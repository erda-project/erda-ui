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
  }

  interface ItemProps {
    key: string | number;
    data: ListData;
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

  interface Label {
    label: string;
    color?: string;
  }

  interface ListData {
    id: string | number;
    title: string;
    description?: string;
    logo?: string | React.ReactNode;
    backgroundImg?: string;
    labels: Label[];
    metaInfos?: MetaInfo[];
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

  interface MetaInfo {
    icon?: string;
    label: string;
    value: string | number;
    type?: 'success' | 'normal' | 'warning' | 'error';
    tip?: string;
    extraProps: ExtraProps;
  }

  interface ExtraProps {
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  }
}
