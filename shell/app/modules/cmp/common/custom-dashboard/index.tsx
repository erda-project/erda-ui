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
import { Button, Modal, FormInstance, Avatar } from 'antd';
import { formatTime, fromNow, goTo, getAvatarChars } from 'common/utils';
import { useUserMap } from 'core/stores/userMap';
import { useMount } from 'react-use';
import { useUpdate } from 'common/use-hooks';
import i18n from 'i18n';
import ErdaTable from 'common/components/table';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import orgCustomDashboardStore from 'app/modules/cmp/stores/custom-dashboard';
import mspCustomDashboardStore from 'msp/query-analysis/custom-dashboard/stores/custom-dashboard';
import breadcrumbStore from 'app/layout/stores/breadcrumb';
import { CustomDashboardScope } from 'app/modules/cmp/stores/_common-custom-dashboard';
import { getCustomDashboardCreators, exportCustomDashboard } from 'app/modules/cmp/services/_common-custom-dashboard';
import { map } from 'lodash';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { ConfigurableFilter, FormModal } from 'common';
import ImportExport from 'cmp/common/custom-dashboard/import-export';

const storeMap = {
  [CustomDashboardScope.ORG]: orgCustomDashboardStore,
  [CustomDashboardScope.MICRO_SERVICE]: mspCustomDashboardStore,
};

