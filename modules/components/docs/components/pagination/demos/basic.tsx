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
import { Pagination } from '@erda-ui/components';

export default () => {
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const onChange = (pageNo: number, size: number) => {
    setCurrent(pageNo);
    setPageSize(size);
  };

  return <Pagination total={99} pageSize={pageSize} onChange={onChange} current={current} />;
};
