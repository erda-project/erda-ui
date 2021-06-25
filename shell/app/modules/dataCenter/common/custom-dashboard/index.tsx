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
import { Button, Table, Popconfirm } from 'app/nusi';
import { goTo, fromNow, formatTime } from 'common/utils';
import { useMount } from 'react-use';
import i18n from 'i18n';
import routeInfoStore from 'app/common/stores/route';
import { useLoading } from 'app/common/stores/loading';
import orgCustomDashboardStore from 'app/modules/dataCenter/stores/custom-dashboard';
import mspCustomDashboardStore from 'msp/monitor/custom-dashboard/stores/custom-dashboard';
import { CustomDashboardScope } from 'app/modules/dataCenter/stores/_common-custom-dashboard';

const storeMap = {
  [CustomDashboardScope.ORG]: orgCustomDashboardStore,
  [CustomDashboardScope.MICRO_SERVICE]: mspCustomDashboardStore,
};

export default ({ scope, scopeId }: { scope: CustomDashboardScope; scopeId: string }) => {
  const params = routeInfoStore.useStore((s) => s.params);
  const store = storeMap[scope];
  const [customDashboardList, customDashboardPaging] = store.useStore((s) => [
    s.customDashboardList,
    s.customDashboardPaging,
  ]);
  const { getCustomDashboard, deleteCustomDashboard } = store;
  const { pageNo, total, pageSize } = customDashboardPaging;
  const [loading] = useLoading(store, ['getCustomDashboard']);
  const _getCustomDashboard = React.useCallback(
    (no: number) =>
      getCustomDashboard({
        scope,
        scopeId,
        pageSize,
        pageNo: no,
      }),
    [getCustomDashboard, pageSize, scope, scopeId],
  );

  useMount(() => {
    _getCustomDashboard(pageNo);
  });

  const handleDelete = (id: string) => {
    deleteCustomDashboard({ id, scopeId }).then(() => {
      _getCustomDashboard(total - 1 > (pageNo - 1) * pageSize ? pageNo : 1);
    });
  };

  const columns = [
    {
      title: i18n.t('name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('description'),
      dataIndex: 'desc',
      render: (desc: string) => desc || '--',
    },
    {
      title: i18n.t('update time'),
      dataIndex: 'updatedAt',
      render: (timestamp: number) => fromNow(timestamp),
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      render: (timestamp: number) => formatTime(timestamp, 'YYYY-MM-DD HH:mm:ss'),
    },
    {
      width: 120,
      title: i18n.t('operation'),
      render: ({ id }: Custom_Dashboard.DashboardItem) => (
        <div className="table-operations">
          <Popconfirm
            title={`${i18n.t('common:confirm to delete')}?`}
            onConfirm={(e: any) => {
              e.stopPropagation();
              handleDelete(id as string);
            }}
            onCancel={(e: any) => e.stopPropagation()}
          >
            <a className="table-operations-btn" onClick={(e: any) => e.stopPropagation()}>
              {i18n.t('delete')}
            </a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="top-button-group">
        <Button type="primary" onClick={() => goTo(goTo.pages[`${scope}AddCustomDashboard`], params)}>
          {i18n.t('org:new O & M dashboard')}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={customDashboardList}
        loading={loading}
        onRow={({ id }: Custom_Dashboard.DashboardItem) => {
          return {
            onClick: () => {
              goTo(goTo.pages[`${scope}CustomDashboardDetail`], { ...params, customDashboardId: id });
            },
          };
        }}
        pagination={{
          current: pageNo,
          total,
          pageSize,
          onChange: _getCustomDashboard,
        }}
      />
    </>
  );
};
