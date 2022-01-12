// Copyright (c) 2022 Terminus, Inc.
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
import i18n from 'i18n';
import { Spin, Button, Input, Tooltip, Drawer, Menu, Dropdown, Modal } from 'antd';
import Table from 'common/components/table';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { goTo, fromNow } from 'common/utils';
import { Filter, ErdaIcon, ErdaAlert, RadioTabs, Badge } from 'common';
import { useMount, useUnmount } from 'react-use';
import { PAGINATION } from 'app/constants';
import projectStore from 'project/stores/project';
import { importExportProjectRecord } from 'org/services/project-list';
import moment from 'moment';
import orgStore from 'app/org-home/stores/org';
import './project-list.scss';

interface IState {
  pageNo: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
  asc?: boolean;
}

const handleFileTypeMap = {
  all: ['projectTemplateExport', 'projectTemplateImport'],
  import: 'projectTemplateImport',
  export: 'projectTemplateExport',
};

const options = [
  { value: 'all', label: `${i18n.t('all')}` },
  { value: 'import', label: `${i18n.t('import')}` },
  { value: 'export', label: `${i18n.t('export')}` },
];

export const OperationProjectRecords = ({ visible, setVisible }) => {
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const [handleProjectRecord, handleRecordLoading] = importExportProjectRecord.useState();
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState('all');
  const [result, setResult] = React.useState('');
  const [searchObj, setSearchObj] = React.useState<IState>({
    pageNo: 1,
    pageSize: 10,
    query: '',
    orderBy: 'activeTime',
    asc: false,
  });

  React.useEffect(() => {
    importExportProjectRecord.fetch({ orgID, types: handleFileTypeMap.all });
  }, [visible]);

  const getColumnOrder = (key?: string) => {
    if (key) {
      return searchObj.orderBy === key ? (searchObj.asc ? 'ascend' : 'descend') : undefined;
    }
    return undefined;
  };

  const recordColumns = [
    {
      title: i18n.t('project'),
      dataIndex: 'projectName',
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: i18n.t('status'),
      dataIndex: 'state',
      ellipsis: {
        showTitle: false,
      },
      render: (state: string) => (
        <Badge
          status={state === 'success' ? 'success' : 'error'}
          text={state === 'success' ? i18n.t('succeed') : i18n.t('failed')}
        />
      ),
    },
    {
      title: i18n.t('type'),
      dataIndex: 'type',
      ellipsis: {
        showTitle: false,
      },
      render: (type: string) => {
        if (type === handleFileTypeMap.import) {
          return i18n.t('import');
        }
        return i18n.t('export');
      },
    },
    {
      title: i18n.d('操作者'),
      dataIndex: 'operatorID',
      ellipsis: {
        showTitle: false,
      },
      // TODO: 头像
    },
    {
      title: i18n.d('执行时间'),
      dataIndex: 'updatedAt',
      ellipsis: {
        showTitle: false,
      },
      sorter: true,
      sortOrder: getColumnOrder('updatedAt'),
      render: (updatedAt: string) => moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const recordActions: IActions<any> = {
    width: 120,
    render: (record: any) => {
      const { viewResult, exportProject } = {
        viewResult: {
          title: i18n.d('查看结果'),
          onClick: () => {
            setIsVisible(true);
            setResult(record.errorInfo);
          },
        },
        exportProject: {
          title: i18n.t('download'),
          onClick: () => window.open(`/api/files/${record.apiFileUUID}`),
        },
      };

      return record.type === 'import' ? [exportProject] : [viewResult, exportProject];
    },
  };

  const onSearch = (query: string) => {
    setSearchObj((prev) => ({ ...prev, query, pageNo: 1 }));
  };

  React.useEffect(() => {
    importExportProjectRecord.fetch({
      ...searchObj,
      orgID,
      types: handleFileTypeMap[activeKey],
      projectName: searchObj.query,
      pageNo: searchObj.pageNo,
      pageSize: searchObj.pageSize,
    });
  }, [activeKey, searchObj]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSearchObj((prev) => ({
      ...prev,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      orderBy: sorter?.field && sorter?.order ? sorter.field : undefined,
      asc: sorter?.order ? sorter.order === 'ascend' : undefined,
    }));
  };

  return (
    <>
      <Drawer
        width="80%"
        onClose={() => setVisible(false)}
        visible={visible}
        destroyOnClose
        title={i18n.d('导入导出记录')}
        className="dice-drawer advanced-filter-drawer"
      >
        <RadioTabs
          options={options}
          value={activeKey}
          onChange={(v: string[]) => {
            setActiveKey(v);
          }}
          className="mb-2"
        />
        <Spin spinning={handleRecordLoading}>
          <Table
            rowKey="id"
            columns={recordColumns}
            dataSource={handleProjectRecord?.list}
            actions={recordActions}
            slot={
              <Filter
                config={[
                  {
                    type: Input,
                    name: 'projectName',
                    customProps: {
                      placeholder: i18n.t('search by project name'),
                      style: { width: 200 },
                    },
                  },
                ]}
                onFilter={({ projectName }: { projectName: string }) => onSearch(projectName)}
              />
            }
            pagination={{
              current: searchObj.pageNo,
              pageSize: searchObj.pageSize,
              total: handleProjectRecord?.total,
              showSizeChanger: true,
              pageSizeOptions: PAGINATION.pageSizeOptions,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Drawer>
      <Modal visible={isVisible} onCancel={() => setIsVisible(false)}>
        {result}
      </Modal>
    </>
  );
};
