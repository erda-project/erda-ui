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
import { Modal } from 'antd';
import { Build } from './build';
import { DataTaskCreation } from './data-task-creation';
import { goTo } from 'app/common/utils';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import routeInfoStore from 'core/stores/route';

const setup = {
  type: 'dataTask',
  addTitle: i18n.t('dop:new task'),
  categoryTitle: i18n.t('dop:all tasks'),
  iconType: 'rw',
};

export const DataTask = () => {
  const { getComboPipelines, batchCreateTask } = buildStore.effects;
  const params = routeInfoStore.useStore((s) => s.params);

  const [modalVisible, setModalVisible] = React.useState(false);

  const goToDetailLink = ({ pipelineID }: { pipelineID: number }, replace?: boolean) => {
    const { projectId, appId } = params;
    goTo(goTo.pages.dataTask, { projectId, appId, pipelineID, replace });
  };

  const addTask = (filePaths: any[]) => {
    if (filePaths.length > 0) {
      batchCreateTask({ batchPipelineYmlPaths: filePaths }).then(() => {
        getComboPipelines().then((comboPipelines) => {
          if (comboPipelines.length > 0) {
            goToDetailLink({ pipelineID: comboPipelines[0].pipelineID });
          }
        });
      });
    }
    setModalVisible(false);
  };

  const resetModal = () => {
    setModalVisible(false);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const renderCreateModal = () => {
    return (
      <Modal
        width={800}
        title={i18n.t('dop:choose the workflow file (master branch)')}
        visible={modalVisible}
        destroyOnClose
        footer={null}
        onCancel={resetModal}
      >
        <DataTaskCreation onOk={addTask} onCancel={resetModal} />
      </Modal>
    );
  };

  return (
    <Build goToDetailLink={goToDetailLink} setup={setup} renderCreateModal={renderCreateModal} showModal={showModal} />
  );
};
