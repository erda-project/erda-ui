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
import { RenderPureForm, useUpdate, FormModal } from 'common';
import { goTo, insertWhen, updateSearch } from 'common/utils';
import i18n from 'i18n';
import { map, isString, isEmpty, remove, set, filter } from 'lodash';
import { Button, Checkbox, Steps, Table, Form, Input, Spin } from 'app/nusi';
import * as React from 'react';
import { useEffectOnce } from 'react-use';
import { ACL_TYPE_MAP, AUTH_TYPE_MAP, getOpenApiConsumerFields, SCENE_MAP, AuthType } from '../config';
import { ApiLimits } from './api-limits';
import './api-package-create.scss';
import routeInfoStore from 'common/stores/route';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';
import { PAGINATION } from 'app/constants';
import { ReduceOne as IconReduceOne, AddOne as IconAddOne } from '@icon-park/react';

const FormItem = Form.Item;
const { Step } = Steps;

const BindDomainForm = (props: any) => {
  const { form, bindDomain } = props;
  const [value, setValue] = React.useState([] as Array<string | undefined>);

  React.useEffect(() => {
    const curVal = isString(bindDomain) ? [bindDomain] : isEmpty(bindDomain) ? [undefined] : bindDomain;
    setValue(curVal);
  }, [bindDomain]);

  const setFieldsValue = (valList: any[]) => {
    const reData = {};
    map(valList, (item, idx) => {
      reData[`bindDomain_${idx}`] = item;
    });
    form.setFieldsValue({ ...reData });
  };

  const addOne = () => {
    const lastItem = value[value.length - 1];
    if (!isEmpty(lastItem)) {
      setFieldsValue([...value, undefined]);
      setValue([...value, undefined]);
    }
  };

  const dropOne = (index: number) => {
    const valArr = [...value];
    remove(valArr, (_v, idx) => idx === index);
    setFieldsValue(valArr);
    setValue(valArr);
  };

  const changeItemValue = (val: string, index: number) => {
    const valArr = [...value];
    set(valArr, `[${index}]`, val);
    setFieldsValue(valArr);
    setValue(valArr);
  };

  return (
    <div className="full-width">
      {map(value, (_item: any, index: number) => {
        return (
          <FormItem className="full-width bind-domain-item" key={`${index}`}>
            {form.getFieldDecorator(`bindDomain_${index}`, {
              initialValue: value[index],
              rules: [
                {
                  required: true,
                  pattern: /^([a-z]|\d|-|\*)+(\.([a-z]|\d|-|\*)+)+$/,
                  message: i18n.t('microService:lowercase letters, numbers, dot, -, *'),
                },
              ],
            })(<Input className="bind-domain-input" onChange={(e: any) => changeItemValue(e.target.value, index)} />)}
            <div className="bind-domain-icons">
              <IconAddOne className="input-with-icon pointer mr0" onClick={() => addOne()} />
              {index !== 0 ? (
                <IconReduceOne
                  className="input-with-icon pointer mr0"
                  onClick={() => {
                    dropOne(index);
                  }}
                />
              ) : null}
            </div>
          </FormItem>
        );
      })}
    </div>
  );
};

