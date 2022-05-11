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
import { Modal, ModalProps, Spin } from 'antd';
import Form from '../form';
import type { FormProps } from '../form';
import { replaceMessage, useLocaleReceiver } from '../locale-provider';

export interface FormModalProps extends ModalProps {
  isEditing?: boolean;
  exactTitle?: boolean;
  formProps: FormProps;
  loading?: boolean;
}

const FormModal = (props: FormModalProps) => {
  const { formProps, isEditing, title, loading, ...rest } = props;

  const [locale] = useLocaleReceiver('FormModal');

  React.useEffect(() => {
    return () => {
      formProps.form && formProps.form.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTitle = props.exactTitle
    ? title
    : isEditing
    ? `${replaceMessage(locale.editForm, { label: title as string })}`
    : `${replaceMessage(locale.newForm, { label: title as string })}`;

  return (
    <Modal title={displayTitle} {...rest}>
      <Spin spinning={!!loading}>
        <Form {...formProps} />
      </Spin>
    </Modal>
  );
};

export default FormModal;
