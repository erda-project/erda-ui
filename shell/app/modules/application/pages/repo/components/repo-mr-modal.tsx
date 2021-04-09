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
import { Modal } from 'nusi';
import RepoMRForm from './repo-mr-form';
import i18n from 'i18n';

interface IProps {
  visible: boolean,
  onOk(): void;
  onCancel(): void;
}

export const RepoMRModal = ({ visible, onOk, onCancel }: IProps) => {
  return (
    <Modal
      width={600}
      title={i18n.t('application:merge demand')}
      footer={null}
      visible={visible}
      onCancel={onCancel}
    >
      <RepoMRForm
        onOk={onOk}
        onCancel={onCancel}
      />
    </Modal>
  );
};
