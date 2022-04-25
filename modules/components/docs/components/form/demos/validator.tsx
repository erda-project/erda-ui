import React from 'react';
import { Input, InputNumber, Button } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, registerValidateRules, onFieldValueChange, createFields } = Form;

const form = createForm({
  effects: () => {
    onFieldValueChange('linkA', (field) => {
      const fieldB = field.query('linkB').value();
      if (field.value < fieldB) {
        field.selfErrors = ['A必须大于B'];
      } else {
        field.selfErrors = [''];
        form.setFieldState('linkB', (state) => {
          state.selfErrors = [''];
        });
      }
    });
    onFieldValueChange('linkB', (field) => {
      const fieldA = field.query('linkA').value();
      if (field.value >= fieldA) {
        field.selfErrors = ['A必须大于B'];
      } else {
        field.selfErrors = [''];
        form.setFieldState('linkA', (state) => {
          state.selfErrors = [''];
        });
      }
    });
  },
});

registerValidateRules({
  customRule: (value) => {
    if (value && !value.includes('@')) {
      return '请输入包含@的字符串';
    }
    return '';
  },
});

export default () => {
  const [data, setData] = React.useState('');

  const fieldsConfig = createFields([
    {
      component: Input,
      title: '必填',
      name: 'required1',
      required: true,
      customProps: {
        placeholder: '必填',
      },
    },
    {
      component: Input,
      title: '必填2',
      name: 'required2',
      customProps: {
        placeholder: '必填2',
      },
      validator: {
        required: true,
      },
    },
    {
      component: InputNumber,
      title: '最大值',
      name: 'max',
      customProps: {
        placeholder: '>5报错',
      },
      validator: {
        maximum: 5,
      },
    },
    {
      component: InputNumber,
      title: '最大值',
      name: 'max2',
      customProps: {
        placeholder: '>=5报错',
      },
      validator: {
        exclusiveMaximum: 5,
      },
    },
    {
      component: InputNumber,
      title: '最小值',
      name: 'min',
      customProps: {
        placeholder: '<5报错',
      },
      validator: {
        minimum: 5,
      },
    },
    {
      component: InputNumber,
      title: '最小值',
      name: 'min2',
      customProps: {
        placeholder: '<=5报错',
      },
      validator: {
        exclusiveMinimum: 5,
      },
    },
    {
      component: Input,
      title: '最大长度',
      name: 'maxLength',
      customProps: {
        placeholder: '最多五个字符',
      },
      validator: {
        max: 5,
      },
    },
    {
      component: Input,
      title: '最小长度',
      name: 'minLength',
      customProps: {
        placeholder: '最少五个字符',
      },
      validator: {
        min: 5,
      },
    },
    {
      component: Input,
      title: '枚举匹配',
      name: 'enum',
      customProps: {
        placeholder: '只能是abc中任一',
      },
      validator: {
        enum: ['a', 'b', 'c'],
      },
    },
    {
      component: Input,
      title: '自定义报错信息',
      name: 'customMessage',
      customProps: {
        placeholder: '自定义报错信息',
      },
      validator: {
        max: 5,
        message: '这儿最多五个字符~哈哈',
      },
    },
    {
      component: Input,
      title: '多个校验条件',
      name: 'multiple',
      customProps: {
        placeholder: '最少3位最多5位',
      },
      validator: [
        {
          max: 5,
        },
        {
          min: 3,
        },
      ],
    },
    {
      component: Input,
      title: '内置格式校验',
      name: 'format',
      customProps: {
        placeholder: '只能输入email',
      },
      validator: {
        format: 'email',
      },
    },
    {
      component: Input,
      title: '全局自定义校验',
      name: 'custom',
      customProps: {
        placeholder: '必须包含@符号',
      },
      validator: {
        customRule: true,
      },
    },
    {
      component: Input,
      title: '局部自定义校验',
      name: 'custom2',
      customProps: {
        placeholder: '必须包含@符号',
      },
      validator: {
        validator: (value) => {
          if (value && !value.includes('@')) {
            return '请输入包含@的字符串';
          }
          return '';
        },
      },
    },
    {
      component: Input,
      title: '异步校验',
      name: 'async',
      customProps: {
        placeholder: '输入123',
      },
      validator: {
        validator: (value) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(value !== '123' ? '' : '该用户已被注册');
            }, 1000);
          }),
      },
    },
    {
      component: InputNumber,
      title: '联动校验A',
      name: 'linkA',
      customProps: {
        placeholder: 'A必须大于B',
      },
    },
    {
      component: InputNumber,
      title: '联动校验B',
      name: 'linkB',
      defaultValue: 10,
      customProps: {
        placeholder: 'A必须大于B',
      },
    },
    {
      component: Input,
      title: '校验时机(onBlur)',
      name: 'trigger',
      customProps: {
        placeholder: '最大长度5',
      },
      validator: {
        triggerType: 'onBlur',
        max: 5,
      },
      wrapperProps: {
        labelCol: 10,
      },
    },
  ]);

  const submit = async () => {
    const values = await form.submit();
    setData(JSON.stringify(values, null, 2));
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
      <Form style={{ width: '50%' }} form={form} fieldsConfig={fieldsConfig} />
      <Button type="primary" onClick={() => submit()}>
        提交
      </Button>
      <code style={{ marginTop: data ? '24px' : '0' }}>{data}</code>
    </div>
  );
};
