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

import { TableRowSelection } from 'antd/lib/table/interface';

export interface ColumnsConfig {
  [key: string]: {
    dataIndex: string;
    hidden: boolean;
  };
}

export interface RowAction {
  title: React.ReactNode;
  onClick?: () => void;
  show?: boolean;
  disabled?: boolean;
  disabledTip?: string;
}

export interface TableRowActions<T> {
  width?: number | string;
  exposeCount?: number;
  /**
   * (record: T) => IAction[]
   *
   * interface IAction {
   *   title: string;
   *   onClick: () => void;
   * }
   */
  render: (record: T, index: number) => RowAction[];
}

export type SortOrder = 'ascend' | 'descend';

export interface RowSelection<T extends Obj> extends TableRowSelection<T> {
  actions?: RowActions[];
}

export interface RowActions {
  key: string;
  name: string;
  disabled?: boolean;
  onClick: (selectedKeys: React.Key[]) => any;
  isVisible?: (selectedKeys: React.Key[]) => boolean;
}
