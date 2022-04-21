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
import { Icon as CustomIcon } from 'common';
import { Dropdown, Menu, Tooltip } from 'antd';

import i18n from 'i18n';
import './pipeline-node.scss';

export interface IProps {
  data: Obj;
  editing: boolean;
  onClickNode: (data: any, arg: any) => void;
  onDeleteNode: (data: any) => void;
}

export const NodeSize = {
  WIDTH: 280,
  HEIGHT: 74,
};
const noop = () => {};
const PipelineNode = (props: IProps) => {
  const { data, editing, onClickNode = noop, onDeleteNode = noop, ...rest } = props;

  const menu = (
    <Menu
      onClick={({ domEvent, key }: any) => {
        domEvent && domEvent.stopPropagation();
        if (key === 'delete') {
          onDeleteNode(data);
        }
      }}
    >
      <Menu.Item key="delete">{i18n.t('Delete')}</Menu.Item>
    </Menu>
  );

  const onClick = () => {
    onClickNode(data, { editing, ...rest });
  };

  const titleText = data.displayName ? `${data.displayName}: ${data.alias}` : data.name || data.alias;
  return (
    <div className="p-3 yml-chart-node project-pipeline-node flex flex-col justify-center" onClick={onClick}>
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
          <div>
            <Dropdown trigger={['click']} overlay={menu}>
              <CustomIcon type="more" onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PipelineNode;
