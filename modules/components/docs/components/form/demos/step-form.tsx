import React from 'react';
import { Button, Input } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, createStepField, FormProvider, createFormStep, FormConsumer } = Form;

const form = createForm();
const formStep = createFormStep();

export default () => {
  const [data, setData] = React.useState('');

  const fieldConfig = createStepField(
    [
      {
        stepName: 'first',
        layoutConfig: { layout: 'vertical' },
        fields: [
          {
            component: Input,
            title: '姓名',
            name: 'username',
            customProps: {
              placeholder: '请输入姓名',
            },
            required: true,
          },
        ],
        customProps: {
          title: '第一步',
        },
      },
      {
        stepName: 'second',
        layoutConfig: { layout: 'horizontal' },
        fields: [
          {
            component: Input,
            title: '年龄',
            name: 'age',
            customProps: {
              placeholder: '请输入年龄',
            },
          },
        ],
        customProps: {
          title: '第二步',
        },
      },
      {
        stepName: 'third',
        gridConfig: { minColumns: 2 },
        fields: [
          {
            component: Input,
            title: '性别',
            name: 'sex',
            customProps: {
              placeholder: '请输入性别',
            },
          },
          {
            component: Input,
            title: '学历',
            name: 'education',
            customProps: {
              placeholder: '请输入学历',
            },
          },
        ],
        customProps: {
          title: '第三步',
        },
      },
    ],
    {
      formStep,
      name: 'formSteps',
    },
  );

  const getValue = () => {
    const state = form.getState();
    setData(JSON.stringify(state.values, null, 2));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#eee',
        padding: '40px 0',
      }}
    >
      <FormProvider form={form}>
        <Form style={{ width: '80%' }} form={form} fieldsConfig={[fieldConfig]} />
        <FormConsumer>
          {() => {
            return (
              <div>
                {formStep?.allowBack && (
                  <Button
                    onClick={() => {
                      formStep.back();
                    }}
                  >
                    上一步
                  </Button>
                )}
                {formStep?.allowNext && (
                  <Button
                    onClick={() => {
                      formStep.next();
                    }}
                  >
                    下一步
                  </Button>
                )}
                {!formStep?.allowNext && (
                  <Button
                    onClick={() => {
                      getValue();
                    }}
                  >
                    提交
                  </Button>
                )}
              </div>
            );
          }}
        </FormConsumer>
      </FormProvider>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
