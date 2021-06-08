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

import { FormModal } from 'common';
import * as React from 'react';
import zkproxyStore from '../../stores/zkproxy';
import './zkproxy-list.scss';
import i18n from 'i18n';


interface IProps {
  visible: boolean;
  editMode: boolean;
  az: any;
  interfacename: string;
  onCancel: () => any;
}


const InterfaceForm = ({ visible, editMode, az, interfacename, onCancel }: IProps) => {
  const zkInterfaceConfig = zkproxyStore.useStore((s) => s.zkInterfaceConfig);
  const { addZkInterfaceConfig } = zkproxyStore.effects;

  const fieldsList = [
    {
      label: i18n.t('microService:interface name'),
      getComp: () => interfacename,
    },
    {
      label: i18n.t('microService:load balancing'),
      name: 'lb_type',
      type: 'select',
      options: ['LB_RANDOM', 'LB_ROUNDROBIN'].map((a) => ({ name: a, value: a })),
      itemProps: {
        disabled: !editMode,
      },
    },
    {
      label: i18n.t('microService:requests count per connection'),
      name: 'max_request_per_conn',
      type: 'select',
      options: ['10', '100', '1000'].map((a) => ({ name: a, value: a })),
      itemProps: {
        disabled: !editMode,
      },
    },
    {
      label: i18n.t('microService:maximum number of connections'),
      name: 'max_connections',
      type: 'select',
      options: ['10', '100', '1000'].map((a) => ({ name: a, value: a })),
      itemProps: {
        disabled: !editMode,
      },
    },
    {
      label: i18n.t('microService:maximum number of requests'),
      name: 'max_requests',
      type: 'select',
      options: ['100', '1000', '10000'].map((a) => ({ name: a, value: a })),
      itemProps: {
        disabled: !editMode,
      },
    },
  ];

  const onOk = (values: any) => {
    addZkInterfaceConfig({
      ...values,
      az,
      interfacename,
    });
    onCancel();
  };

  return (
    <FormModal
      title={i18n.t('microService:interface configuration')}
      visible={visible}
      fieldsList={fieldsList}
      formData={zkInterfaceConfig}
      onOk={editMode ? onOk : undefined}
      onCancel={onCancel}
    />
  );
};

export default InterfaceForm;
