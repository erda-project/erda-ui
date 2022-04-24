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
