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
import { Tree, Tooltip, Row, Col, Tabs } from 'core/nusi';
import { TimeSelect, KeyValueList, Icon as CustomIcon } from 'common';
import { mkDurationStr } from 'trace-insight/common/utils/traceSummary';
import { getSpanAnalysis } from 'msp/services';
import './index.scss';
import i18n from 'i18n';
import moment from 'moment';
import ServiceListDashboard from 'msp/monitor/service-list/pages/service-list-dashboard';
import { customMap } from 'common/components/time-select/common';
import { listToTree } from './utils';
import { SpanTitleInfo } from './span-title-info';
import { TraceDetailInfo } from './trace-detail-info';
import { SpanTimeInfo } from './span-time-info';
import { TraceHeader } from './trace-header';

interface IProps {
  dataSource: any;
}

const { TabPane } = Tabs;

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
  const [proportion, setProportion] = React.useState([24, 0]);
  const [loading, setLoading] = React.useState(false);
  const [spanDetailData, setSpanDetailData] = React.useState({});
  const { roots, min, max } = listToTree(dataSource.spans);
  const [tags, setTags] = React.useState(null as any);
  const [spanStartTime, setSpanStartTime] = React.useState(null!) as any;
  const [_timeRange, _setTimeRange] = React.useState([null!, null!]) as any;
  const duration = max - min;
  const allKeys: string[] = [];
  const { callAnalysis, serviceAnalysis } = (spanDetailData || {}) as any;

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

  const traverseData = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      // FIXME: remove eslint comment
      // eslint-disable-next-line no-param-reassign
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

  function handleClickTimeSpan(startTime: number, selectedTag: MONITOR_TRACE.ITag) {
    const defaultQuick = 'minutes:15';
    const range1 = moment(startTime / 1000 / 1000)
      .subtract(customMap[defaultQuick], 'second')
      .valueOf();
    const range2 = Math.min(
      moment(startTime / 1000 / 1000)
        .add(customMap[defaultQuick], 'second')
        .valueOf(),
      moment().valueOf(),
    );
    _setTimeRange([range1, range2]);
    setTags(selectedTag);
    setSpanStartTime(startTime / 1000 / 1000);
    setProportion([12, 12]);
  }

  function format(item: MONITOR_TRACE.ITraceSpan, depth = 0, _handleClickTimeSpan: any) {
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
      <div
        className="wrapper flex items-center "
        onClick={() => {
          _handleClickTimeSpan(startTime, tags);
        }}
      >
        <Tooltip title={<SpanTitleInfo operationName={operationName} spanKind={spanKind} component={component} />}>
          <div className="left text-xs flex items-center" style={{ width: 200 - 24 * depth }}>
            <span className="truncate">{operationName}</span>
            <span className="truncate ml-3">{`${spanKind} - ${component}`}</span>
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
                  const { quick } = data;
                  let range1 = range?.[0]?.valueOf();
                  let range2 = range?.[1]?.valueOf();
                  if (customMap[quick]) {
                    range1 = moment(spanStartTime).subtract(customMap[quick], 'second').valueOf();
                    range2 = Math.min(
                      moment(spanStartTime).add(customMap[quick], 'second').valueOf(),
                      moment().valueOf(),
                    );
                  }
                  _setTimeRange([range1, range2]);
                }}
                value={selectedTimeRange}
              />
            </div>
            {callAnalysis && (
              <Tabs>
                {/* 后端还未调通，先隐藏 */}
                <TabPane tab={i18n.d('调用分析')} key={1}>
                  <ServiceListDashboard
                    timeSpan={{ startTimeMs: _timeRange[0], endTimeMs: _timeRange[1] }}
                    dashboardId={callAnalysis?.dashboardId}
                    extraGlobalVariable={formatDashboardVariable(callAnalysis?.conditions)}
                  />
                </TabPane>
                <TabPane tab={i18n.d('关联服务')} key={2}>
                  <ServiceListDashboard
                    timeSpan={{ startTimeMs: _timeRange[0], endTimeMs: _timeRange[1] }}
                    dashboardId={serviceAnalysis?.dashboardId}
                    extraGlobalVariable={formatDashboardVariable(serviceAnalysis?.conditions)}
                  />
                </TabPane>
                <TabPane tab={i18n.d('属性')} key={3}>
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
