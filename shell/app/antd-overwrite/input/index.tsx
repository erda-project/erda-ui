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
import AntdInput from 'antd/es/input';
import { firstCharToUpper } from 'common/utils';

const Input = React.forwardRef(({ placeholder, ...props }: any, ref) => {
  return <AntdInput placeholder={firstCharToUpper(placeholder)} {...props} ref={ref}></AntdInput>;
}) as unknown as typeof AntdInput;

Input.Group = AntdInput.Group;
Input.Search = AntdInput.Search;
Input.TextArea = AntdInput.TextArea;
Input.Password = AntdInput.Password;
Input.defaultProps = AntdInput.defaultProps;

export default Input;
