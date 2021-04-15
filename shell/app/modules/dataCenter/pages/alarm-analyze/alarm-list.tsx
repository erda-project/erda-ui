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

import { isEqual, isEmpty } from 'lodash';
import * as React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Spin, Tooltip, Table } from 'app/nusi';
import i18n from 'i18n';
import './alarm-list.scss';
import machineStore from 'dataCenter/stores/machine';
import { useLoading } from 'app/common/stores/loading';
import { useUnmount } from 'react-use';
import { ColumnProps } from 'core/common/interface';

export interface IAlarm {
  content: {
    Title: string;
    Time: string;
    ClusterName: string;
  };
  title: string;
  targetID: string;
  triggeredAt: string;
  updatedAt: string;
  priority: string;
  id: string;
  label: { path: string };
}

interface IProps {
  filterType?: string | string[];
  query?: object;
}

export const ClusterAlarmList = ({
  filterType,
  query = {},
}: IProps) => {
  const [alarmList, paging] = machineStore.useStore(s => [s.alarmList, s.alarmListPaging]);
  const { getAlarmListByCluster } = machineStore.effects;
  const { clearAlarmListByCluster } = machineStore.reducers;
  const [loading] = useLoading(machineStore, ['getAlarmListByCluster']);
  const { total, pageNo } = paging;
  const [queryObj, setQueryObj] = React.useState({});
  React.useEffect(() => {
    if (!isEmpty(query) && !isEqual(queryObj, query)) {
      setQueryObj(query);
    }
  }, [query, queryObj]);

  const handlePageChange = React.useCallback((value: number) => {
    getAlarmListByCluster({ pageNo: value, type: filterType, ...queryObj } as any);
  }, [filterType, getAlarmListByCluster, queryObj]);

  React.useEffect(() => {
    if (!isEmpty(queryObj)) {
      handlePageChange(1);
    }
  }, [filterType, getAlarmListByCluster, handlePageChange, queryObj]);

  useUnmount(() => {
    clearAlarmListByCluster();
  });

  const ruleTypeMap = {
    low: {
      text: i18n.t('dcos:notice'),
      state: 'info',
    },
    medium: {
      text: i18n.t('dcos:caveat'),
      state: 'warning',
    },
    high: {
      text: i18n.t('dcos:serious'),
      state: 'danger',
    },
  };
  const columns: Array<ColumnProps<ORG_ALARM.Ticket>> = [
    {
      title: i18n.t('org:alarm name'),
      dataIndex: 'title',
      render: (text, { label: { path } }) => {
        return (
          <div
            className={classnames({
              title: true,
              'hover-active': !!path,
            })}
            onClick={() => {
              if (path) {
                window.location.href = path;
              }
            }}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: i18n.t('org:alarm time'),
      dataIndex: 'updatedAt',
      width: 150,
      render: (updatedAt, record) => {
        return (
          <Tooltip
            title={
              <>
                <div>{i18n.t('create time')}：{moment(record.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div>{i18n.t('update time')}：{moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
              </>
            }
          >
            <span className="time mr8">{moment(updatedAt).fromNow()}</span>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('org:alarm level'),
      dataIndex: 'priority',
      width: 100,
      render: priority => {
        const { text, state } = ruleTypeMap[priority];
        return <span className={`tag tag-${state}`}>{text}</span>;
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 10, background: '#ffffff' }}>
        <Table
          columns={columns}
          dataSource={alarmList}
          pagination={{
            pageSize: 20,
            current: pageNo,
            total,
            onChange: handlePageChange,
          }}
        />
      </div>
    </Spin>
  );
};

export default ClusterAlarmList;
