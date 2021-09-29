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

import { Button, Select, Alert, Input, Spin, Checkbox, Badge } from 'core/nusi';
import i18n from 'i18n';
import React from 'react';
import { ImageUpload, RenderForm, CompactSelect, ErdaCustomIcon } from 'common';
import { FormInstance } from 'core/common/interface';
import projectStore from 'app/modules/project/stores/project';
import clusterStore from 'cmp/stores/cluster';
import { createTenantProject } from 'msp/services';
import { goTo, insertWhen } from 'app/common/utils';
import orgStore from 'app/org-home/stores/org';
import { get } from 'lodash';
import { useLoading } from 'core/stores/loading';
import classnames from 'classnames';
import pinyin from 'tiny-pinyin';
import './create-project.scss';

const { Option } = Select;

interface ICardProps {
  name: string;
  val: PROJECT.ProjectType;
  icon: string;
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
          <Alert message={tip} type="info" />
        </Spin>
      ),
    });
  }
  return fields;
};

interface IProjectType {
  list: ICardProps[];
  value?: string;
  onChange?: (type: PROJECT.ProjectType, typeItem: ICardProps) => void;
}

const ProjectType = (props: IProjectType) => {
  const { list, value, onChange } = props;
  const [selectType, setType] = React.useState<string | undefined>();
  React.useEffect(() => {
    setType(value);
  }, [value]);
  const handleSelect = React.useCallback(
    (typeItem: ICardProps) => {
      if (typeItem.disabled || typeItem.val === selectType) {
        return;
      }
      setType(typeItem.val);
      onChange?.(typeItem.val, typeItem);
    },
    [onChange, selectType],
  );

  return (
    <div className="template-card-row flex justify-between items-center items-stretch">
      {list.map((item) => {
        const isChecked = selectType === item.val;
        const cln = classnames([
          'template-card',
          'rounded',
          'px-2',
          'py-3',
          'cursor-pointer',
          'flex',
          'flex-col',
          'items-center',
          'justify-start',
          'relative',
          item.disabled ? 'not-allowed' : '',
          isChecked ? 'checked' : '',
        ]);
        return (
          <div
            key={item.val}
            className={cln}
            onClick={() => {
              handleSelect(item);
            }}
          >
            {item.val === 'MSP' ? <Badge className="absolute top-2 right-2" count="beta" /> : null}
            <div className="relative template-icon center-flex-box">
              <ErdaCustomIcon type={item.icon} color={isChecked ? 'primary' : 'lightgray'} size="40px" />
            </div>
            <div className="template-name text-sm color-text pt-2 pb-1 text-center">{item.name}</div>
            <div className="template-description text-xs color-text-sub text-left">{item.description}</div>
          </div>
        );
      })}
    </div>
  );
};

const templateArr: ICardProps[] = [
  {
    name: 'DevOps',
    val: 'DevOps',
    icon: 'CombinedShape',
    description: i18n.t(
      'org:provides functions such as project management, code hub, CI/CD, artifact library and a complete R&D process.',
    ),
    disabled: false,
  },
  {
    name: i18n.t('org:microservice Observation Project'),
    val: 'MSP',
    icon: 'zhili',
    description: i18n.t('org:microservice governance desc'),
    disabled: false,
  },
  {
    name: i18n.t('org:code hosting project'),
    val: 'codeHostingProject',
    icon: 'code',
    description: i18n.t(
      'org:used for code repositories, supports multiple repositories and choose to enable CI/CD and artifacts',
    ),
    disabled: true,
  },
  {
    name: i18n.t('org:agile project'),
    val: 'agileProject',
    icon: 'scrum',
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
  const [template, setTemplate] = React.useState(templateArr[0].val);
  quotaFields[0].label = (
    <>
      {i18n.t('resources quota')}
      <span className="text-xs ml-1"> {i18n.t('project:Maximum resource quota for this project')}</span>
    </>
  );
  quotaFields[1].label = undefined;

  const firstClusterName = get(clusterList, '[0].name') || '';

  const handleSubmit = (form: FormInstance) => {
    form.validateFields().then((values: any) => {
      createProject({ ...values, orgId, cpuQuota: +values.cpuQuota, memQuota: +values.memQuota }).then((res: any) => {
        if (res.success) {
          createTenantProject({
            id: `${res.data}`,
            name: values.name,
            displayName: values.displayName,
            type: values.template === 'MSP' ? 'MSP' : 'DOP',
          }).then(() => {
            goTo('../');
          });
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
      getComp: () => (
        <ProjectType
          list={templateArr}
          onChange={(type) => {
            setTemplate(type);
          }}
        />
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
    ...insertWhen(template !== 'MSP', [
      {
        getComp: () => (
          <Checkbox defaultChecked={ifConfigCluster} onChange={() => setIfConfigCluster(!ifConfigCluster)}>
            {i18n.t('org:need to configure project cluster resources')}
          </Checkbox>
        ),
      },
    ]),
    ...insertWhen(template !== 'MSP' && ifConfigCluster, [
      {
        label: (
          <span className="mr-1">
            {i18n.t('project:Cluster used by the environment')}
            <span className="text-xs ml-1"> {i18n.t('project:Configure-cluster-environment')}</span>
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
