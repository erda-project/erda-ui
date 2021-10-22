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
import { Row, Col, Drawer } from 'antd';
import { getFilterParams } from 'service-insight/common/utils';
import { SimpleLog } from 'common';
import { useSwitch } from 'common/use-hooks';
import WebMap from './config/chartMap';
import TopTabRight from 'service-insight/common/components/tab-right';
import CommonPanel from '../../../trace-insight/pages/trace-querier/trace-common-panel';
import PureTraceDetail from '../../../trace-insight/pages/trace-querier/trace-detail-new';
import monitorCommonStore from 'common/stores/monitorCommon';
import SICommonStore from '../../stores/common';
import traceQuerierStore from 'trace-insight/stores/trace-querier';
import { useLoading } from 'core/stores/loading';
import i18n from 'i18n';

const Web = () => {
  const { getTraceDetailContent, getSpanDetailContent } = traceQuerierStore.effects;
  const spanDetailContent = traceQuerierStore.useStore((s) => s.spanDetailContent);
  const [isTraceDetailContentFetching] = useLoading(traceQuerierStore, ['getTraceDetailContent']);
  const chosenSortItem = monitorCommonStore.useStore((s) => s.chosenSortItem);
  const baseInfo = SICommonStore.useStore((s) => s.baseInfo);

  const [logVisible, openLog, closeLog] = useSwitch(false);
  const [tracingVisible, tracingOn, tracingOff] = useSwitch(false);
  const [traceRecords, setTraceRecords] = React.useState({});
  const [logQuery, setQuery] = React.useState({});
  const [applicationId, setApplicationId] = React.useState({});
  const { filterQuery, shouldLoad }: any = getFilterParams({ baseInfo }, { prefix: 'filter_target_' });
  const chartQuery = chosenSortItem ? { ...filterQuery, filter_http_path: chosenSortItem } : { ...filterQuery };

  const fetchTraceContent = ({ requestId }: any) => {
    tracingOn();
    getTraceDetailContent({ traceId: requestId, needReturn: true }).then((content: any) => {
      setTraceRecords(content);
    });
  };

  const viewLog = ({ requestId, applicationId: appId }: any) => {
    setQuery(requestId);
    setApplicationId(appId);
    openLog();
  };

  return (
    <div>
      <TopTabRight />
      <Row gutter={20}>
        <Col span={8}>
          <div className="monitor-sort-panel">
            <WebMap.sortTab />
            <WebMap.sortList shouldLoad={shouldLoad} query={filterQuery} />
          </div>
        </Col>
        <Col span={16}>
          <WebMap.responseTimes shouldLoad={shouldLoad} query={chartQuery} />
          <WebMap.throughput shouldLoad={shouldLoad} query={chartQuery} />
          <WebMap.httpError shouldLoad={shouldLoad} query={filterQuery} />
          <WebMap.slowTrack
            shouldLoad={shouldLoad}
            query={filterQuery}
            viewLog={viewLog}
            fetchTraceContent={fetchTraceContent}
          />
          <WebMap.errorTrack
            shouldLoad={shouldLoad}
            query={filterQuery}
            viewLog={viewLog}
            fetchTraceContent={fetchTraceContent}
          />
        </Col>
      </Row>
      <Drawer destroyOnClose title={i18n.t('runtime:monitor log')} width="80%" visible={logVisible} onClose={closeLog}>
        <SimpleLog requestId={logQuery} applicationId={applicationId} />
      </Drawer>
      <Drawer
        destroyOnClose
        title={i18n.t('msp:transactions')}
        width="80%"
        visible={tracingVisible}
        onClose={tracingOff}
      >
        <CommonPanel
          title={
            <div className="flex justify-between items-center">
              <h3 className="trace-common-panel-title font-medium">{i18n.t('msp:link information')}</h3>
            </div>
          }
          className="trace-status-list-ct"
        >
          <PureTraceDetail
            spanDetailContent={spanDetailContent}
            traceDetailContent={traceRecords}
            isTraceDetailContentFetching={isTraceDetailContentFetching}
            getSpanDetailContent={getSpanDetailContent}
          />
        </CommonPanel>
      </Drawer>
    </div>
  );
};

export default Web;
