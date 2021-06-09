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
import { Input, Spin, Select, Table } from 'app/nusi';
import { SwitchAutoScroll, CustomFilter } from 'common';
import { goTo, fromNow, insertWhen } from 'common/utils';
import { getTicketType, TicketPriority } from 'application/pages/ticket/ticket-form';
import { useLoading } from 'app/common/stores/loading';
import ticketStore from 'application/stores/ticket';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';
import { IUseFilterProps } from 'interface/common';
import routeInfoStore from 'common/stores/route';

import './ticket-list.scss';

interface IFilter {
  onSubmit: (value: Obj) => void;
  onReset: () => void;
}

const Filter = React.memo(({ onReset, onSubmit }: IFilter) => {
  const filterConfig = React.useMemo(() => {
    return [
      {
        type: Select,
        name: 'type',
        customProps: {
          placeholder: i18n.t('filter by {name}', { name: i18n.t('type') }),
          options: getTicketType().map(({ name, value }) => <Option key={value} value={value}>{name}</Option>),
        },
      },
      {
        type: Select,
        name: 'priority',
        customProps: {
          placeholder: i18n.t('filter by {name}', { name: i18n.t('application:priority') }),
          options: TicketPriority.map((priorityType: any) => <Option key={priorityType.value} value={priorityType.value}>{priorityType.name}</Option>),
        },
      },
      {
        type: Input,
        name: 'q',
        customProps: {
          placeholder: i18n.t('filter by {name}', { name: i18n.t('title') }),
        },
      },
    ];
  }, []);
  return <CustomFilter onReset={onReset} onSubmit={onSubmit} config={filterConfig} isConnectQuery />;
});

const { Option } = Select;
const updateKeyMap = {
  open: 'createdAt',
  closed: 'closedAt',
};

export const TicketList = (props: Pick<IUseFilterProps, 'onSubmit'| 'onReset'| 'onPageChange'>) => {
  const [ticketList, paging] = ticketStore.useStore((s) => [s.ticketList, s.paging]);
  const { onSubmit, onReset, onPageChange } = props;
  const [loading] = useLoading(ticketStore, ['getTicketList']);
  const { ticketType } = routeInfoStore.useStore((s) => s.params);

  const handleSubmit = React.useCallback(onSubmit, []);
  const handleReset = React.useCallback(onReset, []);

  const columns: Array<ColumnProps<TICKET.Ticket>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      render: (text) => `#${text}`,
    },
    {
      title: i18n.t('title'),
      dataIndex: 'title',
    },
    {
      title: i18n.t('type'),
      dataIndex: 'type',
      width: 140,
      render: (text) => {
        const type = getTicketType().find((t) => t.value === text);
        return type ? type.name : '-';
      },
    },
    {
      title: i18n.t('application:priority'),
      dataIndex: 'priority',
      width: 90,
      render: (text) => {
        const priority: any = TicketPriority.find((t: any) => t.value === text);
        return (
          <span className={priority.color}>
            {priority.name}
          </span>
        );
      },
    },
    {
      title: i18n.t('creator'),
      dataIndex: 'creator',
      width: 150,
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      width: 120,
      render: (text) => fromNow(text),
    },
    ...insertWhen(ticketType !== 'open', [
      {
        title: i18n.t('close person'),
        dataIndex: 'content',
        width: 150,
        render: (_text, record) => {
          return record.status === 'closed' ? record.lastOperatorUser : '';
        },
      },
      {
        title: i18n.t('close time'),
        dataIndex: 'status',
        width: 120,
        render: (text, record) => (text === 'closed' ? fromNow(record[updateKeyMap[text]]) : ''),
      },
    ] as Array<ColumnProps<TICKET.Ticket>>),
  ];

  return (
    <React.Fragment>
      <SwitchAutoScroll toPageTop triggerBy={paging.pageNo} />
      <Filter onReset={handleReset} onSubmit={handleSubmit} />
      <Spin spinning={loading}>
        <Table
          tableKey="ticket_list"
          rowKey="id"
          dataSource={ticketList}
          columns={columns}
          pagination={{
            current: paging.pageNo,
            total: paging.total,
            pageSize: paging.pageSize,
            onChange: onPageChange,
          }}
          onRow={(record: TICKET.Ticket) => {
            return {
              onClick: () => { goTo(`./${record.id}`); },
            };
          }}
        />
      </Spin>
    </React.Fragment>
  );
};
