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
import { FormModal, Icon as CustomIcon } from 'common';
import { regRules } from 'common/utils';
import { some } from 'lodash';
import TagSelector from './tag-selector';
import i18n from 'i18n';
import orgStore from 'app/org-home/stores/org';

interface IProps {
  modalVisible: boolean;
  clusterName: string;
  currentOrg: ORG.IOrg;
  formData: Record<string, any>;
  orgs: any;
  onCancel(): void;
  onOk(data: Record<string, any>): void;
}

class AddMachineModal extends React.PureComponent<IProps, any> {
  state = {
    passwordVisible: false,
  };

  togglePasswordVisible = () => {
    this.setState({
      passwordVisible: !this.state.passwordVisible,
    });
  };

  handelSubmit = (data:Record<string, any>) => {
    const { customTag, ...reData } = data;
    if (!Array.isArray(reData.hosts)) {
      reData.hosts = reData.hosts.split('\n');
    }
    if (Array.isArray(reData.tag)) {
      reData.tag = `${reData.tag.join(',')}${
        customTag.trim() ? `,${customTag.trim()}` : ''
      }`;
    }
    this.props.onOk(reData);
    this.props.onCancel();
  };

  render() {
    const { modalVisible, formData, onCancel, clusterName, currentOrg } = this.props;
    const { passwordVisible } = this.state;
    const orgName = currentOrg.name;
    const defaultOrgTag = orgName ? `org-${orgName}` : '';// 取企业名打默认的tag:org-{orgName}
    const fieldsList = [
      {
        label: i18n.t('dcos:username'),
        name: 'user',
        itemProps: {
          placeholder: i18n.t('dcos:init-user-auth'),
          maxLength: 32,
        },
        initialValue: 'root',
      },
      {
        label: i18n.t('dcos:password'),
        name: 'password',
        required: false,
        itemProps: {
          placeholder: i18n.t('dcos:password of the user used to initialize the machine'),
          maxLength: 32,
          type: passwordVisible ? 'text' : 'password',
          addonAfter: (
            <CustomIcon
              className="mr0 pointer"
              onClick={this.togglePasswordVisible}
              type={passwordVisible ? 'openeye' : 'closeeye'}
            />
          ),
        },
        initialValue: '',
      },
      {
        label: 'IP',
        name: 'hosts',
        type: 'textArea',
        rules: [
          {
            validator: (_rule: any, value: string[]| string, callback: Function) => {
              let pass = true;
              const currentValue = Array.isArray(value) ? value : value.split('\n');
              currentValue.forEach((item) => {
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
        initialValue: '',
      },
      {
        label: i18n.t('dcos:label'),
        name: 'tag',
        required: false,
        initialValue: '',
        getComp: () => <TagSelector />,
      },
      {
        label: i18n.t('dcos:custom labels'),
        name: 'customTag',
        required: false,
        initialValue: defaultOrgTag,
        itemProps: {
          placeholder: i18n.t('dcos:separate multiple tags with a comma'),
        },
        rules: [
          {
            validator: (_rule: any, value: string, callback: Function) => {
              const valueArr = value ? value.split(',') : [];
              const reg = /^[a-zA-Z0-9-]+$/;

              const haveInCorrect = valueArr.length
                ? some(valueArr, (val) => {
                  return val.trim() ? !reg.test(val.trim()) : true;
                })
                : false;
              return haveInCorrect
                ? callback(i18n.t('dcos:each label can only contain alphanumeric and underline'))
                : callback();
            },
          },
        ],
      },
      {
        label: i18n.t('dcos:do you want to overwrite'),
        name: 'force',
        type: 'switch',
        required: false,
        initialValue: false,
      },
    ];
    return (
      <FormModal
        width={620}
        title={clusterName ? `${i18n.t('dcos:add machine to cluster')}：${clusterName}` : i18n.t('dcos:add machine')}
        fieldsList={fieldsList}
        visible={modalVisible}
        formData={formData}
        onOk={this.handelSubmit}
        onCancel={onCancel}
        modalProps={{
          destroyOnClose: true,
        }}
      />
    );
  }
}

export default (p: Omit<IProps, 'currentOrg' >) => {
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  return <AddMachineModal {...p} currentOrg={currentOrg} />;
}
