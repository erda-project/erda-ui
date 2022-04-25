import React from 'react';
import { InputNumber } from 'antd';
import { Form } from '@erda-ui/components';

const { createForm, onFieldValueChange, isField } = Form;

const CustomComp = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  console.log('render child');
  return <InputNumber value={value} onChange={onChange} />;
};

const form = createForm({
  effects: () => {
    onFieldValueChange('*(!sum)', () => {
      const sumResult = form.query('*(!sum)').reduce((sum, _field) => {
        if (isField(_field)) {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          return sum + (_field.value || 0);
        }
        return sum;
      }, 0);
      form.setFieldState('sum', (state) => {
        state.value = sumResult;
      });
    });
  },
});

const list = new Array(300)
  .toString()
  .split(',')
  .map((_item, index) => index);

export default () => {
  const fieldsConfig = list.map((i) => ({
    title: `字段${i}`,
    component: CustomComp,
    name: `field${i}`,
  }));
  fieldsConfig.unshift({
    title: '总和',
    component: InputNumber,
    name: 'sum',
    // @ts-ignore no fix
    customProps: {
      disabled: true,
    },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#eee',
        padding: '40px 0',
        height: '300px',
        overflow: 'auto',
      }}
    >
      <Form style={{ width: '70%' }} form={form} fieldsConfig={fieldsConfig} />
    </div>
  );
};
