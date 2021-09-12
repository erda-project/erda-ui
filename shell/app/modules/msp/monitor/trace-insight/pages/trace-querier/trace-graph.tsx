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
import { Tree, Tooltip, Table, Modal, Ellipsis, Button, Row, Col, Tabs, Spin } from 'core/nusi';
import { Holder, PureBoardGrid, TimeSelect, KeyValueList, Icon as CustomIcon } from 'common';
import { mkDurationStr } from 'trace-insight/common/utils/traceSummary';
import { getSpanAnalysis } from 'msp/services';
import './trace-graph.scss';
import i18n from 'i18n';
import { map, isEmpty } from 'lodash';
import moment from 'moment';
import ServiceListDashboard from 'msp/monitor/service-list/pages/service-list-dashboard';
import { customMap } from 'common/components/time-select/common';

interface ISpanDetailProps {
  getSpanDetailContent: (
    visible: boolean,
    span: MONITOR_TRACE.ITraceSpan[],
  ) => {
    visible: boolean;
    span: MONITOR_TRACE.ITraceSpan[];
  };
  spanDetailContent: {
    visible: boolean;
    span: MONITOR_TRACE.ITraceSpan[];
  };
}

interface IProps {
  getSpanDetailContent: (
    visible: boolean,
    span: MONITOR_TRACE.ITraceSpan[],
  ) => {
    visible: boolean;
    span: MONITOR_TRACE.ITraceSpan[];
  };
  spanDetailContent: {
    visible: boolean;
    span: MONITOR_TRACE.ITraceSpan[];
  };
}

interface IState {
  layout: DC.Layout;
  loading: boolean;
}

const DashBoard = React.memo(PureBoardGrid);
const { TabPane } = Tabs;

function listToTree(arr: any[] = []) {
  const list = arr.map((x) => ({ ...x, children: [] })).sort((a, b) => a.startTime - b.startTime);
  const treeMap = {};
  const roots = [];
  const existIds = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    treeMap[node?.id] = i;
    existIds.push(node?.id);
    min = Math.min(min, node?.startTime);
    max = Math.max(max, node?.endTime);
  }

  for (let i = 0; i < list.length; i += 1) {
    const node = list[i];
    const parentSpanId = node?.parentSpanId;
    if (parentSpanId !== '' && existIds.includes(parentSpanId)) {
      list[treeMap[parentSpanId]].children.push(node);
    } else {
      roots.push(node);
    }
  }

  return { roots, min, max };
}

const displayTimeString = (time: number) => {
  return time && time !== -Infinity ? mkDurationStr(time / 1000) : 0;
};

const spanTitleInfo = (operationName, spanKind, component) => {
  return (
    <div>
      <div>{operationName}</div>
      <div>{`${spanKind} - ${component}`}</div>
    </div>
  );
};

const spanTimeInfo = (totalSpanTime: number, selfSpanTime: number) => (
  <div className="flex justify-center">
    <div className="border-0 border-r border-solid border-grey flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold ">
        <span className="text-navy" style={{ fontSize: 16 }}>
          {mkDurationStr(selfSpanTime / 1000)}
        </span>
        {/* <span className="text-navy" style={{ fontSize: 14 }}>
          ms
        </span> */}
      </div>
      <div className="text-sm text-darkgray">{i18n.t('msp:current span time')}</div>
    </div>
    <div className="flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold">
        <span className="text-navy" style={{ fontSize: 16 }}>
          {mkDurationStr(totalSpanTime / 1000)}
        </span>
      </div>
      <div className="text-sm text-darkgray">{i18n.t('msp:total span time')}</div>
    </div>
  </div>
);

const TraceDetailInfo = ({ dataSource }) => {
  const { duration, serviceCount = 0, depth = 0, spanCount = 0 } = dataSource;
  const arr = [
    { text: displayTimeString(duration), subText: 'Duration' },
    { text: serviceCount, subText: 'Services' },
    { text: depth, subText: 'Depth' },
    { text: spanCount, subText: 'Total Spans' },
  ];

  return (
    <div className="bg-grey flex justify-between items-center py-2 my-4">
      {arr.map(({ text, subText }) => (
        <div className="flex flex-col flex-1 items-center justify-center" key={subText}>
          <div className="text-xl text-sub font-semibold">{text}</div>
          <div className="text-xs text-darkgray">{subText}</div>
        </div>
      ))}
    </div>
  );
};

