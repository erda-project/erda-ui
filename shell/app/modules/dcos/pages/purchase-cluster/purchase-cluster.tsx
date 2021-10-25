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
import { Form, Steps, Button, Tooltip, Row, Col, Spin, Switch } from 'antd';
import { RenderPureForm, KeyValueList, Icon as CustomIcon, RenderFormItem } from 'common';
import { goTo, connectCube } from 'common/utils';
import React from 'react';
import {
  supportLBRegion,
  preOrPostPaid,
  lbConfig,
  redisConfig,
  rdsConfig,
  translate,
  checkForbiddenWord,
  checkRdsAccountName,
} from 'dcos/common/config';
import purchaseStore from 'dcos/stores/purchase';
import { FormInstance } from 'core/common/interface';
import { useLoading } from 'core/stores/loading';
import routeInfoStore from 'core/stores/route';
import { Help as IconHelp, LinkOne as IconLinkOne } from '@icon-park/react';
import './purchase-cluster.scss';

const { Step } = Steps;

interface IProps {
  params: Record<string, string>;
  form: FormInstance;
  getAvailableRegions: typeof purchaseStore.effects.getAvailableRegions;
  getAvailableZones: typeof purchaseStore.effects.getAvailableZones;
  checkEcsAvailable: typeof purchaseStore.effects.checkEcsAvailable;
  addPhysicalCluster: typeof purchaseStore.effects.addPhysicalCluster;
  availableRegions: PURCHASE.Region[];
  availableZones: PURCHASE.Zone[];
  isFetchingRegions: boolean;
  isFetchingZones: boolean;
}

class OrderPage extends React.Component<IProps> {
  showLBConfig: boolean;

  formRef = React.createRef<FormInstance>();

  state = {
    step: 0,
    passwordVisible: false,
    lb: false,
    nat: false,
    nas: false,
    redis: false,
    rds: false,
  };

  confirmData = {};

  formData = {} as PURCHASE.AddPhysicalCluster;

  togglePasswordVisible = () => {
    this.setState({
      passwordVisible: !this.state.passwordVisible,
    });
  };

  changeStep = (step: number) => {
    const form = this.formRef.current;
    form
      ?.validateFields()
      .then((values: any) => {
        const clone = cloneDeep(values);
        const { ecsSettings, redisSettings, rdsSettings, ...rest } = values;
        rest.ecsSettings = Object.values(ecsSettings);
        if (redisSettings) {
          rest.redisSettings = [redisSettings];
        }
        if (rdsSettings) {
          rest.rdsSettings = [rdsSettings];
        }
        this.formData = rest;
        // 调整vpcCidr展示位置
        this.confirmData = {
          专有网络cidr: clone.vpcSetting.vpcCidr,
        };
        delete clone.vpcSetting;
        translate(clone, this.confirmData);
        this.setState({ step });
      })
      .catch(({ errorFields }: { errorFields: Array<{ name: any[]; errors: any[] }> }) => {
        form?.scrollToField(errorFields[0].name);
      });
  };

  trigger = (event: string, ...args: any[]) => {
    switch (event) {
      case 'regionChange':
        // @ts-ignore
        this.changeRegion(...args);
        break;
      case 'zoneChange':
        // @ts-ignore
        this.changeZone(...args);
        break;
      case 'ecsInstanceType':
        // @ts-ignore
        this.checkEcsAvailable(...args);
        break;
      case 'accessKeyId':
      case 'accessKeySecret':
        this.searchRegion();
        break;
      default:
        break;
    }
  };

  changeRegion = (region: { localName: string; regionId: string }) => {
    const form = this.formRef.current;
    this.showLBConfig = supportLBRegion.includes(region.localName);
    form?.setFieldsValue({ regionId: region.regionId });
    this.searchZone(region.regionId);
  };

  changeZone = (zone: { zoneId: string }) => {
    const form = this.formRef.current;
    form?.setFieldsValue({ zoneId: zone.zoneId });
  };

  searchRegion = () => {
    const { accessKeyId, accessKeySecret } = this.getFormValue();
    if (accessKeyId && accessKeySecret) {
      this.props.getAvailableRegions({ accessKeyId, accessKeySecret });
    }
  };

