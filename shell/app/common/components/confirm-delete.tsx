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
import { Modal, Button } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import i18n from 'i18n';

interface IProps {
  [proName: string]: any;
  title?: string;
  disabledConfirm?: boolean;
  secondTitle?: JSX.Element | string;
  modalChildren?: JSX.Element;
  deleteItem?: string;
  confirmTip?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
const noop = () => {};

export const ConfirmDelete = (props: IProps) => {
  const {
    deleteItem,
    confirmTip,
    children,
    onConfirm = noop,
    title,
    secondTitle,
    modalChildren,
    disabledConfirm = false,
    onCancel = noop,
  } = props;
  const [isVisible, setIsVisible] = React.useState(false);

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
  const _title = title || i18n.t('common:confirm to delete current {deleteItem}', { deleteItem });
  const _secondTitle =
    secondTitle || i18n.t('common:{deleteItem} cannot be restored after deletion. Continue?', { deleteItem });
  const _confirmTip =
    confirmTip || i18n.t('Permanently delete {deleteItem}. Please pay special attention to it.', { deleteItem });
  return (
    <div>
      <div className="color-text-desc mb-2">{_confirmTip}</div>
      <span onClick={showModal}>
        {children || (
          <Button ghost type="danger">
            {i18n.t('common:delete current {deleteItem}', { deleteItem })}
          </Button>
        )}
      </span>
      <Modal
        title={
          <div className="wrap-flex-box">
            <CustomIcon type="warning" className="mr-1 color-warning text-xl font-bold" />
            {_title}
          </div>
        }
        visible={isVisible}
        onCancel={cancel}
        footer={[
          <Button key="back" onClick={cancel}>
            {i18n.t('cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={onOk} disabled={disabledConfirm}>
            {i18n.t('ok')}
          </Button>,
        ]}
      >
        <p className="mb-2">{_secondTitle}</p>
        {modalChildren}
      </Modal>
    </div>
  );
};
