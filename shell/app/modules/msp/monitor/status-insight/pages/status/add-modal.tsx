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
import { map } from 'lodash';
import { FormModal, useUpdate, KeyValueTable } from 'common';
import { regRules, qs } from 'common/utils';
import monitorStatusStore from 'status-insight/stores/status';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import constants from './constants';
import './add-modal.scss';
import { Input, Select, Radio, Tabs, Form, Tooltip, Button, InputNumber } from 'core/nusi';
import { FormInstance } from 'core/common/interface';
import {
  Down as IconDown,
  Up as IconUp,
  AddOne as IconAddOne,
  ReduceOne as IconReduceOne,
  Help as IconHelp,
} from '@icon-park/react';

const { Option } = Select;
const { Item: FormItem } = Form;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { HTTP_METHOD_LIST, TIME_LIMITS, OPERATORS, RETRY_TIMES, MAX_BODY_LENGTH, CONTAINS } = constants;
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
  headers: Obj;
  url: string;
  query: Obj;
  condition: ITrigger[];
}

const convertFormData = (_formData?: Obj) => {
  if (_formData) {
    return {
      retry: _formData?.config?.retry,
      frequency: _formData?.config?.interval,
      apiMethod: _formData?.config?.method,
      body: JSON.stringify(_formData?.config?.body || {}),
      headers: _formData?.config?.headers,
      url: _formData?.config?.url,
      query: qs.parseUrl(_formData?.config?.url || '')?.query,
      condition: _formData?.config?.triggering,
    };
  } else {
    return {
      condition: [
        {
          key: 'http_code',
          operate: '>=',
          value: 400,
        },
      ],
      showMore: false,
      query: {},
      retry: RETRY_TIMES[0],
      frequency: TIME_LIMITS[0],
      apiMethod: HTTP_METHOD_LIST[0],
      body: JSON.stringify({}),
      headers: {},
      url: '',
    };
  }
};

const ruleOfJson = {
  validator: async (_, value: string) => {
    if (value) {
      try {
        JSON.parse(value);
      } catch {
        throw new Error(i18n.t('msp:please enter the correct JSON format'));
      }
    } else {
      return true;
    }
  },
};

