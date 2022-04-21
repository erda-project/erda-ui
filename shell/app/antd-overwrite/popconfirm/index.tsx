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
import AntdPopConfirm from 'antd/es/popconfirm';
import { firstCharToUpper } from 'common/utils';

const PopConfirm = React.forwardRef(({ children, cancelText, okText, title, ...props }: any, ref) => {
  return (
    <AntdPopConfirm
      cancelText={firstCharToUpper(cancelText)}
      okText={firstCharToUpper(okText)}
      title={firstCharToUpper(title)}
      {...props}
      ref={ref}
    >
      {children}
    </AntdPopConfirm>
  );
}) as unknown as typeof AntdPopConfirm;

export default PopConfirm;
