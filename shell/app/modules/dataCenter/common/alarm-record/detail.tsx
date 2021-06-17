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

import * as React from 'react';
import { useMount } from 'react-use';
import { Table, Radio } from 'app/nusi';
import { isEmpty, get, forEach, mapKeys } from 'lodash';
import i18n from 'i18n';
import moment from 'moment';
import { CommonRangePicker, PureBoardGrid, useUpdate, IF, Icon as CustomIcon } from 'common';
import { getTimeSpan } from 'common/utils';
import { ColumnProps } from 'core/common/interface';
import { useLoading } from 'app/common/stores/loading';
import routeInfoStore from 'common/stores/route';
import EditIssueDrawer from 'project/common/components/issue/edit-issue-drawer';
import { AlarmState } from 'dataCenter/common/alarm-state.tsx';
import SelectProjectModal from '../select-project-modal';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

import orgAlarmRecordStore from 'dataCenter/stores/alarm-record';
import microServiceAlarmRecordStore from 'microService/monitor/alarm-record/stores/alarm-record';

import './detail.scss';

export enum AlarmRecordScope {
  ORG = 'org',
  MICRO_SERVICE = 'micro_service',
}

const storeMap = {
  [AlarmRecordScope.ORG]: orgAlarmRecordStore,
  [AlarmRecordScope.MICRO_SERVICE]: microServiceAlarmRecordStore,
};

const defaultTime = 7 * 24; // hour

const convertChartData = (data: any) => {
  if (isEmpty(data)) return {};

  const { time = [], results = [], title } = data || {};
  const yAxis = [];
  const metricData = [] as object[];
  forEach(get(results, '[0].data') || [], (item) => {
    mapKeys(item, (v) => {
      const { chartType, ...rest } = v;
      yAxis[v.axisIndex] = 1;
      metricData.push({
        ...rest,
        name: v.tag || v.name,
        type: chartType,
      });
    });
  });
  const yAxisLength = yAxis.length;
  return { time, metricData, yAxisLength, xAxisIsTime: true, title };
};

