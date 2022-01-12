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

declare namespace CP_BASE_LIST {
  interface Spec {
    type: 'List';
    operations?: Obj<CP_COMMON.Operation>;
    props?: IProps;
    data: IData;
    filter?: React.ReactElement;
  }

  interface IProps {
    isLoadMore?: boolean;
    defaultBgImg?: string;
    defaultLogo?: string;
    hideHead?: boolean;
    className?: string;
  }

  interface IData {
    title?: string;
    titleSummary?: string;
    pageNo: number;
    pageSize: number;
    total: number;
    list: ListItem[];
  }

  type ListItem = Merge<
    ERDA_LIST.ListData,
    {
      operations?: Obj<CP_COMMON.Operation>;
      moreOperations?: IMoreOp[];
      metaInfos: MetaInfo[];
    }
  >;

  interface IMoreOp {
    icon?: string;
    key?: string;
    text: string;
    operations: Obj<CP_COMMON.Operation>;
  }

  interface MetaInfo extends ERDA_LIST.MetaInfo {
    operations?: Obj<CP_COMMON.Operation>;
  }

  interface Label {
    color: string;
    key: string;
  }

  interface ExtraContent {
    type: string;
    data: any;
    [key: string]: any;
  }

  type Props = MakeProps<Spec>;
}
