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
import { get, isEmpty } from 'lodash';
import PipelineEditor from 'yml-chart/pipeline-editor';
import { NodeEleMap } from 'yml-chart/config';
import { ErdaIcon, ErdaAlert } from 'common';
import { WithAuth } from 'app/user/common';
import { Button, Tooltip, Spin } from 'antd';
import Info from './info';
import { getBranchPath } from 'application/pages/pipeline/config';
import { DetailMode } from './index';
import PipelineNode, { NodeSize } from './pipeline-node';
import buildStore from 'application/stores/build';
import i18n from 'i18n';

interface IProps {
  pipelineFileDetail?: TREE.NODE;
  pipelineDetail?: BUILD.IPipelineDetail;
  onUpdate: (ymlStr: string) => void;
  editAuth: boolean;
  deployAuth: boolean;
  projectId: string;
  loading?: boolean;
  mode?: 'file' | 'edit';
  fileChanged: boolean;
  checkExecute: () => void;
  setEditMode: (v: Partial<DetailMode>) => void;
  setPipelineId: (v: string) => void;
  appId: string;
  extraTitle: React.ReactNode;
  onCancel?: () => void;
}

const defaultPipelineYml = `version: 1.1
stages: []
`;

const StartNode = NodeEleMap.startNode;
const EndNode = NodeEleMap.endNode;

const Editor = (props: IProps) => {
  const {
    loading,
    pipelineFileDetail,
    pipelineDetail,
    projectId,
    editAuth,
    onUpdate,
    mode,
    checkExecute,
    deployAuth,
    fileChanged,
    setEditMode,
    extraTitle,
    appId,
    setPipelineId,
    onCancel,
  } = props;
  const { addPipeline, runBuild: runBuildCall } = buildStore.effects;
  const curPipelineYml = get(pipelineFileDetail, 'meta.pipelineYml') || defaultPipelineYml;
  const ymlStr = isEmpty(pipelineFileDetail) ? '' : curPipelineYml;
  const [running, setRunning] = React.useState(false);

  const { branch, path } = getBranchPath(pipelineFileDetail);

  const checkNewExecute = (v: string) => {
    setPipelineId(v);
    checkExecute();
  };

  const runBuild = () => {
    setRunning(true);
    const postData = {
      appId,
      branch,
      pipelineYmlName: path,
      pipelineYmlSource: 'gittar',
      source: 'dice',
    };
    // create and run;
    addPipeline(postData).then((res) => {
      runBuildCall({ pipelineID: res.id }).then(() => {
        setRunning(false);
        checkNewExecute(res.id);
      });
    });
  };

  return (
    <Spin spinning={running}>
      {fileChanged ? (
        <ErdaAlert
          message={
            <div>
              {`${i18n.t('dop:pipeline-changed-tip1')} `}
              <span className="text-purple-deep cursor-pointer" onClick={checkExecute}>
                {i18n.t('dop:the latest execution status')}
              </span>
            </div>
          }
          closeable={false}
        />
      ) : null}
      <Info
        info={pipelineFileDetail}
        className="mb-2"
        operations={mode === 'file' ? extraTitle : null}
        // TODO: execute in editor, need new api;
        // operations={
        //   mode === 'file' ? (
        //     <WithAuth pass={deployAuth}>
        //       <Tooltip title={'执行'}>
        //         <ErdaIcon
        //           size="20"
        //           className="mr-2"
        //           fill="black-4"
        //           onClick={() => {
        //             runBuild();
        //           }}
        //           type="play1"
        //         />
        //       </Tooltip>
        //     </WithAuth>
        //   ) : (
        //     <></>
        //   )
        // }
      />
      <PipelineEditor
        ymlStr={ymlStr}
        editable={editAuth}
        initEditing={mode === 'edit'}
        title={`${i18n.t('dop:pipeline configuration')}`}
        onSubmit={onUpdate}
        onCancel={onCancel}
        onEditingChange={(editing: boolean) => {
          setEditMode(editing ? DetailMode.edit : DetailMode.file);
        }}
        loading={loading}
        chartProps={{
          chartSize: {
            pipeline: NodeSize,
          },
          nodeEleMap: {
            pipeline: PipelineNode,
            startNode: () => <StartNode disabled />,
            endNode: () => <EndNode disabled />,
          },
        }}
      />
    </Spin>
  );
};

export default Editor;
