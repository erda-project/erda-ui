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

declare namespace CP_TABLE2 {
  interface Spec {
    type: 'Table';
    version?: '2';
    operations?: TableOperation;
    data?: IData;
    props?: IProps;
  }

  interface IProps {
    className?: string;
    title?: string;
    columnsMap?: Obj<{ [key: string]: ColumnItem }>;
    pageSizeOptions?: string[];
    pagination?: false;
  }
  interface IData {
    table: {
      pageNo: number;
      pageSize: number;
      total: number;
      columns: Columns;
      rows: Rows[];
    };
    title?: string;
  }

  interface TableOperation {
    changePage?: Merge<CP_COMMON.Operation, { clientData: { pageNo: number; pageSize: number } }>;
    changeSort?: Merge<CP_COMMON.Operation, { clientData: { columnKey: string; order: string } }>;
    batchRowsHandle?: IBatchOperation;
  }

  type IBatchOperation = Merge<
    CP_COMMON.Operation,
    {
      clientData: { dataRef: Obj; selectedOptionsID: string; selectedRowIDs: string[] };
      serverData: {
        options: Array<{
          id: string;
          text: string;
          icon?: string;
          disabled?: boolean;
          allowedRowIDs: string[];
          forbiddenRowIDs: string[];
        }>;
      };
    }
  >;

  interface Columns {
    columnsMap: Obj<ColumnItem>;
    merges?: Obj<{ orders: string[] }>;
    orders: string[];
  }

  interface ColumnItem {
    title: string;
    tip?: string;
    enableSort?: boolean;
    align?: 'left' | 'right';
    render?: (v: Obj, r: Obj) => React.ReactElement;
  }

  interface Rows {
    id: string;
    selected?: boolean;
    selectable?: boolean;
    operations: RowOperations;
    cellsMap: Obj<CellsItem>;
  }

  interface RowOperations {}

  type CellsItem = TextCell | UserCell | DropdownMenuCell;

  // types of cells
  interface TextCell {
    type: 'text';
    data: { text: string };
  }

  interface UserCell {
    type: 'userAvatar';
    data: { user: string };
  }

  interface DropdownMenuCell {
    type: 'dropdownMenu';
    data: {};
  }

  type Props = MakeProps<Spec> & {
    slot?: React.ReactNode;
  };
}
