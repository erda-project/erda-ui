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

import userMapStore from 'app/common/stores/user-map';
import { CustomFilter, useFilter, MemberSelector } from 'common';
import { useLoading } from 'app/common/stores/loading';
import i18n from 'i18n';
import moment from 'moment';
import { DatePicker, Table, Button, Tooltip } from 'app/nusi';
import auditStore from 'org/stores/audit';
import auditTpl from 'org/common/audit-render';
import * as React from 'react';
import { getTimeRanges, qs } from 'common/utils';
import orgStore from 'app/org-home/stores/org';

const AuditList = ({ sys }: { sys: boolean }) => {
  const orgId = orgStore.useStore(s => s.currentOrg.id);
  const userMap = userMapStore.useStore(s => s);
  const [loading] = useLoading(auditStore, ['getList']);
  const [list, paging] = auditStore.useStore(s => [s.auditList, s.auditPaging]);

  const columns = [
    {
      title: i18n.t('org:operation time'),
      dataIndex: 'startTime',
      width: 180,
      render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('org:audit-operator'),
      dataIndex: 'userId',
      width: 150,
      render: (v: string) => {
        return userMap[v] ? userMap[v].nick || userMap[v].name : v;
      },
    },
    {
      title: i18n.t('org:operation'),
      key: 'op',
      render: (val: string, r: AUDIT.Item) => {
        const _content = auditTpl(r);
        return (
          <>
            <Tooltip title={_content}>
              {_content}
            </Tooltip>
            {r.result !== 'success' ? ` (${r.errorMsg})` : null}
          </>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'clientIp',
      width: 150,
    },
  ];

  const filterConfig = React.useMemo(() => [
    {
      type: MemberSelector,
      name: 'userId',
      customProps: sys
        ? { scopeType: 'uc', mode: 'multiple', size: 'small', allowClear: true }
        : {
          scopeType: 'org',
          mode: 'multiple',
          size: 'small',
          valueChangeTrigger: 'onClose',
          placeholder: i18n.t('search by user name'),
        },
    },
    {
      type: DatePicker.RangePicker,
      name: 'startAt,endAt',
      valueType: 'range',
      customProps: {
        showTime: { format: 'HH:mm' },
        allowClear: false,
        format: 'YYYY-MM-DD HH:mm',
        ranges: getTimeRanges(),
      },
    },
  ], [sys]);

  const { onSubmit, onTableChange, queryCondition } = useFilter<AUDIT.Item[]>({
    getData: auditStore.effects.getList,
    extraQuery: { sys },
    initQuery: {
      startAt: moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      endAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    },
  });

  const onExport = () => {
    const extra = sys ? { sys: true } : { orgId };
    window.open(`/api/audits/actions/export-excel?${qs.stringify({ ...queryCondition, ...extra }, { arrayFormat: 'repeat' })}`);
  };

  return (
    <>
      <div className="top-button-group">
        <Button type='primary' onClick={onExport}>{i18n.t('export')}</Button>
      </div>
      <CustomFilter onSubmit={onSubmit} config={filterConfig} isConnectQuery />
      <Table
        rowKey='id'
        columns={columns}
        dataSource={list}
        loading={loading}
        onChange={onTableChange}
        pagination={{
          current: paging.pageNo,
          pageSize: +paging.pageSize,
          total: paging.total,
        }}
      />
    </>
  );
};

export default AuditList;
