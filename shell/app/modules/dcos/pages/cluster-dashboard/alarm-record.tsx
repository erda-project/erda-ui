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
import { goTo } from 'common/utils';
import { map } from 'lodash';
import { ConfigurableFilter } from 'common';
import ErdaTable from 'common/components/table';
import { useMount } from 'react-use';
import moment from 'moment';
import { useLoading } from 'core/stores/loading';
import i18n from 'i18n';
import alarmRecordStore from 'cmp/stores/alarm-record';
import { AlarmState } from 'cmp/common/alarm-state';
import { ColumnProps } from 'antd/lib/table';

const AlarmRecord = ({ clusters }: { clusters: any }) => {
  const [recordList, paging, alarmAttrs] = alarmRecordStore.useStore((s) => [
    s.recordList,
    s.recordListPaging,
    s.alarmAttrs,
  ]);
  const { getMachineAlarmRecordList, getAlarmAttrs } = alarmRecordStore;
  const [filterValue, setFilterValue] = React.useState<Obj<string>>({});

  const [loading] = useLoading(alarmRecordStore, ['getMachineAlarmRecordList']);

  useMount(() => {
    getAlarmAttrs();
    onSubmit();
  });

  const onSubmit = React.useCallback(
    (v?: Omit<ALARM_REPORT.RecordListQuery, 'alertType'>) => {
      getMachineAlarmRecordList({
        pageSize: paging.pageSize,
        pageNo: paging.pageNo,
        alertType: 'machine',
        clusters,
        ...v,
      });
    },
    [clusters, getMachineAlarmRecordList, paging.pageNo, paging.pageSize],
  );

  const columns: Array<ColumnProps<ALARM_REPORT.RecordListItem>> = [
    {
      title: i18n.t('Title'),
      dataIndex: 'title',
    },
    {
      title: i18n.t('cmp:Status-alert'),
      dataIndex: 'alertState',
      width: 150,
      render: (alertState) => <AlarmState state={alertState} />,
    },
    {
      title: i18n.t('Type-alarm'),
      dataIndex: 'alertType',
      width: 150,
    },
    {
      title: i18n.t('cmp:Time'),
      dataIndex: 'alertTime',
      width: 200,
      render: (alertTime) => moment(alertTime).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const slot = (
    <ConfigurableFilter
      hideSave
      value={filterValue}
      fieldsList={[
        {
          key: 'alertState',
          type: 'select',
          outside: true,
          label: i18n.t('Cluster name'),
          options: map(alarmAttrs.alertState, ({ key, display }) => ({ label: display, value: key })),
          placeholder: i18n.t('filter by {name}', { name: i18n.t('cmp:Status-alert') }),
        },
      ]}
      onFilter={(v) => {
        setFilterValue(v);
        onSubmit(v);
      }}
    />
  );

  return (
    <ErdaTable
      rowKey="id"
      dataSource={recordList}
      slot={slot}
      loading={loading}
      columns={columns}
      onReload={() => onSubmit({ ...filterValue })}
      pagination={{ ...paging }}
      onRow={(record: ALARM_REPORT.RecordListItem) => {
        return {
          onClick: () => {
            goTo(goTo.pages.orgAlarmRecordDetail, { id: record.groupId, jumpOut: true });
          },
        };
      }}
      scroll={{ x: '100%' }}
    />
  );
};

export default AlarmRecord;
