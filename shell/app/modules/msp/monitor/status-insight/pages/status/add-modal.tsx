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

import React from 'react';
import { omitBy, map } from 'lodash';
import { FormModal, KeyValueEditor, useUpdate } from 'common';
import { regRules, qs } from 'common/utils';
import monitorStatusStore from 'status-insight/stores/status';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import constants from './constants';
import './add-modal.scss';
import { Input, Select, Radio, Tabs, Form, Tooltip, Button } from 'core/nusi';
import { FormInstance } from 'core/common/interface';
import {
  Down as IconDown,
  Up as IconUp,
  AddOne as IconAddOne,
  ReduceOne as IconReduceOne,
  Help as IconHelp,
} from '@icon-park/react';

const ruleOfJson = {
  validator: async (_, value: string) => {
    try {
      JSON.parse(value);
    } catch {
      throw new Error(i18n.t('msp:please enter the correct JSON format'));
    }
  },
};

const { Option } = Select;
const { Item: FormItem } = Form;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { HTTP_METHOD_LIST, TIMELIMITS, RETRYLIMITS, MAX_BODY_LENGTH } = constants;
// const transToRegList = (regs: any) => regs.map((item: any) => ({ name: uniqueId('reg_'), reg: item }));

interface IProps {
  formData: any;
  modalVisible: boolean;
  afterSubmit: (args?: any) => Promise<any>;
  toggleModal: (args?: any) => void;
}
interface ITrigger {
  key: string;
  operate: string;
  value: number | string;
}
interface IState {
  showMore: boolean;
  retry: number;
  frequency: number;
  apiMethod: string;
  body: string;
  headers: string;
  url: string;
  query: object;
  condition: ITrigger[];
}

