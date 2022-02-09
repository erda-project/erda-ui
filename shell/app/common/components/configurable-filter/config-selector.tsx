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
import { Popover, Modal } from 'antd';
import { ErdaIcon, Ellipsis, Badge } from 'common';
import { ConfigData } from './index';
import i18n from 'i18n';
import './config-selector.scss';

export interface IProps {
  list: ConfigData[];
  value?: number | string;
  isNew: boolean;
  defaultValue: number | string;
  onDeleteFilter: (config: ConfigData) => void;
  onSaveFilter: (label: string) => void;
  onChange: (config: ConfigData) => void;
  className?: string;
}

const ConfigSelector = ({ className = '', list, defaultValue, value, onChange, onDeleteFilter, isNew }: IProps) => {
  const configSelectorRef = React.useRef<HTMLDivElement>();

  const [defaultData, setDefaultData] = React.useState<ConfigData[]>([]);
  const [customData, setCustomData] = React.useState<ConfigData[]>([]);

  React.useEffect(() => {
    setDefaultData(list.filter((item: ConfigData) => item.isPreset));
    setCustomData(list.filter((item: ConfigData) => !item.isPreset));
  }, [list]);

  const onConfigChange = (config: ConfigData) => {
    onChange(config);
  };

  const deleteFilter = (item: ConfigData) => {
    Modal.confirm({
      title: i18n.t('dop:whether to delete the {name}', { name: item.label }),
      zIndex: 9999,
      getContainer: configSelectorRef.current,
      onOk() {
        onDeleteFilter(item);
      },
    });
  };

  const configItemContent = (item: ConfigData) => {
    return (
      <div className="px-2 py-3">
        {/* <div className="py-1 px-2 bg-hover">设为默认</div>
        <div className="py-1 px-2 bg-hover">重命名</div> */}
        <div className="py-1 px-2 cursor-pointer bg-hover text-red" onClick={() => deleteFilter(item)}>
          {i18n.t('delete')}
        </div>
      </div>
    );
  };

  const configItemMore = (item: ConfigData) => {
    return (
      <Popover
        content={configItemContent(item)}
        trigger={['click']}
        placement="bottomLeft"
        overlayClassName="erda-configurable-filter-add w-[120px]"
        getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
      >
        <ErdaIcon type="gengduo" size={20} className="more-op" onClick={(e) => e.stopPropagation()} />
      </Popover>
    );
  };

  const currentConfig = list.find((item) => item.id === value);
  const changedId = isNew && (value || 'all');
  const renderConfigList = (configList: ConfigData[], showOp: boolean) =>
    configList.map((item) => (
      <div
        key={item.id}
        className={`filter-config-selector-item mb-0.5 flex-h-center cursor-pointer px-2 py-1  hover:text-white hover:bg-white-08 rounded-sm ${
          item.id === currentConfig?.id ? 'text-white bg-white-08' : 'text-white-8'
        }`}
        onClick={() => onConfigChange(item)}
      >
        <div className="flex-h-center flex-1 overflow-hidden">
          <Ellipsis title={item.label} />
          {item.id === defaultValue ? (
            <span className="leading-5 text-xs px-2 border border-solid border-white-1 rounded-sm  ml-2 whitespace-nowrap">
              {i18n.t('default')}
            </span>
          ) : null}
        </div>
        <div className="flex-h-center">
          {changedId === item.id ? (
            <Badge text={i18n.t('dop:changed')} status="processing" showDot={false} className="ml-2" />
          ) : null}
          {showOp ? configItemMore(item) : null}
        </div>
      </div>
    ));

  return (
    <div className={`flex flex-col rounded-sm bg-white-04 py-3 pl-2 w-[230px] ${className}`} ref={configSelectorRef}>
      <div className="flex-1 overflow-auto">
        <div className="pr-2">{renderConfigList(defaultData, false)}</div>
        <div className="my-1 bg-white-2 h-[1px] mr-2" />
        <div className="pr-2">
          <div className="my-2 px-2 text-xs text-white-6">{i18n.t('dop:custom filter')}</div>
          {renderConfigList(customData, true)}
        </div>
      </div>
    </div>
  );
};

export default ConfigSelector;
