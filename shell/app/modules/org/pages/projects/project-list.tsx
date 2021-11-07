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
import { Spin, Button, Input, Tooltip } from 'antd';
import Table, { IColumnProps } from 'common/components/table';
import { goTo, fromNow } from 'common/utils';
import { Filter, Icon as CustomIcon, ErdaIcon } from 'common';
import { useUnmount } from 'react-use';
import { ChartHistogramTwo as IconChartHistogramTwo, Attention as IconAttention } from '@icon-park/react';
import { PAGINATION } from 'app/constants';
import projectStore from 'project/stores/project';
import { useLoading } from 'core/stores/loading';
import './project-list.scss';

interface IState {
  pageNo: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
  asc?: boolean;
}

const projectTypeMap = {
  MSP: <ErdaIcon type="MSP" size={30} />,
  DevOps: <ErdaIcon type="DevOps" size={30} />,
};

export const ProjectList = () => {
  const [list, paging] = projectStore.useStore((s) => [s.list, s.paging]);
  const { getProjectList } = projectStore.effects;
  const { clearProjectList } = projectStore.reducers;
  const { pageNo, pageSize, total } = paging;
  const [loadingList] = useLoading(projectStore, ['getProjectList']);
  const [searchObj, setSearchObj] = React.useState<IState>({
    pageNo: 1,
    pageSize,
    query: '',
    orderBy: 'activeTime',
    asc: false,
  });

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
    const columns: Array<IColumnProps<PROJECT.Detail>> = [
      {
        title: i18n.t('project name'),
        dataIndex: 'displayName',
        key: 'displayName',
        width: 200,
        icon: (text: string, record: PROJECT.Detail) => projectTypeMap[record.type],
        subTitle: (text: string, record: PROJECT.Detail) => record.desc,
        render: (text: string, record: PROJECT.Detail) => <span>{`#${record.id}  ${text}`}</span>,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: () => (
          <span>
            <span className="mr-1">{i18n.t('cmp:application/Member Statistics')}</span>
            <Tooltip title={i18n.t('update data every day at 0')}>
              <IconAttention fill="#333" className="font-bold" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'stats',
        key: 'countApplications',
        width: 120,
        render: (stats: PROJECT.ProjectStats) => `${stats.countApplications} / ${stats.countMembers}`,
      },
      {
        title: i18n.t('CPU limit'),
        dataIndex: 'cpuQuota',
        key: 'cpuQuota',
        width: 200,
        icon: <ErdaIcon type="CPU" />,
        sorter: true,
        sortOrder: getColumnOrder('cpuQuota'),
        render: (text: string) => `${text} Core`,
      },
      {
        title: i18n.t('Memory limit'),
        dataIndex: 'memQuota',
        key: 'memQuota',
        width: 200,
        icon: <ErdaIcon type="CPU" />,
        sorter: true,
        sortOrder: getColumnOrder('memQuota'),
        render: (text: string) => `${text} GiB`,
      },
      {
        title: i18n.t('latest active'),
        dataIndex: 'activeTime',
        key: 'activeTime',
        width: 120,
        sorter: true,
        sortOrder: getColumnOrder('activeTime'),
        render: (text) => (text ? fromNow(text) : i18n.t('none')),
      },

      {
        title: i18n.t('dop:statistics'),
        key: 'op',
        dataIndex: 'id',
        width: 80,
        render: (id, record) => {
          if (record.type === 'MSP') {
            return null;
          }
          return (
            <div className="table-operations">
              <span
                className="table-operations-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(`./${id}/dashboard`);
                }}
              >
                <ErdaIcon type="jiankong" />
              </span>
            </div>
          );
        },
      },
    ];
    return columns;
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

  return (
    <div className="org-project-list">
      <Spin spinning={loadingList}>
        <div className="top-button-group">
          <Button type="primary" onClick={() => goTo('./createProject')}>
            {i18n.t('add project')}
          </Button>
        </div>
        <Table
          rowKey="id"
          dataSource={list}
          columns={getColumns()}
          rowClassName={() => 'cursor-pointer'}
          filter={
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
    </div>
  );
};