const AddModal = (props: IProps) => {
  const { formData, modalVisible, afterSubmit, toggleModal } = props;
  const { env, projectId } = routeInfoStore.useStore((s) => s.params);
  const { saveService, updateMetric } = monitorStatusStore.effects;
  const [form] = Form.useForm();
  const formRef = React.useRef<FormInstance>(null);
  const [{ showMore, retry, frequency, apiMethod, body, headers, url, query, condition }, updater, update] =
    useUpdate<IState>({
      showMore: false,
      retry: RETRYLIMITS[0],
      frequency: TIMELIMITS[0],
      apiMethod: HTTP_METHOD_LIST[0],
      body: '',
      headers: '',
      url: '',
      query: {},
      condition: [
        {
          key: 'http_code',
          operate: '>=',
          value: 400,
        },
      ],
    });

  React.useEffect(() => {
    if (!modalVisible) {
      update({
        condition: [
          {
            key: 'http_code',
            operate: '>=',
            value: 400,
          },
        ],
        showMore: false,
        query: {},
      });
    }
  }, [modalVisible]);

  const deleteItem = (index: number) => {
    condition.splice(index, 1);
    const newData = [...condition];
    update({
      condition: newData,
    });
  };

  const addItem = () => {
    condition.push({
      key: 'http_code',
      operate: '=',
      value: 'abc',
    });
    const newData = [...condition];
    update({
      condition: newData,
    });
  };

  const setInputValue = (index: number, value: number | string) => {
    if (condition[index]) {
      condition[index].value = value;
    }
    update({
      condition: [...condition],
    });
  };

  const setOperate = (index: number, operate: string) => {
    if (condition[index]) {
      condition[index].operate = operate;
    }
    update({
      condition: [...condition],
    });
  };

  const setKey = (index: number, key: string) => {
    if (condition[index]) {
      condition[index].key = key;
    }
    update({
      condition: [...condition],
    });
  };

  const setUrlParm = (queryConfig: { [key: string]: string }) => {
    formRef?.current?.setFieldsValue({ url: `${url.split('?')[0]}?${qs.stringify(queryConfig)}` });
    update({
      url: `${url.split('?')[0]}?${qs.stringify(queryConfig)}`,
    });
  };

  const formatBody = () => {
    if (body) {
      const jsonObj = JSON.parse(body);
      update({
        body: JSON.stringify(jsonObj, null, 4),
      });
      formRef.current?.setFieldsValue({ body: JSON.stringify(jsonObj, null, 4) });
    }
  };

  const handleSubmit = (_data: MONITOR_STATUS.IMetricsBody) => {
    const { ...rest } = _data;
    const others = omitBy(rest, (v, k) => k.startsWith('reg_')) as any;
    if (rest.id) {
      updateMetric({
        ...others,
        projectId,
        config: {
          retry,
          interval: frequency,
          headers,
          body,
          method: apiMethod,
          triggering: condition,
        },
      }).then(afterSubmit);
    } else {
      saveService({
        ...others,
        projectId,
        config: {
          retry,
          interval: frequency,
          headers,
          url,
          body,
          method: apiMethod,
          triggering: condition,
        },
      }).then(() => {
        afterSubmit();
      });
    }
    toggleModal();
  };

  let data = formData;
  if (formData) {
    // number 的 accountId 会被直接展示在 select 上，而不是去匹配相应的 name
    const { accountId } = formData;
    data = {
      ...formData,
      accountId: accountId ? accountId.toString() : null,
    };
  }

  const fieldsList = [
    {
      name: 'id',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      name: 'env',
      initialValue: env,
      itemProps: {
        type: 'hidden',
      },
    },
    {
      label: i18n.t('msp:checking method'),
      name: 'mode',
      type: 'radioGroup',
      options: [
        {
          value: 'http',
          name: 'http',
        },
      ],
      initialValue: 'http',
    },
    {
      label: i18n.t('msp:name'),
      name: 'name',
    },
    {
      label: 'URL',
      name: 'url',
      rules: [{ ...regRules.http }],
      getComp: () => {
        return (
          <Input
            onChange={(e) => {
              update({
                url: e.target.value,
              });
            }}
            onBlur={(e) => {
              update({
                query: qs.parseUrl(e.target.value).query,
              });
            }}
            addonBefore={
              <Select
                value={apiMethod}
                onChange={(value: string) => {
                  update({
                    apiMethod: value,
                  });
                }}
                style={{ width: 110 }}
              >
                {map(HTTP_METHOD_LIST, (method) => (
                  <Option value={method} key={method}>
                    {method}
                  </Option>
                ))}
              </Select>
            }
            className="url"
            placeholder={i18n.t('project:please enter')}
          />
        );
      },
    },
    {
      getComp: () => {
        return (
          <div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Params" key="1">
                <div>
                  <KeyValueEditor
                    isNeedTextArea={false}
                    tableProps={{
                      size: 'default',
                    }}
                    dataSource={query}
                    form={form}
                    onChange={(params) => {
                      setUrlParm(params);
                    }}
                  />
                </div>
              </TabPane>
              <TabPane tab="Headers" key="2">
                <div>
                  <KeyValueEditor
                    isNeedTextArea={false}
                    tableProps={{
                      size: 'default',
                    }}
                    onChange={(headers: any) => {
                      update({
                        headers,
                      });
                    }}
                    form={form}
                  />
                </div>
              </TabPane>
              <TabPane tab="Body" key="3">
                <Button className="mb-4" size="small" type="primary" onClick={formatBody}>
                  Beautify
                </Button>
                <FormItem name="body" rules={[ruleOfJson]}>
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    maxLength={MAX_BODY_LENGTH}
                    placeholder={
                      i18n.t('msp|please enter body, length limit:', { nsSeparator: '|' }) + MAX_BODY_LENGTH.toString()
                    }
                    onChange={(e) => {
                      update({
                        body: e.target.value,
                      });
                    }}
                  />
                </FormItem>
              </TabPane>
            </Tabs>
          </div>
        );
      },
    },
    {
      getComp: () => {
        return (
          <div>
            <a
              onClick={() => {
                update({ showMore: !showMore });
              }}
            >
              {i18n.t('advanced settings')}
              {showMore ? <IconUp size="16px" /> : <IconDown size="16px" />}
            </a>
            <div className={`p-4 mt-2 h-full bg-grey ${showMore ? '' : 'hidden'}`}>
              <div className="flex">
                <h4 className="mb-2">{i18n.t('msp:anomaly check')}</h4>
                <Tooltip title={i18n.t('msp:exception check prompt')}>
                  <IconHelp className="ml-1" />
                </Tooltip>
              </div>
              <div>
                {condition.length > 0
                  ? map(condition, (item, index) => (
                      <div className="flex items-center mb-2">
                        <Select
                          value={item?.key}
                          onChange={(v) => setKey(index, v)}
                          style={{ width: 110 }}
                          className="mr-2"
                        >
                          <Option value="http_code">{i18n.t('org:state code')}</Option>
                          <Option value="body">{i18n.t('request body')}</Option>
                        </Select>
                        <Select
                          onChange={(v) => setOperate(index, v)}
                          style={{ width: 150 }}
                          value={item?.operate}
                          className="api-test-select mr-2"
                          placeholder={i18n.t('project:compare')}
                        >
                          <Option value=">">{i18n.t('project:more than the')}</Option>
                          <Option value=">=">{i18n.t('project:greater than or equal to')}</Option>
                          <Option value="=">{i18n.t('project:equal to')}</Option>
                          <Option value="<=">{i18n.t('project:less than or equal to')}</Option>
                          <Option value="<">{i18n.t('project:less than')}</Option>
                          <Option value="contains">{i18n.t('project:contains')}</Option>
                        </Select>
                        <Input value={item?.value} onChange={(e) => setInputValue(index, e.target.value)} />
                        <IconReduceOne className="ml-2" size="16" onClick={() => deleteItem(index)} />
                      </div>
                    ))
                  : null}
              </div>

              <IconAddOne className="mt-4" size="16" onClick={addItem} />
              <h4 className="mt-4 mb-3 text-sm">{i18n.t('msp:number of retries')}</h4>
              <Radio.Group
                onChange={(e) => {
                  update({
                    retry: e.target.value,
                  });
                }}
                value={retry}
                name="retryRadioGroup"
                defaultValue={RETRYLIMITS[0]}
              >
                {map(RETRYLIMITS, (retryItem: number) => (
                  <Radio className="pr-10" value={retryItem} key={retryItem}>
                    {retryItem}
                  </Radio>
                ))}
              </Radio.Group>
              <h4 className="mt-5 mb-3 text-sm">{i18n.t('msp:monitoring frequency')}</h4>
              <Radio.Group
                onChange={(e) => {
                  update({
                    frequency: e.target.value,
                  });
                }}
                value={frequency}
                name="timeRadioGroup"
                defaultValue={TIMELIMITS[0]}
              >
                {map(TIMELIMITS, (time: number) => (
                  <Radio className="pr-10" value={time} key={time}>
                    {time}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <FormModal
      ref={formRef}
      className="h-4/5"
      width={620}
      title={i18n.t('msp:add monitoring')}
      fieldsList={fieldsList}
      visible={modalVisible}
      formData={data}
      onOk={handleSubmit}
      onCancel={toggleModal}
      modalProps={{
        destroyOnClose: true,
      }}
    />
  );
};

export default AddModal;
