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

import { Button, Select, Alert, Input, Spin, Checkbox } from 'app/nusi';
import i18n from 'i18n';
import * as React from 'react';
import { ImageUpload, RenderForm, CompactSelect } from 'common';
import { FormInstance } from 'core/common/interface';
import projectStore from 'app/modules/project/stores/project';
import { useEffectOnce } from 'react-use';
import clusterStore from 'cmp/stores/cluster';
import { goTo, insertWhen } from 'app/common/utils';
import orgStore from 'app/org-home/stores/org';
import { get } from 'lodash';
import { useLoading } from 'core/stores/loading';
import classnames from 'classnames';
import pinyin from 'tiny-pinyin';
import default_devops_svg from 'app/images/devops.svg';
import active_devops_svg from 'app/images/devops_1.svg';
import default_dmtd_svg from 'app/images/dmtd.svg';
import active_dmtd_svg from 'app/images/dmtd_1.svg';
import default_mjxm_svg from 'app/images/mjxm.svg';
import active_mjxm_svg from 'app/images/mjxm_1.svg';
import './create-project.scss';

const { Option } = Select;

interface ICardProps {
  name: string;
  val?: string;
  chooseVal: string;
  choose: React.Dispatch<React.SetStateAction<string>>;
  icon: {
    default: string;
    active: string;
  };
  description: string;
  disabled?: boolean;
}

export const useQuotaFields = (
  canEdit: boolean,
  showTip: boolean,
  usedResource: { cpuQuota: number; memQuota: number },
  canGetClusterListAndResources = true,
) => {
  const leftResource = projectStore.useStore((s) => s.leftResources);
  const { getLeftResources } = projectStore.effects;
  const { clearLeftResources } = projectStore.reducers;
  const [isLoading] = useLoading(projectStore, ['getLeftResources']);

  React.useEffect(() => {
    if (canGetClusterListAndResources) {
      clusterStore.effects.getClusterList();
      getLeftResources();
    }
    return () => {
      clearLeftResources();
    };
  }, [canGetClusterListAndResources, clearLeftResources, getLeftResources]);

  const leftCpu = Math.round((get(leftResource, 'availableCpu') || 0) + usedResource.cpuQuota); // 编辑时，可用值需要加上当前项目已经占用的
  const leftMem = Math.round((get(leftResource, 'availableMem') || 0) + usedResource.memQuota);
  const totalMem = Math.round(get(leftResource, 'totalMem') || 0);
  const totalCpu = Math.round(get(leftResource, 'totalCpu') || 0);

  const fields = [
    {
      label: i18n.t('CPU allocation'),
      labelTip: !canEdit ? i18n.t('org:Adjust in OrgCenter-Project Management') : undefined,
      name: 'cpuQuota',
      rules: [
        {
          validator: (_rule: any, value: any, callback: (message?: string) => void) => {
            if (value && (isNaN(+value) || +value < 0 || (+value > usedResource.cpuQuota && +value > leftCpu))) {
              return callback(i18n.t('please enter a number between {min} ~ {max}', { min: 0, max: leftCpu }));
            }
            callback();
          },
        },
      ],
      customRender: (v: number) => `${v} Core`,
      itemProps: {
        addonBefore: 'CPU',
        addonAfter: 'Core',
        disabled: !canEdit || isLoading,
      },
    },
    {
      label: i18n.t('Memory allocation'),
      labelTip: !canEdit ? i18n.t('org:Adjust in OrgCenter-Project Management') : undefined,
      name: 'memQuota',
      rules: [
        {
          validator: (_rule: any, value: any, callback: (message?: string) => void) => {
            if (value && (isNaN(+value) || +value < 0 || (+value > usedResource.memQuota && +value > leftMem))) {
              return callback(i18n.t('please enter a number between {min} ~ {max}', { min: 0, max: leftMem }));
            }
            callback();
          },
        },
      ],
      customRender: (v: number) => `${v} GiB`,
      itemProps: {
        addonBefore: 'MEM',
        addonAfter: 'GiB',
        disabled: !canEdit || isLoading,
      },
    },
  ] as any[];

  if (showTip) {
    const tip = (
      <>
        <div>
          <span className="mr-4">
            {i18n.t('project:total cluster resources')}：CPU：{totalCpu}
            {i18n.t('default:core')}
          </span>
          <span>MEM：{totalMem}GiB</span>
        </div>
        <div>
          <span className="mr-4">
            {i18n.t('cmp:available resources')}：CPU：{leftCpu}
            {i18n.t('default:core')}
          </span>
          <span>MEM：{leftMem}GiB</span>
        </div>
      </>
    );
    fields.push({
      required: false,
      showInfo: true,
      hideWhenReadonly: true,
      getComp: () => (
        <Spin spinning={isLoading}>
          <Alert message={tip} type="normal" />
        </Spin>
      ),
    });
  }
  return fields;
};

