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
import Tabs from 'antd/es/tabs';
import { firstCharToUpper } from 'common/utils';
const { TabPane } = Tabs;

Tabs.TabPane = React.forwardRef(({ tab, ...props }: any, ref) => {
  // TODO: tab 无效
  return <TabPane tab={firstCharToUpper(tab)} {...props} ref={ref}></TabPane>;
}) as unknown as typeof Tabs.TabPane;

export default Tabs;
