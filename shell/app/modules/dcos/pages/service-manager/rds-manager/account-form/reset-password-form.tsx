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
import i18n from 'i18n';
import { FormModal, Icon as CustomIcon, useUpdate } from 'common';
import { checkPassword } from 'dcos/common/config';
import { WrappedFormUtils } from 'interface/common';

export interface IFormRes {
  password: string;
  confirm: string;
}

interface IProps {
  visible: boolean;
  onClose: () => any;
  handleSubmit: (formRes: IFormRes) => void;
}

type FormRef = {props: {form: WrappedFormUtils}};

const ResetPasswordForm = (props: IProps) => {
  const { visible, onClose, handleSubmit } = props;
  const formRef = React.useRef({}) as React.MutableRefObject<FormRef>;

  const [{
    passwordVisible,
    confirmPasswordVisible,
  }, updater] = useUpdate({
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
      label: i18n.t('new password'),
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
      label: i18n.t('confirm the new password'),
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
          required: true, message: i18n.t('please confirm your password!'),
        }, {
          validator: compareToFirstPassword,
        },
      ],
    },
  ];

  return (
    <FormModal
      title={i18n.t('reset account password')}
      visible={visible}
      fieldsList={fieldsList}
      onCancel={onClose}
      onOk={handleSubmit}
      wrappedComponentRef={formRef}
    />
  );
};

export default ResetPasswordForm;
