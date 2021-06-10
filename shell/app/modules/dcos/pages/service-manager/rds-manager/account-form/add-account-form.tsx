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
import { FormModal, Icon as CustomIcon, useUpdate } from 'common';
import i18n from 'i18n';
import { checkPassword } from 'dcos/common/config';
import { WrappedFormUtils } from 'core/common/interface';

export interface IFormRes {
  account: string;
  accountType: string;
  password: string;
  confirm: string;
  description: string;
}

interface IProps {
  visible: boolean;
  onClose: () => any;
  handleSubmit: (formRes: IFormRes) => void;
  allAccountName: string[];
}

interface FormRef {
  props: { form: WrappedFormUtils };
}

const AddAccountForm = (props: IProps) => {
  const { visible, onClose, handleSubmit, allAccountName } = props;
  const formRef = React.useRef({}) as React.MutableRefObject<FormRef>;

  const [{ passwordVisible, confirmPasswordVisible }, updater] = useUpdate({
    passwordVisible: false,
    confirmPasswordVisible: false,
  });

  const togglePasswordVisible = () => {
    updater.passwordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisible = () => {
    updater.confirmPasswordVisible(!confirmPasswordVisible);
  };

  const compareToFirstPassword = function (rule: any, value: string, callback: Function) {
    if (value && value !== formRef.current.props?.form?.getFieldValue('password')) {
      callback(i18n.t('the two passwords you entered do not match'));
    } else {
      callback();
    }
  };

  const fieldsList = [
    {
      label: `${i18n.t('dcos:database account')}(${i18n.t('ordinary account')})`,
      name: 'account',
      rules: [
        {
          validator: (_: any, value: string, callback: Function) => {
            if (!value) return callback();
            if (allAccountName.includes(value)) {
              return callback(i18n.t('{name} already exist', { name: i18n.t('dcos:database account') }));
            }
            if (value.length < 5 || value.length > 32 || !/^[a-z][a-z0-9_]*[a-z0-9]$/.test(value)) {
              return callback(i18n.t('dcos:rds-account-name-format'));
            }
            callback();
          },
        },
      ],
      itemProps: {
        placeholder: i18n.t('dcos:rds-account-name-format'),
      },
    },
    // {
    //   // label: (
    //   //   <span>
    //   //     {i18n.t('account type')}&nbsp;
    //   //     <Tooltip title="">
    //   //       <Icon type="question-circle-o" />
    //   //     </Tooltip>
    //   //   </span>
    //   // ),
    //   label: i18n.t('account type'),
    //   name:'',
    //   type: 'radioGroup',
    //   initialValue: '普通账号',
    //   rules: [{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('account type') }) }],
    //   options: [{
    //     name: i18n.t('ordinary account'),
    //     value: '普通账号',
    //   }],
    // },
    {
      label: i18n.t('dcos:password'),
      name: 'password',
      itemProps: {
        placeholder: i18n.t('dcos:8-32-both-num-az'),
        type: passwordVisible ? 'text' : 'password',
        addonAfter: (
          <CustomIcon
            className="mr0 pointer"
            onClick={togglePasswordVisible}
            type={passwordVisible ? 'openeye' : 'closeeye'}
          />
        ),
      },
      rules: [
        {
          validator: checkPassword,
        },
      ],
    },
    {
      label: i18n.t('confirm password'),
      name: 'confirm',
      itemProps: {
        type: confirmPasswordVisible ? 'text' : 'password',
        addonAfter: (
          <CustomIcon
            className="mr0 pointer"
            onClick={toggleConfirmPasswordVisible}
            type={confirmPasswordVisible ? 'openeye' : 'closeeye'}
          />
        ),
      },
      rules: [
        {
          required: true,
          message: i18n.t('please confirm your password!'),
        },
        {
          validator: compareToFirstPassword,
        },
      ],
    },
    {
      label: i18n.t('description'),
      name: 'description',
      type: 'textArea',
      required: false,
      itemProps: {
        maxLength: 256,
        rows: 4,
      },
    },
  ];

  return (
    <FormModal
      title={i18n.t('create an account')}
      visible={visible}
      fieldsList={fieldsList}
      onCancel={onClose}
      onOk={handleSubmit}
      wrappedComponentRef={formRef}
    />
  );
};

export default AddAccountForm;
