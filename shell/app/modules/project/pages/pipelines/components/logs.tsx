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
import { Drawer } from 'antd';
import { updateSearch } from 'common/utils';
import DiceConfigPage from 'app/config-page';
import PipelineRunDetail from 'application/pages/pipeline/run-detail';
import fileTreeStore from 'common/stores/file-tree';
import routeInfoStore from 'core/stores/route';
import { getINodeByPipelineId, getPipelineDetail } from 'application/services/build';

const PipelineLogs = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const { updateTreeNodeDetail } = fileTreeStore;
  const [visible, setVisible] = React.useState(false);

  const onClose = React.useCallback(() => {
    setVisible(false);
  }, []);
  return (
    <>
      <DiceConfigPage
        scenarioKey="project-pipeline-exec-list"
        scenarioType="project-pipeline-exec-list"
        showLoading
        inParams={{ projectId }}
        customProps={{
          pipelineTable: {
            op: {
              clickRow: async (record: { id: string; pipelineId: number }) => {
                const res = await getINodeByPipelineId({ pipelineId: record.id });
                const inode = res?.data?.inode;
                updateTreeNodeDetail(res.data);
                const response = await getPipelineDetail({ pipelineID: +record.id });
                const appId = response.data.applicationID;
                inode && updateSearch({ nodeId: inode, applicationId: appId, pipelineID: record.id });
                setVisible(true);
              },
            },
            props: {
              styleNames: 'h-full',
              wrapperClassName: 'flex-1',
            },
          },
        }}
      />
      <Drawer onClose={onClose} visible={visible} width="80%" destroyOnClose closable={false}>
        <PipelineRunDetail deployAuth={{ hasAuth: false }} isMobileInit={false} />
      </Drawer>
    </>
  );
};

export default PipelineLogs;