const AddModal = (props: IProps) => {
  const { formData, modalVisible, afterSubmit, toggleModal } = props;
  const { env, projectId } = routeInfoStore.useStore((s) => s.params);
  const { saveService, updateMetric } = monitorStatusStore.effects;
  const [form] = Form.useForm();
  const formRef = React.useRef<FormInstance>(null);
  const [{ showMore, retry, frequency, apiMethod, body, headers, url, query, condition }, updater, update] =
    useUpdate<IState>({
      showMore: false,
      ...convertFormData(formData),
    });

  React.useEffect(() => {
    if (!modalVisible) {
      update(convertFormData());
    } else {
      update(convertFormData(formData));
    }
  }, [modalVisible]);

  const deleteItem = (index: number) => {
    condition.splice(index, 1);
    updater.condition([...condition]);
  };

  const addItem = () => {
    condition.push({
      key: 'http_code',
      operate: '>=',
      value: '',
    });
    updater.condition([...condition]);
  };

  const setInputValue = (index: number, value: number | string) => {
    condition[index].value = value;
    updater.condition([...condition]);
  };

  const setOperator = (index: number, operate: string) => {
    if (condition[index]) {
      condition[index].operate = operate;
    }
    updater.condition([...condition]);
  };

  const setKey = (index: number, key: string) => {
    if (condition[index]) {
      condition[index].key = key;
    }
    updater.condition([...condition]);
  };

  const setUrlParams = (queryConfig: Obj) => {
    if (url) {
      formRef.current?.setFieldsValue({ url: `${url.split('?')[0]}?${qs.stringify(queryConfig)}` });
      updater.url(`${url.split('?')[0]}?${qs.stringify(queryConfig)}`);
    }
  };

  const formatBody = () => {
    if (body) {
      const jsonObj = JSON.parse(body);
      update({
        body: JSON.stringify(jsonObj, null, 2),
      });
      formRef.current?.setFieldsValue({ body: JSON.stringify(jsonObj, null, 2) });
    }
  };

  const handleSubmit = (_data: MONITOR_STATUS.IMetricsBody) => {
    const { mode, name, id } = _data;
    if (id) {
      updateMetric({
        id,
        env,
        mode,
        name,
        projectId,
        config: {
          url,
          retry,
          interval: frequency,
          headers,
          body: JSON.parse(body),
          method: apiMethod,
          triggering: condition,
        },
      }).then(afterSubmit);
    } else {
      saveService({
        id,
        env,
        mode,
        name,
        projectId,
        config: {
          retry,
          interval: frequency,
          headers,
          url,
          body: JSON.parse(body),
          method: apiMethod,
          triggering: condition,
        },
      }).then(() => {
        afterSubmit();
      });
    }
    toggleModal();
  };

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
      itemProps: {
        addonBefore: (
          <Select
            value={apiMethod}
            onChange={(value) => {
              updater.apiMethod(value);
            }}
            style={{ width: 110 }}
          >
            {map(HTTP_METHOD_LIST, (method) => (
              <Option value={method} key={method}>
                {method}
              </Option>
            ))}
          </Select>
        ),
        onChange: (e) => {
          updater.url(e.target.value);
        },
        onBlur: () => {
          updater.query(qs.parseUrl(url).query);
        },
      },
    },
    {
      name: 'settings',
      getComp: () => {
        return (
          <div className="h-full">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Params" key="1">
                <KeyValueTable
                  isTextArea={false}
                  data={query}
                  form={form}
                  onChange={setUrlParams}
                  onDel={setUrlParams}
                />
              </TabPane>
              <TabPane tab="Headers" key="2">
                <KeyValueTable
                  isTextArea={false}
                  onChange={(header: any) => {
                    updater.headers(header);
                  }}
                  onDel={(header: any) => {
                    updater.headers(header);
                  }}
                  data={headers}
                  form={form}
                />
              </TabPane>
              <TabPane tab="Body" key="3">
                <Button className="mb-4" size="small" type="primary" onClick={formatBody}>
                  {i18n.t('format')}
                </Button>
                <FormItem initialValue={body} name="body" rules={[ruleOfJson]}>
                  <TextArea
                    autoSize={{ minRows: 5, maxRows: 12 }}
                    maxLength={MAX_BODY_LENGTH}
                    placeholder={
                      i18n.t('msp|please enter body, length limit:', { nsSeparator: '|' }) + MAX_BODY_LENGTH.toString()
                    }
                    value={body}
                    onChange={(e: any) => {
                      updater.body(e.target.value);
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
      name: 'more',
      getComp: () => {
        return (
          <div>
            <span
              onClick={() => {
                updater.showMore(!showMore);
              }}
            >
              {i18n.t('advanced settings')}
              {showMore ? <IconUp size="16px" /> : <IconDown size="16px" />}
            </span>
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
                          onChange={(v) => {
                            if (v === 'http_code') {
                              condition[index].operate = '>=';
                            } else {
                              condition[index].operate = 'contains';
                            }
                            setKey(index, v);
                          }}
                          style={{ width: 110 }}
                          className="mr-2"
                        >
                          <Option value="http_code">{i18n.t('org:state code')}</Option>
                          <Option value="body">{i18n.t('request body')}</Option>
                        </Select>
                        {item.key === 'http_code' ? (
                          <>
                            <Select
                              onChange={(v) => setOperator(index, v)}
                              style={{ width: 150 }}
                              value={item?.operate}
                              className="mr-2"
                              placeholder={i18n.t('project:compare')}
                            >
                              {map(OPERATORS, (value, key) => (
                                <Option value={key}>{value}</Option>
                              ))}
                            </Select>
                            <InputNumber
                              value={item?.value}
                              className="flex-1"
                              onChange={(v) => setInputValue(index, v)}
                            />
                          </>
                        ) : (
                          <>
                            <Select
                              onChange={(v) => setOperator(index, v)}
                              style={{ width: 150 }}
                              value={item?.operate}
                              className="mr-2"
                              placeholder={i18n.t('project:compare')}
                            >
                              {map(CONTAINS, (val, key) => (
                                <Option value={key}>{val}</Option>
                              ))}
                            </Select>
                            <Input value={item?.value} onChange={(e) => setInputValue(index, e.target.value)} />
                          </>
                        )}
                        <IconReduceOne className="ml-2" size="16" onClick={() => deleteItem(index)} />
                      </div>
                    ))
                  : null}
              </div>

              <IconAddOne className="mt-4" size="16" onClick={addItem} />
              <h4 className="mt-4 mb-3 text-sm">{i18n.t('msp:number of retries')}</h4>
              <Radio.Group
                onChange={(e) => {
                  updater.retry(e.target.value);
                }}
                value={retry}
                name="retryRadioGroup"
                defaultValue={RETRY_TIMES[0]}
              >
                {map(RETRY_TIMES, (retryTime: number) => (
                  <Radio className="pr-10" value={retryTime} key={retryTime}>
                    {retryTime}
                  </Radio>
                ))}
              </Radio.Group>
              <h4 className="mt-5 mb-3 text-sm">{i18n.t('msp:monitoring frequency')}</h4>
              <Radio.Group
                onChange={(e) => {
                  updater.frequency(e.target.value);
                }}
                value={frequency}
                name="timeRadioGroup"
                defaultValue={TIME_LIMITS[0]}
              >
                {map(TIME_LIMITS, (time) => (
                  <Radio className="pr-10" value={time} key={time}>
                    {time < 60 ? `${time}${i18n.t('common:second(s)')}` : `${time / 60}${i18n.t('common:minutes')}`}
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
      formData={formData}
      onOk={handleSubmit}
      onCancel={toggleModal}
      modalProps={{
        destroyOnClose: true,
      }}
    />
  );
};

export default AddModal;