export default ({ scope, tenantGroup }: { scope: string; tenantGroup?: string }) => {
  const alarmRecordStore = storeMap[scope];
  const { recordId } = routeInfoStore.useStore((s) => s.params);
  const [recordDetail, alarmTimesChart, recordHistories] = alarmRecordStore.useStore((s) => [
    s.recordDetail,
    s.alarmTimesChart,
    s.recordHistories,
  ]);
  const { getAlarmRecordDetail, getAlarmTimesChart, getAlarmRecordHistories } = alarmRecordStore;
  // const isExistingTicket = !!recordDetail.issueId;

  const [loading] = useLoading(alarmRecordStore, ['getAlarmRecordHistories']);
  const issueUrlMap = React.useMemo(
    () => ({
      [AlarmRecordScope.ORG]: `/api/org-alert-records/${recordId}/issues`,
      [AlarmRecordScope.MICRO_SERVICE]: `/api/tmc/tenantGroup/${tenantGroup}/alert-records/${recordId}/issues`,
    }),
    [recordId, tenantGroup],
  );

  useMount(() => {
    getAlarmRecordDetail(recordId);
  });

  const [{ drawerVisible, selectProjectVisible, relatedProject, view, timeSpan }, updater] = useUpdate({
    drawerVisible: false,
    selectProjectVisible: false,
    relatedProject: 0,
    view: 'table',
    timeSpan: getTimeSpan(defaultTime),
  });

  React.useEffect(() => {
    recordDetail.projectId && updater.relatedProject(recordDetail.projectId);
  }, [recordDetail.projectId, updater]);

  React.useEffect(() => {
    const { startTimeMs, endTimeMs } = timeSpan;
    getAlarmTimesChart({
      start: startTimeMs,
      end: endTimeMs,
      filter_alert_group_id: recordId,
      count: 'tags.alert_id',
    });
    getAlarmRecordHistories({
      start: startTimeMs,
      end: endTimeMs,
      groupId: recordId,
    });
  }, [getAlarmRecordHistories, getAlarmTimesChart, recordId, timeSpan]);

  const closeDrawer = () => {
    updater.drawerVisible(false);
    getAlarmRecordDetail(recordId);
  };

  const toggleSelectProjectModal = () => updater.selectProjectVisible(!selectProjectVisible);

  const handleSelectProject = (projectId: number) => {
    updater.relatedProject(projectId);
    toggleSelectProjectModal();
    updater.drawerVisible(true);
  };

  const layout = React.useMemo(
    () => [
      {
        w: 24,
        h: 7,
        x: 0,
        y: 0,
        i: 'alarm-times',
        moved: false,
        static: false,
        view: {
          chartType: 'chart:area',
          title: i18n.t('org:alarm times trends'),
          staticData: convertChartData(alarmTimesChart),
          config: {
            optionProps: {
              isMoreThanOneDay: true,
            },
          },
        },
      },
    ],
    [alarmTimesChart],
  );

  const columns: Array<ColumnProps<ALARM_REPORT.AlarmHistory>> = [
    {
      title: i18n.t('org:create time'),
      dataIndex: 'timestamp',
      render: (timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('org:alarm status'),
      dataIndex: 'alertState',
      render: (alertState) => <AlarmState state={alertState} />,
    },
    {
      width: 200,
      title: i18n.t('operation'),
      render: (record: ALARM_REPORT.AlarmHistory) => (
        <div className="table-operations">
          <IF check={!!record.displayUrl}>
            <a className="table-operations-btn" href={record.displayUrl} target="_blank" rel="noopener noreferrer">
              {i18n.t('org:check')}
            </a>
            <IF.ELSE />
            {'--'}
          </IF>
        </div>
      ),
    },
  ];

  return (
    <div className="alarm-record-detail">
      {/* <div className="top-button-group">
        <Button
          type="primary"
          onClick={() => {
            if (isExistingTicket) {
              updater.drawerVisible(true);
            } else if (relatedProject) {
              updater.drawerVisible(true);
            } else {
              toggleSelectProjectModal();
            }
          }}
        >
          {isExistingTicket ? i18n.t('org:check ticket') : i18n.t('org:create ticket')}
        </Button>
      </div> */}
      <div className="start-flex-box mb16">
        <CommonRangePicker defaultTime={defaultTime} onOk={(v) => updater.timeSpan(v)} />
        {/* <Radio.Group value={view} onChange={(e: any) => updater.view(e.target.value)}> */}
        {/*  <Radio.Button value="table"><CustomIcon type="unorderedlist" /></Radio.Button> */}
        {/*  <Radio.Button value="chart"><CustomIcon type="bar-chart" /></Radio.Button> */}
        {/* </Radio.Group> */}
      </div>
      <IF check={view === 'table'}>
        <Table
          rowKey="id"
          dataSource={recordHistories}
          loading={loading}
          columns={columns}
          expandedRowRender={(record: ALARM_REPORT.AlarmHistory) => (
            <div className="pr32">
              <div className="code-block auto-overflow content-block">
                <pre className="prewrap">{record.content}</pre>
              </div>
            </div>
          )}
        />
        <IF.ELSE />
        <PureBoardGrid layout={layout} />
      </IF>
      <IF check={drawerVisible}>
        <EditIssueDrawer
          projectId={relatedProject}
          id={Number(recordDetail.issueId)}
          customUrl={issueUrlMap[scope]}
          issueType={ISSUE_TYPE.TICKET}
          ticketType="monitor"
          iterationID={-1}
          visible={drawerVisible}
          closeDrawer={closeDrawer}
        />
      </IF>
      <SelectProjectModal
        visible={selectProjectVisible}
        onOk={handleSelectProject}
        toggleModal={toggleSelectProjectModal}
      />
    </div>
  );
};
