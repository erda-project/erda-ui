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
import { filter, omitBy, get } from 'lodash';
import { FormModal } from 'common';
import { regRules } from 'common/utils';
import monitorOverviewStore from 'monitor-overview/stores/monitor-overview';
import monitorStatusStore from 'status-insight/stores/status';
import routeInfoStore from 'app/common/stores/route';
import i18n from 'i18n';

import './add-modal.scss';

// const transToRegList = (regs: any) => regs.map((item: any) => ({ name: uniqueId('reg_'), reg: item }));

interface IProps{
  formData: any;
  modalVisible: boolean;
  afterSubmit(args?: any): Promise<any>;
  toggleModal(args?: any): void;
}
const AddModal = (props: IProps) => {
  const { formData, modalVisible, afterSubmit, toggleModal } = props;

  const params = routeInfoStore.useStore(s => s.params);
  const { saveService, updateMetric } = monitorStatusStore.effects;
  const instance = monitorOverviewStore.useStore(s => s.instance);

  const handelSubmit = (_data: MONITOR_STATUS.IMetricsBody) => {
    const { accountId, ...rest } = _data;
    const expects = filter(rest, (v, k) => k.startsWith('reg_')) as string[];
    const others = omitBy(rest, (v, k) => k.startsWith('reg_')) as any;

    if (rest.id) {
      updateMetric({ ...others, accountId: parseInt(`${accountId}`, 10), expects }).then(afterSubmit);
    } else {
      saveService({ ...others, accountId: parseInt(`${accountId}`, 10), expects }).then(() => {
        afterSubmit();
      });
    }
    toggleModal();
  };

  let data = formData;
  if (formData) {
    // number 的 accountId 会被直接展示在 select 上，而不是去匹配相应的 name
    const { accountId } = formData;
    data = {
      ...formData,
      accountId: accountId ? accountId.toString() : null,
    };
  }

  const defaultEnv = get(instance, 'workspace') || get(params, 'env');
  const fieldsList = [
    {
      name: 'id',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      name: 'env',
      initialValue: defaultEnv,
      itemProps: {
        type: 'hidden',
      },
    },
    {
      label: i18n.t('microService:checking method'),
      name: 'mode',
      type: 'radioGroup',
      options: [
        {
          value: 'http',
          name: 'http',
        },
      ],
      initialValue: 'http',
    },
    {
      label: i18n.t('microService:name'),
      name: 'name',
    },
    {
      label: 'URL',
      name: 'url',
      rules: [{ ...regRules.http }],
    },
  ];

  return (
    <FormModal
      width={620}
      title={i18n.t('microService:add monitoring')}
      fieldsList={fieldsList}
      visible={modalVisible}
      formData={data}
      onOk={handelSubmit}
      onCancel={toggleModal}
    />
  );
};

export default AddModal;