  searchZone = (regionId: string) => {
    const { accessKeyId, accessKeySecret } = this.getFormValue();
    if (accessKeyId && accessKeySecret) {
      this.props.getAvailableZones({ regionId, accessKeyId, accessKeySecret });
    }
  };

  checkEcsAvailable = (instanceType: string, fieldName: string) => {
    const { params, checkEcsAvailable } = this.props;
    const form = this.formRef.current;
    const { accessKeyId, accessKeySecret, regionId, zoneId } = this.getFormValue();
    const { clusterName } = params;
    checkEcsAvailable({
      clusterName,
      accessKeyId,
      accessKeySecret,
      regionId,
      zoneId,
      instanceType,
    }).then((result) => {
      const { available, description } = result;
      form?.setFields([
        {
          name: [fieldName],
          value: instanceType,
          errors: available === false ? [description] : null,
        },
      ]);
    });
  };

  getFormValue = (field?: string) => {
    const form = this.formRef.current;
    return field ? form?.getFieldValue(field) : form?.getFieldsValue();
  };

  handleSubmit = () => {
    this.props.addPhysicalCluster(this.formData).then(() => {
      goTo('../');
    });
  };

  getTitle = (title: string, enableKey: string) => {
    let needToggle = false;
    let enable = true;
    if (this.state[enableKey] !== undefined) {
      needToggle = true;
      enable = this.state[enableKey];
    }
    return {
      label: (
        <span className={`split-title ${enable ? '' : 'disable'}`}>
          {title}&nbsp;
          {needToggle && (
            <Switch size="small" checked={enable} onChange={(bool) => this.setState({ [enableKey]: bool })} />
          )}
        </span>
      ),
      getComp: () => null,
      noColon: true,
    };
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

  getVpcConfig = () => {
    return [
      {
        label: 'vpcCidr',
        name: ['vpcSetting', 'vpcCidr'],
        initialValue: '10.0.0.0/8',
        getComp: () => <span>10.0.0.0/8</span>,
      },
    ];
  };

  getRegionConfig = () => {
    const { availableRegions, availableZones, isFetchingRegions, isFetchingZones } = this.props;
    return [
      // this.getTitle('区域', 'region'),
      {
        label: i18n.t('region'),
        name: 'regionId',
        getComp: ({ form }: { form: FormInstance }) => (
          <Spin spinning={isFetchingRegions}>
            <div className="region-select">
              {availableRegions.length
                ? availableRegions.map((region) => {
                    return (
                      <div
                        key={region.regionId}
                        className={`region-item ${form.getFieldValue('regionId') === region.regionId ? 'active' : ''}`}
                        onClick={() => this.trigger('regionChange', region)}
                      >
                        {supportLBRegion.includes(region.localName) ? (
                          <Tooltip title={i18n.t('support load balancing')}>
                            <CustomIcon className="tag-icon" type="load-balancer" />
                          </Tooltip>
                        ) : null}
                        {region.localName}
                      </div>
                    );
                  })
                : i18n.t('org:please input accessKeyId and accessKeySecret first')}
            </div>
          </Spin>
        ),
      },
      {
        label: i18n.t('org:availability zone'),
        name: 'zoneId',
        getComp: ({ form }: { form: FormInstance }) => (
          <Spin spinning={isFetchingZones}>
            <div className="region-select">
              {availableZones.length
                ? availableZones.map((zone) => {
                    return (
                      <div
                        key={zone.zoneId}
                        className={`region-item ${form.getFieldValue('zoneId') === zone.zoneId ? 'active' : ''}`}
                        onClick={() => this.trigger('zoneChange', zone)}
                      >
                        {zone.localName}
                      </div>
                    );
                  })
                : i18n.t('org:please select a region first')}
            </div>
          </Spin>
        ),
      },
    ];
  };

  getNatConfig = () => {
    if (!this.state.nat) {
      return [this.getTitle('NAT', 'nat')];
    }
    return [
      this.getTitle('NAT', 'nat'),
      {
        label: i18n.t('specification'),
        name: ['natSetting', 'natSpec'],
        type: 'radioGroup',
        options: ['Small', 'Middle', 'Large', 'XLarge'].map((o) => ({ name: o, value: o })),
        initialValue: 'Small',
      },
      {
        label: i18n.t('bandwidth'),
        name: ['natSetting', 'NatBandwidth'],
        type: 'inputNumber',
        itemProps: { step: 1, min: 5, max: 100, placeholder: '5-100 M' },
      },
      {
        label: i18n.t('org:network billing method'),
        name: ['natSetting', 'EipInternetChargeType'],
        type: 'radioGroup',
        options: [
          {
            value: 'PayByTraffic',
            name: i18n.t('pay by traffic'),
          },
          {
            value: 'PayByBandwidth',
            name: i18n.t('org:pay by bandwidth'),
          },
        ],
        initialValue: 'PayByTraffic',
      },
      {
        label: i18n.t('org:instance billing method'),
        name: ['natSetting', 'EipInstanceChargeType'],
        ...preOrPostPaid,
      },
    ];
  };

  getNasConfig = () => {
    if (!this.state.nas) {
      return [this.getTitle('NAS', 'nas')];
    }
    return [
      this.getTitle('NAS', 'nas'),
      {
        label: i18n.t('storage type'),
        name: ['nasSetting', 'nasStorageType'],
        type: 'radioGroup',
        options: [
          {
            value: 'Capacity',
            name: i18n.t('capacity type'),
          },
          {
            value: 'Performance',
            name: i18n.t('org:performance type'),
          },
        ],
        initialValue: 'Capacity',
      },
    ];
  };

  getLBFields = () => {
    if (!this.showLBConfig) {
      return [];
    }
    if (!this.state.lb) {
      return [this.getTitle(i18n.t('load balancing'), 'lb')];
    }
    const { loadBalancerSetting = {} } = this.getFormValue();
    let lbPayTypeExtra: any[] = [];
    let lbChargeExtra: any[] = [];
    if (loadBalancerSetting.loadBalancePayType === 'PrePay') {
      const periodList = loadBalancerSetting.lbPayCycle === 'Month' ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
      lbPayTypeExtra = [
        {
          label: i18n.t('duration unit'),
          name: ['loadBalancerSetting', 'lbPayCycle'],
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
          label: i18n.t('duration'),
          name: 'period',
          type: 'radioGroup',
          options: periodList.map((a) => ({ value: a, name: a })),
          initialValue: periodList[0],
        },
      ];
    }
    if (loadBalancerSetting.loadBalancerInternetChargeType === 'paybybandwidth') {
      lbChargeExtra = [
        {
          label: i18n.t('bandwidth'),
          name: ['loadBalancerSetting', 'loadBalancerBandwidth'],
          type: 'inputNumber',
          itemProps: { step: 1, min: 1, max: 5000, placeholder: '1-5000 MB' },
        },
      ];
    }
    return [
      this.getTitle(i18n.t('load balancing'), 'lb'),
      {
        label: this.getLinkLabel(
          i18n.t('specification'),
          i18n.t('check detail'),
          'https://help.aliyun.com/document_detail/27657.html',
        ),
        name: ['loadBalancerSetting', 'loadBalancerSpec'],
        type: 'select',
        options: lbConfig.map((o) => ({
          name: `${o.key} (${i18n.t('org:maximum number of connections')}: ${o.maxConn} ${i18n.t(
            'org:new connections per second',
          )}: ${o.CPS} ${i18n.t('queries per second')}:${o.QPS})`,
          value: o.key,
        })),
        rules: [
          {
            required: true,
            message: i18n.t('please select version'),
          },
        ],
      },
      {
        label: i18n.t('org:billing method'),
        name: ['loadBalancerSetting', 'loadBalancePayType'],
        type: 'radioGroup',
        options: [
          {
            value: 'PayOnDemand',
            name: i18n.t('org:pay as you go'),
          },
          {
            value: 'PrePay',
            name: i18n.t('org:Subscription'),
          },
        ],
      },
      ...lbPayTypeExtra,
      {
        label: i18n.t('org:network billing method'),
        name: ['loadBalancerSetting', 'loadBalancerInternetChargeType'],
        type: 'radioGroup',
        options: [
          {
            value: 'paybybandwidth',
            name: i18n.t('by fixed bandwidth'),
          },
          {
            value: 'paybytraffic',
            name: i18n.t('by flow'),
          },
        ],
      },
      ...lbChargeExtra,
    ];
  };

  getEcsFieldByType = (type: string) => {
    let extra: any[] = [];
    const { ecsSettings } = this.getFormValue();
    const ecsData = ecsSettings ? ecsSettings[type] : {};
    const showLabel = type === 'master';
    let formItemLayout: {
      [k: string]: {
        sm: { span: number };
        md?: { span: number };
      };
    } = {
      labelCol: {
        sm: { span: 0 },
      },
      wrapperCol: {
        sm: { span: 22 },
      },
    };
    if (showLabel) {
      formItemLayout = {
        labelCol: {
          sm: { span: 24 },
          md: { span: 7 },
        },
        wrapperCol: {
          sm: { span: 24 },
          md: { span: 16 },
        },
      };
    }
    if (ecsData && ecsData.instanceChargeType === 'PrePaid') {
      const periodList =
        ecsData.periodUnit === 'Month' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 24, 36, 48, 60] : [1, 2, 3, 4];
      extra = [
        {
          label: i18n.t('duration unit'),
          name: `ecsSettings.${type}.periodUnit`,
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
          formLayout: 'horizontal',
          formItemLayout,
        },
        {
          label: i18n.t('duration'),
          name: `ecsSettings.${type}.period`,
          type: 'select',
          options: periodList.map((a) => ({ value: a, name: a })),
          initialValue: periodList[0],
          formLayout: 'horizontal',
          formItemLayout,
        },
      ];
    }
    const placeholderMap = {
      master: i18n.t('org:suggest 3 nodes in production and 1 node in test'),
      pubilc: i18n.t(
        'org:It is recommended to use 2 nodes in production, and 1 node in test. Only 1 node does not support the creation of SLB.',
      ),
      private: i18n.t('org:suggest production is assessed by business volume, 1 node in test'),
    };
    return [
      {
        label: showLabel ? i18n.t('org:node type') : null,
        name: `ecsSettings.${type}.nodeType`,
        initialValue: type,
        itemProps: {
          disabled: true,
        },
        formLayout: 'horizontal',
        formItemLayout,
        rules: [
          {
            required: true,
            message: i18n.t('org:please select node type'),
          },
        ],
      },
      {
        label: showLabel ? i18n.t('org:instance specification') : null,
        name: `ecsSettings.${type}.instanceType`,
        initialValue: 'ecs.sn2ne.2xlarge',
        formLayout: 'horizontal',
        formItemLayout,
        rules: [
          {
            required: true,
            message: i18n.t('org:Please fill in the instance specification.'),
          },
        ],
        itemProps: {
          onBlur: (e: React.ChangeEvent<HTMLInputElement>) =>
            this.trigger('ecsInstanceType', e.target.value, `ecsSettings.${type}.instanceType`),
        },
        extraProps: {
          hasFeedback: true,
        },
      },
      {
        label: showLabel ? i18n.t('org:billing method') : null,
        name: `ecsSettings.${type}.instanceChargeType`,
        ...preOrPostPaid,
        formLayout: 'horizontal',
        formItemLayout,
        rules: [
          {
            required: true,
            message: i18n.t('org:please choose a billing method'),
          },
        ],
      },
      ...extra,
      {
        label: showLabel ? this.getTipLabel(i18n.t('cmp:system disk'), i18n.t('cloud ssd')) : null,
        name: `ecsSettings.${type}.systemDiskSize`,
        type: 'inputNumber',
        itemProps: { step: 1, min: 20, max: 500, placeholder: '20-500 GB' },
        formLayout: 'horizontal',
        formItemLayout,
        rules: [
          {
            required: true,
            message: i18n.t('org:please fill in the system disk capacity'),
          },
        ],
      },
      {
        label: showLabel ? i18n.t('org:purchased instances') : null,
        name: `ecsSettings.${type}.amount`,
        type: 'inputNumber',
        itemProps: { step: 1, min: 1, max: 100, placeholder: '1-100' },
        extraProps: {
          extra: placeholderMap[type],
        },
        formLayout: 'horizontal',
        formItemLayout,
        rules: [
          {
            required: true,
            message: i18n.t('org:please fill in the purchased instances'),
          },
        ],
      },
    ];
  };

