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
import i18n from 'i18n';
import { Spin, Input, Drawer, Modal, Avatar } from 'antd';
import Table from 'common/components/table';
import { IActions } from 'common/components/table/interface';
import { Filter, RadioTabs, Badge } from 'common';
import { getAvatarChars } from 'common/utils';
import { PAGINATION } from 'app/constants';
import { useUserMap } from 'core/stores/userMap';
import { importExportProjectRecord } from 'org/services/project-list';
import moment from 'moment';
import orgStore from 'app/org-home/stores/org';
import './project-list.scss';

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
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

export const OperationProjectRecords = ({ visible, setVisible }: IProps) => {
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const [handleProjectRecord, handleRecordLoading] = importExportProjectRecord.useState();
  const userMap = useUserMap();
  const [activeKey, setActiveKey] = React.useState('all' as string);
  const [searchObj, setSearchObj] = React.useState<IState>({
    pageNo: 1,
    pageSize: 10,
    query: '',
    asc: false,
  });

  React.useEffect(() => {
    importExportProjectRecord.fetch({ orgID, types: handleFileTypeMap.all });
  }, [orgID]);

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
      title: i18n.t('operator'),
      dataIndex: 'operatorID',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => {
        const { avatar, nick } = userMap[text];
        return (
          <>
            <Avatar src={avatar || undefined} size="small" className="flex-shrink-0">
              {nick ? getAvatarChars(nick) : i18n.t('none')}
            </Avatar>
            <span> {nick}</span>
          </>
        );
      },
    },
    {
      title: i18n.t('execution time'),
      dataIndex: 'updatedAt',
      ellipsis: {
        showTitle: false,
      },
      sorter: true,
      sortOrder: getColumnOrder('updatedAt'),
      render: (updatedAt: string) => moment(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const recordActions: IActions<PROJECT_LIST.FileRecord> = {
    width: 120,
    render: (record: PROJECT_LIST.FileRecord) => {
      const { viewResult, exportProject } = {
        viewResult: {
          title: i18n.t('view results'),
          onClick: () => {
            if (record.state === 'success') {
              Modal.success({
                title: i18n.t('view results'),
                content: (
                  <span className="font-medium text-base text-default text-success">
                    {record.type === 'projectTemplateImport'
                      ? i18n.t('imported successfully')
                      : i18n.t('exported successfully')}
                    !
                  </span>
                ),
              });
            } else {
              Modal.error({
                title: i18n.t('view results'),
                content: record.errorInfo,
              });
            }
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
  }, [activeKey, orgID, searchObj]);

  const handleTableChange = (pagination: { current: number; pageSize: number }, filters: any, sorter: any) => {
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
        onClose={() => {
          setVisible(false);
          setActiveKey('all');
        }}
        visible={visible}
        destroyOnClose
        title={i18n.t('import and export records')}
        className="dice-drawer advanced-filter-drawer"
      >
        <RadioTabs
          options={options}
          value={activeKey}
          onChange={(v) => {
            setActiveKey(v as string);
            setSearchObj({ ...searchObj, pageNo: 1 });
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
    </>
  );
};
