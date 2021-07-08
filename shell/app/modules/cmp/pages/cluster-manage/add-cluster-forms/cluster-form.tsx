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
import * as React from 'react';
import i18n from 'i18n';
import moment, { Moment } from 'moment';
import { RenderPureForm, FormModal, Copy } from 'common';
import { message, Alert, Popover, Button } from 'app/nusi';
import { find, get, debounce, flatten, isString, isEmpty, every, set } from 'lodash';
import { FormInstance, RadioChangeEvent } from 'core/common/interface';
import { clusterTypeMap } from './cluster-type-modal';
import clusterStore from '../../../stores/cluster';
import { goTo, insertWhen, regRules } from 'common/utils';
import { Down as IconDown, Up as IconUp, Help as IconHelp } from '@icon-park/react';
import { Link } from 'react-router-dom';
import './cluster-form.scss';

const getDefaultMasterURL = (type: string, val = '', isEdgeCluster = true) => {
  const urlMap = {
    k8s: `inet://${val}?ssl=on/kubernetes.default.svc.cluster.local`,
    dcos: `inet://${val}/master.mesos`,
  };
  const centerUrlMap = {
    k8s: 'inet://ingress-nginx.kube-system.svc.cluster.local?direct=on&ssl=on/kubernetes.default.svc.cluster.local',
    dcos: 'http://master.mesos',
  };
  return isEdgeCluster ? urlMap[type] : centerUrlMap[type];
};

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
  const [isEdgeCluster, setIsEdgeCluster] = React.useState(get(formData, 'isEdgeCluster', true));
  const [wildcardDomain, setWildcardDomain] = React.useState('');
  const [credentialType, setCredentialType] = React.useState(get(formData, 'credentialType', 'kubeConfig'));
  const { getClusterNewDetail } = clusterStore.effects;

  const debounceCheckName = React.useCallback(
    debounce((nameStr: string, callback: Function) => {
      if (editMode) return callback();
      nameStr &&
        getClusterNewDetail({ clusterName: nameStr }).then((res: any) => {
          const { basic } = get(res, '[0]', {});
          const curIsEdgeCluster = get(basic, 'edgeCluster.value', true);
          setIsEdgeCluster(curIsEdgeCluster);
          callback();
        });
    }, 200),
    [],
  );

  React.useEffect(() => {
    form.setFieldsValue({ scheduler: { dcosURL: getDefaultMasterURL(clusterType, wildcardDomain, isEdgeCluster) } });
  }, [isEdgeCluster, wildcardDomain]);

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
          // 修改泛域名的同时，同步设置dcos地址
          if (clusterType !== 'edas' && isEdgeCluster) {
            setWildcardDomain(value);
          }
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
      { label: i18n.t('org:cluster address'), name: ['scheduler', 'k8sAddr'] },
      { label: 'Registry Address', name: ['scheduler', 'regAddr'] },
    ]),
    ...insertWhen(clusterType === 'dcos', [
      {
        label: i18n.t('org:cluster entry'),
        name: 'scheduler.dcosURL',
        pattern: /^(http|https|inet):\/\/[?a-zA-Z0-9]+([&-./?=][a-zA-Z0-9]+)+$/,
        initialValue: getDefaultMasterURL(clusterType),
        itemProps: {
          // disabled: true,
        },
        config: {
          getValueFromEvent(e: any) {
            const { value } = e.target;
            return value.replace(/\s/g, '').toLowerCase();
          },
        },
      },
    ]),
    ...insertWhen(clusterType === 'k8s', [
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
          suffix: (
            <div className="flex justify-end">
              <a href="" target="__blank">
                {i18n.t('cmp:learn how to write KubeConfig file?')}
              </a>
            </div>
          ),
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
      {`${i18n.t('cloud management')} -> ${i18n.t('dcos:cluster overview')} -> ${i18n.t('set tags')}`}
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
  const formValues = form.getFieldsValue();
  const { scheduler } = formValues || ({} as any);

  // CA证书、客户端证书、客户端秘钥 必须同为空或同为不空
  const haveCrt = !!(scheduler && (scheduler.caCrt || scheduler.clientCrt || scheduler.clientKey));
  // 当认证类型空时，认证用户名、密码不需要填
  const authType = scheduler && scheduler.authType;
  let authFields = [] as any;
  if (authType !== '') {
    authFields = [
      {
        label: i18n.t('org:authenticated user'),
        name: ['scheduler', 'authUsername'],
        initialValue: 'admin',
        required: true, // 当认证类型不为空时，必填
      },
      {
        label: i18n.t('org:authentication password'),
        name: ['scheduler', 'authPassword'],
        initialValue: 'Terminus1234',
        required: true, // 当认证类型不为空时，必填
      },
    ];
  }

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
          className: 'full-width',
          placeholder: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 100 }),
        },
        initialValue: 1,
        required: false,
      },
    ],
    dcos: [
      {
        label: i18n.t('org:authenticated type'),
        name: ['scheduler', 'authType'],
        type: 'radioGroup',
        options: ['', 'basic', 'token'].map((v) => {
          return {
            value: v,
            name: v || '无',
          };
        }),
        initialValue: '',
        required: false,
      },
      ...authFields,
      {
        label: i18n.t('org:CA certificate'),
        name: ['scheduler', 'caCrt'],
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: i18n.t('org:client certificate'),
        name: ['scheduler', 'clientCrt'],
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: i18n.t('org:client secret key'),
        name: ['scheduler', 'clientKey'],
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: `${i18n.t('enable')} dice_tags`,
        name: ['scheduler', 'enableTag'],
        type: 'switch',
        initialValue: true,
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
        <Alert message={`${i18n.t('cmp:note')}:`} description={k8sAlert} type="normal" className="mb-8" />
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
          <div className={`more-form ${showMore ? '' : 'hide'}`}>
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
  const formatLaunchTime = (ISOTime: Moment | string) => {
    const isISOString = isString(ISOTime);
    const ISOString = isISOString ? (ISOTime as string) : (ISOTime as Moment).toISOString();
    const dateAndTime = ISOString.split('T');
    const time = dateAndTime[1].split(':');
    return `${dateAndTime[0]}T${time[0]}:${time[1]}${isISOString ? '' : 'Z'}`;
  };
  const handleSubmit = (values: any) => {
    const { scheduler, opsConfig } = values;
    const postData = { ...values };
    if (every(opsConfig, (item) => isEmpty(item))) {
      postData.opsConfig = null;
    }
    const cpuSubscribeRatio = get(scheduler, 'cpuSubscribeRatio');
    const repeatValue = get(opsConfig, 'repeatValue');
    const launchTime = get(opsConfig, 'launchTime');
    const scaleDuration = get(opsConfig, 'scaleDuration');
    const scaleNumber = get(opsConfig, 'scaleNumber');
    scaleDuration && (postData.opsConfig.scaleDuration = Number(scaleDuration));
    scaleNumber && (postData.opsConfig.scaleNumber = Number(scaleNumber));
    repeatValue && (postData.opsConfig.repeatValue = repeatValue.toString());
    launchTime && (postData.opsConfig.launchTime = formatLaunchTime(launchTime));
    cpuSubscribeRatio && (postData.scheduler.cpuSubscribeRatio = `${cpuSubscribeRatio}`);
    onSubmit && onSubmit({ ...postData, type: clusterType });
    toggleModal();
  };

  const beforeSubmit = (values: any) => {
    const launchTime = get(values, 'opsConfig.launchTime');
    return new Promise((resolve, reject) => {
      if (launchTime && launchTime < moment()) {
        message.warning(i18n.t('org:the execution time cannot be earlier than the current time'));
        reject();
      } else {
        resolve(values);
      }
    });
  };

  if (clusterType === 'k8s' && initData) {
    const { manageConfig } = initData as any;
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
      beforeSubmit={beforeSubmit}
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
