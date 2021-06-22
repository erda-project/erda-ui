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

import { find, isEmpty } from 'lodash';
import * as React from 'react';
import { PagingTable, FormModal, connectCube } from 'common';
import { Button, Input, Select, InputNumber } from 'app/nusi';
import { policyCols } from '../config';
import { ApiPoliciesHeader } from './api-policies-header';
import i18n from 'i18n';
import gatewayStore from 'microService/stores/gateway';

const { Group: InputGroup } = Input;
const { Option } = Select;

interface IProps {
  addPolicy: typeof gatewayStore.effects.addPolicy;
  deletePolicy: typeof gatewayStore.effects.deletePolicy;
  updatePolicy: typeof gatewayStore.effects.updatePolicy;
  getConsumer: typeof gatewayStore.effects.getConsumer;
  getList: typeof gatewayStore.effects.getPolicyList;
  trafficControlPolicy: {
    policyList: GATEWAY.PolicyListItem[];
  };
  consumer: GATEWAY.Consumer;
}

class Policy extends React.Component<IProps, any> {
  state = {
    modalVisible: false,
    formData: {},
  };

  onSubmit = (data: GATEWAY.UpdatePolicy, addMode: boolean) => {
    if (addMode) {
      this.props.addPolicy({ data, category: 'trafficControl' });
    } else {
      this.props.updatePolicy({ data, category: 'trafficControl' });
    }
    this.toggleModal();
  };

  onDelete = ({ policyId }: GATEWAY.PolicyListItem) => {
    this.props.deletePolicy({ data: { policyId }, category: 'trafficControl' });
  };

  toggleModal = (data?: GATEWAY.PolicyListItem) => {
    let formData = {};
    if (data) {
      const { policies = [], ...rest } = data;
      formData = {
        ...rest,
        authentication: !!find(policies, { category: 'authentication' }),
      };
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
      formData,
    });
  };

  getList = (params: Record<string, any>) => {
    this.props.getList({ ...params, category: 'trafficControl' });
  };

  componentDidMount(): void {
    this.props.getConsumer();
  }

  render() {
    const { trafficControlPolicy } = this.props;
    const { modalVisible, formData } = this.state;
    const dataSource = trafficControlPolicy.policyList;

    const fieldsList = [
      {
        label: i18n.t('can only contain letters, numbers, underscores and hyphens'),
        name: 'policyName',
        rules: [{ pattern: /^[a-zA-z0-9_-]+$/, message: i18n.t('microService:display name') }],
        itemProps: {
          placeholder: i18n.t('can only contain letters, numbers, underscores and hyphens'),
        },
      },
      {
        label: i18n.t('microService:policy name'),
        name: 'displayName',
        required: false,
        itemProps: {
          placeholder: i18n.t('microService:as policy name by default'),
        },
      },
      {
        label: i18n.t('microService:request limit'),
        name: 'config',
        config: { initialValue: formData.config || { qps: 1 } },
        getComp: ({ form: { getFieldValue, setFieldsValue } }) => {
          const fieldValue = getFieldValue('config') || {};
          const targetUnit = Object.keys(fieldValue).length > 0 ? Object.keys(fieldValue)[0] : 'qps';
          const limitValue = Object.keys(fieldValue).length > 0 ? fieldValue[targetUnit] : 1;
          return (
            <>
              <InputGroup compact>
                <InputNumber
                  min={1}
                  style={{ width: '70%' }}
                  value={limitValue}
                  onChange={(value) => {
                    setFieldsValue({ config: { [targetUnit]: value } });
                  }}
                  placeholder={i18n.t('microService:please key in numbers')}
                />
                <Select
                  style={{ width: '30%' }}
                  value={targetUnit || 'qps'}
                  onSelect={(unit) => {
                    setFieldsValue({ config: { [unit]: limitValue } });
                  }}
                >
                  <Option value="qps">{i18n.t('microService:times/second')}</Option>
                  <Option value="qpm">{i18n.t('microService:times/minute')}</Option>
                  <Option value="qph">{i18n.t('microService:times/hour')}</Option>
                  <Option value="qpd">{i18n.t('microService:times/day')}</Option>
                </Select>
              </InputGroup>
            </>
          );
        },
      },
    ];
    if (!isEmpty(formData)) {
      fieldsList.push({
        name: 'policyId',
        itemProps: {
          type: 'hidden',
        },
      });
    }

    return (
      <div>
        <ApiPoliciesHeader />
        <div className="flex justify-between items-center mb-4">
          <Button type="primary" className="add-btn" onClick={() => this.toggleModal()}>
            {i18n.t('common:add')}
          </Button>
        </div>
        <PagingTable
          {...this.props}
          total={2}
          dataSource={dataSource}
          columns={policyCols}
          basicOperation
          rowKey="policyId"
          onEdit={this.toggleModal}
          onDelete={this.onDelete}
          getList={this.getList}
          tableProps={{
            pagination: false,
          }}
        />

        <FormModal
          width="600px"
          name={i18n.t('microService:flow control strategy')}
          fieldsList={fieldsList}
          visible={modalVisible}
          formData={formData}
          onOk={this.onSubmit}
          onCancel={this.toggleModal}
          modalProps={{
            destroyOnClose: true,
          }}
        />
      </div>
    );
  }
}

const mapper = () => {
  const [trafficControlPolicy, consumer] = gatewayStore.useStore((s) => [s.trafficControlPolicy, s.consumer]);
  const { getConsumer, getPolicyList: getList, addPolicy, updatePolicy, deletePolicy } = gatewayStore.effects;
  return {
    trafficControlPolicy,
    consumer,
    getConsumer,
    getList,
    addPolicy,
    updatePolicy,
    deletePolicy,
  };
};

export const TrafficPolicy = connectCube(Policy, mapper);
