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
import { Icon as CustomIcon } from 'common';
import { Dropdown, Menu, Tooltip } from 'app/nusi';
import { map, uniqueId, isEmpty } from 'lodash';
import { i18nMap } from '../pipeline-yml/pipeline-node-drawer';
import i18n from 'i18n';
import './pipeline-node.scss';

export interface IProps{
  data: Obj;
  editing: boolean;
  onClickNode: (data: any, arg: any) => void;
  onDeleteNode: (data: any) => void;
}

const noop = () => {};
export const PipelineNode = (props: IProps) => {
  const { data, editing, onClickNode = noop, onDeleteNode = noop, ...rest } = props;

  const menu = (
    <Menu onClick={({ domEvent, key }:any) => {
      domEvent && domEvent.stopPropagation();
      if (key === 'delete') {
        onDeleteNode(data);
      }
    }}
    >
      <Menu.Item key='delete'>
        {i18n.t('application:delete')}
      </Menu.Item>
    </Menu>
  );

  const onClick = () => {
    onClickNode(data, { editing, ...rest });
  };
  const getLoopRender = () => {
    const { loop = {} } = data;
    if (!isEmpty(loop) && loop.break) {
      const { strategy = {} } = loop;
      const tip = (
        <div onClick={(e:any) => e.stopPropagation()}>
          <div className='bold'>{i18n.t('project:loop strategy')}</div>
          {loop.break && <div className='pl8'>{`${i18n.t('project:end of loop condition')}: ${loop.break}`}</div>}
          {strategy.max_times && <div className='pl8'>{`${i18n.t('project:maximum number of loop')}: ${strategy.max_times}`}</div>}
          {strategy.decline_ratio && <div className='pl8'>{`${i18n.t('project:decline ratio')}: ${strategy.decline_ratio}`}</div>}
          {strategy.decline_limit_sec && <div className='pl8'>{`${i18n.t('project:decline limit second')}: ${strategy.decline_limit_sec}${i18n.t('common:second')}`}</div>}
          {strategy.interval_sec && <div className='pl8'>{`${i18n.t('project:interval second')}: ${strategy.interval_sec}${i18n.t('common:second')}`}</div>}
        </div>
      );
      return (
        <Tooltip title={tip}>
          <CustomIcon className='color-text-desc fz16 hover-active' type="xunhuan" onClick={(e) => e.stopPropagation()} />
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <div className='yml-chart-node pipeline-node column-flex-box' onClick={onClick}>
      <div className={'pipeline-title py12'}>
        <div className="title-icon mr12">
          {
            data.logoUrl ? (
              <img src={data.logoUrl} alt='logo' />
            ) : (
              <CustomIcon type='wfw' color className='full-width full-height' />
            )
          }
        </div>
        <div className="title-txt column-flex-box color-text">
          <span className='mb4 nowrap fz16 bold name'>{data.displayName || data.type}</span>
          <span className='nowrap fz12 type'>{data.alias}</span>
        </div>
        {editing ? (
          <div>
            <Dropdown trigger={['click']} overlay={menu}>
              <CustomIcon type="more" onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </div>
        ) : getLoopRender()}
      </div>
      <div className='pipeline-content flex-1 py12'>
        {data.description}
      </div>
    </div>
  );
};

const renderDataSource = (dataSource: any) => {
  const contents: any[] = [];
  const type = dataSource instanceof Array ? 'array' : typeof dataSource;
  switch (type) {
    case 'array':
      contents.push(renderArray(dataSource));
      break;
    case 'object':
      contents.push(renderObject(dataSource));
      break;
    default:
      contents.push(renderValue(dataSource));
      break;
  }

  return contents.map(item => item);
};

const renderObject = (dataSource: object) => {
  return map(dataSource, (value: any, key: string) => {
    const type = value instanceof Array ? 'array' : typeof value;
    let isObject = false;
    if (type === 'array' && (!value || (value && value.length === 0))) {
      return null;
    } else if (!value && value !== '') {
      return null;
    }

    switch (type) {
      case 'array':
      case 'object':
        isObject = true;
        break;
      default:
        break;
    }
    return (
      <div key={uniqueId(`pv-obj-${key}`)}>
        <span className={isObject ? 'object-key' : ''}>{i18nMap[key] || key}: </span>
        <span className={isObject ? 'object-value' : ''}>
          {renderDataSource(value)}
        </span>
      </div>
    );
  });
};

const renderArray = (dataSource: object) => {
  return map(dataSource, (value: any, key: string) => {
    return (
      <div key={uniqueId(`pv-array-${key}`)}>
        {renderDataSource(value)}
      </div>
    );
  });
};

const renderValue = (value: any) => {
  return <span key={uniqueId(`pv-v-${value}`)}>{value}</span>;
};
