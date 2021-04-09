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
import { FormModal } from 'common';
import MarkdownEditor from 'app/common/components/markdown-editor';
import i18n from 'i18n';


export const getTicketType = (): TICKET.TicketType[] => {
  const typeArr = [
    {
      value: 'bug',
      name: i18n.t('application:bug'),
    },
    {
      value: 'vulnerability',
      name: i18n.t('application:code vulnerability'),
    },
    {
      value: 'codeSmell',
      name: i18n.t('application:code smell'),
    },
  ];
  return typeArr;
};

export const TicketPriority = [
  {
    value: 'low',
    name: i18n.t('application:low'),
    color: 'tag-info',
  },
  {
    value: 'medium',
    name: i18n.t('application:medium'),
    color: 'tag-warning',
  },
  {
    value: 'high',
    name: i18n.t('application:high'),
    color: 'tag-danger',
  },
];

export const TicketForm = ({
  visible,
  onOk,
  onCancel,
}: {
  visible: boolean,
  onOk(values: any): void,
  onCancel(): void,
}) => {
  const fieldsList = [
    {
      label: i18n.t('application:ticket title'),
      name: 'title',
    },
    {
      label: i18n.t('application:ticket content'),
      name: 'content',
      getComp: () => (
        <MarkdownEditor
          btnText={i18n.t('submit comment')}
        />
      ),
    },
    {
      label: i18n.t('application:ticket type'),
      name: 'type',
      type: 'select',
      options: getTicketType(),
    },
    {
      label: i18n.t('application:priority'),
      name: 'priority',
      type: 'radioGroup',
      options: TicketPriority,
    },
  ];
  return (
    <FormModal
      width={700}
      name={i18n.t('application:tickets')}
      fieldsList={fieldsList}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    />
  );
};