const urlMap = {
  [CustomDashboardScope.ORG]: {
    add: goTo.pages.orgAddCustomDashboard,
    detail: goTo.pages.orgCustomDashboardDetail,
  },
  [CustomDashboardScope.MICRO_SERVICE]: {
    add: goTo.pages.microServiceAddCustomDashboard,
    detail: goTo.pages.microServiceCustomDashboardDetail,
  },
};
const CustomDashboardList = ({
  scope,
  scopeId,
  relationship,
}: {
  scope: CustomDashboardScope;
  scopeId: string;
  relationship?: Custom_Dashboard.Relationship[];
}) => {
  const params = routeInfoStore.useStore((s) => s.params);
  const [{ formData, filterData, recordModalVisible, formModalVisible }, updater, update] = useUpdate({
    formData: null,
    filterData: { creator: [], createdAt: '', title: undefined } as Custom_Dashboard.CustomLIstQuery,
    recordModalVisible: false,
    formModalVisible: false,
  });

  const isEditing = formData !== null;
  const formRef = React.useRef<FormInstance>(null);
  const creatorsData = getCustomDashboardCreators.useData();
  const userMap = useUserMap();
  const store = storeMap[scope];
  const [customDashboardList, customDashboardPaging] = store.useStore((s) => [
    s.customDashboardList,
    s.customDashboardPaging,
  ]);
  const { creators } = creatorsData || {};
  const creatorOptions = map(creators, (item) => ({ label: userMap[item]?.nick || userMap[item]?.name, value: item }));

  const {
    getCustomDashboard,
    deleteCustomDashboard,
    updateCustomDashboardInfo,
    createCustomDashboard,
    updateCustomDashboard,
  } = store;
  const { pageNo, total, pageSize } = customDashboardPaging;
  const [loading] = useLoading(store, ['getCustomDashboard']);

  const _getCustomDashboard = React.useCallback(
    (no: number, size?: number, queryObj: Custom_Dashboard.CustomLIstQuery = filterData) => {
      const { createdAt, ...rest } = queryObj;
      let query = queryObj;
      if (createdAt) {
        query = { ...rest, startTime: createdAt[0], endTime: createdAt[1] };
      }
      getCustomDashboard({
        scope,
        scopeId,
        pageSize: size,
        pageNo: no,
        ...query,
      });
    },
    [getCustomDashboard, scope, scopeId, filterData],
  );

  useMount(() => {
    _getCustomDashboard(pageNo);
  });

  React.useEffect(() => {
    getCustomDashboardCreators.fetch({ scope, scopeId });
  }, [scope, scopeId]);

  React.useEffect(() => {
    _getCustomDashboard(1, pageSize, filterData);
  }, [_getCustomDashboard, filterData, pageSize]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: `${i18n.t('common:confirm to delete')}?`,
      onOk: async () => {
        await deleteCustomDashboard({ id, scopeId });
        _getCustomDashboard(total - 1 > (pageNo - 1) * pageSize ? pageNo : 1);
      },
    });
  };

  const handleEdit = (record: { name: string; desc?: string }) => {
    updater.formModalVisible(true);
    updater.formData(record);
  };

  const columns: Array<ColumnProps<Custom_Dashboard.DashboardItem>> = [
    {
      title: i18n.t('Name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('Description'),
      dataIndex: 'desc',
      render: (desc: string) => desc || '--',
    },
    {
      title: i18n.t('Update time'),
      dataIndex: 'updatedAt',
      render: (timestamp: number) => fromNow(timestamp),
    },
    {
      title: i18n.t('Creator'),
      dataIndex: 'creator',
      render: (text: string) => {
        const cU = userMap[Number(text)];
        if (text && cU) {
          return (
            <span>
              <Avatar size="small" src={cU.avatar}>
                {cU.nick ? getAvatarChars(cU.nick) : i18n.t('None')}
              </Avatar>
              <span className="ml-0.5 mr-1" title={cU.name}>
                {cU.nick || cU.name || text || i18n.t('None')}
              </span>
            </span>
          );
        }

        return '-';
      },
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      render: (timestamp: number) => formatTime(timestamp, 'YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const filterList = [
    {
      key: 'creatorId',
      type: 'select',
      label: i18n.t('Creator'),
      options: creatorOptions,
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Submitter') }),
    },
    {
      key: 'description',
      type: 'input',
      label: i18n.t('Description'),
      options: creatorOptions,
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Description') }),
    },
    {
      key: 'createdAt',
      type: 'dateRange',
      label: i18n.t('create time'),
    },
    {
      label: '',
      type: 'input',
      outside: true,
      key: 'name',
      placeholder: i18n.t('default:Search by keyword'),
      customProps: {
        autoComplete: 'off',
      },
    },
  ];

  const fieldsList = [
    {
      name: 'name',
      label: i18n.t('cmp:Name'),
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: i18n.t('cmp:Please enter the dashboard name'),
      },
    },
    {
      name: 'desc',
      label: i18n.t('cmp:Description'),
      required: false,
      itemProps: {
        maxLength: 200,
        placeholder: i18n.t('cmp:Please enter the dashboard description'),
      },
    },
    {
      name: 'id',
      required: false,
      itemProps: {
        hidden: true,
      },
    },
  ];

  const tableActions: IActions<Custom_Dashboard.DashboardItem> = {
    render: (record) => [
      {
        title: i18n.t('delete'),
        onClick: () => {
          handleDelete(record.id as string);
        },
      },
      {
        title: i18n.t('cmp:Export File'),
        onClick: () => {
          exportCustomDashboard({ scope, scopeId, viewIds: [String(record.id)] });
          updater.recordModalVisible(true);
        },
      },
      {
        title: i18n.t('cmp:Edit Name'),
        onClick: () => {
          handleEdit(record);
        },
      },
    ],
  };

  const slot = (
    <ConfigurableFilter
      hideSave
      value={filterData}
      fieldsList={filterList}
      onFilter={(values) => {
        updater.filterData(values);
      }}
    />
  );

  const onSubmit = (values: Custom_Dashboard.BasicInfo) => {
    updater.formModalVisible(false);
    if (!isEditing) {
      breadcrumbStore.reducers.setInfo('dashboardName', values.name);
      createCustomDashboard({ name: values.name, desc: values.desc, scope, scopeId, version: 'v2' }).then((res) => {
        updateCustomDashboardInfo({ name: values.name, desc: values.desc, id: res.id });
      });
      goTo(urlMap[scope].add);
    } else {
      updateCustomDashboardInfo(values);
      updateCustomDashboard({
        name: values.name,
        desc: values.desc,
        scope,
        scopeId,
        id: values.id,
        updateType: 'MetaType',
      }).then(() => {
        updater.formData(null);
        _getCustomDashboard(pageNo);
      });
    }
  };

  return (
    <>
      <div className="top-button-group">
        <ImportExport
          scope={scope}
          scopeId={scopeId}
          queryObj={filterData as Custom_Dashboard.CustomLIstQuery}
          visible={recordModalVisible}
          onVisibleChange={updater.recordModalVisible}
          getCustomDashboard={_getCustomDashboard}
          relationship={relationship}
        />
        <Button
          type="primary"
          onClick={() => {
            updater.formModalVisible(true);
          }}
        >
          {i18n.t('cmp:Add-custom-dashboard')}
        </Button>
      </div>
      <ErdaTable
        rowKey="id"
        columns={columns}
        actions={tableActions}
        dataSource={customDashboardList}
        loading={loading}
        onRow={({ id }: Custom_Dashboard.DashboardItem) => {
          return {
            onClick: () => {
              goTo(urlMap[scope].detail, { ...params, customDashboardId: id });
            },
          };
        }}
        pagination={{
          current: pageNo,
          total,
          pageSize,
        }}
        onChange={({ current = 1, pageSize: size }) => {
          _getCustomDashboard(current, size);
        }}
        scroll={{ x: '100%' }}
        slot={slot}
      />
      <FormModal
        width={800}
        ref={formRef}
        title={`${isEditing ? i18n.t('cmp:Edit Name') : i18n.t('cmp:Add Dashboard')}`}
        visible={formModalVisible}
        fieldsList={fieldsList}
        formData={formData}
        onOk={(values: any) => {
          onSubmit(values);
        }}
        onCancel={() => {
          updater.formModalVisible(false);
          updater.formData(null);
        }}
        modalProps={{ destroyOnClose: true }}
      />
    </>
  );
};

export default CustomDashboardList;
