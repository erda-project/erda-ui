import React from 'react';
import { FormModal, Form } from '@erda-ui/components';
import { Button, Input } from 'antd';

const { createForm, createFields } = Form;

const form = createForm();

const formFieldsList = createFields([
  {
    component: Input,
    title: '姓名',
    name: 'username',
    customProps: {
      placeholder: '请输入姓名',
    },
  },
]);

export default () => {
  const [visible, setVisible] = React.useState(false);

  const onSubmitForm = () => {
    // eslint-disable-next-line no-console
    console.log('value', form.values);
  };

  return (
    <>
      <Button onClick={() => setVisible(true)}>显示</Button>
      <FormModal
        title="新建一个应用"
        exactTitle
        visible={visible}
        onOk={onSubmitForm}
        onCancel={() => setVisible(false)}
        formProps={{
          form,
          fieldsConfig: formFieldsList,
        }}
      />
    </>
  );
};
