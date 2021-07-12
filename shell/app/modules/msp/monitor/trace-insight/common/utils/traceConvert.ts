// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import fp from 'lodash/fp';
import { mkDurationStr } from './traceSummary';
import { findIndex, flatMap, groupBy, values, uniq } from 'lodash';
import { ConstantNames, Constants } from 'trace-insight/common/utils/traceConstants';

interface timeMarkers {
  index: number;
  time: string;
}

interface Trace {
  traceId: string;
  duration: string;
  services: number;
  depth: number;
  totalSpans: number;
  serviceCounts: Array<{
    name: string;
    count: number;
    max: number;
  }>;
  timeMarkers: timeMarkers[];
  timeMarkersBackup: timeMarkers[];
  spans: MONITOR_TRACE.ISpan;
}

const recursiveGetRootMostSpan = (idSpan: any, prevSpan: MONITOR_TRACE.ITrace): MONITOR_TRACE.ITrace => {
  if (prevSpan.parentSpanId && idSpan[prevSpan.parentSpanId]) {
    return recursiveGetRootMostSpan(idSpan, idSpan[prevSpan.parentSpanId]);
  }
  return prevSpan;
};

const getRootMostSpan = (traces: MONITOR_TRACE.ITrace[]) => {
  const firstWithoutParent = traces.find((s: any) => !s.parentSpanId);
  if (firstWithoutParent) {
    return firstWithoutParent;
  }
  const idToSpanMap = fp.flow(
    fp.groupBy((s: any) => s.id),
    fp.mapValues(([s]) => s),
  )(traces);
  return recursiveGetRootMostSpan(idToSpanMap, traces[0]);
};

const createSpanTreeEntry = (
  trace: MONITOR_TRACE.ITrace,
  traces: MONITOR_TRACE.ITrace[],
  indexByParentId: any = null,
) => {
  const idx =
    indexByParentId ||
    fp.flow(
      fp.filter((s: any) => s.parentSpanId !== ''),
      fp.groupBy((s: any) => s.parentSpanId),
    )(traces);

  return {
    span: trace,
    children: (idx[trace.id] || []).map((s: MONITOR_TRACE.ITrace) => createSpanTreeEntry(s, traces, idx)),
  };
};

const treeDepths = (entry: any, startDepth: number): Obj<number> => {
  const initial = {};
  initial[entry.span.id] = startDepth;
  if (entry.children.length === 0) {
    return initial;
  }
  return (entry.children || []).reduce((prevMap: any, child: any) => {
    const childDepths = treeDepths(child, startDepth + 1);
    const newCombined = {
      ...prevMap,
      ...childDepths,
    };
    return newCombined;
  }, initial);
};

const toSpanDepths = (traces: MONITOR_TRACE.ITrace[]) => {
  const root = getRootMostSpan(traces);
  const entry = createSpanTreeEntry(root, traces);
  return treeDepths(entry, 1);
};

/**
 *
 * @param traces
 * @return {{traceId: string; duration: number}}: duration: microsecond
 */
const traceSummary = (traces: MONITOR_TRACE.ITrace[]): { traceId: string; duration: number } => {
  const duration = traces.reduce((prev, next) => {
    return prev + (next.endTime - next.startTime);
  }, 0);
  const { traceId } = traces[0];
  return {
    traceId,
    duration: duration / 1000,
  };
};

const getRootSpans = (traces: MONITOR_TRACE.ITrace[]) => {
  const ids = traces.map((s: any) => s.id);
  return traces.filter((s: any) => ids.indexOf(s.parentSpanId) === -1);
};

const compareSpan = (s1: any, s2: any) => {
  return (s1.timestamp || 0) - (s2.timestamp || 0);
};

const childrenToList = (entry: any) => {
  const fpSort = (fn: any) => (list: any[]) => list.sort(fn);
  const deepChildren: any = fp.flow(
    fpSort((e1: any, e2: any) => compareSpan(e1.span, e2.span)),
    fp.flatMap(childrenToList),
  )(entry.children || []);
  return [entry.span, ...deepChildren];
};

const traceConvert = (traces: MONITOR_TRACE.ITrace[]): Trace => {
  if (!traces?.length) {
    return {} as Trace;
  }
  const summary = traceSummary(traces);
  const spanDepths = toSpanDepths(traces);
  const depth = Math.max(...values(spanDepths));
  const groupByParentId = groupBy(traces, (s) => s.parentSpanId);
  const traceTimestamp = traces[0].timestamp || 0;
  const allServicesName = uniq(traces.map((item) => item.tags.service_name));

  const services = allServicesName?.length || 0;
  const spans = flatMap(getRootSpans(traces), (rootSpan) => childrenToList(createSpanTreeEntry(rootSpan, traces))).map(
    (span) => {
      const spanDuration = (span.endTime - span.startTime) / 1000;
      const spanStartTs = span.timestamp || traceTimestamp;
      const spanDepth = spanDepths[span.id] || 1;
      const width = ((spanDuration || 0) / summary.duration) * 100;
      let errorType = 'none';

      if (errorType !== 'critical') {
        if (findIndex(span.annotations || [], (ann: any) => ann.value === Constants.ERROR) !== -1) {
          errorType = 'transient';
        }
      }
      const left = ((spanStartTs - traceTimestamp) / summary.duration) * 100;

      return {
        spanId: span.id,
        parentId: span.parentSpanId || null,
        spanName: span.name,
        duration: spanDuration,
        durationStr: mkDurationStr(spanDuration),
        left: left >= 100 ? 0 : left,
        width: width < 0.1 ? 0.1 : width,
        depth: (spanDepth + 2) * 5,
        depthClass: (spanDepth - 1) % 6,
        children: (groupByParentId[span.id] || []).map((s) => s.id).join(','),
        tags: span.tags,
        annotations: (span.annotations || []).map((a: any) => ({
          isCore: Constants.CORE_ANNOTATIONS.indexOf(a.value) !== -1,
          left: ((a.timestamp - spanStartTs) / spanDuration) * 100,
          message: a.message,
          value: ConstantNames[a.value] || a.value,
          timestamp: a.timestamp,
          relativeTime: mkDurationStr(a.timestamp - traceTimestamp),
          width: 8,
        })),
        errorType,
      };
    },
  );
  const timeMarkers = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p, index) => ({
    index,
    time: mkDurationStr(summary.duration * p),
  }));
  const totalSpans = spans.length;
  const timeMarkersBackup = timeMarkers;
  const spansBackup = spans;
  return {
    ...summary,
    totalSpans,
    services,
    duration: mkDurationStr(summary.duration),
    depth,
    spans,
    spansBackup,
    timeMarkers,
    timeMarkersBackup,
  };
};

export default traceConvert;
