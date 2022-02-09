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
import { Spin, Button, Input, Tooltip, Menu, Dropdown, message } from 'antd';
import ErdaTable from 'common/components/table';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { goTo, fromNow } from 'common/utils';
import { Filter, ErdaIcon, ErdaAlert } from 'common';
import { useUnmount } from 'react-use';
import { PAGINATION } from 'app/constants';
import projectStore from 'project/stores/project';
import { exportProjectTemplate, importExportFileRecord } from 'org/services/project-list';
import { useLoading } from 'core/stores/loading';
import { OperationProjectRecords } from './operation-project-record';
import orgStore from 'app/org-home/stores/org';
import './project-list.scss';

interface IState {
  pageNo: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
  asc?: boolean;
}

const projectTypeMap = {
  MSP: <ErdaIcon type="MSP" size={28} />,
  DevOps: <ErdaIcon type="DevOps" size={28} />,
};

export const ProjectList = () => {
  const [list, paging] = projectStore.useStore((s) => [s.list, s.paging]);
  const { getProjectList } = projectStore.effects;
  const { clearProjectList } = projectStore.reducers;
  const { pageNo, pageSize, total } = paging;
  const [loadingList] = useLoading(projectStore, ['getProjectList']);
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const [searchObj, setSearchObj] = React.useState<IState>({
    pageNo: 1,
    pageSize,
    query: '',
    orderBy: 'activeTime',
    asc: false,
  });
  const [visible, setVisible] = React.useState(false);
  const [isClickExport, setIsClickExport] = React.useState(false);

  useUnmount(() => {
    clearProjectList();
  });

  const getColumnOrder = (key?: string) => {
    if (key) {
      return searchObj.orderBy === key ? (searchObj.asc ? 'ascend' : 'descend') : undefined;
    }
    return undefined;
  };

  const getColumns = () => {
    const columns: Array<ColumnProps<PROJECT.Detail>> = [
      {
        title: i18n.t('project'),
        dataIndex: 'displayName',
        key: 'displayName',
        icon: (text: string, record: PROJECT.Detail) => projectTypeMap[record.type] || projectTypeMap.DevOps,
        subTitle: (text: string, record: PROJECT.Detail) => record.desc,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: () => (
          <span className="flex items-center">
            <span className="mr-1">{i18n.t('cmp:application/Member Statistics')}</span>
            <Tooltip title={i18n.t('update data every day at 0')}>
              <ErdaIcon className="font-bold" type="attention" size="14" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'stats',
        key: 'countApplications',
        render: (stats: PROJECT.ProjectStats) => `${stats.countApplications} / ${stats.countMembers}`,
      },
      {
        title: i18n.t('CPU quota'),
        dataIndex: 'cpuQuota',
        key: 'cpuQuota',
        icon: <ErdaIcon type="CPU" />,
        sorter: true,
        sortOrder: getColumnOrder('cpuQuota'),
        render: (text: string) => `${(+text || 0).toFixed(2)} Core`,
      },
      {
        title: i18n.t('Memory quota'),
        dataIndex: 'memQuota',
        key: 'memQuota',
        icon: <ErdaIcon type="GPU" />,
        sorter: true,
        sortOrder: getColumnOrder('memQuota'),
        render: (text: string) => `${(+text || 0).toFixed(2)} GiB`,
      },
      {
        title: i18n.t('latest active'),
        dataIndex: 'activeTime',
        key: 'activeTime',
        sorter: true,
        sortOrder: getColumnOrder('activeTime'),
        render: (text) => (text ? fromNow(text) : i18n.t('none')),
      },
    ];
    return columns;
  };

  const ProjectActions: IActions<PROJECT.Detail> = {
    width: 120,
    render: (record: PROJECT.Detail) => {
      const { exportProject, goToEfficiencyMeasure } = {
        exportProject: {
          title: i18n.t('export'),
          onClick: () => {
            exportProjectTemplate.fetch({ orgID, projectID: record.id }).then(() => {
              message
                .success(i18n.t('dop:The export task has been created, please check the progress in the record'), 4)
                .then(() => {
                  importExportFileRecord.fetch({
                    orgID,
                    types: ['projectTemplateExport'],
                    pageNo: 1,
                    pageSize: searchObj.pageSize,
                  });
                });
              setIsClickExport(true);
              setVisible(true);
            });
          },
        },
        goToEfficiencyMeasure: {
          title: i18n.t('dop:efficiency measure'),
          onClick: () => {
            goTo(`./${record.id}/measure/task`);
          },
        },
      };

      return record.type === 'MSP' ? [exportProject] : [exportProject, goToEfficiencyMeasure];
    },
  };

  const onSearch = (query: string) => {
    setSearchObj((prev) => ({ ...prev, query, pageNo: 1 }));
  };

  const getList = React.useCallback(
    (_search?: IState) => {
      getProjectList({ ...searchObj, ..._search });
    },
    [searchObj, getProjectList],
  );

  React.useEffect(() => {
    getList(searchObj);
  }, [searchObj, getList]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSearchObj((prev) => ({
      ...prev,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      orderBy: sorter?.field && sorter?.order ? sorter.field : undefined,
      asc: sorter?.order ? sorter.order === 'ascend' : undefined,
    }));
  };

  const addDropdownMenu = (
    <Menu className="bg-default">
      <Menu.Item onClick={() => goTo('./createProject')} key={'app'} className="bg-default hover:bg-white-08">
        <div className="flex-h-center text-white-9">
          <ErdaIcon type="tj1" size={16} className="mr-1" />
          {i18n.t('add')}
        </div>
      </Menu.Item>
      <Menu.Item onClick={() => goTo('./importProject')} key={'file'} className="bg-default hover:bg-white-08">
        <div className="flex-h-center text-white-9">
          <ErdaIcon type="upload" size={16} className="mr-1" />
          {i18n.t('import')}
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="org-project-list">
      <Spin spinning={loadingList}>
        <div className="top-button-group flex">
          <Button
            className="text-default-8 bg-default-06 font-medium"
            onClick={() => {
              setVisible(true);
            }}
          >
            {i18n.t('import and export records')}
          </Button>
          <Dropdown overlay={addDropdownMenu} trigger={['click']}>
            <Button type={'primary'} className="bg-default flex-h-center">
              {i18n.t('add project')}
              <ErdaIcon type="caret-down" size="18" color="currentColor" className="ml-1 text-white-400" />
            </Button>
          </Dropdown>
        </div>
        <ErdaAlert
          showOnceKey="project-list"
          message={i18n.t(
            'support the creation and deletion of all projects in the organization, as well as the operation and management of project members and quotas.',
          )}
        />
        <ErdaTable
          rowKey="id"
          dataSource={list}
          columns={getColumns()}
          rowClassName={() => 'cursor-pointer'}
          actions={ProjectActions}
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
          onRow={(record: any) => {
            return {
              onClick: () => {
                goTo(`./${record.id}/info`);
              },
            };
          }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: PAGINATION.pageSizeOptions,
          }}
          onChange={handleTableChange}
        />
      </Spin>
      <OperationProjectRecords
        visible={visible}
        setVisible={setVisible}
        isClickExport={isClickExport}
        setIsClickExport={setIsClickExport}
      />
    </div>
  );
};