const TraceHeader = (props: { duration: number; setExpandedKeys: any; allKeys: string[]; expandedKeys: string[] }) => {
  const { duration, setExpandedKeys, allKeys, expandedKeys } = props;
  const avg = duration / 4;
  const pointTimers = [avg, avg * 2, avg * 3, avg * 4];
  const isExpanded = expandedKeys?.length > 0;
  return (
    <div className="trace-header text-gray font-semibold text-sm pb-3 my-2">
      <div className="left text-sub font-semibold flex items-center">
        <span className="left text-sub font-semibold">Services</span>
        <Tooltip title={i18n.t('msp:expand all')}>
          <CustomIcon
            type="chevron-down"
            onClick={() => setExpandedKeys(allKeys)}
            className={`text-xs ${
              isExpanded ? 'text-holder' : 'text-primary cursor-pointer'
            } border-solid border-2 w-4 h-4 flex justify-center items-center`}
          />
        </Tooltip>
        <Tooltip title={i18n.t('msp:fold all')}>
          <CustomIcon
            type="chevron-up"
            onClick={() => setExpandedKeys([])}
            className={`text-xs ${
              isExpanded ? 'text-primary cursor-pointer' : 'text-holder'
            } border-solid border-2 w-4 h-4 flex justify-center items-center ml-2`}
          />
        </Tooltip>
      </div>

      {pointTimers.map((timer, index) => {
        return (
          <div className="right" key={`${`${index}${timer}`}`}>
            {displayTimeString(timer)}
          </div>
        );
      })}
    </div>
  );
};

