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
import { defaultPipelineYml, NodeEleMap } from 'yml-chart/config';
import { ErdaIcon, ErdaAlert } from 'common';
import { WithAuth } from 'app/user/common';
import { Tooltip, Spin } from 'antd';
import Info from './info';
import { DetailMode } from './index';
import PipelineNode, { NodeSize } from './pipeline-node';
import { runPipeline } from 'project/services/pipeline';
import InParamsForm from './in-params-form';
import i18n from 'i18n';

interface IProps {
  pipelineFileDetail?: TREE.NODE;
  onUpdate: (ymlStr: string) => void;
  pipelineDefinitionID: string;
  editAuth: boolean;
  deployAuth: boolean;
  projectId: string;
  pipelineDetail?: BUILD.IPipelineDetail;
  loading?: boolean;
  mode?: 'file' | 'edit';
  fileChanged: boolean;
  switchToExecute: () => void;
  setEditMode: (v: Partial<DetailMode>) => void;
  setPipelineId: (v: string) => void;
  extraTitle?: React.ReactNode;
}

const { endNode: EndNode } = NodeEleMap;

const Editor = (props: IProps) => {
  const {
    loading,
    pipelineFileDetail,
    projectId,
    editAuth,
    onUpdate,
    mode,
    switchToExecute,
    deployAuth,
    fileChanged,
    pipelineDetail,
    setEditMode,
    extraTitle: propsExtraTitle,
    pipelineDefinitionID,
    setPipelineId,
  } = props;
  const curPipelineYml = get(pipelineFileDetail, 'meta.pipelineYml') || defaultPipelineYml;
  const ymlStr = isEmpty(pipelineFileDetail) ? '' : curPipelineYml;
  const [running, setRunning] = React.useState(false);
  const executeRef = React.useRef<{
    execute: (_ymlStr: string, extra: { pipelineId?: string; pipelineDetail?: BUILD.IPipelineDetail }) => void;
  }>(null);

  const checkNewExecute = (v: string) => {
    setPipelineId(v);
    switchToExecute();
  };

  const runBuild = (_v?: { runParams: Obj<string | number> }) => {
    setRunning(true);
    runPipeline({ pipelineDefinitionID, projectID: +projectId, ..._v })
      .then((res) => {
        res.data?.pipeline?.id && checkNewExecute(res.data.pipeline.id);
      })
      .finally(() => {
        setRunning(false);
      });
  };

  const extraTitle = (
    <div className="flex-h-center">
      <WithAuth pass={deployAuth}>
        <Tooltip title={i18n.t('Execute')}>
          <ErdaIcon
            size="20"
            className="ml-2 cursor-pointer"
            fill="black-4"
            onClick={() => {
              executeRef?.current?.execute(ymlStr, { pipelineDetail });
            }}
            type="play1"
          />
        </Tooltip>
      </WithAuth>
      {propsExtraTitle}
    </div>
  );

  const addDrawerProps = React.useMemo(() => {
    return { showInParams: true, showOutParams: true };
  }, []);

  return (
    <Spin spinning={running}>
      {fileChanged || pipelineDetail ? (
        <ErdaAlert
          message={
            <div>
              {fileChanged ? `${i18n.t('dop:pipeline-changed-tip1')} ` : `${i18n.t('dop:pipeline-changed-tip3')} `}
              <span className="text-purple-deep cursor-pointer" onClick={switchToExecute}>
                {i18n.t('dop:the latest execution status')}
              </span>
            </div>
          }
          closeable={false}
        />
      ) : null}
      <Info info={pipelineFileDetail} className="mb-2" operations={mode === 'file' ? extraTitle : null} />
      <PipelineEditor
        ymlStr={ymlStr}
        addDrawerProps={addDrawerProps}
        editable={editAuth}
        initEditing={mode === 'edit'}
        title={`${i18n.t('dop:pipeline configuration')}`}
        onSubmit={onUpdate}
        onCancel={() => {
          !fileChanged && pipelineDetail && switchToExecute();
        }}
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
            endNode: () => <EndNode disabled />,
          },
        }}
      />
      <InParamsForm
        ref={executeRef}
        afterExecute={() => setRunning(false)}
        beforeExecute={() => setRunning(true)}
        onExecute={runBuild}
      />
    </Spin>
  );
};

export default Editor;
