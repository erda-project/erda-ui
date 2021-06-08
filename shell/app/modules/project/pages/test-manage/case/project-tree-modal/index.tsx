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
import i18n from 'i18n';
import { Modal } from 'app/nusi';

import { useLoading } from 'app/common/stores/loading';
import testSetStore from 'project/stores/test-set';
import { CaseTree } from '../../components';
import { TestOperation } from '../../constants';

const titleMap = {
  [TestOperation.copy]: i18n.t('project:copy to'),
  [TestOperation.move]: i18n.t('project:move to'),
  [TestOperation.recover]: i18n.t('project:recover to'),
};

const ProjectTreeModal = () => {
  const treeModalInfo = testSetStore.useStore((s) => s.treeModalInfo);
  const [confirmLoading] = useLoading(testSetStore, ['submitTreeModal']);
  const { submitTreeModal } = testSetStore.effects;
  const { closeTreeModal, updateTreeModalExtra } = testSetStore.reducers;
  const { action, type } = treeModalInfo;
  const visible = !!type;
  return (
    <Modal
      visible={visible}
      title={titleMap[action]}
      onCancel={closeTreeModal}
      onOk={() => submitTreeModal()}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <div style={{ position: 'relative' }}>
        <CaseTree
          readOnly
          needRecycled={false}
          needActiveKey={false}
          onSelect={updateTreeModalExtra}
          mode="temp"
        />
      </div>
    </Modal >
  );
};

export default ProjectTreeModal;