const TemplateCard = (props: ICardProps) => {
  const { chooseVal, choose, ...type } = props;
  const isChecked = chooseVal && chooseVal === type.val;
  const onClick = () => {
    if (type.disabled) return;
    choose(type.val || '');
  };
  const cln = classnames([
    'template-card',
    'border-radius',
    'px-2',
    'py-3',
    'pointer',
    'column-flex-box',
    'v-align',
    'flex-start',
    type.disabled ? 'not-allowed' : '',
    isChecked ? 'checked' : '',
  ]);

  return (
    <div className={cln} onClick={onClick}>
      <div className="template-icon">
        <img
          className="full-width full-height"
          src={isChecked ? get(type, 'icon.active') : get(type, 'icon.default')}
          alt="template-icon"
        />
      </div>
      <div className="template-name fz14 color-text pt-2 pb-1">{type.name}</div>
      <div className="template-description fz12 color-text-sub">{type.description}</div>
    </div>
  );
};

const templateArr = [
  {
    name: 'DevOps',
    val: 'DevOps',
    icon: {
      default: default_devops_svg,
      active: active_devops_svg,
    },
    description: i18n.t(
      'org:provides functions such as project management, code hub, CI/CD, artifact library and a complete R&D process.',
    ),
    disabled: false,
  },
  {
    name: i18n.t('org:code hosting project'),
    icon: {
      default: default_dmtd_svg,
      active: active_dmtd_svg,
    },
    description: i18n.t(
      'org:used for code repositories, supports multiple repositories and choose to enable CI/CD and artifacts',
    ),
    disabled: true,
  },
  {
    name: i18n.t('org:agile project'),
    icon: {
      default: default_mjxm_svg,
      active: active_mjxm_svg,
    },
    description: i18n.t('org:support-agile-management'),
    disabled: true,
  },
];

