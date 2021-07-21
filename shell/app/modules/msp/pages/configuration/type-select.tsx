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
import { ErdaCustomIcon } from 'common';
import './type-select.scss';

enum iconMap {
  GO = 'go',
  PHP = 'php',
  JAVA = 'java',
  JAEGER = 'jaeger',
  NODEJS = 'nodejs',
  DOT_NET = 'net',
  JAVA_AGENT = 'java',
  NODEJS_AGENT = 'nodejs',
  OPEN_TELEMETRY = 'opentelemetry',
  APACHE_SKYWALKING = 'apacheskywalking',
  manual = 'shoudonganzhuang',
  automatic = 'code',
}

const defaultIcon = 'code';

export interface Item {
  key: string;
  type: string;
  displayName: string;
  iconProps?: {};
}

export interface IProps<T = Item> {
  className?: string;
  value?: string;
  list: T[];

  onChange?: (type: string, item: T) => void;
}

const TypeSelect = <T extends Item>({ list, onChange, value, className }: IProps<T>) => {
  const [type, setType] = React.useState<string>();

  React.useEffect(() => {
    setType(value);
  }, [value]);

  const handleClick = React.useCallback(
    (item: T) => {
      if (type === item.type) {
        return;
      }
      setType(item.type);
      onChange?.(item.type, item);
    },
    [type, onChange],
  );
  return (
    <div className={`msp-conf-type-select wrap-flex-box ${className && className}`}>
      {list.map((item) => {
        const { key, type: itemType, displayName, iconProps = {} } = item;
        const isSelect = type === itemType;
        return (
          <div
            className={`conf-item mr16 mb16 flex-box flex-start pl12 ${isSelect ? 'select-item' : ''}`}
            key={key || itemType}
            onClick={() => {
              handleClick(item);
            }}
          >
            <ErdaCustomIcon size="60px" type={iconMap[key] ?? defaultIcon} {...iconProps} />
            <div className="ml12 name bold-500">{displayName}</div>
          </div>
        );
      })}
    </div>
  );
};

export default TypeSelect;
