/* eslint-disable no-param-reassign */
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

import React from 'react';
import { Tree, Tooltip, Row, Col, Tabs, Table } from 'antd';
import { TimeSelect, KeyValueList, Icon as CustomIcon, EmptyHolder, Ellipsis } from 'common';
import { mkDurationStr } from 'trace-insight/common/utils/traceSummary';
import { getSpanAnalysis, getSpanEvents } from 'msp/services';
import './index.scss';
import i18n from 'i18n';
import moment from 'moment';
import ServiceListDashboard from 'msp/env-overview/service-list/pages/service-list-dashboard';
import { ITimeRange, translateRelativeTime } from 'common/components/time-select/common';
import { listToTree } from './utils';
import { SpanTitleInfo } from './span-title-info';
import { TraceDetailInfo } from './trace-detail-info';
import { SpanTimeInfo } from './span-time-info';
import { TraceHeader } from './trace-header';

interface IProps {
  dataSource: MONITOR_TRACE.ITrace;
}

const { TabPane } = Tabs;

export function TraceGraph(props: IProps) {
  const { dataSource } = props;
  const bg = ['#4E6097', '#498E9E', '#6CB38B', 'purple', '#F7A76B'];
  const errorColor = '#CE4324';
  // const bg = ['#5872C0', '#ADDD8B', '#DE6E6A', '#84BFDB', '#599F76', '#ED895D', '#9165AF','#DC84C8','#F3C96B'];
  const [expandedKeys, setExpandedKeys] = React.useState([] as string[]);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(null! as ITimeRange);
  const [proportion, setProportion] = React.useState([24, 0]);
  const [loading, setLoading] = React.useState(false);
  const [spanDetailData, setSpanDetailData] = React.useState({});
  const { roots, min, max } = listToTree(dataSource?.spans);
  const [tags, setTags] = React.useState(null! as MONITOR_TRACE.ITag);
  const [spanStartTime, setSpanStartTime] = React.useState(null! as number);
  const [timeRange, setTimeRange] = React.useState([null!, null!] as number[]);
  const [selectedSpanId, setSelectedSpanId] = React.useState(null! as string);
  const spanData = getSpanEvents.useData();
  const spanDataSource = spanData?.spanEvents || [];
  const duration = max - min;
  const allKeys: string[] = [];
  const { serviceAnalysis } = (spanDetailData as MONITOR_TRACE.ISpanRelationChart) || {};

  const columns = [
    {
      title: i18n.t('time'),
      dataIndex: 'timestamp',
      width: 160,
      render: (time: number) => moment(time / 1000 / 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('msp:events'),
      dataIndex: 'events',
      ellipsis: true,
      render: (events: object) => (
        <div>
          {Object.keys(events).map((k) => (
            <Ellipsis title={`${k}: ${events[k]}`} key={k} />
          ))}
        </div>
      ),
    },
  ];

  const getMetaData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { span_layer, span_kind, terminus_key, service_instance_id } = tags;
      const type = `${span_layer}_${span_kind}`;
      if (!service_instance_id) {
        return null;
      }
      const { success, data } = await getSpanAnalysis({
        type,
        startTime: timeRange[0],
        endTime: timeRange[1],
        serviceInstanceId: service_instance_id,
        tenantId: terminus_key,
      });

      if (success) {
        setSpanDetailData(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tags, timeRange]);

  React.useEffect(() => {
    if (tags) {
      getMetaData();
    }
  }, [getMetaData, tags]);

  React.useEffect(() => {
    if (selectedSpanId && spanStartTime) {
      getSpanEvents.fetch({
        startTime: Math.floor(spanStartTime),
        spanId: selectedSpanId,
      });
    }
  }, [selectedSpanId, spanStartTime]);

  const traverseData = (data: MONITOR_TRACE.ITraceSpan[]) => {
    for (let i = 0; i < data.length; i++) {
      data[i] = format(data[i], 0, handleClickTimeSpan);
    }

    return data;
  };

  const treeData = traverseData(roots);
  const formatDashboardVariable = (conditions: string[]) => {
    const dashboardVariable = {};
    for (let i = 0; i < conditions?.length; i++) {
      dashboardVariable[conditions[i]] = tags?.[conditions[i]];
    }
    return dashboardVariable;
  };

  function handleClickTimeSpan(startTime: number, selectedTag: MONITOR_TRACE.ITag, id: string) {
    const r1 = moment(startTime / 1000 / 1000)
      .subtract(15, 'minute')
      .valueOf();
    const r2 = Math.min(
      moment(startTime / 1000 / 1000)
        .add(15, 'minute')
        .valueOf(),
      moment().valueOf(),
    );
    setSelectedTimeRange({
      mode: 'customize',
      customize: {
        start: moment(r1),
        end: moment(r2),
      },
    });
    setTimeRange([r1, r2]);
    setTags(selectedTag);
    setSpanStartTime(startTime / 1000 / 1000);
    setProportion([14, 10]);
    setSelectedSpanId(id);
  }

  function format(
    item: MONITOR_TRACE.ISpanItem,
    depth = 0,
    _handleClickTimeSpan: (startTime: number, selectedTag: MONITOR_TRACE.ITag, id: string) => void,
  ) {
    item.depth = depth;
    item.key = item.id;
    allKeys.push(item.id);
    const { startTime, endTime, duration: totalDuration, selfDuration, operationName, tags: _tags, id } = item;
    const { span_kind: spanKind, component, error, service_name: serviceName } = _tags;
    const leftRatio = (startTime - min) / duration;
    const centerRatio = (endTime - startTime) / duration;
    const rightRatio = (max - endTime) / duration;
    const showTextOnLeft = leftRatio > 0.2;
    const showTextOnRight = !showTextOnLeft && rightRatio > 0.2;
    const displayTotalDuration = mkDurationStr(totalDuration / 1000);
    item.title = (
      <div
        className="wrapper flex items-center"
        onClick={() => {
          _handleClickTimeSpan(startTime, _tags, id);
        }}
      >
        <Tooltip
          title={
            <SpanTitleInfo
              operationName={operationName}
              spanKind={spanKind}
              component={component}
              serviceName={serviceName}
            />
          }
        >
          <div className="left flex items-center " style={{ width: Math.max(300 - 24 * depth, 300) }}>
            <div className="w-1 h-4 relative mr-1" style={{ background: error ? errorColor : bg[depth % 5] }} />
            <div className="flex items-center" style={{ width: Math.max(300 - 24 * depth - 8, 280) }}>
              <span className="font-semibold text-ms mr-2 whitespace-nowrap">{serviceName}</span>
              <span className="truncate text-xs">{operationName}</span>
            </div>
          </div>
        </Tooltip>
        <div className="right text-gray">
          <div style={{ flex: leftRatio }} className="text-right text-xs self-center">
            {showTextOnLeft && displayTotalDuration}
          </div>
          <Tooltip title={<SpanTimeInfo totalSpanTime={totalDuration} selfSpanTime={selfDuration} />}>
            <div
              style={{ flex: centerRatio < 0.01 ? 0.01 : centerRatio, background: error ? errorColor : bg[depth % 5] }}
              className="rounded-sm mx-1"
            />
          </Tooltip>
          <div style={{ flex: rightRatio }} className="self-center text-left text-xs">
            {showTextOnRight && displayTotalDuration}
          </div>
        </div>
      </div>
    );
    if (item.children) {
      item.children = item.children.map((x) => format(x, depth + 1, _handleClickTimeSpan));
    }
    return item;
  }

  const onExpand = (keys: string[]) => {
    setExpandedKeys(keys);
  };

  return (
    <>
      <TraceDetailInfo dataSource={dataSource} />
      <div className="mt-4">
        <Row gutter={20}>
          <Col span={proportion[0]} className={`${proportion[0] !== 24 ? 'pr-0' : ''}`}>
            <TraceHeader
              duration={duration}
              setExpandedKeys={setExpandedKeys}
              allKeys={allKeys}
              expandedKeys={expandedKeys}
            />
            <div className="trace-graph">
              {treeData.length > 0 && (
                <Tree
                  showLine={{ showLeafIcon: false }}
                  defaultExpandAll
                  height={window.innerHeight - 200}
                  // switcherIcon={<DownOutlined />}
                  // switcherIcon={<CustomIcon type="caret-down" />}
                  expandedKeys={expandedKeys}
                  treeData={treeData}
                  onExpand={onExpand}
                />
              )}
            </div>
          </Col>
          <Col span={proportion[1]} className={`${proportion[0] !== 24 ? 'pl-0' : ''}`}>
            <div className="flex justify-between items-center my-2 px-3 py-1">
              <div className="text-sub text-sm font-semibold w-5/6">
                <Ellipsis title={tags?.operation_name}>{tags?.operation_name}</Ellipsis>
              </div>
              <Tooltip title={i18n.t('close')}>
                <span onClick={() => setProportion([24, 0])} className="cursor-pointer">
                  <CustomIcon type="gb" className="text-holder" />
                </span>
              </Tooltip>
            </div>
            <div className="px-3">
              {selectedTimeRange && (
                <TimeSelect
                  // defaultValue={globalTimeSelectSpan.data}
                  // className={className}
                  onChange={(data, range) => {
                    if (Object.keys(data)?.length !== 0) {
                      setSelectedTimeRange(data);
                    }
                    const { quick = '' } = data;
                    let range1 = range?.[0]?.valueOf() || selectedTimeRange?.customize?.start?.valueOf();
                    let range2 = range?.[1]?.valueOf() || selectedTimeRange?.customize?.end?.valueOf();
                    if (quick) {
                      const [unit, count] = quick.split(':');
                      const [start, end] = translateRelativeTime(unit, Number(count));
                      range1 = start?.valueOf();
                      range2 = Math.min(end?.valueOf(), moment().valueOf());
                    }
                    setTimeRange([range1, range2]);
                  }}
                  value={selectedTimeRange}
                />
              )}
            </div>
            {(serviceAnalysis || proportion[0] === 14) && (
              <div className="px-3 trace-detail-chart" style={{ height: window.innerHeight - 200 }}>
                <Tabs>
                  <TabPane tab={i18n.t('msp:attributes')} key={1}>
                    <KeyValueList data={tags} />
                  </TabPane>
                  <TabPane tab={i18n.t('msp:events')} key={2}>
                    <Table columns={columns} dataSource={spanDataSource} />
                  </TabPane>
                  <TabPane tab={i18n.t('msp:associated services')} key={3}>
                    {!serviceAnalysis?.dashboardId && <EmptyHolder relative />}
                    {serviceAnalysis?.dashboardId && (
                      <ServiceListDashboard
                        timeSpan={{ startTimeMs: timeRange[0], endTimeMs: timeRange[1] }}
                        dashboardId={serviceAnalysis?.dashboardId}
                        extraGlobalVariable={formatDashboardVariable(serviceAnalysis?.conditions)}
                      />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}
