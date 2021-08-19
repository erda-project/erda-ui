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

/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import i18n from 'i18n';
import { RenderPureForm, FormModal, Copy } from 'common';
import { Alert, Popover, Button } from 'core/nusi';
import { find, get, debounce, flatten, isEmpty, every, set } from 'lodash';
import { FormInstance, RadioChangeEvent } from 'core/common/interface';
import { clusterTypeMap } from './cluster-type-modal';
import clusterStore from '../../../stores/cluster';
import { goTo, insertWhen, regRules } from 'common/utils';
import { Down as IconDown, Up as IconUp, Help as IconHelp } from '@icon-park/react';
import { Link } from 'react-router-dom';
import './cluster-form.scss';

const ClusterBasicForm = ({
  form,
  editMode = false,
  clusterList,
  clusterType,
  formData,
}: {
  form: FormInstance;
  editMode: boolean;
  formData: any;
  clusterList: ORG_CLUSTER.ICluster[];
  clusterType: string;
}) => {
  const [credentialType, setCredentialType] = React.useState(get(formData, 'credentialType', 'kubeConfig'));
  const { getClusterNewDetail } = clusterStore.effects;

  const debounceCheckName = React.useCallback(
    debounce((nameStr: string, callback: Function) => {
      if (editMode) return callback();
      nameStr &&
        getClusterNewDetail({ clusterName: nameStr }).then(() => {
          callback();
        });
    }, 200),
    [],
  );

  const fieldsList = [
    {
      label: i18n.t('{name} identifier', { name: i18n.t('org:cluster') }),
      name: 'name',
      config: {
        getValueFromEvent(e: any) {
          const { value } = e.target;
          return value.replace(/\s/g, '').toLowerCase();
        },
      },
      itemProps: {
        disabled: editMode,
        placeholder: i18n.t('org:letters and numbers, separated by hyphens, cannot be modified if confirmed'),
      },
      rules: [
        regRules.clusterName,
        {
          validator: (_rule: unknown, v: string, callback: Function) => {
            const curCluster = find(clusterList, { name: v });
            if (!editMode && curCluster) {
              callback(i18n.t('org:cluster already existed'));
            } else if (v) {
              debounceCheckName(v, callback);
            } else {
              callback();
            }
          },
        },
      ],
    },
    {
      label: i18n.t('org:cluster name'),
      name: 'displayName',
      pattern: /^.{1,50}$/,
      required: false,
      itemProps: {
        maxLength: 50,
      },
      suffix:
        clusterType === 'k8s' ? (
          <Alert message={`${i18n.t('tip')}:`} description={k8sPrompt} type="warning" className="mt-4" />
        ) : null,
    },
    {
      label: i18n.t('org:extensive domain'),
      name: 'wildcardDomain',
      pattern: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
      config: {
        getValueFromEvent(e: any) {
          const { value } = e.target;
          const newValue = value.replace(/\s/g, '');
          return newValue;
        },
      },
    },
    {
      label: i18n.t('description'),
      name: 'description',
      type: 'textArea',
      itemProps: { autoSize: { minRows: 3, maxRows: 6 } },
      pattern: /^[\s\S]{0,100}$/,
      message: '100个字符以内',
      required: false,
    },
    {
      name: 'id',
      itemProps: { type: 'hidden' },
    },
    ...insertWhen(clusterType === 'edas', [
      { label: i18n.t('org:EDAS address'), name: ['scheduler', 'edasConsoleAddr'] },
      { label: 'AK', name: ['scheduler', 'accessKey'] },
      { label: 'AS', name: ['scheduler', 'accessSecret'] },
      { label: i18n.t('org:cluster ID'), name: ['scheduler', 'clusterID'] },
      { label: 'Region ID', name: ['scheduler', 'regionID'] },
      { label: i18n.t('org:namespace'), name: ['scheduler', 'logicalRegionID'] },
    ]),
    ...insertWhen(clusterType === 'k8s' || clusterType === 'edas', [
      {
        label: i18n.t('cmp:verification method'),
        name: 'credentialType',
        type: 'radioGroup',
        options: [
          {
            value: 'kubeConfig',
            name: 'KubeConfig',
          },
          {
            value: 'serviceAccount',
            name: 'Service Account',
          },
          {
            value: 'proxy',
            name: 'Cluster Agent',
          },
        ],
        initialValue: 'kubeConfig',
        formLayout: 'horizontal',
        itemProps: {
          onChange: (e: RadioChangeEvent) => {
            form.setFieldsValue({ credential: { content: undefined, address: undefined } });
            setCredentialType(e.target.value);
          },
        },
      },
      ...insertWhen(credentialType === 'kubeConfig', [
        {
          label: 'KubeConfig',
          name: ['credential', 'content'],
          type: 'textArea',
          initialValue: editMode ? '********' : '',
          itemProps: {
            onClick: () => {
              if (!form.isFieldTouched(['credential', 'content'])) {
                form.setFieldsValue({ credential: { content: undefined } });
              }
            },
          },
          required: !editMode,
        },
      ]),
      ...insertWhen(credentialType === 'serviceAccount', [
        {
          label: 'API Server URL',
          name: 'credential.address',
        },
        {
          label: (
            <div className="flex items-center">
              <div className="mr-1">Secret</div>
              <Popover
                title={`${i18n.t(
                  'cmp:please use the following command to get the Secret information corresponding to the Service Account',
                )}：`}
                content={
                  <div className="flex flex-col">
                    <div># Copy the secret name from the output of the get secret command</div>
                    <div id="command-script" className="whitespace-pre">
                      {`~/$ kubectl get serviceaccounts <service-account-name> -o yaml\n~/$ kubectl get secret <service-account-secret-name> -o yaml`}
                    </div>
                    <div className="flex justify-end mt-2">
                      <Copy selector=".btn-to-copy" />
                      <Button type="ghost" className="btn-to-copy" data-clipboard-target="#command-script">
                        {i18n.t('cmp:copy to clipboard')}
                      </Button>
                    </div>
                  </div>
                }
              >
                <IconHelp className="text-icon cursor-pointer" />
              </Popover>
            </div>
          ),
          name: ['credential', 'content'],
          type: 'textArea',
          initialValue: editMode ? '********' : '',
          itemProps: {
            onClick: () => {
              if (!form.isFieldTouched(['credential', 'content'])) {
                form.setFieldsValue({ credential: { content: undefined } });
              }
            },
          },
          required: !editMode,
        },
      ]),
    ]),
  ];

  return <RenderPureForm list={fieldsList} form={form} />;
};