  getEcsFields = () => {
    return [
      {
        label: <span className="split-title">Ecs</span>,
        getComp: ({ form }: { form: FormInstance }) => {
          return (
            <div className="ecs-block">
              <Row>
                <Col span={10}>
                  {this.getEcsFieldByType('master').map((field) => (
                    <RenderFormItem key={field.name} {...field} form={form} />
                  ))}
                </Col>
                <Col span={7}>
                  {this.getEcsFieldByType('pubilc').map((field) => (
                    <RenderFormItem key={field.name} {...field} form={form} />
                  ))}
                </Col>
                <Col span={7}>
                  {this.getEcsFieldByType('private').map((field) => (
                    <RenderFormItem key={field.name} {...field} form={form} />
                  ))}
                </Col>
              </Row>
            </div>
          );
        },
      },
    ];
  };

  getRedisFields = () => {
    if (!this.state.redis) {
      return [this.getTitle('Redis', 'redis')];
    }
    const { redisSettings } = this.getFormValue();
    const { single, double } = redisConfig;
    const fullList = single.concat(double);
    let extraFields: any[] = [];
    if (redisSettings) {
      if (redisSettings.chargeType === 'PrePaid') {
        const periodList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 24, 36, 48, 60];
        extraFields = [
          {
            label: i18n.t('duration(month)'),
            name: ['redisSettings', 'period'],
            type: 'radioGroup',
            options: periodList.map((a) => ({ value: a, name: a })),
          },
        ];
      }
    }
    return [
      this.getTitle('Redis', 'redis'),
      {
        label: this.getLinkLabel(
          i18n.t('specification'),
          i18n.t('check detail'),
          'https://help.aliyun.com/document_detail/61135.html',
        ),
        name: ['redisSettings', 'instanceClass'],
        type: 'select',
        options: fullList.map((item) => ({
          name: `${item.text} (${i18n.t('org:maximum number of connections')}: ${item.maxConn}, ${i18n.t(
            'maximum throughput',
          )}: ${item.maxThrp})`,
          value: item.key,
        })),
        rules: [
          {
            required: true,
            message: i18n.t('org:please select specifications'),
          },
        ],
      },
      {
        label: i18n.t('org:payment type'),
        name: ['redisSettings', 'chargeType'],
        ...preOrPostPaid,
      },
      ...extraFields,
      {
        label: i18n.t('version'),
        name: ['redisSettings', 'engineVersion'],
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
    ];
  };

