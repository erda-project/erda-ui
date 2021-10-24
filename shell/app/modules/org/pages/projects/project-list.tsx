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
import { Table, Spin, Tooltip, Button, Ellipsis } from 'core/nusi';
import { ColumnProps } from 'core/common/interface';
import { goTo, fromNow } from 'common/utils';
import { useUnmount } from 'react-use';
import { ChartHistogramTwo as IconChartHistogramTwo, Attention as IconAttention } from '@icon-park/react';
import { SearchTable, Icon as CustomIcon } from 'common';
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
    const columns: Array<ColumnProps<PROJECT.Detail>> = [
      {
        title: i18n.t('project:project ID'),
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: i18n.t('project name'),
        dataIndex: 'displayName',
        key: 'displayName',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (text) => <Ellipsis title={text}>{text}</Ellipsis>,
      },
      {
        title: i18n.t('org:application/Member Statistics'),
        dataIndex: 'stats',
        key: 'countApplications',
        width: 120,
        render: (stats: PROJECT.ProjectStats) => `${stats.countApplications} / ${stats.countMembers}`,
      },
      {
        title: i18n.t('msp:project type'),
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (text: string) => (text === 'MSP' ? i18n.t('org:microservice Observation Project') : 'DevOps'),
      },
      {
        title: i18n.t('total CPU allocation'),
        dataIndex: 'cpuQuota',
        key: 'cpuQuota',
        width: 200,
        sorter: true,
        sortOrder: getColumnOrder('cpuQuota'),
        render: (text: string) => `${text} Core`,
      },
      {
        title: i18n.t('total Memory allocation'),
        dataIndex: 'memQuota',
        key: 'memQuota',
        width: 200,
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
        title: i18n.t('project:statistics'),
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
                <IconChartHistogramTwo />
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
        <SearchTable onSearch={onSearch} placeholder={i18n.t('search by project name')} needDebounce>
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
            onRow={(record: any) => {
              return {
                onClick: () => {
                  goTo(`./${record.id}/setting`);
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
        </SearchTable>
      </Spin>
    </div>
  );
};