const CreationForm = () => {
  const { createProject } = projectStore.effects;
  const orgId = orgStore.getState((s) => s.currentOrg.id);
  const clusterList = clusterStore.useStore((s) => s.list);
  const quotaFields = useQuotaFields(true, true, { cpuQuota: 0, memQuota: 0 });
  const [ifConfigCluster, setIfConfigCluster] = React.useState(true);
  quotaFields[0].label = (
    <>
      {i18n.t('resources quota')}
      <span className="fz12 ml-1"> {i18n.t('project:Maximum resource quota for this project')}</span>
    </>
  );
  quotaFields[1].label = undefined;

  const firstClusterName = get(clusterList, '[0].name') || '';

  const handleSubmit = (form: FormInstance) => {
    form.validateFields().then((values: any) => {
      createProject({ ...values, orgId, cpuQuota: +values.cpuQuota, memQuota: +values.memQuota }).then((res: any) => {
        if (res.success) {
          goTo('../');
        }
      });
    });
  };

  const getCompactSelect = (title: string) => (
    <CompactSelect title={title}>
      <Select>
        {(clusterList || []).map((cluster) => (
          <Option key={cluster.id} value={cluster.name}>
            {cluster.name}
          </Option>
        ))}
      </Select>
    </CompactSelect>
  );

  const fieldsList = [
    {
      label: i18n.t('select template'),
      name: 'template',
      initialValue: templateArr[0].val,
      getComp: ({ form }: { form: FormInstance }) => (
        <div className="template-card-row flex-box">
          {templateArr.map((item) => (
            <TemplateCard
              key={item.name}
              chooseVal={form.getFieldsValue().template}
              choose={(e: any) => {
                form.setFieldsValue({
                  template: e,
                });
              }}
              {...item}
            />
          ))}
        </div>
      ),
    },
    {
      label: i18n.t('project name'),
      name: 'displayName',
      getComp: ({ form }: { form: FormInstance }) => (
        <Input
          onInput={(e: any) => {
            let v = e.target.value.trim();
            if (pinyin.isSupported()) {
              v = pinyin.convertToPinyin(v, '', true);
            }
            form.setFieldsValue({
              name: v.split(' ').join('-').toLowerCase(),
            });
            form.validateFields(['name']);
          }}
        />
      ),
      itemProps: {
        placeholder: i18n.t('project:the project name displayed on the Erda platform, supports Chinese characters'),
        maxLength: 40,
      },
    },
    {
      label: i18n.t('project identifier'),
      name: 'name',
      rules: [
        { max: 40, message: i18n.t('cannot exceed 40 characters') },
        {
          pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
          message: i18n.t('project-app-name-tip'),
        },
        {
          validator: (_rule: any, value: any, callback: (message?: string) => void) => {
            if (value && value.toLowerCase().endsWith('_ability')) {
              return callback(i18n.t('The name is reserved internally. Please change the name.'));
            }
            callback();
          },
        },
      ],
      itemProps: {
        placeholder: i18n.t('project-app-name-tip'),
        maxLength: 40,
      },
    },
    {
      getComp: () => (
        <Checkbox defaultChecked={ifConfigCluster} onChange={() => setIfConfigCluster(!ifConfigCluster)}>
          {i18n.t('org:need to configure project cluster resources')}
        </Checkbox>
      ),
    },
    ...insertWhen(ifConfigCluster, [
      {
        label: (
          <span className="mr-1">
            {i18n.t('project:Cluster used by the environment')}
            <span className="fz12 ml-1"> {i18n.t('project:Configure-cluster-environment')}</span>
          </span>
        ),
        name: ['clusterConfig', 'DEV'],
        initialValue: firstClusterName,
        itemProps: {
          allowClear: true,
        },
        getComp: () => getCompactSelect('DEV'),
      },
      {
        name: ['clusterConfig', 'TEST'],
        initialValue: firstClusterName,
        itemProps: {
          allowClear: true,
        },
        getComp: () => getCompactSelect('TEST'),
      },
      {
        name: ['clusterConfig', 'STAGING'],
        initialValue: firstClusterName,
        itemProps: {
          allowClear: true,
        },
        getComp: () => getCompactSelect('STAGING'),
      },
      {
        name: ['clusterConfig', 'PROD'],
        initialValue: firstClusterName,
        itemProps: {
          allowClear: true,
        },
        getComp: () => getCompactSelect('PROD'),
      },
      ...quotaFields,
    ]),
    {
      label: i18n.t('project icon'),
      name: 'logo',
      required: false,
      getComp: ({ form }: { form: FormInstance }) => <ImageUpload id="logo" form={form} showHint />,
    },
    {
      label: i18n.t('project description'),
      name: 'desc',
      type: 'textArea',
      required: false,
      itemProps: { rows: 4, maxLength: 200, style: { resize: 'none' } },
    },
    {
      label: '',
      getComp: ({ form }: { form: FormInstance }) => (
        <React.Fragment>
          <Button className="btn-save" type="primary" onClick={() => handleSubmit(form)}>
            {i18n.t('save')}
          </Button>
          <Button className="ml-3" onClick={() => window.history.back()}>
            {i18n.t('cancel')}
          </Button>
        </React.Fragment>
      ),
    },
  ];

  return <RenderForm layout="vertical" list={fieldsList} />;
};

export default CreationForm;
