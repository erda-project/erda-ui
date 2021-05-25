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
import { RenderPureForm, FormModal, useUpdate } from 'common';
import { DatePicker, InputNumber, message } from 'app/nusi';
import { find, get, debounce, flatten, map, isString, isEmpty, every } from 'lodash';
import { WrappedFormUtils } from 'core/common/interface';
import { clusterTypeMap } from './cluster-type-modal';
import clusterStore from '../../../stores/cluster';
import { regRules } from 'common/utils';
import { Down as IconDown, Up as IconUp } from '@icon-park/react';
import './cluster-form.scss';

enum RepeatMode {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

const scaleModeMap = {
  none: i18n.t('org:none'),
  auto: i18n.t('org:auto'),
  scheduler: i18n.t('org:scheduler'),
};

const repeatModeMap = {
  Daily: i18n.t('org:daily'),
  Weekly: i18n.t('org:weekly'),
  Monthly: i18n.t('org:monthly'),
};

const weekMap = {
  0: i18n.t('Sunday'),
  1: i18n.t('Monday'),
  2: i18n.t('Tuesday'),
  3: i18n.t('Wednesday'),
  4: i18n.t('Thursday'),
  5: i18n.t('Friday'),
  6: i18n.t('Saturday'),
};

const getDefaultMasterURL = (type:string, val = '', isEdgeCluster = true) => {
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
  form: WrappedFormUtils
  editMode: boolean,
  formData:any,
  clusterList:ORG_CLUSTER.ICluster[],
  clusterType:string;
}) => {
  const [isEdgeCluster, setIsEdgeCluster] = React.useState(get(formData, 'isEdgeCluster', true));
  const [wildcardDomain, setWildcardDomain] = React.useState('');
  const { getClusterNewDetail } = clusterStore.effects;
  const debounceCheckName = React.useCallback(debounce((nameStr: string, callback: Function) => {
    if (editMode) return callback();
    nameStr && getClusterNewDetail({ clusterName: nameStr }).then((res:any) => {
      const { basic } = get(res, '[0]', {});
      const curIsEdgeCluster = get(basic, 'edgeCluster.value', true);
      setIsEdgeCluster(curIsEdgeCluster);
      callback();
    });
  }, 200), []);

  React.useEffect(() => {
    form.setFieldsValue({
      'scheduler.dcosURL': getDefaultMasterURL(clusterType, wildcardDomain, isEdgeCluster),
    });
  }, [isEdgeCluster, wildcardDomain]);

  const fieldsList = [
    {
      label: i18n.t('{name} identify', { name: i18n.t('org:cluster') }),
      name: 'name',
      config: {
        getValueFromEvent(e: any) {
          const { value } = e.target;
          return value.replace(/\s/g, '').toLowerCase();
        },
      },
      itemProps: {
        disabled: editMode,
        placeholder: i18n.t('org:clusterName limit'),
      },
      rules: [
        regRules.clusterName,
        {
          validator: (rule: any, v: string, callback: Function) => {
            const curCluster = find(clusterList, { name: v });
            if (!editMode && curCluster) {
              callback(i18n.t('org:cluster existing'));
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
      pattern: /^.{1,30}$/,
      required: false,
      itemProps: {
        maxLength: 30,
      },
    },
    {
      label: i18n.t('org:wildcard domain'),
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
  ];
  if (clusterType === 'edas') {
    fieldsList.splice(4, 0, ...[
      { label: i18n.t('org:EDAS address'), name: 'scheduler.edasConsoleAddr' },
      { label: 'AK', name: 'scheduler.accessKey' },
      { label: 'AS', name: 'scheduler.accessSecret' },
      { label: i18n.t('org:cluster ID'), name: 'scheduler.clusterID' },
      { label: 'Region ID', name: 'scheduler.regionID' },
      { label: i18n.t('org:namespace'), name: 'scheduler.logicalRegionID' },
      { label: i18n.t('org:cluster address'), name: 'scheduler.k8sAddr' },
      { label: 'Registry Address', name: 'scheduler.regAddr' },
    ] as any);
  } else {
    fieldsList.splice(4, 0, {
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
    } as any);
  }

  return <RenderPureForm list={fieldsList} form={form} onlyItems />;
};
const ClusterSchedulerForm = ({ form, clusterType, formData, editMode }: { form: WrappedFormUtils, clusterType:string, formData: any, editMode: boolean, }) => {
  const initialOpsConfig = formData && formData.opsConfig;
  const formValues = form.getFieldsValue();
  const { scheduler, opsConfig } = formValues || ({} as any);
  const [{ repeatRange, repeatValue, repeatMode }, updater] = useUpdate({
    repeatRange: [],
    repeatValue: initialOpsConfig && initialOpsConfig.repeatValue,
    repeatMode: initialOpsConfig && initialOpsConfig.repeatMode,
  });
  React.useEffect(() => {
    form.setFieldsValue({
      'opsConfig.repeatValue': (repeatRange[0] && repeatRange[1]) ? repeatRange.join('-') : undefined,
    });
  }, [repeatRange]);
  // CA证书、客户端证书、客户端秘钥 必须同为空或同为不空
  const haveCrt = !!(
    scheduler &&
    (scheduler.caCrt || scheduler.clientCrt || scheduler.clientKey)
  );
  // 当认证类型空时，认证用户名、密码不需要填
  const authType = scheduler && scheduler.authType;
  let authFields = [] as any;
  if (authType !== '') {
    authFields = [
      {
        label: i18n.t('org:approve user'),
        name: 'scheduler.authUsername',
        initialValue: 'admin',
        required: true, // 当认证类型不为空时，必填
      },
      {
        label: i18n.t('org:approve password'),
        name: 'scheduler.authPassword',
        initialValue: 'Terminus1234',
        required: true, // 当认证类型不为空时，必填
      },
    ];
  }
  const fieldListMap = {
    k8s: [
      {
        label: i18n.t('org:oversold ratio'),
        name: 'scheduler.cpuSubscribeRatio',
        type: 'inputNumber',
        extraProps: {
          extra: i18n.t('org:set up cluster oversold ratio, such as 2, which is 1 nuclear CPU as 2 nuclear use'),
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
        label: i18n.t('org:approve type'),
        name: 'scheduler.authType',
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
        name: 'scheduler.caCrt',
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: i18n.t('org:client certificate'),
        name: 'scheduler.clientCrt',
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: i18n.t('org:client secret key'),
        name: 'scheduler.clientKey',
        type: 'textArea',
        initialValue: '',
        itemProps: { autoSize: { minRows: 2, maxRows: 6 } },
        required: haveCrt,
      },
      {
        label: `${i18n.t('enable')} dice_tags`,
        name: 'scheduler.enableTag',
        type: 'switch',
        initialValue: true,
        required: false,
      },
    ],
  };

  if (editMode) {
    fieldListMap.k8s.push({
      label: i18n.t('org:scale mode'),
      name: 'opsConfig.scaleMode',
      type: 'radioGroup',
      options: map(scaleModeMap, (name, value) => ({ name, value })),
      required: false,
    },);
  }

  if (opsConfig && opsConfig.scaleMode === 'scheduler') {
    fieldListMap.k8s.push({
      label: i18n.t('org:launch time'),
      name: 'opsConfig.launchTime',
      initialValue: initialOpsConfig && initialOpsConfig.launchTime,
      getComp: () => (
        <>
          <DatePicker
            className="full-width"
            format="YYYY-MM-DD HH:mm"
            defaultValue={initialOpsConfig && moment(initialOpsConfig.launchTime)}
            disabledDate={(current: Moment) => current && current < moment().subtract(1, 'days')}
            showTime
            onChange={date => { form.setFieldsValue({ 'opsConfig.launchTime': date }); }}
          />
        </>
      ),
    }, {
      label: i18n.t('org:scale duration'),
      name: 'opsConfig.scaleDuration',
      type: 'inputNumber',
      initialValue: initialOpsConfig && initialOpsConfig.scaleDuration,
      itemProps: {
        max: 12,
        min: 0,
        precision: 0,
        placeholder: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 12 }),
        className: 'full-width',
      },
    }, {
      label: i18n.t('org:scale number'),
      name: 'opsConfig.scaleNumber',
      type: 'inputNumber',
      initialValue: initialOpsConfig && initialOpsConfig.scaleNumber,
      itemProps: {
        max: 20,
        min: 0,
        precision: 0,
        placeholder: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 20 }),
        className: 'full-width',
      },
    }, {
      label: i18n.t('org:repeat mode'),
      name: 'opsConfig.repeatMode',
      type: 'select',
      initialValue: repeatMode,
      options: map(repeatModeMap, (name, value) => ({ value, name })),
      itemProps: {
        className: 'full-width',
        onChange(value: string) {
          form.setFieldsValue({
            'opsConfig.repeatValue': undefined,
          });
          updater.repeatValue('');
          updater.repeatMode(value);
        },
      },
    });

    let repeatValueField;
    switch (repeatMode) {
      case RepeatMode.WEEKLY:
        repeatValueField = {
          label: i18n.t('org:repeat day'),
          name: 'opsConfig.repeatValue',
          type: 'select',
          initialValue: repeatValue && repeatValue.split(','),
          options: map(weekMap, (name, value) => ({ value, name })),
          itemProps: {
            mode: 'multiple',
            className: 'full-width',
          },
        };
        break;
      case RepeatMode.MONTHLY:
        repeatValueField = {
          label: i18n.t('org:repeat range'),
          name: 'opsConfig.repeatValue',
          initialValue: repeatValue,
          getComp: () => {
            let start;
            let end;

            if (repeatValue) {
              const [s, e] = repeatValue.split('-');
              start = Number(s);
              end = Number(e);
            }

            return (
              <>
                <InputNumber
                  onChange={(value: any) => {
                    const e = repeatRange[1];
                    const s = (value > e) ? e : value;
                    updater.repeatRange([s, e]);
                  }}
                  defaultValue={start}
                  min={1}
                  max={repeatRange[1]}
                  precision={0}
                />
                <span className="mx8">-</span>
                <InputNumber
                  onChange={(value: any) => {
                    const s = repeatRange[0];
                    const e = (value < s) ? s : value;
                    updater.repeatRange([s, e]);
                  }}
                  defaultValue={end}
                  min={repeatRange[0]}
                  max={31}
                  precision={0}
                />
              </>
            );
          },
        };
        break;
      default:
        repeatValueField = {
          label: i18n.t('org:repeat internal(day)'),
          name: 'opsConfig.repeatValue',
          type: 'inputNumber',
          initialValue: repeatValue,
          itemProps: {
            min: 1,
            precision: 0,
          },
        };
        break;
    }
    fieldListMap.k8s.push(repeatValueField);
  }

  const fieldsList = clusterType ? fieldListMap[clusterType] : [];
  return <RenderPureForm list={fieldsList} form={form} onlyItems />;
};
const ClusterAddForm = (props:any) => {
  const { form, mode, formData, clusterList, clusterType } = props;
  const [showMore, setShowMore] = React.useState(false);

  return (
    <div className="cluster-form">
      <ClusterBasicForm form={form} clusterType={clusterType} formData={formData} editMode={mode === 'edit'} clusterList={clusterList} />
      {
        clusterType === 'edas' ? null : (
          <div className="more">
            <a className="more-btn" onClick={() => setShowMore(!showMore)}>
              {i18n.t('advanced settings')}
              { showMore ? <IconDown size="16px" /> : <IconUp size="16px" />}
            </a>
            <div className={`more-form ${showMore ? '' : 'hide'}`}>
              <ClusterSchedulerForm form={form} clusterType={clusterType} formData={formData} editMode={mode === 'edit'} />
            </div>
          </div>
        )
      }
    </div>
  );
};
interface IProps {
  [pro: string]: any;
  onSubmit: Function;
  visible: boolean;
  toggleModal: (isCancel?: boolean) => void;
  initData?: object | null;
  clusterList:ORG_CLUSTER.ICluster[];
  clusterType: string;
}

export const AddClusterModal = (props: IProps) => {
  const { initData, toggleModal, visible, onSubmit, clusterList, clusterType } = props;
  const formatLaunchTime = (ISOTime: Moment | string) => {
    const isISOString = isString(ISOTime);
    const ISOString = isISOString ? ISOTime as string : (ISOTime as Moment).toISOString();
    const dateAndTime = ISOString.split('T');
    const time = dateAndTime[1].split(':');
    return `${dateAndTime[0]}T${time[0]}:${time[1]}${isISOString ? '' : 'Z'}`;
  };
  const handleSubmit = (values: any) => {
    const { scheduler, opsConfig } = values;
    const postData = { ...values };
    if (every(opsConfig, item => isEmpty(item))) { postData.opsConfig = null; }
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
      if (launchTime && (launchTime < moment())) {
        message.warning(i18n.t('org:the execution time cannot be earlier than the current time'));
        reject();
      } else {
        resolve(values);
      }
    });
  };

  return (
    <FormModal
      width={800}
      name={i18n.t('org:{type} cluster', { type: get(find(flatten(clusterTypeMap), { type: clusterType }), 'name', '') })}
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
