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

import { FormModal, RenderPureForm } from 'common';
import { uniq, get } from 'lodash';
import i18n from 'i18n';
import { Icon } from 'app/nusi';
import { diskTypeMap, getOptions } from './config';
import LabelSelector from 'dcos/common/label-selector';
import { CustomLabel, checkCustomLabels } from 'dcos/common/custom-label';
import { WrappedFormUtils } from 'core/common/interface';
import orgStore from 'app/org-home/stores/org';
import * as React from 'react';

interface IProps {
  visible: boolean,
  formData?: any,
  cluster: ORG_CLUSTER.ICluster,
  orgId: number,
  onCancel(): void,
  onSubmit(resp: any): any,
}

const BasicForm = ({ form }: {form: WrappedFormUtils}) => {
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const defaultOrgTag = `org-${currentOrg.name}`;// 取企业名打默认的tag:org-{orgName}

  const fieldsList = [
    {
      label: i18n.t('machines'),
      name: 'instanceNum',
      type: 'inputNumber',
      initialValue: 1,
      itemProps: {
        min: 1,
        max: 20,
        className: 'full-width',
      },
      extraProps: {
        extra: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 20 }),
      },
    },
    {
      label: i18n.t('org:machine label'),
      name: 'labels',
      getComp: () => <LabelSelector />,
    },
    {
      label: i18n.t('dcos:custom labels'),
      name: 'customLabels',
      required: false,
      initialValue: defaultOrgTag,
      getComp: () => (
        <CustomLabel />
      ),
      rules: [
        { validator: checkCustomLabels },
      ],
    },
    {
      label: i18n.t('org:machine type'),
      name: 'instanceType',
      initialValue: 'ecs.sn2ne.2xlarge',
      itemProps: { type: 'hidden' },
    },
    {
      label: 'cloudVendor',
      name: 'cloudVendor',
      initialValue: 'alicloud',
      itemProps: { type: 'hidden' },
    },
    {
      label: 'cloudResource',
      name: 'cloudResource',
      initialValue: 'ecs',
      itemProps: { type: 'hidden' },
    },

  ];
  return <RenderPureForm list={fieldsList} form={form} onlyItems />;
};

const MoreForm = ({ form }: {form: WrappedFormUtils}) => {
  const fieldsList = [
    {
      label: i18n.t('org:disk size'),
      name: 'diskSize',
      type: 'inputNumber',
      initialValue: 200,
      itemProps: {
        min: 1,
        max: 1024,
        className: 'full-width',
        formatter: (v:string) => `${v}G`,
        parser: (v:string) => v.replace('G', ''),
      },
      extraProps: {
        extra: i18n.t('please enter a number between {min} ~ {max}', { min: 1, max: 1024 }),
      },
    },
    {
      label: i18n.t('org:disk type'),
      name: 'diskType',
      type: 'select',
      initialValue: diskTypeMap.cloud_ssd.value,
      options: getOptions('diskType'),
      itemProps: {
        className: 'full-width',
      },
    },
  ];
  return <RenderPureForm list={fieldsList} form={form} onlyItems />;
};

const CloudMachineAddForm = (props:any) => {
  const { form, cluster } = props;
  const [showMore, setShowMore] = React.useState(false);
  const cloudVendor = get(cluster, 'cloudVendor');

  return (
    <div className="cluster-form">
      <BasicForm form={form} />
      {
        ['alicloud-cs', 'alicloud-cs-managed'].includes(cloudVendor) ? (null) : (
          <div className="more">
            <a className="more-btn" onClick={() => setShowMore(!showMore)}>
              {i18n.t('advanced settings')}
              <Icon type={showMore ? 'down' : 'up'} />
            </a>
            <div className={`more-form ${showMore ? '' : 'hide'}`}>
              <MoreForm form={form} />
            </div>
          </div>
        )
      }
    </div>
  );
};

const CloudMachineFormModal = (props: IProps) => {
  const { formData, onCancel, visible, onSubmit, orgId, cluster } = props;
  // k8s(alicloud) 云集群(alicloud-ecs)  容器集群(alicloud-ack)
  const cloudVendor = get(cluster, 'cloudVendor', '');

  const handelSubmit = (data: any) => {
    const { customLabels = [], instanceNum, diskSize, ...rest } = data;
    rest.labels = uniq((data.labels || []).concat(customLabels));
    const postData = {
      ...rest,
      instanceNum: Number(instanceNum),
      clusterName: cluster.name,
      cloudVendor,
      orgID: orgId,
    };
    if (!['alicloud-cs', 'alicloud-cs-managed'].includes(cloudVendor)) {
      postData.diskSize = Number(diskSize);
    }
    onSubmit(postData);
    onCancel();
  };

  return (
    <FormModal
      width={800}
      title={i18n.t('org:add alibaba cloud machine')}
      visible={visible}
      onOk={handelSubmit}
      onCancel={onCancel}
      PureForm={CloudMachineAddForm}
      formData={formData}
      cluster={cluster}
      modalProps={{
        destroyOnClose: true,
      }}
    />
  );
};


export default CloudMachineFormModal;
