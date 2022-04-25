import React from 'react';
import { FormModal, Form } from '@erda-ui/components';
import { Button, Input } from 'antd';

const { createForm, createFields } = Form;

const form = createForm();

export default () => {
  const [visible, setVisible] = React.useState(false);

  const formFieldsList = createFields([
    {
      component: Input,
      title: '姓名',
      name: 'username',
      customProps: {
        placeholder: '请输入姓名',
      },
    },
    {
      component: Input,
      title: '年龄',
      name: 'age',
      customProps: {
        placeholder: '请输入年龄',
      },
    },
  ]);

  React.useEffect(() => {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          username: '张三',
          age: 29,
        });
      }, 3000);
    }).then((res) => {
      form.setInitialValues(res);
    });
  }, []);

  const onSubmitForm = () => {
    // eslint-disable-next-line no-console
    console.log('value', form.values);
  };

  return (
    <>
      <FormModal
        title="应用"
        visible={visible}
        onOk={onSubmitForm}
        isEditing
        onCancel={() => setVisible(false)}
        formProps={{
          form,
          fieldsConfig: formFieldsList,
        }}
      />
      <Button onClick={() => setVisible(true)}>显示</Button>
    </>
  );
};
