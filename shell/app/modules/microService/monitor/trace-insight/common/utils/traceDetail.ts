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

import { sortBy, groupBy, values, flatMap, findIndex, find } from 'lodash';
import fp from 'lodash/fp';
import {
  traceSummary,
  getGroupedTimestamps,
  getServiceDurations,
  getServiceNames,
  getServiceName,
  mkDurationStr,
} from './traceSummary';
import { Constants, ConstantNames } from './traceConstants';

export function getRootSpans(spans: any) {
  const ids = spans.map((s: any) => s.id);
  return spans.filter((s: any) => ids.indexOf(s.parentSpanId) === -1);
}

function compareSpan(s1: any, s2: any) {
  return (s1.timestamp || 0) - (s2.timestamp || 0);
}

function childrenToList(entry: any) {
  const fpSort = (fn: any) => (list: any[]) => list.sort(fn);
  const deepChildren: any = fp.flow(
    fpSort((e1: any, e2: any) => compareSpan(e1.span, e2.span)),
    fp.flatMap(childrenToList),
  )(entry.children || []);
  return [entry.span, ...deepChildren];
}

function createSpanTreeEntry(span: any, trace: any, indexByParentId: any = null) {
  const idx =
    indexByParentId ||
    fp.flow(
      fp.filter((s: any) => s.parentSpanId !== ''),
      fp.groupBy((s: any) => s.parentSpanId),
    )(trace);

  return {
    span,
    children: (idx[span.id] || []).map((s: any) => createSpanTreeEntry(s, trace, idx)),
  };
}

function recursiveGetRootMostSpan(idSpan: any, prevSpan: any): any {
  if (prevSpan.parentSpanId && idSpan[prevSpan.parentSpanId]) {
    return recursiveGetRootMostSpan(idSpan, idSpan[prevSpan.parentSpanId]);
  }
  return prevSpan;
}

function getRootMostSpan(spans: any) {
  const firstWithoutParent = spans.find((s: any) => !s.parentSpanId);
  if (firstWithoutParent) {
    return firstWithoutParent;
  }
  const idToSpanMap = fp.flow(
    fp.groupBy((s: any) => s.id),
    fp.mapValues(([s]) => s),
  )(spans);
  return recursiveGetRootMostSpan(idToSpanMap, spans[0]);
}

function treeDepths(entry: any, startDepth: any) {
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
}

function toSpanDepths(spans: any) {
  const rootMost = getRootMostSpan(spans);
  const entry = createSpanTreeEntry(rootMost, spans);
  return treeDepths(entry, 1);
}

export function formatEndpoint({ ipv4, ipv6, port = 0, serviceName = '' }: any) {
  if (serviceName) {
    if (ipv6) {
      return `[${ipv6}]:${port} (${serviceName})`;
    }
    return `${ipv4}:${port} (${serviceName})`;
  }
  if (ipv6) {
    return `[${ipv6}]:${port}`;
  }
  return `${ipv4}:${port}`;
}

export default function traceToMustache(trace: any) {
  const summary = traceSummary(trace) as any; // summary
  const { traceId } = summary; // traceId 唯一
  const duration = mkDurationStr(summary.duration); // 总时间
  const groupedTimestamps = getGroupedTimestamps(summary); //
  const serviceDurations = getServiceDurations(groupedTimestamps);

  const services = serviceDurations.length || 0;
  const serviceCounts = sortBy(serviceDurations, 'name');
  const groupByParentId = groupBy(trace, (s) => s.parentSpanId);

  const traceTimestamp = trace[0].timestamp || 0;
  const spanDepths = toSpanDepths(trace);

  const depth = Math.max(...values(spanDepths));
  const spans = flatMap(getRootSpans(trace), (rootSpan) => childrenToList(createSpanTreeEntry(rootSpan, trace))).map(
    (span) => {
      const spanStartTs = span.timestamp || traceTimestamp;
      const spanDepth = spanDepths[span.id] || 1;
      const width = ((span.duration || 0) / summary.duration) * 100;
      let errorType = 'none';

      const binaryAnnotations = (span.binaryAnnotations || []).map((a: any) => {
        if (a.key === Constants.ERROR) {
          errorType = 'critical';
        }
        if (Constants.CORE_ADDRESS.indexOf(a.key) !== -1) {
          return {
            ...a,
            key: ConstantNames[a.key],
            value: formatEndpoint(a.endpoint),
          };
        } else if (ConstantNames[a.key]) {
          return {
            ...a,
            key: ConstantNames[a.key],
          };
        }
        return a;
      });

      if (errorType !== 'critical') {
        if (findIndex(span.annotations || [], (ann: any) => ann.value === Constants.ERROR) !== -1) {
          errorType = 'transient';
        }
      }

      const localComponentAnnotation = find(span.binaryAnnotations || [], (s) => s.key === Constants.LOCAL_COMPONENT);
      if (localComponentAnnotation && localComponentAnnotation.endpoint) {
        binaryAnnotations.push({
          ...localComponentAnnotation,
          key: 'Local Address',
          value: formatEndpoint(localComponentAnnotation.endpoint),
        });
      }

      const left = (parseFloat(`${spanStartTs - traceTimestamp}`) / parseFloat(summary.duration)) * 100;

      return {
        spanId: span.id,
        parentId: span.parentSpanId || null,
        spanName: span.name,
        serviceNames: getServiceNames(span).join(','),
        serviceName: getServiceName(span) || '',
        duration: span.duration,
        durationStr: mkDurationStr(span.duration),
        // duration 为 0 的情况处理
        left: left >= 100 ? 0 : left,
        width: width < 0.1 ? 0.1 : width,
        depth: (spanDepth + 2) * 5,
        depthClass: (spanDepth - 1) % 6,
        children: (groupByParentId[span.id] || []).map((s) => s.id).join(','),
        annotations: (span.annotations || []).map((a: any) => ({
          isCore: Constants.CORE_ANNOTATIONS.indexOf(a.value) !== -1,
          left: ((a.timestamp - spanStartTs) / span.duration) * 100,
          // TODO: endpoint没有了，需要移除处理逻辑
          // endpoint: a.endpoint ? formatEndpoint(a.endpoint) : null,
          message: a.message,
          value: ConstantNames[a.value] || a.value,
          timestamp: a.timestamp,
          relativeTime: mkDurationStr(a.timestamp - traceTimestamp),
          width: 8,
        })),
        binaryAnnotations,
        errorType,
      };
    },
  );

  const totalSpans = spans.length;
  const timeMarkers = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p, index) => ({
    index,
    time: mkDurationStr(summary.duration * p),
  }));
  const timeMarkersBackup = timeMarkers;
  const spansBackup = spans;

  return {
    traceId,
    duration,
    services,
    depth,
    totalSpans,
    serviceCounts,
    timeMarkers,
    timeMarkersBackup,
    spans,
    spansBackup,
  };
}