export function TraceGraph(props: IProps) {
  const { dataSource = {} } = props;
  const bg = ['#4E6097', '#498E9E', '#6CB38B', 'purple', '#F7A76B'];
  const errorColor = '#CE4324';
  // const bg = ['#5872C0', '#ADDD8B', '#DE6E6A', '#84BFDB', '#599F76', '#ED895D', '#9165AF','#DC84C8','#F3C96B'];
  const [expandedKeys, setExpandedKeys] = React.useState([] as string[]);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState({
    mode: 'quick',
    quick: 'minutes:15',
    customize: {},
  });
  const [timeRange, setTimeRange] = React.useState([moment().subtract(15, 'minutes'), moment()]);
  const [proportion, setProportion] = React.useState([24, 0]);
  const [loading, setLoading] = React.useState(false);
  const [spanDetailData, setSpanDetailData] = React.useState({});
  const { roots, min, max } = listToTree(dataSource.spans);
  const [tags, setTags] = React.useState(null);
  const [spanStartTime, setSpanStartTime] = React.useState(null);
  const [_timeRange, _setTimeRange] = React.useState([null, null]);
  const duration = max - min;
  const allKeys: string[] = [];
  const { callAnalysis, serviceAnalysis } = spanDetailData || {};

  const getMetaData = React.useCallback(async () => {
    setLoading(true);

    try {
      const { span_layer, span_kind, terminus_key, service_instance_id } = tags;
      const type = `${span_layer}_${span_kind}`;

      const { success, data } = await getSpanAnalysis({
        type,
        startTime: _timeRange[0],
        endTime: _timeRange[1],
        serviceInstanceId: service_instance_id,
        tenantId: terminus_key,
      });
      if (success) {
        setSpanDetailData(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tags, _timeRange]);

  React.useEffect(() => {
    if (tags) {
      getMetaData();
    }
  }, [getMetaData, tags, _timeRange]);

  const traverseData = (data) => {
    for (let i = 0; i < data.length; i++) {
      data[i] = format(data[i], 0);
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

  function format(item: MONITOR_TRACE.ITraceSpan, depth = 0) {
    item.depth = depth;
    item.key = item.id;
    allKeys.push(item.id);
    const { startTime, endTime, duration: totalDuration, selfDuration, operationName, tags } = item;
    const { span_kind: spanKind, component, error } = tags;
    const leftRatio = (startTime - min) / duration;
    const centerRatio = (endTime - startTime) / duration;
    const rightRatio = (max - endTime) / duration;
    const showTextOnLeft = leftRatio > 0.2;
    const showTextOnRight = !showTextOnLeft && rightRatio > 0.2;
    const displayTotalDuration = mkDurationStr(totalDuration / 1000);

    item.title = (
      <div className="wrapper flex items-center">
        <Tooltip title={spanTitleInfo(operationName, spanKind, component)}>
          <div className="left text-xs flex items-center" style={{ width: 200 - 24 * depth }}>
            <span className="truncate">{operationName}</span>
            <span className="truncate ml-3">{`${spanKind} - ${component}`}</span>
          </div>
        </Tooltip>
        <div
          className="right text-gray"
          onClick={() => {
            const { quick } = selectedTimeRange;
            let range1 = timeRange[0].valueOf();
            let range2 = timeRange[1].valueOf();
            if (customMap[quick]) {
              range1 = moment(startTime / 1000 / 1000)
                .subtract(customMap[quick], 'second')
                .valueOf();
              range2 = moment(startTime / 1000 / 1000)
                .add(customMap[quick], 'second')
                .valueOf();
            }
            _setTimeRange([range1, range2]);
            // getMetaData(tags);
            setTags(tags);
            setSpanStartTime(startTime / 1000 / 1000);
            setProportion([12, 12]);
          }}
        >
          <div style={{ flex: leftRatio }} className="text-right text-xs self-center">
            {showTextOnLeft && displayTotalDuration}
          </div>
          <Tooltip title={spanTimeInfo(totalDuration, selfDuration)}>
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
      item.children = item.children.map((x) => format(x, depth + 1));
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
          <Col span={proportion[0]}>
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
                  height={window.innerHeight * 0.7}
                  // switcherIcon={<DownOutlined />}
                  // switcherIcon={<CustomIcon type="caret-down" />}
                  expandedKeys={expandedKeys}
                  treeData={treeData}
                  onExpand={onExpand}
                />
              )}
            </div>
          </Col>
          <Col span={proportion[1]}>
            <div className="flex justify-between items-center">
              <Tooltip title={i18n.t('close')}>
                <span onClick={() => setProportion([24, 0])} className="cursor-pointer">
                  <CustomIcon type="gb" className="text-holder" />
                </span>
              </Tooltip>
              <TimeSelect
                // defaultValue={globalTimeSelectSpan.data}
                // className={className}
                onChange={(data, range) => {
                  setSelectedTimeRange(data);
                  setTimeRange(range);
                  const { quick } = data;
                  let range1 = range[0].valueOf();
                  let range2 = range[1].valueOf();
                  if (customMap[quick]) {
                    range1 = moment(spanStartTime).subtract(customMap[quick], 'second').valueOf();
                    range2 = moment(spanStartTime).add(customMap[quick], 'second').valueOf();
                  }
                  _setTimeRange([range1, range2]);
                }}
                value={selectedTimeRange}
              />
            </div>
            {callAnalysis && (
              <Tabs>
                {/* 后端还未调通，先隐藏 */}
                {/* <TabPane tab="调用分析" key={1}>
                  <ServiceListDashboard
                    timeSpan={{ startTimeMs: _timeRange[0], endTimeMs: _timeRange[1] }}
                    dashboardId={callAnalysis?.dashboardId}
                    extraGlobalVariable={formatDashboardVariable(callAnalysis?.conditions)}
                  />
                </TabPane> */}
                <TabPane tab="关联服务" key={2}>
                  <ServiceListDashboard
                    timeSpan={{ startTimeMs: _timeRange[0], endTimeMs: _timeRange[1] }}
                    dashboardId={serviceAnalysis?.dashboardId}
                    extraGlobalVariable={formatDashboardVariable(serviceAnalysis?.conditions)}
                  />
                </TabPane>
                <TabPane tab="属性" key={3}>
                  <KeyValueList data={tags} />
                </TabPane>
              </Tabs>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}
