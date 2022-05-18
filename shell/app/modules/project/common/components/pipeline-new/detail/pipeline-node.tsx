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
import { Icon as CustomIcon, ErdaIcon } from 'common';
import { firstCharToUpper } from 'common/utils';
import { Dropdown, Menu, Tooltip } from 'antd';

import i18n from 'i18n';
import './pipeline-node.scss';

export interface IProps {
  data: Obj;
  editing: boolean;
  onClickNode: (data: any, arg: any) => void;
  onDeleteNode: (data: any) => void;
  onDisableNode: (data: any) => void;
}

export const NodeSize = {
  WIDTH: 280,
  HEIGHT: 74,
};
const noop = () => {};
const PipelineNode = (props: IProps) => {
  const { data, editing, onClickNode = noop, onDeleteNode = noop, onDisableNode = noop, ...rest } = props;

  const onClick = () => {
    onClickNode(data, { editing, ...rest });
  };

  const titleText = data.displayName ? `${data.displayName}: ${data.alias}` : data.name || data.alias;
  return (
    <Tooltip title={data.disable ? i18n.t('dop:The node is disabled') : ''} zIndex={1060}>
      <div
        className={`p-3 yml-chart-node project-pipeline-node flex flex-col justify-center ${
          data.disable ? 'opacity-60' : ''
        } hover:opacity-100`}
        onClick={onClick}
      >
        <div className={'flex py-3'}>
          <div className="w-[50px] h-[50px] mr-3">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="logo" className="w-full h-full" />
            ) : (
              <CustomIcon type="wfw" color className="w-full h-full" />
            )}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col text-normal">
            <span className="mb-1 nowrap text-base name">
              <Tooltip title={titleText}>{titleText}</Tooltip>
            </span>
          </div>
          {editing ? (
            <div className="items-center h-6 ml-1 pipeline-node-actions" onClick={(e) => e.stopPropagation()}>
              <Tooltip title={data.disable ? i18n.t('Enable') : firstCharToUpper(i18n.t('disable'))}>
                <ErdaIcon
                  type={data.disable ? 'enable' : 'disable'}
                  size="20"
                  className="text-icon mr-1"
                  onClick={() => onDisableNode(data)}
                />
              </Tooltip>

              <Tooltip title={i18n.t('Delete')}>
                <ErdaIcon type="delete-action" size="20" className="text-icon" onClick={() => onDeleteNode(data)} />
              </Tooltip>
            </div>
          ) : null}
        </div>
      </div>
    </Tooltip>
  );
};

export default PipelineNode;
