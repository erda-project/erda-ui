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
import { Button } from 'app/nusi';
import { useSwitch, useMultiFilter } from 'common';
import { goTo } from 'common/utils';
import { TicketList } from './ticket-list';
import { TicketForm } from './ticket-form';
import i18n from 'i18n';
import ticketStore from '../../stores/ticket';
import routeInfoStore from 'app/common/stores/route';
import { useUnmount } from 'react-use';
import orgStore from 'app/org-home/stores/org';

export const ticketTabs = () => {
  const openTotal = ticketStore.useStore(s => s.openTotal);
  return [
    {
      key: 'all',
      name: i18n.t('all'),
    },
    {
      key: 'open',
      name: <span>{i18n.t('application:pending')}<span className="dice-badge">{openTotal}</span></span>,
    },
    {
      key: 'closed',
      name: i18n.t('closed'),
    },
  ];
};

interface IProps {
  scope?: string;
}

const Ticket = ({ scope }: IProps) => {
  const [visible, openModal, closeModal] = useSwitch(false);
  const [params] = routeInfoStore.useStore(s => [s.params]);
  const orgId = orgStore.getState(s => s.currentOrg.id);
  const { ticketType: tabKey } = params;

  const { addTicket } = ticketStore.effects;
  const { clearTicketList } = ticketStore.reducers;

  const { getTicketList } = ticketStore.effects;

  const multiFilterProps = useMultiFilter({
    getData: [getTicketList],
    extraQueryFunc: (activeGroup) => ({
      targetID: scope === 'org' ? orgId : +params.appId,
      targetType: scope === 'org' ? 'org' : 'application',
      status: activeGroup === 'all' ? undefined : activeGroup,
    }),
    shareQuery: true,
    multiGroupEnums: ['open', 'all', 'closed'],
    groupKey: 'ticketType',
    activeKeyInParam: true,
  });

  useUnmount(() => {
    clearTicketList();
  });

  const onOk = (payload: any) => {
    openModal();
    addTicket({
      ...payload,
      targetID: scope === 'org' ? String(orgId) : String(params.appId),
      targetType: scope === 'org' ? 'org' : 'application',
      status: tabKey,
    }).finally(() => {
      closeModal();
      if (tabKey === 'open') {
        multiFilterProps.fetchDataWithQuery(1);
      } else {
        goTo('../open');
      }
    });
  };

  return (
    <div>
      <div className="top-button-group">
        <Button type="primary" onClick={() => openModal()}>{i18n.t('application:add ticket')}</Button>
        <TicketForm visible={visible} onOk={onOk} onCancel={closeModal} />
      </div>
      <TicketList {...multiFilterProps} />
    </div>
  );
};

export default Ticket;
