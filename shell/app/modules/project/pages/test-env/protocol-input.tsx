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
import { Input, Select } from 'antd';

const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

interface IInputProps {
  initProtocol?: string;
  value?: string;
  onChange?: (params: string) => void;

  [prop: string]: any;
}

const ProtocolInput = ({ value = '', onChange, ...rest }: IInputProps) => {
  let inputValue = '';
  let protocol = HTTPS_PREFIX;
  if (value.startsWith(HTTP_PREFIX)) {
    protocol = HTTP_PREFIX;
    inputValue = value.slice(HTTP_PREFIX.length);
  } else if (value.startsWith(HTTPS_PREFIX)) {
    protocol = HTTPS_PREFIX;
    inputValue = value.slice(HTTPS_PREFIX.length);
  }

  return (
    <Input
      addonBefore={
        <Select value={protocol} onChange={(v) => onChange && onChange(`${v}${inputValue}`)} style={{ width: 94 }}>
          <Select.Option value={HTTP_PREFIX}>http://</Select.Option>
          <Select.Option value={HTTPS_PREFIX}>https://</Select.Option>
        </Select>
      }
      maxLength={200}
      value={inputValue}
      onChange={(e) => onChange && onChange(`${protocol}${e.target.value.trim()}`)}
      {...rest}
    />
  );
};

export default ProtocolInput;
