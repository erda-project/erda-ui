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

import { FormModal, Icon as CustomIcon, useUpdate } from 'common';
import { regRules } from 'common/utils';
import LabelSelector from 'dcos/common/label-selector';
import { CustomLabel, checkCustomLabels } from 'dcos/common/custom-label';
import i18n from 'i18n';
import * as React from 'react';
import machineStore from 'app/modules/dataCenter/stores/machine';
import { uniq } from 'lodash';
import orgStore from 'app/org-home/stores/org';

interface IProps {
  visible: boolean,
  formData?: any,
  cluster: ORG_CLUSTER.ICluster | null,
  onCancel(): void,
  onSubmit?(resp: ORG_MACHINE.IClusterOperateRecord): any,
}
const MachineFormModal = ({
  visible,
  formData,
  cluster,
  onCancel,
  onSubmit = () => { },
}: IProps) => {
  const [state, updater] = useUpdate({
    passwordVisible: false,
  });
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { addMachine } = machineStore.effects;
  const defaultOrgTag = `org-${currentOrg.name}`;// 取企业名打默认的tag:org-{orgName}

  const togglePasswordVisible = () => {
    updater.passwordVisible(!state.passwordVisible);
  };

  const handelSubmit = (data: any) => {
    const { customLabels = [], ...rest } = data;
    if (!Array.isArray(rest.hosts)) {
      rest.hosts = rest.hosts.split('\n');
    }
    rest.labels = uniq((data.labels || []).concat(customLabels));
    addMachine({
      ...rest,
      clusterName: cluster && cluster.name,
      orgID: currentOrg.id,
    }).then(onSubmit);
    onCancel();
  };

  const fieldsList = [
    {
      label: 'Hosts',
      name: 'hosts',
      type: 'textArea',
      rules: [
        {
          validator: (rule: any, value: any, callback: any) => {
            let pass = true;
            const currentValue = Array.isArray(value) ? value : value.split('\n');
            currentValue.forEach((item: string) => {
              const o = item.replace(/\s+/g, '');
              o !== '' && (pass = regRules.ip.pattern.test(o));
            });
            return pass ? callback() : callback(i18n.t('dcos:please fill in the correct ip, separated by the enter key'));
          },
        },
      ],
      itemProps: {
        rows: 4,
        placeholder: i18n.t('dcos:fill-ip-split-enter'),
      },
    },
    {
      label: i18n.t('dcos:label'),
      name: 'labels',
      required: false,
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
      label: i18n.t('dcos:port'),
      name: 'port',
      type: 'inputNumber',
      itemProps: {
        placeholder: i18n.t('dcos:ssh port'),
        max: 999999,
      },
    },
    {
      label: i18n.t('dcos:username'),
      name: 'user',
      itemProps: {
        placeholder: i18n.t('dcos:ssh user'),
        maxLength: 32,
      },
    },
    {
      label: i18n.t('dcos:password'),
      name: 'password',
      itemProps: {
        placeholder: i18n.t('dcos:ssh password'),
        maxLength: 32,
        type: state.passwordVisible ? 'text' : 'password',
        addonAfter: (
          <CustomIcon
            className="mr0 pointer"
            onClick={togglePasswordVisible}
            type={state.passwordVisible ? 'openeye' : 'closeeye'}
          />
        ),
      },
    },
    {
      label: i18n.t('dcos:data disk device'),
      name: 'dataDiskDevice',
      required: false,
      itemProps: {
        placeholder: i18n.t('org:such as vdb (do not support multiple additional data plate)'),
      },
    },
  ];
  return (
    <FormModal
      width={620}
      title={cluster ? `${i18n.t('dcos:add machine to cluster')}：${cluster.name}` : i18n.t('dcos:add machine')}
      fieldsList={fieldsList}
      visible={visible}
      formData={formData}
      onOk={handelSubmit}
      onCancel={onCancel}
    />
  );
};

export default MachineFormModal;