export const PureApiPackage = () => {
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [apiPackageDetail, consumerAuthorizes, aliCloudDomian] = gatewayStore.useStore((s) => [
    s.apiPackageDetail,
    s.consumerAuthorizes,
    s.aliCloudDomian,
  ]);
  const {
    getApiPackageDetail,
    createOpenApiConsumer,
    getConsumerAuthorizes,
    updateConsumerAuthorizes,
    createApiPackage,
    updateApiPackage,
    getAliCloudDomain,
    getCloudApiInfo,
    bindAliCloudDomain,
  } = gatewayStore.effects;
  const { clearApiPackageDetail } = gatewayStore.reducers;
  const [isFetching, isGenAliuAuth, isUpdateApi, isCreateApi, isCreateConsumer] = useLoading(gatewayStore, [
    'getApiPackageDetail',
    'generateAliCloudCredentialsAfterCreate',
    'updateApiPackage',
    'createApiPackage',
    'createOpenApiConsumer',
  ]);
  const [state, updater] = useUpdate({
    currentStep: +query.step || 0,
    basicForm: {
      scene: 'openapi',
      aclType: 'on',
      needBindCloudapi: false,
    },
    consumerFormVisible: false,
    consumerMap: {},
    consumerPaging: {
      current: 1,
      pageSize: PAGINATION.pageSize,
    },
  });

  const editMode = !!params.packageId;

  const addStep = (step: number) => {
    const nextStep = state.currentStep + step;
    updater.currentStep(nextStep);
    updateSearch({ step: nextStep });
  };

  useEffectOnce(() => {
    getCloudApiInfo();
    if (params.packageId) {
      getApiPackageDetail();
      getAliCloudDomain();
      getConsumerAuthorizes({ packageId: params.packageId });
    }
    return () => {
      clearApiPackageDetail();
    };
  });

  React.useEffect(() => {
    const checkedMap = {};
    map(consumerAuthorizes, (item) => {
      checkedMap[item.id] = item;
    });
    updater.consumerMap(checkedMap);
  }, [consumerAuthorizes]);

  React.useEffect(() => {
    if (apiPackageDetail.id) {
      updater.basicForm(apiPackageDetail);
      // 如果url上是第三步，但数据更新后没有第三步时，跳到第一步
      if (state.basicForm.aclType === 'off' && +query.step === 2) {
        updater.currentStep(0);
        updateSearch({ step: 0 });
      }
    }
  }, [apiPackageDetail]);

  const basicFormRef = React.useRef(null);

  const Step1 = (formProps: any) => {
    let authTypes = Object.entries(AUTH_TYPE_MAP);
    if (!state.basicForm.needBindCloudapi) {
      authTypes = authTypes.filter(([key]) => key !== AuthType.aliCloudApp);
    }
    const fieldsList: any[] = [
      {
        name: 'id',
        required: false,
        initialValue: state.basicForm.id,
        itemProps: { type: 'hidden' },
      },
      {
        label: i18n.t('microService:scene'),
        name: 'scene',
        type: 'select',
        initialValue: state.basicForm.scene,
        itemProps: {
          disabled: editMode,
        },
        options: filter(Object.entries(SCENE_MAP), (item) => item[0] !== 'unity').map(([key, value]) => ({
          value: key,
          name: value,
        })),
      },
      {
        label: i18n.t('microService:name'),
        name: 'name',
        initialValue: state.basicForm.name,
        rules: [
          {
            pattern: /^[A-Za-z0-9]+([-/_.][0-9a-zA-Z]+)*$/,
            message: i18n.t(
              'microService:Please enter a name consisting of letters, numbers, underscores, hyphens, slashes and dots within 50 characters.',
            ),
          },
        ],
        itemProps: {
          disabled: editMode,
          maxLength: 50,
        },
      },
      {
        label: <span className="label-with-required">{i18n.t('microService:binding domain')}</span>,
        getComp: ({ form }: any) => {
          return <BindDomainForm bindDomain={state.basicForm.bindDomain} form={form} />;
        },
      },
      {
        label: i18n.t('microService:description'),
        initialValue: state.basicForm.description,
        name: 'description',
        rules: [{ max: 100, message: i18n.t('microService:please enter a description within 100 characters') }],
      },
      ...insertWhen(aliCloudDomian.cloudapiExists, [
        {
          label: i18n.t('microService:whether to bind Alibaba Cloud API gateway'),
          type: 'switch',
          name: 'needBindCloudapi',
          initialValue: state.basicForm.needBindCloudapi,
          itemProps: {
            disabled: editMode && apiPackageDetail.needBindCloudapi,
          },
        },
      ]),
    ];

    if (state.basicForm.scene === 'openapi') {
      fieldsList.push(
        ...[
          {
            label: i18n.t('microService:consumer authentication method'),
            type: 'select',
            name: 'authType',
            initialValue: state.basicForm.authType,
            options: authTypes.map(([key, value]) => ({ value: key, name: value })),
          },
          {
            label: i18n.t('microService:consumer access condition'),
            type: 'radioGroup',
            name: 'aclType',
            initialValue: state.basicForm.aclType || 'on',
            options: Object.entries(ACL_TYPE_MAP).map(([key, value]) => ({ value: key, name: value })),
            itemProps: { disabled: state.basicForm.authType === AuthType.aliCloudApp },
          },
        ],
      );
    }
    if (editMode && apiPackageDetail.needBindCloudapi) {
      fieldsList.push({
        label: i18n.t('microService:Alibaba Cloud API gateway domain'),
        getComp: () => {
          if (aliCloudDomian.domain) {
            return <p>{aliCloudDomian.domain}</p>;
          } else {
            return <p>{i18n.t('microService:binding')}</p>;
          }
        },
      });
    }

    return <RenderPureForm {...formProps} ref={basicFormRef} list={fieldsList} />;
  };

  const Step2 = () => {
    const columns = [
      {
        title: i18n.t('microService:allow access'),
        dataIndex: 'selected',
        width: 120,
        render: (_val: boolean, record: any) => (
          <Checkbox
            checked={state.consumerMap[record.id] && state.consumerMap[record.id].selected}
            onChange={(e) =>
              updater.consumerMap((prev: any) => {
                return { ...prev, [record.id]: { ...record, selected: e.target.checked } };
              })
            }
          />
        ),
      },
      {
        title: i18n.t('microService:consumer name'),
        dataIndex: 'name',
        width: 300,
      },
      {
        title: i18n.t('microService:consumer description'),
        dataIndex: 'description',
      },
    ];

    const onSubmitForm = (data: any) => {
      createOpenApiConsumer(data).then(async (res) => {
        if (apiPackageDetail.needBindCloudapi) {
          await gatewayStore.effects.generateAliCloudCredentialsAfterCreate({ consumerId: res });
        }
        getConsumerAuthorizes({ packageId: params.packageId });
      });
      updater.consumerFormVisible(false);
    };

    return (
      <>
        <Button type="primary" className="mb16" onClick={() => updater.consumerFormVisible(true)}>
          创建调用方
        </Button>
        <FormModal
          width="600px"
          name={i18n.t('microService:consumer')}
          fieldsList={getOpenApiConsumerFields(false)}
          visible={state.consumerFormVisible}
          onOk={onSubmitForm}
          onCancel={() => updater.consumerFormVisible(false)}
        />
        <Table
          rowKey="id"
          dataSource={consumerAuthorizes}
          columns={columns}
          pagination={{ ...state.consumerPaging }}
          onChange={(pag) => updater.consumerPaging(pag)}
        />
      </>
    );
  };

  const Form1 = React.useMemo(
    () =>
      Form.create({
        onValuesChange: (_, changedValues) => {
          updater.basicForm((prev: any) => {
            const newData = changeBindDomain({ ...prev, ...changedValues });
            return { ...newData };
          });
          if (changedValues.authType === AuthType.aliCloudApp) {
            (basicFormRef.current as any).props.form.setFieldsValue({ aclType: 'on' });
          }
          if (changedValues.needBindCloudapi === false && state.basicForm.authType === AuthType.aliCloudApp) {
            (basicFormRef.current as any).props.form.setFieldsValue({ authType: undefined });
          }
        },
      })(Step1),
    [
      apiPackageDetail,
      state.basicForm.scene,
      state.basicForm.aclType,
      state.basicForm.authType,
      state.basicForm.needBindCloudapi,
      aliCloudDomian,
    ],
  );

  const StepContents = [Form1, ...insertWhen(state.basicForm.aclType === 'on', [Step2]), ApiLimits];

  const StepContent = StepContents[state.currentStep] || (() => null);

  const noop = () => {};
  const saveForm1 = (cbs: any[]) => {
    const [cb1, cb2] = cbs || [noop, noop];
    if (basicFormRef.current) {
      (basicFormRef.current as any).props.form.validateFields((err: any, values: object) => {
        if (err) return;
        const newData = changeBindDomain(values) as GATEWAY.UpdataApiPackage;
        if (params.packageId) {
          updateApiPackage(newData).then((res) => {
            if (!apiPackageDetail.needBindCloudapi && newData.needBindCloudapi) {
              bindAliCloudDomain({ packageId: params.packageId });
            }
            // @ts-ignore
            if ((newData.authType === AuthType.aliCloudApp) !== (apiPackageDetail.authType === AuthType.aliCloudApp)) {
              getConsumerAuthorizes({ packageId: params.packageId });
            }
            cb1(res);
          });
        } else {
          // 保存基本信息后已经有记录了，跳到编辑页面
          createApiPackage(newData).then(cb2);
        }
      });
    }
  };

  const changeBindDomain = (obj: any) => {
    const newData = {};
    const domains = [] as string[];
    map(obj, (item, key) => {
      if (key.includes('bindDomain_')) {
        const [, idx] = key.split('_');
        item && set(domains, `[${idx}]`, item);
      } else {
        set(newData, `${key}`, item);
      }
    });
    if (!isEmpty(domains)) set(newData, 'bindDomain', domains);
    return newData;
  };

  const handleNextStep = () => {
    switch (state.currentStep) {
      case 0:
        saveForm1([
          () => addStep(1),
          (res: any) => {
            if (res.id) {
              goTo(`../${res.id}/edit?step=${state.currentStep + 1}`);
            }
          },
        ]);
        break;
      case 1: {
        const checkedKeys: string[] = [];
        const newList: any[] = [];
        map(state.consumerMap, (item, k) => {
          if (item.selected === true) {
            checkedKeys.push(k);
          }
          newList.push(item);
        });
        updateConsumerAuthorizes({ packageId: params.packageId, newList, data: { consumers: checkedKeys } });
        addStep(1);
        break;
      }
      default:
        addStep(1);
        break;
    }
  };

  const cancelBtn = (
    <Button key="cancel" onClick={() => goTo(editMode ? '../../' : '../')}>
      {i18n.t('microService:cancel')}
    </Button>
  );
  const prevBtn = (
    <Button key="prev" onClick={() => addStep(-1)}>
      {i18n.t('microService:prev')}
    </Button>
  );
  const nextBtn = (
    <Button key="next" type="primary" onClick={handleNextStep}>
      {i18n.t('microService:next')}
    </Button>
  );
  const completeBtn = (
    <Button key="complete" type="primary" onClick={() => goTo('../../')}>
      {i18n.t('microService:complete')}
    </Button>
  );

  const stepBtn = [
    [cancelBtn, nextBtn],
    ...insertWhen(state.basicForm.aclType === 'on', [[cancelBtn, prevBtn, nextBtn]]),
    [prevBtn, completeBtn],
  ][state.currentStep];

  // 场景为webapi时，只有第一步，保存和取消动作不同
  if (state.basicForm.scene === 'webapi') {
    return (
      <div className="endpoint-create">
        <Spin spinning={isFetching}>
          <div className="endpoint-create-body">
            <StepContent />
          </div>
          <div className="endpoint-create-footer">
            {cancelBtn}
            <Button type="primary" onClick={() => saveForm1([() => goTo('../../'), () => goTo('../')])}>
              {i18n.t('ok')}
            </Button>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="endpoint-create">
      <Spin spinning={isFetching || isCreateApi || isUpdateApi || isGenAliuAuth || isCreateConsumer}>
        <Steps type="navigation" current={state.currentStep}>
          <Step title={i18n.t('microService:basic information')} />
          {state.basicForm.aclType !== 'on' ? null : <Step title={i18n.t('microService:consumer authorization')} />}
          <Step title={i18n.t('microService:traffic control')} />
        </Steps>
        <div className="endpoint-create-body">
          <StepContent />
        </div>
        <div className="endpoint-create-footer">{stepBtn}</div>
      </Spin>
    </div>
  );
};

export default PureApiPackage;
