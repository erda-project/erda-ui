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
import { PaginationConfig, SorterResult } from 'antd/lib/table';
import { IFormItem } from 'common/components/render-formItem';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export interface Location extends history.Location {
  query: any
}

declare global {
  interface Window {
    sysNotify(): any
  }
}

export { ColumnProps, Action } from '@terminus/nusi/es/table';
export { FilterItemConfig } from '@terminus/nusi/es/filter/interface';
export { WrappedFormUtils };
export { SelectValue, SelectProps } from 'antd/lib/select';
export { DrawerProps } from 'antd/lib/drawer';
export { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
export { AntTreeNodeSelectedEvent } from 'antd/lib/tree/Tree';
export { PaginationProps } from '@terminus/nusi/es/pagination';
export { GlobalNavigationProps, AppCenterProps } from '@terminus/nusi/es/global-navigation/interface';
export { SideNavigationProps } from '@terminus/nusi/es/side-navigation/interface';
export { PageHeaderProps } from '@terminus/nusi/es/page-header/interface';
export { MenuConfigItemProps } from '@terminus/nusi/es/side-navigation/interface';
export { RadioChangeEvent } from '@terminus/nusi/es/radio/interface';
export { ClickParam } from '@terminus/nusi/es/menu';
export { RangePickerProps } from 'antd/es/date-picker/interface';
export { UploadProps } from 'antd/es/upload';
export { InputProps } from 'antd/es/input';
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
  onTableChange: (pagination: PaginationConfig, _filters: any, sorter: SorterResult<T>) => void;
  sizeChangePagination: (paging: IPaging) => JSX.Element;
}

export interface IUseMultiFilterProps extends Omit<IUseFilterProps, 'onTableChange' | 'sizeChangePagination'> {
  activeType: string;
  onChangeType: (t: string | number) => void;
}

export type FormModalList = IFormItem[] | ((form: WrappedFormUtils, isEdit: boolean) => IFormItem[]);
