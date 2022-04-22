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

import { Button, Spin } from 'antd';
import { useSwitch, useUpdate } from 'app/common/use-hooks';
import { ProblemForm, ProblemPriority, ProblemTypeOptions } from 'application/pages/problem/problem-form';
import TicketDetail from './problem-detail';
import { addTicket, getTicketList } from 'application/services/problem';
import { ConfigurableFilter, Table, TopButtonGroup } from 'common';
import { firstCharToUpper, fromNow, getDefaultPaging, insertWhen } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { IUserInfo, useUserMap } from 'core/stores/userMap';
import i18n from 'i18n';
import React from 'react';
import { useMount } from 'react-use';
import userStore from 'user/stores';
import './problem-list.scss';
import { ColumnProps } from 'antd/lib/table';

const updateKeyMap = {
  open: 'createdAt',
  closed: 'closedAt',
};

export const getUserInfo = (userMap: Obj<IUserInfo>, userId: string) => {
  const user = userMap[userId];
  return user ? user.nick || user.name || user.email || user.phone || user.id : i18n.t('dop:System');
};

export const ProblemList = () => {
  const [{ appId: routeAppId }, { type: routeType }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [visible, openModal, closeModal] = useSwitch(false);
  const appId = routeInfoStore.useStore((s) => s.params.appId);
  const loginUser = userStore.getState((s) => s.loginUser);
  const [state, updater, update] = useUpdate({
    detailVisibleId: 0,
    ...getDefaultPaging(),
    list: [],
    hasMore: undefined,
  });

  const [filterData, setFilterData] = React.useState({
    status: 'open',
    type: routeType,
  });
  const loading = getTicketList.useLoading();
  const list = state.list || [];

  const userMap = useUserMap();

  const filterFn = (paging?: Obj, values?: Obj) => {
    setFilterData((prev) => ({ ...prev, ...values }));
    paging && update(paging);
    const filterStatus = values?.status || filterData.status;
    getTicketList
      .fetch({
        ...filterData,
        pageNo: state.pageNo,
        pageSize: state.pageSize,
        ...paging,
        ...values,
        status: filterStatus === 'all' ? undefined : filterStatus,
        targetID: +routeAppId,
        targetType: 'application',
      })
      .then((resp) => {
        update({
          list: resp.data?.tickets || [],
          total: resp.data?.total || 0,
        });
      });
  };

  useMount(() => {
    filterFn();
  });

  const onOk = (payload: any) => {
    addTicket({
      ...payload,
      userID: loginUser.id,
      targetID: String(appId),
      targetType: 'application',
    }).then((res) => {
      if (res.success) {
        closeModal();
        filterFn({ pageNo: 1 });
      }
    });
  };
  const fieldsList = [
    {
      key: 'status',
      type: 'select',
      label: i18n.t('Status'),
      mode: 'single',
      options: [
        {
          value: 'all',
          label: i18n.t('All'),
        },
        {
          value: 'open',
          label: firstCharToUpper(i18n.t('dop:pending')),
        },
        {
          value: 'closed',
          label: i18n.t('Closed'),
        },
      ],
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Status').toLowerCase() }),
    },
    {
      key: 'type',
      type: 'select',
      label: i18n.t('Type'),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Type').toLowerCase() }),
      options: ProblemTypeOptions.map((a) => ({ label: a.name, value: a.value })),
      mode: 'single',
    },
    {
      key: 'priority',
      type: 'select',
      label: i18n.t('dop:Priority'),
      options: ProblemPriority.map((a) => ({ label: a.name, value: a.value })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:Priority').toLowerCase() }),
      mode: 'single',
    },
    {
      key: 'q',
      outside: true,
      label: 'title',
      placeholder: firstCharToUpper(i18n.t('filter by {name}', { name: i18n.t('Title').toLowerCase() })),
      type: 'input',
    },
  ];

  const columns: Array<ColumnProps<PROBLEM.Ticket>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      render: (text: string) => `#${text}`,
    },
    {
      title: i18n.t('Title'),
      dataIndex: 'title',
    },
    {
      title: i18n.t('Type'),
      dataIndex: 'type',
      width: 120,
      render: (text: string) => {
        const type = ProblemTypeOptions.find((t) => t.value === text);
        return type ? type.name : '-';
      },
    },
    {
      title: i18n.t('dop:Priority'),
      dataIndex: 'priority',
      width: 96,
      render: (text: string) => {
        const priority: any = ProblemPriority.find((t: any) => t.value === text);
        return <span className={priority.color}>{priority.name}</span>;
      },
    },
    {
      title: i18n.t('Creator'),
      dataIndex: 'creator',
      width: 120,
      render: (userId: string) => getUserInfo(userMap, userId),
    },
    {
      title: i18n.t('Creation time'),
      dataIndex: 'createdAt',
      width: 176,
      render: (text: string) => fromNow(text),
    },
    ...insertWhen(filterData.status !== 'open', [
      {
        title: i18n.t('close person'),
        dataIndex: 'content',
        width: 120,
        render: (_text: string, record: PROBLEM.Ticket) => {
          return record.status === 'closed' ? getUserInfo(userMap, record.lastOperatorUser) : '-';
        },
      },
      {
        title: i18n.t('close time'),
        dataIndex: 'status',
        width: 176,
        render: (text: string, record: PROBLEM.Ticket) =>
          text === 'closed' ? fromNow(record[updateKeyMap[text]]) : '-',
      },
    ] as Array<ColumnProps<PROBLEM.Ticket>>),
  ];

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          onReload={(pageNo) => {
            filterFn({ pageNo });
          }}
          pagination={{
            current: state.pageNo,
            total: state.total,
            pageSize: state.pageSize,
            onChange: (pageNo, pageSize) => {
              filterFn({ pageNo, pageSize });
            },
          }}
          onRow={(record: PROBLEM.Ticket) => {
            return {
              onClick: () => {
                updater.detailVisibleId(record.id);
              },
            };
          }}
          slot={
            <ConfigurableFilter
              hideSave
              value={filterData}
              fieldsList={fieldsList}
              onFilter={(values) => filterFn({ pageNo: 1 }, values)}
            />
          }
        />
      </Spin>
      <TopButtonGroup>
        <Button type="primary" onClick={() => openModal()}>
          {i18n.t('Add')}
        </Button>
        <ProblemForm visible={visible} onOk={onOk} onCancel={closeModal} />
        <TicketDetail
          id={state.detailVisibleId}
          onClose={() => updater.detailVisibleId(0)}
          onCloseIssue={() => {
            filterFn({ pageNo: 1 });
            updater.detailVisibleId(0);
          }}
        />
      </TopButtonGroup>
    </React.Fragment>
  );
};
