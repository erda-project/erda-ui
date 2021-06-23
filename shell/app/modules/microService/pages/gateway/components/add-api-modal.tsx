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

import { FormModal, useUpdate } from 'common';
import * as React from 'react';
import i18n from 'i18n';
import { WrappedFormUtils, SelectValue } from 'core/common/interface';
import { Input, Select } from 'app/nusi';
import { get, map, size } from 'lodash';
import { HTTP_METHODS, HTTP_PREFIX, HTTPS_PREFIX } from 'microService/pages/gateway/config';
import gatewayStore from 'microService/stores/gateway';
import microServiceStore from 'microService/stores/micro-service';
import { useMount } from 'react-use';
import { insertWhen } from 'common/utils';

const { Option } = Select;

interface IProps {
  modalVisible: boolean;
  apiPathPrefix: string;
  currentService: string | undefined;
  diceApp: string | undefined;
  chosenRuntimeId: string | undefined;
  isRuntimeEntry: boolean;
  serviceAddressMap: Record<string, any>;
  dataSource: Record<string, any>;
  onCancel: (data?: any) => void;
  afterSubmit: () => void;
}

const AddApiModal = ({
  modalVisible,
  onCancel,
  apiPathPrefix,
  currentService,
  diceApp,
  chosenRuntimeId,
  afterSubmit,
  isRuntimeEntry,
  serviceAddressMap,
  dataSource,
}: IProps) => {
  const isK8S = microServiceStore.useStore((s) => s.isK8S);
  const { addAPI, updateAPI } = gatewayStore.effects;
  const [authPolicy, trafficControlPolicy] = gatewayStore.useStore((s) => [s.authPolicy, s.trafficControlPolicy]);
  const [state, updater, update] = useUpdate({
    isEditingApi: false,
    chosenRedirectType: '',
    protocol: HTTP_PREFIX,
    authVisible: false,
    policyVisible: false,
    formData: {},
  });
  const initData = (data: Record<string, any>) => {
    let formData: any = {};
    let policyVisible = false;
    let authVisible = false;
    let protocol = HTTP_PREFIX;
    let chosenRedirectType = 'service';

    if (data) {
      const firstPolicy = data.policies ? data.policies.find((item: any) => item.category === 'trafficControl') : null;
      const firstAuthPolicy = data.policies ? data.policies.find((item: any) => item.category === 'auth') : null;
      chosenRedirectType = get(data, 'redirectType', 'service');

      formData = {
        ...data,
        _policies: data.policies || [], // 用于编辑时
        policies: firstPolicy ? [firstPolicy.policyId] : [],
        authMode: firstAuthPolicy ? [firstAuthPolicy.policyId] : [],
      };
      const match = data.redirectAddr.match(/^https?:\/\//);
      if (match) {
        protocol = match[0];
        formData.redirectAddr = formData.redirectAddr.slice(match[0].length);
      }
      policyVisible = !!firstPolicy;
      authVisible = !!firstAuthPolicy;
    }
    if (!!data && !formData.method) {
      formData.method = 'all';
    }

    update({
      formData,
      policyVisible,
      authVisible,
      protocol,
      isEditingApi: !!data,
      chosenRedirectType,
    });
  };

  useMount(() => {
    if (modalVisible) {
      initData(dataSource);
    }
  });

  const changeProtocol = (value: SelectValue) => {
    updater.protocol(value as string);
  };
  const selectBefore = (
    <Select value={state.protocol} onChange={changeProtocol} style={{ width: 92 }}>
      <Option value={HTTP_PREFIX}>http://</Option>
      <Option value={HTTPS_PREFIX}>https://</Option>
    </Select>
  );
  const fieldsList: any[] = [
    // {
    //   label: i18n.t('microService:external network access'),
    //   name: 'outerNetEnable',
    //   type: 'switch',
    //   initialValue: true,
    //   required: false,
    // },
    {
      label: i18n.t('microService:API path'),
      name: state.formData && state.isEditingApi ? 'displayPath' : 'path',
      rules: [
        {
          pattern: /^\//,
          message: i18n.t('path starts with /'),
        },
      ],
      getComp: ({ form }: { form: WrappedFormUtils }) => (
        <Input
          placeholder={i18n.t('path starts with /')}
          onBlur={(e) => {
            if (state.isEditingApi) return;
            form.setFieldsValue({ redirectPath: e.target.value });
          }}
        />
      ),
    },
    {
      label: i18n.t('microService:API source'),
      name: 'redirectType',
      type: 'radioGroup',
      options: map(
        { service: i18n.t('microService:current service'), url: i18n.t('microService:custom address') },
        (name, value) => {
          return {
            value,
            name,
          };
        },
      ),
      initialValue: 'service',
      itemProps: {
        onChange: (e: any) => {
          updater.chosenRedirectType(e.target.value);
        },
      },
    },
    // 支持蛇口非K8S
    ...insertWhen(!isK8S, [
      {
        label: i18n.t('microService:forwarding path'),
        name: 'redirectPath',
        rules: [
          {
            pattern: /^\//,
            message: i18n.t('path starts with /'),
          },
        ],
      },
    ]),
    {
      label: i18n.t('microService:method'),
      name: 'method',
      type: 'select',
      options: [
        {
          name: i18n.t('microService:all methods'),
          value: 'all',
        },
        ...HTTP_METHODS,
      ].map(({ value, name }) => ({ value, name })),
      initialValue: 'GET',
    },
    {
      label: i18n.t('microService:interface description'),
      name: 'description',
      type: 'textArea',
      itemProps: { rows: 4, maxLength: 200 },
    },
  ];
  if (state.chosenRedirectType === 'url') {
    fieldsList.splice(2, 0, {
      label: i18n.t('microService:forwarding address'),
      name: 'redirectAddr',
      initialValue: currentService && isRuntimeEntry ? serviceAddressMap[currentService as any] : '',
      itemProps: {
        addonBefore: selectBefore,
      },
    });
  }

  const authList = authPolicy.policyList || [];
  if (authList.length && !isK8S) {
    fieldsList.push({
      label: i18n.t('microService:open authentication'),
      name: 'authVisible',
      type: 'switch',
      initialValue: state.authVisible,
      required: false,
      itemProps: {
        onChange: () => {
          updater.authVisible(!state.authVisible);
        },
      },
    });
  }

  if (state.authVisible) {
    fieldsList.push({
      label: i18n.t('microService:authentication mode'),
      name: 'authMode',
      type: 'select',
      options: authList.map((p: any) => ({ name: p.displayName, value: p.policyId })),
      itemProps: {
        multiple: true,
      },
    });
  }

  let policyList: any = trafficControlPolicy.policyList || [];
  const savedPolicy = state.formData && state.formData.policies;
  if ((size(savedPolicy) || policyList.length) && isK8S) {
    fieldsList.push({
      label: i18n.t('microService:flow control'),
      name: 'policyVisible',
      type: 'switch',
      initialValue: state.policyVisible,
      required: false,
      itemProps: {
        onChange: () => {
          updater.policyVisible(!state.policyVisible);
        },
      },
    });

    if (state.policyVisible) {
      // 当前 API 的限流策略被删除后，就把当前数据也加到选项里，保持 displayName
      if (
        state.formData &&
        state.formData.policies &&
        !policyList.find((item: any) => item.policyId === state.formData.policies[0])
      ) {
        policyList = policyList.concat(
          state.formData._policies.filter((item: any) => item.category === 'trafficControl'),
        );
      }
      fieldsList.push({
        label: i18n.t('microService:limited flow strategy'),
        name: 'policies',
        type: 'select',
        options: policyList.map((p: any) => ({ name: p.displayName, value: p.policyId })),
        itemProps: {
          multiple: true,
        },
      });
    }
  }

  if (state.formData) {
    fieldsList.push({
      name: 'apiId',
      itemProps: {
        type: 'hidden',
      },
    });
  }
  const onSubmit = (data: any, addMode: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { policyVisible, policies, redirectAddr, authMode, displayPath, path, method, ...rest } = data;
    const { displayPathPrefix = '' } = state.formData;
    let _policies = [];

    if (policies) {
      _policies = Array.isArray(policies) ? policies : [policies];
    }

    if (authMode) {
      _policies = Array.isArray(authMode) ? [..._policies, ...authMode] : _policies.concat(authMode);
    }

    let payload = { ...rest, policies: _policies };

    if (redirectAddr) {
      payload.redirectAddr = state.protocol + redirectAddr;
    }
    if (path) {
      payload = { ...payload, path: apiPathPrefix + path };
    } else if (displayPath) {
      payload = { ...payload, path: displayPathPrefix + displayPath };
    } else {
      payload = { ...payload, path: apiPathPrefix || displayPathPrefix };
    }

    // runtime 入口过来的，新增 API 需传 diceApp、diceService
    if (currentService && diceApp && chosenRuntimeId) {
      payload = { ...payload, diceApp, diceService: currentService, runtimeId: chosenRuntimeId };
    }

    // 选择所有方法则无需提交 method 字段
    if (method !== 'all') {
      payload = { ...payload, method };
    }

    if (addMode) {
      addAPI(payload).then(() => afterSubmit());
    } else {
      updateAPI(payload).then(() => afterSubmit());
    }
    handleCancle();
  };

  const handleCancle = () => {
    onCancel();
  };

  return (
    <FormModal
      width="800px"
      name="API"
      fieldsList={fieldsList}
      visible={modalVisible}
      formData={state.formData}
      onOk={onSubmit}
      onCancel={handleCancle}
    />
  );
};

export default React.memo(AddApiModal);
