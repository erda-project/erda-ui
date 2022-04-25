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
        title="应用"
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
