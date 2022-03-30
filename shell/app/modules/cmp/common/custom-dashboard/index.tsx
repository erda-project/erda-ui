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
import { Button, Modal, FormInstance } from 'antd';
import { formatTime, fromNow, goTo } from 'common/utils';
import { useUserMap } from 'core/stores/userMap';
import { useMount } from 'react-use';
import i18n from 'i18n';
import ErdaTable from 'common/components/table';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import orgCustomDashboardStore from 'app/modules/cmp/stores/custom-dashboard';
import mspCustomDashboardStore from 'msp/query-analysis/custom-dashboard/stores/custom-dashboard';
import breadcrumbStore from 'app/layout/stores/breadcrumb';
import { CustomDashboardScope } from 'app/modules/cmp/stores/_common-custom-dashboard';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { UserInfo, ConfigurableFilter, FormModal } from 'common';
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
const CustomDashboardList = ({ scope, scopeId }: { scope: CustomDashboardScope; scopeId: string }) => {
  const params = routeInfoStore.useStore((s) => s.params);
  const [formData, setFormData] = React.useState(null);
  const isEditing = formData !== null;
  const formRef = React.useRef<FormInstance>(null);
  const userMap = useUserMap();
  const store = storeMap[scope];
  const [customDashboardList, customDashboardPaging, modalVisible] = store.useStore((s) => [
    s.customDashboardList,
    s.customDashboardPaging,
    s.modalVisible,
  ]);

  const {
    getCustomDashboard,
    deleteCustomDashboard,
    updateModalVisible,
    updateCustomDashboardInfo,
    updateCustomDashboard,
  } = store;
  const { pageNo, total, pageSize } = customDashboardPaging;
  const [loading] = useLoading(store, ['getCustomDashboard']);
  const _getCustomDashboard = React.useCallback(
    (no: number, pageSize?: number) =>
      getCustomDashboard({
        scope,
        scopeId,
        pageSize,
        pageNo: no,
      }),
    [getCustomDashboard, scope, scopeId],
  );

  useMount(() => {
    _getCustomDashboard(pageNo);
  });

  React.useEffect(() => {

  }, [userMap]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: `${i18n.t('common:confirm to delete')}?`,
      onOk: async () => {
        await deleteCustomDashboard({ id, scopeId });
        _getCustomDashboard(total - 1 > (pageNo - 1) * pageSize ? pageNo : 1, pageSize);
      },
    });
  };

  const handleEdit = (record) => {
    updateModalVisible(true);
    setFormData(record);
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
      render: (text: string) => <UserInfo id={text} />,
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      render: (timestamp: number) => formatTime(timestamp, 'YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const filterList = [
    {
      key: 'creatorIDs',
      type: 'select',
      label: i18n.t('creator'),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('submitter') }),
      // placeholder: i18n.t('filter by {name}', { name: i18n.t('App') }),
    },
    {
      key: 'createdAt',
      type: 'dateRange',
      label: i18n.t('create time'),
      // placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:branch') }),
    },
    {
      label: '',
      type: 'input',
      outside: true,
      key: 'keyword',
      placeholder: i18n.t('default:search by keywords'),
      customProps: {
        autoComplete: 'off',
      },
    },
  ];

  const fieldsList = [
    {
      name: 'name',
      label: i18n.d('大盘名称'),
      required: true,
      itemProps: {
        maxLength: 50,
        placeholder: i18n.t('cmp:please input dashboard name'),
      },
    },
    {
      name: 'desc',
      label: i18n.d('大盘描述'),
      required: false,
      itemProps: {
        maxLength: 200,
        placeholder: i18n.t('cmp:please input dashboard description'),
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
        title: i18n.d('编辑大盘名称'),
        onClick: () => {
          handleEdit(record);
        },
      },
      {
        title: i18n.t('delete'),
        onClick: () => {
          handleDelete(record.id as string);
        },
      },
    ],
  };

  const slot = <ConfigurableFilter hideSave fieldsList={filterList} onFilter={() => {}} />;

  const onSubmit = (values) => {
    updateModalVisible(false);
    if (!isEditing) {
      breadcrumbStore.reducers.setInfo('dashboardName', values.name);
      goTo(urlMap[scope].add);
      updateCustomDashboardInfo({ name: values.name, desc: values.desc });
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
        setFormData(null);
        _getCustomDashboard(pageNo);
      });
    }
  };
  return (
    <>
      <div className="top-button-group">
        <ImportExport />
        <Button
          type="primary"
          onClick={() => {
            updateModalVisible(true);
            // goTo(urlMap[scope].add)
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
        onChange={({ current, pageSize }) => {
          _getCustomDashboard(current, pageSize);
        }}
        scroll={{ x: '100%' }}
        slot={slot}
      />
      <FormModal
        width={800}
        ref={formRef}
        title={`${isEditing ? i18n.d('编辑大盘名称') : i18n.d('新增大盘名称')}`}
        visible={modalVisible}
        fieldsList={fieldsList}
        formData={formData}
        onOk={(values: any) => {
          onSubmit(values);
        }}
        onCancel={() => {
          updateModalVisible(false);
          setFormData(null);
        }}
        modalProps={{ destroyOnClose: true }}
      />
    </>
  );
};

export default CustomDashboardList;
