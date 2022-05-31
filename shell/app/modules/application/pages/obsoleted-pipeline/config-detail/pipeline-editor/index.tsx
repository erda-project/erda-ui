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
import { NodeEleMap, defaultPipelineYml } from 'yml-chart/config';
import i18n from 'i18n';

const { startNode: StartNode, endNode: EndNode } = NodeEleMap;
interface IProps {
  caseDetail: TREE.NODE;
  addDrawerProps: Obj;
  onUpdateYml: (ymlStr: string) => void;
  editable: boolean;
  loading?: boolean;
}

const CasePipelineEditor = (props: IProps) => {
  const { caseDetail, onUpdateYml, loading, addDrawerProps, editable } = props;
  const curPipelineYml = get(caseDetail, 'meta.pipelineYml') || defaultPipelineYml;
  const ymlStr = isEmpty(caseDetail) ? '' : curPipelineYml; //
  return (
    <div>
      <PipelineEditor
        ymlStr={ymlStr}
        editable={editable}
        title={i18n.t('Pipeline')}
        addDrawerProps={addDrawerProps}
        onSubmit={onUpdateYml}
        loading={loading}
        chartProps={{
          nodeEleMap: {
            startNode: () => <StartNode disabled />,
            endNode: () => <EndNode disabled />,
          },
        }}
      />
    </div>
  );
};

export default CasePipelineEditor;
