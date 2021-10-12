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
import { FormModal, KeyValueEditor } from 'common';
import { regRules, qs } from 'common/utils';
import monitorStatusStore from 'status-insight/stores/status';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import constants from './constants';
import './add-modal.scss';
import { Input, Select, Radio, Tabs, Form, Tooltip } from 'core/nusi';
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
const { HTTP_METHOD_LIST, TIMELIMITS, RETRYLIMITS, MAX_BODY_LENGTH } = constants;
const { banFullWidthPunctuation } = regRules;
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

const AddModal = (props: IProps) => {
  const { formData, modalVisible, afterSubmit, toggleModal } = props;
  const [showMore, setShowMore] = React.useState(false);
  const [retry, setRetry] = React.useState(RETRYLIMITS[0]);
  const [frequency, setFrequency] = React.useState(TIMELIMITS[0]);
  const [apiMethod, setApiMethod] = React.useState(HTTP_METHOD_LIST[0]);
  const [body, setBody] = React.useState('');
  const [headers, setHeaders] = React.useState('');
  const [url, setUrl] = React.useState('');
  const formRef = React.useRef<FormInstance>(null);
  const [query, setQuery] = React.useState({});
  const [condition, setCondition] = React.useState<ITrigger[]>([
    {
      key: 'http_code',
      operate: '>=',
      value: 400,
    },
  ]);
  const { env, projectId } = routeInfoStore.useStore((s) => s.params);
  const { saveService, updateMetric } = monitorStatusStore.effects;
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!modalVisible) {
      setCondition([
        {
          key: 'http_code',
          operate: '>=',
          value: 400,
        },
      ]);
      setShowMore(false);
    }
  }, [modalVisible]);
  const deleteItem = (index: number) => {
    condition.splice(index, 1);
    const newData = [...condition];
    setCondition(newData);
  };
  const addItem = () => {
    condition.push({
      key: 'http_code',
      operate: '=',
      value: 'abc',
    });
    const newData = [...condition];
    setCondition(newData);
  };

  const setInputValue = (index: number, value: number | string) => {
    if (condition[index]) {
      condition[index].value = value;
    }
    setCondition([...condition]);
  };

  const setOperate = (index: number, operate: string) => {
    if (condition[index]) {
      condition[index].operate = operate;
    }
    setCondition([...condition]);
  };

  const setKey = (index: number, key: string) => {
    if (condition[index]) {
      condition[index].key = key;
    }
    setCondition([...condition]);
  };

  const setUrlParm = (queryConfig: { [key: string]: string }) => {
    formRef?.current?.setFieldsValue({ url: `${url.split('?')[0]}?${qs.stringify(queryConfig)}` });
    setUrl(`${url.split('?')[0]}?${qs.stringify(queryConfig)}`);
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
            onChange={(e) => setUrl(e.target.value)}
            onBlur={(e) => {
              // console.log(qs.(e.target.value))
              setQuery(qs.parseUrl(e.target.value).query);
            }}
            addonBefore={
              <Select value={apiMethod} onChange={(value: string) => setApiMethod(value)} style={{ width: 110 }}>
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
      name: 'condition',
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
                    onChange={(header: any) => setHeaders(header)}
                    form={form}
                  />
                </div>
              </TabPane>
              <TabPane tab="Body" key="3">
                <FormItem name="body" rules={[banFullWidthPunctuation]}>
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    maxLength={MAX_BODY_LENGTH}
                    placeholder={
                      i18n.t('msp|please enter body, length limit:', { nsSeparator: '|' }) + MAX_BODY_LENGTH.toString()
                    }
                    onChange={(e) => {
                      setBody(e.target.value);
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
            <a onClick={() => setShowMore(!showMore)}>
              {i18n.t('advanced settings')}
              {showMore ? <IconDown size="16px" /> : <IconUp size="16px" />}
            </a>
            <div className={`p-4 mt-2 h-full hidden-box ${showMore ? '' : 'hidden'}`}>
              <div className="flex">
                <h4 className="mb-2">{i18n.t('msp:triggering conditions')}</h4>
                <Tooltip title={i18n.t('msp:oR relationship between multiple conditions')}>
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
                onChange={(e) => setRetry(e.target.value)}
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
                onChange={(e) => setFrequency(e.target.value)}
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