const k8sAlert = (
  <span>
    {i18n.t(
      'cmp:during the initialization of the import cluster, all nodes in the cluster will be labeled with the organization name to facilitate the calling of services and tasks of the organization. If you need Erda best calling strategy, you need to enter',
    )}
    <Link to={goTo.resolve.cmpRoot()} className="mx-1" target="_blank" rel="noopener noreferrer">
      {`${i18n.t('Cloud management')} -> ${i18n.t('dcos:cluster overview')} -> ${i18n.t('set tags')}`}
    </Link>
    {i18n.t('cmp:configure')}
  </span>
);

const k8sPrompt = (
  <div>
    <div>1. {i18n.t('cmp:please ensure that your Kubernetes cluster and Erda network are smooth')}</div>
    <div>
      2.{' '}
      {i18n.t(
        'cmp:after importing the cluster, the nodes in the cluster will be labeled with the organization label by default',
      )}
    </div>
  </div>
);

const ClusterSchedulerForm = ({ form, clusterType }: { form: FormInstance; clusterType: string }) => {
  const fieldListMap = {
    k8s: [
      {
        label: i18n.t('org:oversold ratio'),
        name: ['scheduler', 'cpuSubscribeRatio'],
        type: 'inputNumber',
        extraProps: {
          extra: i18n.t(
            'org:Set the cluster oversold ratio. If the oversold ratio is 2, then 1 core CPU is used as 2 cores.',
          ),
        },
        itemProps: {
          min: 1,
          max: 100,
          className: 'w-full',
          placeholder: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 100 }),
        },
        initialValue: 1,
        required: false,
      },
    ],
  };

  const fieldsList = clusterType ? fieldListMap[clusterType] : [];
  return <RenderPureForm list={fieldsList} form={form} />;
};

const ClusterAddForm = (props: any) => {
  const { form, mode, formData, clusterList, clusterType } = props;
  const [showMore, setShowMore] = React.useState(false);

  return (
    <div className="cluster-form">
      <If condition={clusterType === 'k8s'}>
        <Alert message={`${i18n.t('cmp:note')}:`} description={k8sAlert} type="info" className="mb-8" />
      </If>
      <ClusterBasicForm
        form={form}
        clusterType={clusterType}
        formData={formData}
        editMode={mode === 'edit'}
        clusterList={clusterList}
      />
      {clusterType === 'edas' ? null : (
        <div className="more">
          <a className="more-btn" onClick={() => setShowMore(!showMore)}>
            {i18n.t('advanced settings')}
            {showMore ? <IconDown size="16px" /> : <IconUp size="16px" />}
          </a>
          <div className={`more-form ${showMore ? '' : 'hidden'}`}>
            <ClusterSchedulerForm
              form={form}
              clusterType={clusterType}
              formData={formData}
              editMode={mode === 'edit'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
interface IProps {
  [pro: string]: any;
  onSubmit: Function;
  visible: boolean;
  toggleModal: (isCancel?: boolean) => void;
  initData?: object | null;
  clusterList: ORG_CLUSTER.ICluster[];
  clusterType: string;
}

export const AddClusterModal = (props: IProps) => {
  const { initData, toggleModal, visible, onSubmit, clusterList, clusterType } = props;
  const handleSubmit = (values: any) => {
    const { scheduler, opsConfig, credential } = values;
    const postData = { ...values };
    if (every(opsConfig, (item) => isEmpty(item))) {
      postData.opsConfig = null;
    }
    const credentialContent = get(credential, 'content');
    const credentialAddress = get(credential, 'address');
    const cpuSubscribeRatio = get(scheduler, 'cpuSubscribeRatio');
    cpuSubscribeRatio && (postData.scheduler.cpuSubscribeRatio = `${cpuSubscribeRatio}`);
    credentialContent && (credential.content = `${credentialContent.trim()}`);
    credentialAddress && (credential.address = `${credentialAddress.trim()}`);
    onSubmit?.({ ...postData, type: clusterType });
    toggleModal();
  };

  if (['k8s', 'edas'].includes(clusterType) && initData) {
    const { manageConfig } = initData as Obj;
    const { credentialSource, address } = manageConfig || {};
    set(initData, 'credentialType', credentialSource);
    set(initData, 'credential.address', address);
  }

  return (
    <FormModal
      width={800}
      name={i18n.t('org:{type} cluster', {
        type: get(find(flatten(clusterTypeMap), { type: clusterType }), 'name', ''),
      })}
      title={
        clusterType === 'k8s' ? i18n.t('org:import an existing Erda {type} cluster', { type: 'Kubernetes' }) : undefined
      }
      visible={visible}
      onOk={handleSubmit}
      onCancel={() => toggleModal(true)}
      PureForm={ClusterAddForm}
      formData={initData}
      clusterList={clusterList}
      clusterType={clusterType}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
    />
  );
};
