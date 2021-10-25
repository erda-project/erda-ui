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
import { Table, Spin, Button, Tooltip } from 'antd';
import { ColumnProps } from 'core/common/interface';
import { goTo, fromNow } from 'common/utils';
import { useUnmount } from 'react-use';
import { ChartHistogramTwo as IconChartHistogramTwo } from '@icon-park/react';
import { SearchTable, Ellipsis, Icon as CustomIcon } from 'common';
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
        title: <span>CPU / {i18n.t('Memory usage')}</span>,
        dataIndex: 'usage',
        key: 'usage',
        render: (t, record: PROJECT.Detail) => {
          const {
            cpuServiceUsed = 0,
            memServiceUsed = 0,
            cpuAddonUsed = 0,
            memAddonUsed = 0,
            memQuota,
            cpuQuota,
          } = record;

          const renderBar = (serviceUsed: number, addonUsed: number, totalNum: number, unit: string) => {
            const isOveruse = serviceUsed + addonUsed > totalNum;
            const leftNum = totalNum - (serviceUsed + addonUsed);
            const percent = isOveruse
              ? [
                  // 超过总量
                  Math.floor((serviceUsed / (serviceUsed + addonUsed)) * 100),
                  Math.floor((addonUsed / (serviceUsed + addonUsed)) * 100),
                  0,
                ]
              : totalNum === 0
              ? [
                  // 总量、使用量都为0
                  0, 0, 100,
                ]
              : [
                  Math.round((serviceUsed / totalNum) * 100),
                  Math.round((addonUsed / totalNum) * 100),
                  Math.abs(100 - Math.round((serviceUsed / totalNum) * 100) - Math.round((addonUsed / totalNum) * 100)),
                ];
            const percentText = percent.map((item) => `${item}%`);

            return (
              <div className={`quota-container ${isOveruse ? 'overuse' : ''}`}>
                <div className={'quota-bar'}>
                  <Tooltip
                    title={`${i18n.t('cmp:application used')} ${serviceUsed.toFixed(2)}${unit} (${
                      isOveruse ? `${Math.floor(totalNum ? (serviceUsed / totalNum) * 100 : 100)}%` : percentText[0]
                    })`}
                  >
                    <div
                      className={`nowrap ${percentText[0] !== '0%' ? 'border-right-color' : ''}`}
                      style={{ width: percentText[0] }}
                    >
                      {i18n.t('project:application')}
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={`${i18n.t('cmp:addon used')} ${addonUsed.toFixed(2)}${unit} (${
                      isOveruse ? `${Math.floor(totalNum ? (addonUsed / totalNum) * 100 : 100)}%` : percentText[1]
                    })`}
                  >
                    <div
                      className={`nowrap ${percentText[1] !== '0%' ? 'border-right-color' : ''}`}
                      style={{ width: percentText[1] }}
                    >
                      addon
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={`${i18n.t('available')} ${leftNum <= 0 ? 0 : leftNum.toFixed(2)}${unit} (${percentText[2]})`}
                  >
                    <div className="nowrap" style={{ width: percentText[2] }}>
                      {i18n.t('project:available')}
                    </div>
                  </Tooltip>
                </div>
                <Tooltip title={i18n.t('usage limit exceeded')}>
                  <CustomIcon type="warning" className="overuse-tip ml-1" />
                </Tooltip>
              </div>
            );
          };
          return (
            <div style={{ minWidth: '200px' }}>
              <div className="flex justify-between items-center">
                <div style={{ width: '40px' }}>CPU:</div>
                {renderBar(+cpuServiceUsed.toFixed(2), +cpuAddonUsed.toFixed(2), cpuQuota, 'Core')}
              </div>
              <div className="flex justify-between items-center">
                <div style={{ width: '40px' }}>MEM:</div>
                {renderBar(+memServiceUsed.toFixed(2), +memAddonUsed.toFixed(2), memQuota, 'GiB')}
              </div>
            </div>
          );
        },
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
