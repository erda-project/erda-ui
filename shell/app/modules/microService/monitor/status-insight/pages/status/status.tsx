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
import { Table, Button, Icon, Modal, Tooltip, Select } from 'nusi';
import { goTo, cutStr, resolvePath } from 'common/utils';
import { reverse, map, filter, floor } from 'lodash';
import { useUpdate } from 'common';
import StatusChart from './status-chart';
import AddModal from './add-modal';
import monitorStatusStore from 'status-insight/stores/status';
import { useLoading } from 'app/common/stores/loading';
import routeInfoStore from 'app/common/stores/route';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import './status.scss';

const { Option } = Select;

const Status = () => {
  const query = routeInfoStore.useStore(s => s.query);
  const dashboard = monitorStatusStore.useStore(s => s.dashboard);
  const [isFetchingList] = useLoading(monitorStatusStore, ['getProjectDashboard']);
  const { getProjectDashboard, deleteMetric } = monitorStatusStore.effects;
  const { clearDashboardInfo } = monitorStatusStore.reducers;

  const { type = 'All' } = query || {};

  const [{ modalVisible, formData, filterType }, updater, update] = useUpdate({
    modalVisible: false,
    formData: null as MONITOR_STATUS.IMetricsBody | null,
    filterType: type,
  });

  useEffectOnce(() => {
    getProjectDashboard();
    return () => {
      clearDashboardInfo();
    };
  });

  const toggleModal = (_data?: MONITOR_STATUS.IMetricsBody) => {
    update({
      modalVisible: !modalVisible,
      formData: _data,
    });
  };

  const handleEdit = (e: any, _data: MONITOR_STATUS.IMetricsBody) => {
    e.stopPropagation();
    toggleModal(_data);
  };

  const handleDelete = (e: any, id: string) => {
    e.stopPropagation();
    Modal.confirm({
      title: i18n.t('microService:are you sure to delete this monitor?'),
      onOk: () => {
        deleteMetric(id).then(() => {
          getProjectDashboard();
        });
      },
    });
  };

  const handleDetailClick = (e: any, path: string) => {
    e.stopPropagation();
    goTo(path);
  };

  const changeType = (_type: any) => {
    updater.filterType(_type);
  };

  let data = [] as any[];
  if (dashboard && dashboard.metrics) {
    const curMetrics = dashboard.metrics;
    data = reverse(Object.keys(curMetrics)).map((id) => {
      return {
        id,
        ...(curMetrics[id] || {}),
      };
    });
  }
  let filterData = data;
  if (filterType !== 'All') {
    filterData = filter(filterData, item => item.status === filterType);
  }

  const typeMap = {
    All: {
      text: i18n.t('microService:all'),
      color: 'green',
    },
    Operational: {
      text: i18n.t('microService:normal'),
      color: 'green',
    },
    'Major Outage': {
      text: i18n.t('microService:downtime'),
      color: 'red',
    },
    Miss: {
      text: i18n.t('microService:no data'),
      color: 'grey',
    },
  };

  const defaultMap = {
    text: i18n.t('microService:no data'),
    color: 'grey',
  };

  const columns = [
    {
      title: i18n.t('microService:index'),
      dataIndex: 'name',
      render: (text: string) => <span className="name-link"><Tooltip title={text}>{cutStr(text, 25)}</Tooltip></span>,
    },
    {
      title: i18n.t('microService:status'),
      dataIndex: 'status',
      render: (status: string) => <span><span className={`status-point ${(typeMap[status] || defaultMap).color}`} />{(typeMap[status] || defaultMap).text}</span>,
    },
    {
      title: i18n.t('microService:online rate'),
      dataIndex: 'uptime',
    },
    {
      title: `${i18n.t('microService:downtime')}(${i18n.t('microService:near 1 hour')})`,
      dataIndex: 'downDuration',
    },
    {
      title: 'Apdex',
      dataIndex: 'apdex',
      render: (text: string) => text && floor(+text, 2),
    },
    {
      title: i18n.t('microService:average response time'),
      dataIndex: 'latency',
      render: (text: string) => <span>{text} ms</span>,
    },
    {
      title: `${i18n.t('microService:response map')}(${i18n.t('microService:near 1 hour')})`,
      dataIndex: 'chart',
      width: 144,
      render: (_text: string, record: any) => {
        const { chart } = record;
        if (!chart) {
          return <div style={{ height: '58px' }} />;
        }
        return (
          <div>
            <StatusChart
              xAxisData={chart.time}
              data={chart.latency}
              style={{ width: '120px', height: '40px' }}
            />
            <ul className="status-list">
              {
                  chart.status.map((item: string, i: number) => <li key={String(i)} className={typeMap[item].color} />)
                }
            </ul>
          </div>
        );
      },
    },
    {
      title: i18n.t('microService:root cause analytics'),
      dataIndex: 'requestId',
      width: 90,
      render: (requestId: string) => (
        !!requestId && (
          <span
            className="reason-analysis-span"
            onClick={e => {
              handleDetailClick(
                e,
                resolvePath(`../error/request-detail/${requestId}`)
              );
            }}
          >
            {i18n.t('microService:details')}
          </span>
        )
      ),
    },
    {
      title: i18n.t('operations'),
      dataIndex: 'id',
      width: 90,
      render: (id: string, record: any) => {
        return (
          <div className="table-operations">
            <a className="table-operations-btn" key="edit" onClick={e => handleEdit(e, record)}>{i18n.t('microService:edit')}</a>
            <a className="table-operations-btn" key="del" onClick={e => handleDelete(e, id)}>{i18n.t('microService:delete')}</a>
          </div>
        );
      },
    },
  ];

  let hasDown = {
    text: 'no Data',
    color: '',
  };
  if (dashboard.downCount !== undefined) {
    hasDown = dashboard.downCount > 0
      ? { text: `${dashboard.downCount} Down`, color: 'red' }
      : { text: 'All up', color: 'green' };
  }

  return (
    <div className="project-status-page">
      <div className="status-button-group-left">
        <Select onChange={changeType} value={filterType} className="type-filter">
          {
              map(typeMap, (item, key) => {
                return <Option key={key} value={key}>{item.text}</Option>;
              })
            }
        </Select>
      </div>
      <div className="status-button-group">
        {/* <Button className="account-button" type="primary" ghost onClick={() => goTo('./account')}>{i18n.t('microService:authentication management')}</Button> */}
        <Button className="add-button" type="primary" onClick={() => toggleModal()}>{i18n.t('microService:add monitoring')}</Button>
      </div>
      <div className="top-bar">
        <span className={`summary-down-count ${hasDown.color}`}>
          <span><Icon type="info-circle" /> {hasDown.text} </span>
        </span>
      </div>
      <AddModal
        modalVisible={modalVisible}
        toggleModal={toggleModal}
        formData={formData}
        afterSubmit={getProjectDashboard}
      />
      <Table
        rowKey="id"
        rowClassName={() => 'row-click'}
        onRow={(record) => {
          return {
            onClick: () => goTo(`./${record.id}`),
          };
        }}
        loading={isFetchingList}
        columns={columns}
        dataSource={filterData}
        pagination={false}
      />
    </div>
  );
};

export default Status;
