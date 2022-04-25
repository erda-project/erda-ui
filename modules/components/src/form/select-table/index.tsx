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
import { ISelectTableProps, SelectTable as AntSelectTable } from '@formily/antd';
import { Input, InputProps } from 'antd';
import { usePrefixCls } from '../../_util/hooks';
import ErdaIcon, { useErdaIcon } from '../../icon';

interface SearchConfig extends InputProps {
  slotNode: React.ReactElement;
}

export interface IErdaSelectTableProps extends ISelectTableProps {
  searchConfig?: SearchConfig;
}

function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value !== undefined ? [value] : [];
}

function includes(test: React.ReactNode, search: string) {
  return toArray(test).join('').toUpperCase().includes(search);
}

// copy from formily to local search all columns
function includesOption(pOption: any, search: string) {
  const searched = new Set();
  const _includesOption = (option: any): boolean => {
    const keys = Object.keys(option || {});
    return keys.some((key) => {
      if (key === '__level') {
        return false;
      }
      const value = option[key];
      if (React.isValidElement(value)) return false;
      if (key !== 'children' && !searched.has(value)) {
        if (typeof value === 'object') {
          searched.add(value);
          return _includesOption(value);
        }
        return includes(value, search);
      }
      return false;
    });
  };
  return _includesOption(pOption);
}

const SelectTable = (props: IErdaSelectTableProps) => {
  useErdaIcon();

  const [searchKey, setSearchKey] = React.useState('');
  // @ts-ignore TODO
  const { searchConfig, showSearch, dataSource, _datasource, ...rest } = props;
  const { slotNode, ...searchProps } = (searchConfig || {}) as Partial<SearchConfig>;

  const [prefixCls] = usePrefixCls('form-select-table');

  const memoDataSource = React.useMemo(() => {
    if (showSearch && searchKey) {
      return (dataSource ?? (_datasource as any[]) ?? []).filter((option) => includesOption(option, searchKey));
    }
    return dataSource;
  }, [_datasource, dataSource, searchKey, showSearch]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey((e.target.value ?? '').trim());
  };

  return (
    <div className={`${prefixCls}`}>
      {!!showSearch && (
        <div className={`${prefixCls}-header`}>
          <Input
            size="small"
            allowClear
            className="search"
            prefix={<ErdaIcon type="search" size="16" />}
            onChange={onSearchChange}
            {...searchProps}
          />
          {slotNode}
        </div>
      )}
      <AntSelectTable dataSource={memoDataSource} {...rest} />
    </div>
  );
};

export default SelectTable;
