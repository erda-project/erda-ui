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
import { map } from 'lodash';
import { FormModal, KeyValueTable } from 'common';
import { useUpdate } from 'common/use-hooks';
import { regRules, qs } from 'common/utils';
import monitorStatusStore from 'status-insight/stores/status';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';

import './add-modal.scss';

// const transToRegList = (regs: any) => regs.map((item: any) => ({ name: uniqueId('reg_'), reg: item }));

interface IProps {
  formData: any;
  modalVisible: boolean;
  afterSubmit: (args?: any) => Promise<any>;
  toggleModal: (args?: any) => void;
}
interface ITrigger {
  key: string;
  operate: string;
  value: number | string;
}
interface IState {
  showMore: boolean;
  retry: number;
  frequency: number;
  apiMethod: string;
  body: string;
  headers: Obj;
  url: string;
  query: Obj;
  condition: ITrigger[];
}

const convertFormData = (_formData?: Obj) => {
  if (_formData) {
    return {
      retry: _formData?.config?.retry || RETRY_TIMES[0],
      frequency: _formData?.config?.interval || TIME_LIMITS[0],
      apiMethod: _formData?.config?.method || HTTP_METHOD_LIST[0],
      body: JSON.stringify(_formData?.config?.body, null, 2) || JSON.stringify({}),
      headers: _formData?.config?.headers || {},
      url: _formData?.config?.url || '',
      query: qs.parseUrl(_formData?.config?.url || '')?.query,
      condition: _formData?.config?.triggering || [
        {
          key: 'http_code',
          operate: '>=',
          value: 400,
        },
      ],
    };
  } else {
    return {
      condition: [
        {
          key: 'http_code',
          operate: '>=',
          value: 400,
        },
      ],
      showMore: false,
      query: {},
      retry: RETRY_TIMES[0],
      frequency: TIME_LIMITS[0],
      apiMethod: HTTP_METHOD_LIST[0],
      body: JSON.stringify({}),
      headers: {},
      url: '',
    };
  }
};

const ruleOfJson = {
  validator: async (_, value: string) => {
    if (value) {
      try {
        JSON.parse(value);
      } catch {
        throw new Error(i18n.t('msp:please enter the correct JSON format'));
      }
    } else {
      return true;
    }
  },
};

const AddModal = (props: IProps) => {
  const { formData, modalVisible, afterSubmit, toggleModal } = props;

  const { env } = routeInfoStore.useStore((s) => s.params);
  const { saveService, updateMetric } = monitorStatusStore.effects;

  const handleSubmit = (_data: MONITOR_STATUS.IMetricsBody) => {
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

  const fieldsList = [
    {
      name: 'id',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      name: 'env',
      initialValue: env,
      itemProps: {
        type: 'hidden',
      },
    },
    {
      label: i18n.t('msp:checking method'),
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
      label: i18n.t('msp:name'),
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
      title={i18n.t('msp:add monitoring')}
      fieldsList={fieldsList}
      visible={modalVisible}
      formData={data}
      onOk={handleSubmit}
      onCancel={toggleModal}
    />
  );
};

export default AddModal;
