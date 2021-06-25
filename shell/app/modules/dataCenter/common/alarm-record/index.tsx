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
import { Table, Select } from 'app/nusi';
import { goTo } from 'common/utils';
import { map } from 'lodash';
import { Avatar, CustomFilter, MemberSelector, useFilter } from 'common';
import { useMount } from 'react-use';
import moment from 'moment';
import { useLoading } from 'app/common/stores/loading';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { IssueState } from 'project/common/components/issue/issue-state';
import { AlarmState } from 'dataCenter/common/alarm-state';
import userMapStore from 'app/common/stores/user-map';
import routeInfoStore from 'app/common/stores/route';
import orgAlarmRecordStore from 'dataCenter/stores/alarm-record';
import mspAlarmRecordStore from 'msp/monitor/alarm-record/stores/alarm-record';

export enum AlarmRecordScope {
  ORG = 'org',
  MICRO_SERVICE = 'micro_service',
}

const storeMap = {
  [AlarmRecordScope.ORG]: orgAlarmRecordStore,
  [AlarmRecordScope.MICRO_SERVICE]: mspAlarmRecordStore,
};

const memberScopeMap = {
  [AlarmRecordScope.ORG]: 'org',
  [AlarmRecordScope.MICRO_SERVICE]: 'project',
};

export default ({ scope }: { scope: string }) => {
  const alarmRecordStore = storeMap[scope];
  const [recordList, paging, alarmAttrs] = alarmRecordStore.useStore((s) => [
    s.recordList,
    s.recordListPaging,
    s.alarmAttrs,
  ]);
  const { getAlarmRecordList, getAlarmAttrs } = alarmRecordStore;
  const userMap = userMapStore.useStore((s) => s);
  const params = routeInfoStore.useStore((s) => s.params);

  const [loading] = useLoading(alarmRecordStore, ['getAlarmRecordList']);
  useMount(() => {
    getAlarmAttrs();
  });

  const { onSubmit, onReset, autoPagination } = useFilter({
    getData: getAlarmRecordList,
    debounceGap: 500,
  });

  const columns: Array<ColumnProps<ALARM_REPORT.RecordListItem>> = [
    {
      title: i18n.t('title'),
      dataIndex: 'title',
    },
    {
      title: i18n.t('org:alarm status'),
      dataIndex: 'alertState',
      width: 120,
      render: (alertState) => <AlarmState state={alertState} />,
    },
    {
      title: i18n.t('org:alarm type'),
      dataIndex: 'alertType',
      width: 80,
    },
    {
      title: i18n.t('org:alarm time'),
      dataIndex: 'alertTime',
      width: 180,
      render: (alertTime) => moment(alertTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('org:processing status'),
      dataIndex: 'handleState',
      width: 100,
      render: (handleState) => (handleState ? <IssueState state={handleState} /> : '--'),
    },
    {
      title: i18n.t('org:assignee'),
      dataIndex: 'handlerId',
      width: 120,
      render: (handlerId) => {
        const userInfo = userMap[handlerId];
        if (!userInfo) return '--';
        const { nick, name } = userInfo;
        return <Avatar name={nick || name} size={24} showName />;
      },
    },
    {
      title: i18n.t('org:processing time'),
      dataIndex: 'handleTime',
      width: 180,
      render: (handleTime) => (handleTime ? moment(handleTime).format('YYYY-MM-DD HH:mm:ss') : '--'),
    },
  ];

  const filterConfig = React.useMemo(
    () => [
      {
        type: Select,
        name: 'alertState',
        customProps: {
          mode: 'multiple',
          placeholder: i18n.t('filter by {name}', { name: i18n.t('org:alarm status') }),
          options: map(alarmAttrs.alertState, ({ key, display }) => (
            <Select.Option key={key} value={key}>
              {display}
            </Select.Option>
          )),
        },
      },
      {
        type: Select,
        name: 'alertType',
        customProps: {
          mode: 'multiple',
          placeholder: i18n.t('application:filter by alarm type'),
          options: map(alarmAttrs.alertType, ({ key, display }) => (
            <Select.Option key={key} value={key}>
              {display}
            </Select.Option>
          )),
        },
      },
      {
        type: Select,
        name: 'handleState',
        customProps: {
          mode: 'multiple',
          placeholder: i18n.t('application:filter by handling status'),
          options: map(alarmAttrs.handleState, ({ key, display }) => (
            <Select.Option key={key} value={key}>
              {display}
            </Select.Option>
          )),
        },
      },
      {
        type: MemberSelector,
        name: 'handlerId',
        customProps: {
          mode: 'multiple',
          valueChangeTrigger: 'onClose',
          placeholder: i18n.t('filter by handler'),
          scopeType: memberScopeMap[scope],
        },
      },
    ],
    [alarmAttrs.alertState, alarmAttrs.alertType, alarmAttrs.handleState, scope],
  );

  return (
    <>
      <CustomFilter onReset={onReset} onSubmit={onSubmit} config={filterConfig} isConnectQuery />
      <Table
        tableKey="alarm-record"
        rowKey={(r) => r.groupId}
        dataSource={recordList}
        loading={loading}
        columns={columns}
        pagination={autoPagination(paging)}
        onRow={(record: ALARM_REPORT.RecordListItem) => {
          return {
            onClick: () => {
              goTo(goTo.pages[`${scope}AlarmRecordDetail`], { ...params, id: record.groupId });
            },
          };
        }}
      />
    </>
  );
};
