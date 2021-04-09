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
import { get, isEmpty } from 'lodash';
import PipelineEditor from 'app/yml-chart/pipeline-editor';
import CaseYmlGraphicEditor from './case-yml-graphic-editor';
// import {  NodeEleMap } from 'application/common/yml-editor/config';
import { CHART_NODE_SIZE, NodeEleMap } from 'application/common/yml-editor/config';
import i18n from 'i18n';

interface IProps{
  caseDetail: TREE.NODE;
  addDrawerProps: Obj;
  onUpdateYml: (ymlStr: string) => void;
  scope: string;
  editable: boolean;
}

const defaultPipelineYml = `version: 1.1
stages: []
`;

const CasePipelineEditor = (props: IProps) => {
  const { caseDetail, onUpdateYml, addDrawerProps, scope, editable } = props;
  const curPipelineYml = get(caseDetail, 'meta.pipelineYml') || defaultPipelineYml;
  const ymlStr = isEmpty(caseDetail) ? '' : curPipelineYml;//
  return (
    <div>
      <PipelineEditor
        ymlStr={ymlStr}
        editable={editable}
        title={i18n.t('pipeline')}
        YmlGraphicEditor={(p:any) => <CaseYmlGraphicEditor scope={scope} addDrawerProps={addDrawerProps} {...p} />}
        onSubmit={onUpdateYml}
        chartProps={{
          chartSize: {
            pipeline: CHART_NODE_SIZE.pipeline,
            startNode: CHART_NODE_SIZE.startNode,
            endNode: CHART_NODE_SIZE.startNode,
          },
          nodeEleMap: {
            pipeline: NodeEleMap.pipeline,
            startNode: NodeEleMap.startNode,
            endNode: NodeEleMap.startNode,
          },
        }}
      />
    </div>
  );
};

export default CasePipelineEditor;
