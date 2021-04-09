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

import React, { Component } from 'react';
import { Popconfirm, Modal } from 'nusi';
import i18n from 'i18n';

const { confirm } = Modal;
const noop = () => {};

interface IProps {
  [proName: string]: any;
  secondTitle?: string;
  okText?: string;
  cancelText?: string;
  onShow?: any;
  onConfirm?(): void;
  onCancel?(): void;
}
export class DoubleConfirm extends Component<IProps> {
  doubleConfirm = (e: React.MouseEvent<any, MouseEvent> | undefined) => {
    if (e !== undefined) {
      e.stopPropagation();
    }
    const { onShow } = this.props;
    if (onShow && typeof onShow === 'function') {
      onShow();
    }
    const { onConfirm = noop, onCancel = noop, secondTitle, okText, cancelText } = this.props;
    confirm({
      title: i18n.t('common:double confirm'),
      content: secondTitle || `${i18n.t('common:confirm this action')}？`,
      onOk() {
        onConfirm();
      },
      onCancel() {
        onCancel();
      },
      okText: okText || i18n.t('common:confirm'),
      cancelText: cancelText || i18n.t('common:cancel'),
    });
  };

  cancel = (e: React.MouseEvent<any, MouseEvent> | undefined) => {
    if (e !== undefined) {
      e.stopPropagation();
    }
  };

  render() {
    return (
      <Popconfirm title={`${i18n.t('common:confirm deletion')}?`} {...this.props} onConfirm={this.doubleConfirm} onCancel={this.cancel} />
    );
  }
}