  getRdsFields = () => {
    if (!this.state.rds) {
      return [this.getTitle('Rds', 'rds')];
    }
    const { rdsSettings } = this.getFormValue();
    const { passwordVisible } = this.state;
    let extra: any[] = [];
    if (rdsSettings && rdsSettings.payType === 'PrePaid') {
      const usedTimeList = rdsSettings.period === 'Year' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3];
      extra = [
        {
          label: i18n.t('duration unit'),
          name: ['rdsSettings', 'period'],
          type: 'radioGroup',
          options: [
            {
              value: 'Month',
              name: i18n.t('month'),
            },
            {
              value: 'Year',
              name: i18n.t('year'),
            },
          ],
          initialValue: 'Month',
        },
        {
          label: i18n.t('duration'),
          name: ['rdsSettings', 'usedTime'],
          type: 'radioGroup',
          options: usedTimeList.map((a) => ({ value: a, name: a })),
        },
      ];
    }
    return [
      this.getTitle('Rds', 'rds'),
      {
        label: this.getLinkLabel(
          i18n.t('specification'),
          i18n.t('check detail'),
          'https://help.aliyun.com/document_detail/26312.html',
        ),
        name: ['rdsSettings', 'dbInstanceClass'],
        type: 'select',
        options: rdsConfig.map((item) => ({
          name: `${item.key} (${item.cpu} ${item.mem} ${i18n.t('org:maximum number of connections')}: ${
            item.maxConn
          }, ${i18n.t('maximum IOPS')}: ${item.maxIOPS})`,
          value: item.key,
        })),
        rules: [
          {
            required: true,
            message: i18n.t('please select version'),
          },
        ],
      },
      {
        label: i18n.t('org:payment type'),
        name: ['rdsSettings', 'payType'],
        type: 'radioGroup',
        options: [
          {
            value: 'Postpaid', // 这里是小写，简直操蛋
            name: i18n.t('pay as you go'),
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
        name: ['rdsSettings', 'engineVersion'],
        type: 'radioGroup',
        options: ['5.5', '5.6', '5.7'].map((a) => ({ name: a, value: a })),
      },
      {
        label: this.getTipLabel(i18n.t('storage disk capacity'), i18n.t('local ssd')),
        name: ['rdsSettings', 'dbInstanceStorage'],
        type: 'inputNumber',
        itemProps: { step: 5, min: 50, max: 2000, placeholder: '50-2000 GB' },
        rules: [
          {
            required: true,
            message: i18n.t('org:Please fill in the storage disk capacity'),
          },
        ],
      },
      {
        label: i18n.t('account name'),
        name: ['rdsSettings', 'accountName'],
        rules: [
          {
            validator: checkRdsAccountName,
          },
        ],
      },
      {
        label: i18n.t('org:database name'),
        name: ['rdsSettings', 'dbName'],
        itemProps: { maxLength: 16 },
        rules: [
          {
            validator: checkForbiddenWord,
          },
        ],
      },
      {
        label: i18n.t('password'),
        name: ['rdsSettings', 'Password'],
        required: false,
        itemProps: {
          placeholder: i18n.t('org:6 to 32 digits, consisting of letters, numbers and underscores'),
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
            message: i18n.t('org:6 to 32 digits, consisting of letters, numbers and underscores'),
          },
        ],
        initialValue: '',
      },
      {
        label: i18n.t('org:database encoding'),
        name: ['rdsSettings.parameters', 'character_set_server'],
        type: 'radioGroup',
        options: ['utf8', 'gbk', 'latin1', 'utf8mb4'].map((a) => ({ name: a, value: a })),
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

    const formList = [
      {
        label: i18n.t('cluster name'),
        name: 'clusterName',
        initialValue: this.props.params.clusterName,
        getComp: () => <span>{this.props.params.clusterName}</span>,
      },
      ...this.getVpcConfig(),
      {
        label: 'accessKeyId',
        name: 'accessKeyId',
        itemProps: {
          onBlur: () => this.trigger('accessKeyId'),
        },
      },
      {
        label: 'accessKeySecret',
        name: 'accessKeySecret',
        itemProps: {
          onBlur: () => this.trigger('accessKeySecret'),
        },
      },
      ...this.getRegionConfig(),
      ...this.getEcsFields(),
      ...this.getLBFields(),
      ...this.getNatConfig(),
      ...this.getNasConfig(),
      ...this.getRedisFields(),
      ...this.getRdsFields(),
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

    const steps = [
      {
        title: i18n.t('choose'),
        content: <RenderPureForm list={formList} formItemLayout={formItemLayout} {...this.props} />,
      },
      {
        title: i18n.t('ok'),
        content: (
          <div className={`confirm-block ${step === 0 ? 'hidden' : ''}`}>
            <KeyValueList data={this.confirmData} />
            <div className="op-row">
              <Button type="primary" onClick={this.handleSubmit}>
                {i18n.t('ok')}
              </Button>
              <Button className="ml-3" onClick={() => this.changeStep(0)}>
                {i18n.t('return modification')}
              </Button>
            </div>
          </div>
        ),
      },
    ];

    return (
      <Form ref={this.formRef} className="purchase-cluster">
        <Steps className="step-wrap" current={step}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[step].content}</div>
      </Form>
    );
  }
}

const Mapper = () => {
  const [availableRegions, availableZones] = purchaseStore.useStore((s) => [s.availableRegions, s.availableZones]);
  const [isFetchingRegions, isFetchingZones] = useLoading(purchaseStore, ['getAvailableRegions', 'getAvailableZones']);
  const { addPhysicalCluster, getAvailableRegions, getAvailableZones, checkEcsAvailable } = purchaseStore.effects;
  const params = routeInfoStore.useStore((s) => s.params);
  return {
    availableRegions,
    availableZones,
    isFetchingRegions,
    isFetchingZones,
    addPhysicalCluster,
    getAvailableRegions,
    getAvailableZones,
    checkEcsAvailable,
    params,
  };
};

export default connectCube(OrderPage, Mapper);
