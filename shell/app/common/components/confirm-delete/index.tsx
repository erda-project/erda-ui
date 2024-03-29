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
import { Button, Modal } from 'antd';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import { firstCharToUpper } from 'app/common/utils';

interface IProps {
  [proName: string]: any;
  title?: string;
  disabledConfirm?: boolean;
  secondTitle?: JSX.Element | string;
  modalChildren?: JSX.Element;
  deleteItem?: string;
  confirmTip?: string | false;
  hasTriggerContent?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}
const noop = () => {};

const ConfirmDelete = (props: IProps) => {
  const {
    deleteItem,
    hasTriggerContent = true,
    confirmTip,
    children,
    onConfirm = noop,
    title,
    secondTitle,
    modalChildren,
    disabledConfirm = false,
    onCancel = noop,
  } = props;
  const [isVisible, setIsVisible] = React.useState(!hasTriggerContent);

  const showModal = () => {
    setIsVisible(true);
  };

  const onOk = () => {
    setIsVisible(false);
    onConfirm();
  };

  const cancel = () => {
    setIsVisible(false);
    onCancel();
  };
  const _title = title || firstCharToUpper(i18n.t('common:confirm to delete the current {deleteItem}', { deleteItem }));
  const _secondTitle =
    secondTitle || i18n.t('common:{deleteItem} cannot be restored after deletion. Continue?', { deleteItem });
  const _confirmTip =
    confirmTip || i18n.t('dop:Delete the {deleteItem} permanently. Please operate with caution.', { deleteItem });

  return (
    <div>
      {hasTriggerContent && (
        <>
          {confirmTip !== false && <div className="text-desc mb-2">{_confirmTip}</div>}
          <span onClick={showModal}>
            {children || <Button danger>{i18n.t('common:delete current {deleteItem}', { deleteItem })}</Button>}
          </span>
        </>
      )}
      <Modal
        title={
          <div className="flex flex-wrap items-center">
            <ErdaIcon type="tishi" size="20" className="mr-1" color="warning" />
            {_title}
          </div>
        }
        visible={isVisible}
        onCancel={cancel}
        footer={[
          <Button key="back" onClick={cancel}>
            {i18n.t('Cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={onOk} disabled={disabledConfirm}>
            {i18n.t('OK')}
          </Button>,
        ]}
      >
        <p className="mb-2">{_secondTitle}</p>
        {modalChildren}
      </Modal>
    </div>
  );
};

export default ConfirmDelete;
