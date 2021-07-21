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

import * as history from 'history';
import 'jest-enzyme';
import { PaginationConfig, SorterResult, FormInstance } from 'core/common/interface';
import { IFormItem } from 'common/components/render-formItem';

export interface Location extends history.Location {
  query: any;
}

declare global {
  interface Window {
    sysNotify(): any;
  }
}

// export {GlobalNavigationProps} from '@terminus/nusi/es/global-navigation/interface'
// export type History = history.History;

export interface IUseFilterProps<T = any> {
  onSubmit: (value: Record<string, any>) => void;
  onReset: () => void;
  onPageChange: (pNo: number) => void;
  fetchDataWithQuery: (pNo?: number) => void;
  queryCondition: any;
  pageNo: number;
  autoPagination: (paging: IPaging) => Obj;
  onTableChange: (pagination: any, _filters: any, sorter: any) => void;
  sizeChangePagination: (paging: IPaging) => JSX.Element;
}

export interface IUseMultiFilterProps extends Omit<IUseFilterProps, 'onTableChange' | 'sizeChangePagination'> {
  activeType: string;
  onChangeType: (t: string | number) => void;
}

export type FormModalList = IFormItem[] | ((form: any, isEdit: boolean) => IFormItem[]);
