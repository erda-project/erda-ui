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
  interface Props {
    dataSource: ListData[];
    pagination?: Pagination;
    isLoadMore?: boolean;
    onLoadMore: (curPageNo: number) => void;
    getKey: (item: ListData, idx: number) => string | number;
    EmptyHolder: React.FC;
    defaultLogo?: string;
    defaultBgImg?: string;
    columnsInfoWidth?: Obj<number>;
    batchOperation?: React.ReactElement;
    onSelectChange?: (rowId: string) => void;
    className?: string;
  }

  interface ItemProps {
    key: string | number;
    data: ListData;
    columnsInfoWidth?: Obj<number>;
    defaultLogo?: string;
    defaultBgImg?: string;
    onSelectChange?: (bol: boolean) => void;
  }

  interface Operation {
    icon: string;
    key: string;
    text: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    [key: string]: any;
  }

  interface Pagination {
    pageNo: number;
    pageSize?: number;
    total: number;
    pageSizeOptions?: string[];
    onChange: (current: number, pageSize: number) => void;
  }

  interface IState {
    text: string;
    status: 'success' | 'warning' | 'error' | 'processing';
  }

  interface Tag {
    label: string;
    color: string;
  }

  interface ListData {
    id: string | number;
    title: string;
    titleSummary?: string;
    description?: string;
    logoURL?: string | React.ReactNode;
    icon?: { type?: string; url?: string };
    backgroundImg?: string;
    star?: boolean;
    titleState: IState[];
    mainState: IState;
    tags: Tag[];
    columnsInfo: IColumnsInfo;
    kvInfos?: MetaInfo[];
    titlePrefixIcon?: string;
    titlePrefixIconTip?: string;
    titleSuffixIcon?: string;
    titleSuffixIconTip?: string;
    extra?: React.ReactNode;
    operations?: Operation[];
    moreOperations?: Operation[];
    logoCircle?: boolean;
    itemProps?: {
      onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    };
    [k: string]: any;
  }

  interface IColumnsInfo {
    users?: string[];
    text?: Array<{ tip?: string; text: string }>;
    state?: IState;
    hoverIcons?: Array<{ icon: string; tip: string }>;
  }

  interface MetaInfo {
    icon?: string;
    key: string;
    value: string | number;
    type?: 'success' | 'normal' | 'warning' | 'error';
    tip?: string;
    extraProps?: ExtraProps;
  }

  interface ExtraProps {
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  }
}
