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

import { cloneDeep } from 'lodash';
import i18n from 'i18n';
import React from 'react';
import { Form, Steps, Button, Tooltip } from 'antd';
import { RenderPureForm, KeyValueList, Icon as CustomIcon } from 'common';
import { connectCube } from 'common/utils';
import { FormInstance } from 'core/common/interface';
import { goTo } from 'common/utils';
import {
  redisConfig,
  rdsConfig,
  preOrPostPaid,
  translate,
  checkRdsAccountName,
  checkForbiddenWord,
  checkPassword as checkRedisPassword,
  characterSetLists,
} from 'dcos/common/config';
import { Help as IconHelp, LinkOne as IconLinkOne } from '@icon-park/react';

import './index.scss';
import purchaseStore from 'dcos/stores/purchase';

const { Step } = Steps;

interface IProps {
  form: FormInstance;
  addResource: typeof purchaseStore.effects.addResource;
}

class OrderPage extends React.Component<IProps, any> {
  state = {
    step: 0,
    passwordVisible: false,
  };

  formRef = React.createRef<FormInstance>();

  confirmData = {};

  formData: { [key: string]: any } = {};

  changeStep = (step: number) => {
    const form = this.formRef.current;
    if (step === 1) {
      form?.validateFields().then((values: any) => {
        const { resourceType, ...data } = values;
        this.formData = values;
        this.confirmData = {};
        translate(cloneDeep(data[resourceType]), this.confirmData);
        this.setState({ step });
      });
    } else {
      this.setState({ step });
    }
  };

  togglePasswordVisible = () => {
    this.setState({
      passwordVisible: !this.state.passwordVisible,
    });
  };

  handleSubmit = () => {
    const { resourceType, ...data } = this.formData;
    this.props
      .addResource({
        type: resourceType,
        [resourceType]: data[resourceType],
      })
      .then(() => {
        goTo('../');
      });
  };

  getFormValue = (field?: string) => {
    const form = this.formRef.current;
    return field ? form?.getFieldValue(field) : form?.getFieldsValue();
  };

  getTipLabel = (text: string, tip: string) => (
    <Tooltip title={tip}>
      {text} <IconHelp />
    </Tooltip>
  );

  getLinkLabel = (text: string, tip: string, href: string) => (
    <Tooltip title={tip}>
      <a target="_blank" rel="noopener noreferrer" href={href}>
        {text} <IconLinkOne />
      </a>
    </Tooltip>
  );

  getFormList = () => {
    const tailFormItemLayout = {
      wrapperCol: {
        sm: {
          span: 24,
          offset: 0,
        },
        md: {
          span: 20,
          offset: 4,
        },
        lg: {
          span: 18,
          offset: 4,
        },
      },
    };
    const { resourceType = 'ecs' } = this.getFormValue();

    const getFieldsBy = {
      ecs: this.getEcsFields,
      redis: this.getRedisFields,
      rds: this.getRdsFields,
    };

    return [
      {
        label: i18n.t('type'),
        name: 'resourceType',
        type: 'radioGroup',
        options: ['ecs', 'redis', 'rds'].map((a) => ({ name: a, value: a })),
        initialValue: resourceType || 'ecs',
      },
      ...getFieldsBy[resourceType](),
      {
        label: '',
        isTailLayout: true,
        tailFormItemLayout,
        getComp: () => (
          <React.Fragment>
            <Button type="primary" onClick={() => this.changeStep(1)}>
              {i18n.t('ok')}
            </Button>
            <Button className="ml-3" onClick={() => window.history.back()}>
              {i18n.t('cancel')}
            </Button>
          </React.Fragment>
        ),
      },
    ];
  };

