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
import { ErdaIcon } from 'common';
import { DevFlowInfo } from 'project/services/project-workflow';
import BaseStep, { IBaseProps } from './base-step';

interface IProps extends IBaseProps {
  data: DevFlowInfo;
  app: IApplication;
}

const Code: React.FC<IProps> = ({ data, app = {}, beta }) => {
  const { devFlowNode } = data;
  return (
    <BaseStep title={i18n.t('dop:{type} node', { type: 'Code' })} beta={beta}>
      <div className="workflow-step-code">
        <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">
          {' '}
          {i18n.t('App')}: {app.displayName ?? devFlowNode.appID}
        </p>
        <div className="flex items-center justify-start">
          <div
            className="max-w-[120px] px-2 rounded whitespace-nowrap overflow-ellipsis overflow-hidden text-blue-deep bg-blue-light"
            title={devFlowNode.targetBranch}
          >
            {devFlowNode.targetBranch}
          </div>
          <ErdaIcon type="arrow-left" className="mx-2 text-default-6" />
          <div
            className="max-w-[120px] px-2 rounded whitespace-nowrap overflow-ellipsis overflow-hidden text-blue-deep bg-blue-light"
            title={devFlowNode.sourceBranch}
          >
            {devFlowNode.sourceBranch}
          </div>
        </div>
      </div>
    </BaseStep>
  );
};

export default Code;
