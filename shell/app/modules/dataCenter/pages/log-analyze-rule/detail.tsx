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
import routeInfoStore from 'common/stores/route';
import i18n from 'i18n';
import { cloneDeep, isEmpty, map, uniqueId, find, findIndex, fill, filter, get, every } from 'lodash';
import { useMount, useUpdateEffect } from 'react-use';
import { goTo, getLS } from 'common/utils';
import { Button, message, Spin } from 'app/nusi';
import { Form } from 'workBench/pages/form-editor/index';
import { registComponent } from 'app/configForm/form/form';
import { useLoading } from 'app/common/stores/loading';
import FormSelectModel from './form-select-model';
import FormTestButton from './form-test-button';
import FormExtractResultTable from './form-extract-result-table';
import FormTestResultTable from './form-test-result-table';

import LogAnalyzeStore from '../../stores/log-analyze';

export default () => {
  const formRef = React.useRef(null as any);
  const [templates, curRule] = LogAnalyzeStore.useStore((s) => [s.templates, s.curRule]);
  const { getRuleTemplates, getRuleTemplate, getRule, createRule, editRule, testRule, clearCurRule } = LogAnalyzeStore;
  const [testRuleLoading, getRuleLoading, createRuleLoading, editRuleLoading] = useLoading(LogAnalyzeStore, [
    'testRule',
    'getRule',
    'createRule',
    'editRule',
  ]);
  const { params, query } = routeInfoStore.useStore((s) => s);
  const [processors, setProcessors] = React.useState<LOG_ANALYZE.Processor[]>([]);
  const isEditRule = !!params.ruleId;
  const pageSource = query.source;

  useMount(() => {
    isEditRule && getRule(params.ruleId);
    if (pageSource === 'log-query') {
      formRef.current.setFieldsValue({
        content: getLS('logRuleContent'),
        filters: getLS('logRuleTags'),
      });
    }
    getRuleTemplates();
  });

  const components = React.useMemo(
    () => [
      {
        name: 'selectModel',
        Component: FormSelectModel,
        templates,
      },
      {
        name: 'extractResultTable',
        Component: FormExtractResultTable,
      },
      {
        name: 'testButton',
        Component: FormTestButton,
        loading: testRuleLoading,
      },
      {
        name: 'testResultTable',
        Component: FormTestResultTable,
      },
    ],
    [templates, testRuleLoading],
  );

  components.forEach((item) => registComponent(item));

  const convertFilters = (filters: Array<{ key: string; value: string }>) => {
    return map(filters, ({ key, value }) => `${key}=${value}`);
  };

  const convertProcessors = (_processors: LOG_ANALYZE.Processor[]): LOG_ANALYZE.Processor[] => {
    const keys = get(_processors[0], 'config.keys');
    const pattern = get(_processors[0], 'config.pattern');

    const ids = pattern.match(/\((.*?)\)/g);
    // 后端给出的 keys 应与正则匹配后的 patten id 一一对应（保证一致性的话应该让后端做 pattern 匹配给出 id）
    const initialCurExtractResult = map(ids, (id, k) => ({
      id,
      uniId: uniqueId(),
      ...keys[k],
    }));

    return [
      {
        ..._processors[0],
        config: {
          keys: initialCurExtractResult,
          pattern,
        },
      },
    ];
  };

  const convertRule = React.useCallback(({ filters, processors: _processors, ...restResult }: LOG_ANALYZE.Template) => {
    formRef.current &&
      formRef.current.setFieldsValue({
        ...restResult,
        filters: convertFilters(filters),
        processors: convertProcessors(_processors),
      });
    setProcessors(convertProcessors(_processors));
  }, []);

  React.useEffect(() => {
    isEditRule && !isEmpty(curRule) && convertRule(curRule);
  }, [convertRule, curRule, isEditRule]);

  // 选择内置模板填充表单
  const selectTemplate = React.useCallback(
    (template: string) => {
      getRuleTemplate(template).then(convertRule);
    },
    [convertRule, getRuleTemplate],
  );

  const initCurExtractResult = React.useCallback((regString: string) => {
    let initialCurExtractResult = [] as any;
    const ids = regString.match(/\((.*?)\)/g);
    if (!isEmpty(ids)) {
      initialCurExtractResult = map(ids, (id) => ({
        id,
        uniId: uniqueId(),
        key: undefined,
        name: undefined,
        type: 'string',
      }));
    }
    formRef.current.setFieldValue('processors[0].config.keys', initialCurExtractResult);
    setProcessors(formRef.current.getData()?.processors || []);
  }, []);

  const returnList = () => {
    goTo('../');
    clearCurRule();
  };

  const editCurExtractResult = React.useCallback(
    (beforeExtractResult, uniId: string, item: { key: string; value: any }) => {
      const results = cloneDeep(beforeExtractResult);
      const result = find(results, { uniId });
      const index = findIndex(results, { uniId });

      fill(results, { uniId, ...result, [item.key]: item.value }, index, index + 1);
      formRef.current.setFieldValue('processors[0].config.keys', results);
      setProcessors(formRef.current.getData()?.processors || []);
    },
    [],
  );

  const handleTestRule = React.useCallback(() => {
    formRef.current
      .validateFields()
      .then((values: any) => {
        const { name, content } = values;
        if (!content) {
          message.warning(i18n.t('org:please enter the log content first'));
          return;
        }
        const keys = get(processors[0], 'config.keys');
        if (!every(keys, (key) => !!key.key)) {
          message.warning(i18n.t('all keys are required'));
          return;
        }
        testRule({
          content,
          name,
          processors,
        }).then((result) => {
          const resultData = map(result, (value, key) => ({
            value,
            key,
            name: (find(keys, { key }) || {}).name || '',
          }));
          formRef.current.setFieldValue('results', resultData);
        });
      })
      .catch(({ errorFields }: { errorFields: any }) => {
        formRef.current.scrollToField(errorFields[0].name);
      });
  }, [testRule, processors]);

  const fields = React.useMemo(
    () => [
      {
        label: i18n.t('org:built-in templates'),
        labelTip: i18n.t('org:built-in templates tip'),
        component: 'selectModel',
        key: 'model',
        componentProps: {
          onChange: selectTemplate,
        },
        type: 'selectModel',
        category: 'extra',
      },
      {
        label: i18n.t('org:indicator name'),
        component: 'input',
        key: 'name',
        componentProps: {
          placeholder: i18n.t('org:please input indicator name'),
          style: { width: 400 },
        },
        required: true,
        rules: [
          {
            max: '50',
            msg: i18n.t('no more than {size} characters', { size: 50 }),
          },
        ],
        type: 'input',
        category: 'basic',
      },
      {
        label: i18n.t('org:log filter'),
        component: 'select',
        componentProps: {
          placeholder: i18n.t('microService:format: Key=Value, press Enter to add'),
          mode: 'tags',
          allowClear: true,
          style: { width: 400 },
        },
        key: 'filters',
        category: 'log',
      },
      {
        label: i18n.t('org:extract method'),
        component: 'select',
        key: 'processors[0].type',
        value: 'regexp',
        componentProps: {
          placeholder: i18n.t('org:please select extract method'),
          style: { width: 400 },
        },
        required: true,
        dataSource: {
          type: 'static',
          static: [
            {
              name: i18n.t('regexp'),
              value: 'regexp',
            },
          ],
        },
        defaultValue: 'regexp',
        type: 'select',
        category: 'extract',
      },
      {
        label: i18n.t('regexp'),
        component: 'textarea',
        key: 'processors[0].config.pattern',
        componentProps: {
          placeholder: i18n.t('please input regexp'),
          style: { width: 400 },
          rows: 4,
          onBlur: (e: any) => initCurExtractResult(e.target.value),
        },
        required: true,
        rules: [
          {
            max: '2000',
            msg: i18n.t('no more than {size} characters', { size: 2000 }),
          },
        ],
        removeWhen: [
          [
            {
              field: 'processors[0].type',
              operator: '!=',
              value: 'regexp',
            },
          ],
        ],
        type: 'textarea',
        category: 'extract',
      },
      {
        label: i18n.t('org:extract result'),
        component: 'extractResultTable',
        key: 'processors[0].config.keys',
        type: 'extractResultTable',
        componentProps: {
          onChange: (value: any, uniId: string, item: { key: string; value: any }) =>
            editCurExtractResult(value, uniId, item),
        },
        category: 'extract',
      },
      {
        label: i18n.t('org:log content'),
        component: 'textarea',
        key: 'content',
        componentProps: {
          placeholder: i18n.t('org:please input log content'),
          style: { width: 400 },
          rows: 4,
        },
        type: 'textarea',
        category: 'test',
      },
      {
        component: 'testButton',
        key: 'test',
        componentProps: {
          onChange: () => handleTestRule(),
        },
        type: 'testButton',
        category: 'test',
      },
      {
        label: i18n.t('org:analysis result'),
        component: 'testResultTable',
        key: 'results',
        type: 'testResultTable',
        category: 'test',
      },
    ],
    [editCurExtractResult, handleTestRule, initCurExtractResult, selectTemplate],
  );

  useUpdateEffect(() => {
    formRef.current && formRef.current.setFields(cloneDeep(fields));
  }, [fields]);

  const onOk = React.useCallback(() => {
    formRef.current
      .validateFields()
      .then((values: any) => {
        const { name, filters } = values;
        const keys = get(processors[0], 'config.keys');
        if (!every(keys, (key) => !!key.key)) {
          message.warning(i18n.t('all keys are required'));
          return;
        }
        const legalFilters = filter(filters, (item) => item.includes('='));
        const payload = {
          name,
          filters: map(legalFilters, (item) => {
            const [key, value] = item.split('=');
            return { key, value };
          }),
          processors,
        };

        if (isEditRule) {
          editRule({
            ...payload,
            id: Number(params.ruleId),
          }).then(returnList);
        } else {
          createRule(payload).then(returnList);
        }
      })
      .catch(({ errorFields }: { errorFields: any }) => {
        formRef.current.scrollToField(errorFields[0].name);
      });
  }, [editRule, createRule, params, processors]);

  return (
    <Form
      fields={fields}
      formRef={formRef}
      formRender={({ RenderFields, form, fields: totalFields }: any) => {
        const methodFields = filter(totalFields, { category: 'extra' });
        const basicFields = filter(totalFields, { category: 'basic' });
        const logFields = filter(totalFields, { category: 'log' });
        const extractFields = filter(totalFields, { category: 'extract' });
        const testFields = filter(totalFields, { category: 'test' });

        return (
          <Spin spinning={getRuleLoading}>
            <RenderFields form={form} fields={methodFields} />
            <div className="bold fz16 mb4">{i18n.t('org:basic info')}</div>
            <RenderFields form={form} fields={basicFields} />
            <div className="bold fz16 mb4">{i18n.t('org:log filter')}</div>
            <RenderFields form={form} fields={logFields} />
            <div className="bold fz16 mb4">{i18n.t('org:indicator extract')}</div>
            <RenderFields form={form} fields={extractFields} />
            <div className="bold fz16 mb4">{i18n.t('org:rule test')}</div>
            <RenderFields form={form} fields={testFields} />
            <div className="action-footer text-right">
              <Button className="mr8" onClick={returnList}>
                {i18n.t('cancel')}
              </Button>
              <Button loading={createRuleLoading || editRuleLoading} type="primary" onClick={onOk}>
                {i18n.t('ok')}
              </Button>
            </div>
          </Spin>
        );
      }}
    />
  );
};