  getEcsFields = () => {
    const { ecs = {} } = this.getFormValue();
    let extraFields: any[] = [];
    if (ecs.instanceChargeType === 'PrePaid') {
      const periodList = ecs.periodUnit === 'Week' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 24, 36, 48, 60];
      extraFields = [
        {
          label: i18n.t('time unit'),
          name: ['ecs', 'periodUnit'],
          type: 'radioGroup',
          options: [
            {
              value: 'Week',
              name: i18n.t('week'),
            },
            {
              value: 'Month',
              name: i18n.t('month'),
            },
          ],
          initialValue: 'Week',
        },
        {
          label: i18n.t('cmp:duration'),
          name: ['ecs', 'period'],
          type: 'select',
          options: periodList.map((a) => ({ value: a, name: a })),
          initialValue: periodList[0],
        },
      ];
    }
    return [
      {
        label: (
          <span>
            <Tooltip title={i18n.t('cmp:currently only supports private')}>
              {i18n.t('cmp:node type')}&nbsp;
              <IconHelp />
            </Tooltip>
          </span>
        ),
        name: ['ecs', 'nodeType'],
        type: 'radioGroup',
        options: ['master', 'pubilc', 'private'].map((a) => ({ value: a, name: a })),
        initialValue: 'private',
        itemProps: {
          disabled: true,
        },
      },
      {
        label: i18n.t('cmp:instance specification'),
        name: ['ecs', 'instanceType'],
        initialValue: 'ecs.g5.2xlarge',
      },
      {
        label: i18n.t('cmp:billing method'),
        name: ['ecs', 'instanceChargeType'],
        ...preOrPostPaid,
      },
      ...extraFields,
      {
        label: this.getTipLabel(i18n.t('cmp:system disk'), `${i18n.t('cmp:cloud')} SSD`),
        name: ['ecs', 'systemDiskSize'],
        type: 'inputNumber',
        itemProps: { step: 1, min: 20, max: 500, placeholder: i18n.t('cmp:20 to 500') },
        rules: [
          {
            required: true,
            message: i18n.t('cmp:please fill in the system disk capacity'),
          },
        ],
      },
      {
        label: i18n.t('cmp:purchased instances'),
        name: ['ecs', 'amount'],
        type: 'inputNumber',
        itemProps: { step: 1, min: 1, max: 100, placeholder: i18n.t('cmp:1 to 100') },
      },
    ];
  };

  getRedisFields = () => {
    const { redis = {} } = this.getFormValue();
    const { passwordVisible } = this.state;
    const { single, double } = redisConfig;
    const fullList = single.concat(double);
    let extraFields: any[] = [];
    if (redis.chargeType === 'PrePaid') {
      const periodList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 24, 36, 48, 60];
      extraFields = [
        {
          label: `${i18n.t('cmp:duration')}(${i18n.t('month')}）`,
          name: ['redis', 'period'],
          type: 'radioGroup',
          options: periodList.map((a) => ({ value: a, name: a })),
        },
      ];
    }
    return [
      {
        label: this.getLinkLabel(
          i18n.t('cmp:specifications'),
          i18n.t('cmp:see details'),
          'https://help.aliyun.com/document_detail/61135.html',
        ),
        name: ['redis', 'instanceClass'],
        type: 'select',
        options: fullList.map((item) => ({
          name: `${item.text} (${i18n.t('cmp:maximum number of connections')}: ${item.maxConn}, ${i18n.t(
            'cmp:maximum throughput',
          )}: ${item.maxThrp})`,
          value: item.key,
        })),
        rules: [
          {
            required: true,
            message: i18n.t('cmp:please select the specification'),
          },
        ],
      },
      {
        label: i18n.t('cmp:payment type'),
        name: ['redis', 'chargeType'],
        ...preOrPostPaid,
      },
      ...extraFields,
      {
        label: i18n.t('version'),
        name: ['redis', 'engineVersion'],
        type: 'radioGroup',
        options: [
          {
            value: '2.8',
            name: '2.8',
          },
          {
            value: '4.0',
            name: '4.0',
          },
        ],
        initialValue: '2.8',
      },
      {
        label: i18n.t('password'),
        name: ['redis', 'Password'],
        required: false,
        itemProps: {
          placeholder: i18n.t('cmp:6 to 32 digits, must contain letters in uppercase and lowercase and numbers'),
          maxLength: 32,
          type: passwordVisible ? 'text' : 'password',
          addonAfter: (
            <CustomIcon
              className="mr-0 cursor-pointer"
              onClick={this.togglePasswordVisible}
              type={passwordVisible ? 'openeye' : 'closeeye'}
            />
          ),
        },
        rules: [
          {
            validator: checkRedisPassword,
          },
        ],
        initialValue: '',
      },
    ];
  };

  getRdsFields = () => {
    const { rds } = this.getFormValue();
    const { passwordVisible } = this.state;
    let extra: any[] = [];
    if (rds && rds.payType === 'PrePaid') {
      const usedTimeList = rds.period === 'Year' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3];
      extra = [
        {
          label: i18n.t('time unit'),
          name: ['rds', 'period'],
          type: 'radioGroup',
          options: [
            {
              value: 'Month',
              name: i18n.t('month'),
            },
            {
              value: 'Year',
              name: i18n.t('cmp:year'),
            },
          ],
          initialValue: 'Month',
        },
        {
          label: i18n.t('cmp:duration'),
          name: ['rds', 'usedTime'],
          type: 'radioGroup',
          options: usedTimeList.map((a) => ({ value: a, name: a })),
        },
      ];
    }
    return [
      {
        label: this.getLinkLabel(
          i18n.t('cmp:payment type'),
          i18n.t('cmp:please select the specification'),
          'https://help.aliyun.com/document_detail/26312.html',
        ),
        name: ['rds', 'dbInstanceClass'],
        type: 'select',
        options: rdsConfig.map((item) => ({
          name: `${item.key} (${item.cpu} ${item.mem} ${i18n.t('cmp:maximum number of connections')}: ${
            item.maxConn
          }, ${i18n.t('cmp:maximum iops')}: ${item.maxIOPS})`,
          value: item.key,
        })),
        rules: [
          {
            required: true,
            message: i18n.t('cmp:specifications'),
          },
        ],
      },
      {
        label: i18n.t('cmp:see details'),
        name: ['rds', 'payType'],
        type: 'radioGroup',
        options: [
          {
            value: 'Postpaid', // 这里是小写，简直操蛋
            name: i18n.t('org:Pay-As-You-Go'),
          },
          {
            value: 'Prepaid',
            name: i18n.t('org:Subscription'),
          },
        ],
        initialValue: 'Postpaid',
      },
      ...extra,
      {
        label: i18n.t('version'),
        name: ['rds', 'engineVersion'],
        type: 'radioGroup',
        options: ['5.5', '5.6', '5.7'].map((a) => ({ name: a, value: a })),
      },
      {
        label: this.getTipLabel(i18n.t('cmp:storage disk capacity'), i18n.t('cmp:local ssd')),
        name: ['rds', 'dbInstanceStorage'],
        type: 'inputNumber',
        itemProps: { step: 5, min: 50, max: 2000, placeholder: i18n.t('cmp:50 to 2000 gb') },
        rules: [
          {
            required: true,
            message: i18n.t('cmp:please fill in the storage capacity'),
          },
        ],
      },
      {
        label: i18n.t('cmp:account name'),
        name: ['rds', 'accountName'],
        rules: [
          {
            validator: checkRdsAccountName,
          },
        ],
      },
      {
        label: i18n.t('cmp:database name'),
        name: ['rds', 'dbName'],
        itemProps: { maxLength: 16 },
        rules: [
          {
            validator: checkForbiddenWord,
          },
        ],
      },
      {
        label: i18n.t('password'),
        name: ['rds', 'Password'],
        required: false,
        itemProps: {
          placeholder: i18n.t('cmp:6 to 32 digits, consisting of letters, numbers and underscores'),
          maxLength: 32,
          type: passwordVisible ? 'text' : 'password',
          addonAfter: (
            <CustomIcon
              className="mr-0 cursor-pointer"
              onClick={this.togglePasswordVisible}
              type={passwordVisible ? 'openeye' : 'closeeye'}
            />
          ),
        },
        rules: [
          {
            pattern: /^[a-zA-Z0-9_]{6,32}$/,
            message: i18n.t('cmp:6 to 32 digits, consisting of letters, numbers and underscores'),
          },
        ],
        initialValue: '',
      },
      {
        label: i18n.t('cmp:database encoding'),
        name: ['rds.parameters', 'character_set_server'],
        type: 'radioGroup',
        options: characterSetLists.map((a) => ({ name: a, value: a })),
      },
    ];
  };

  render() {
    const { step } = this.state;
    const formItemLayout = {
      labelCol: {
        sm: { span: 24 },
        md: { span: 4 },
        lg: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 24 },
        md: { span: 20 },
        lg: { span: 18 },
      },
    };

    const steps = [{ title: i18n.t('cmp:select configuration') }, { title: i18n.t('cmp:confirm configuration') }];

    return (
      <Form ref={this.formRef} className="purchase-resource">
        <Steps className="step-wrap" current={step}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">
          <div className={step === 0 ? '' : 'hidden'}>
            <RenderPureForm list={this.getFormList()} formItemLayout={formItemLayout} {...this.props} />,
          </div>
          <div className={step === 1 ? '' : 'hidden'}>
            <div className="confirm-block">
              <KeyValueList data={this.confirmData} />
              <div className="op-row">
                <Button type="primary" onClick={() => this.handleSubmit()}>
                  {i18n.t('submit')}
                </Button>
                <Button className="ml-3" onClick={() => this.changeStep(0)}>
                  {i18n.t('cmp:return to modify')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    );
  }
}

const mapper = () => {
  const { addResource } = purchaseStore.effects;
  return {
    addResource,
  };
};

export default connectCube(OrderPage, mapper);
