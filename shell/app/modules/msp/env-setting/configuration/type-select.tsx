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
  Golang = 'go',
  PHP = 'php',
  Java = 'java',
  Jageger = 'jaeger',
  'Node.js' = 'nodejs',
  '.NET Core' = 'net',
  'Java Agent' = 'java',
  NODEJS_AGENT = 'nodejs',
  OpenTelemetry = 'opentelemetry',
  'Apache SkyWalking' = 'apacheskywalking',
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
    <div className={`msp-conf-type-select flex flex-wrap justify-items-start ${className && className}`}>
      {list.map((item) => {
        const { key, type: itemType, displayName, iconProps = {} } = item;
        const isSelect = type === itemType;
        return (
          <div
            className={`conf-item group mr-4 mb-4 flex justify-items-start items-center pl-3 hover:border-primary ${
              isSelect ? 'border-primary bg-light-primary' : ''
            }`}
            key={key || itemType}
            onClick={() => {
              handleClick(item);
            }}
          >
            <ErdaCustomIcon size="60px" type={iconMap[key] ?? defaultIcon} {...iconProps} />
            <div className={`ml-3 name font-medium group-hover:text-primary ${isSelect ? 'text-primary' : ''}`}>
              {displayName}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TypeSelect;
