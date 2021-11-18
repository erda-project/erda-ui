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

declare namespace ERDA_LIST {
  interface IListItemProps {
    size?: 'small' | 'middle' | 'large';
    data: IListData;
    alignCenter?: boolean;
    noBorder?: boolean;
    operations: IOperation[] | ((data: IListData) => IOperation[]);
    onRow?: Object;
    key: string | number;
  }

  interface IOperation {
    title: React.ReactNode;
    key?: string | number;
    onClick?: ([key]: any) => void;
  }

  interface IProps {
    dataSource: IListData;
    size?: ISize;
    isLoadMore?: boolean;
    onLoadMore: () => void;
    alignCenter?: boolean;
    noBorder?: boolean;
    pagination?: IPagination;
    operations: IOperation[] | ((data: IListData) => IOperation[]);
    onRow?: Object;
    getKey: (item: IListData, idx: number) => string | number;
  }

  interface IPagination {
    pageNo?: number;
    pageSize?: number;
    total?: number;
    pageSizeOptions?: string[];
  }

  type ISize = 'middle' | 'large' | 'small';

  interface IListData {
    [pro: string]: any;
    id?: string | number;
    title: string;
    description?: string;
    prefixImg?: string | React.ReactNode;
    extraInfos?: IIconInfo[];
    operations?: Obj<CP_COMMON.Operation>;
    prefixImgCircle?: boolean;
  }

  interface IIconInfo {
    icon?: string;
    text: string;
    type?: 'success' | 'normal' | 'warning' | 'error';
    tooltip?: string;
    operations?: Obj<CP_COMMON.Operation>;
    extraProps: IExtraProps;
  }

  interface IExtraProps {
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  }
}
