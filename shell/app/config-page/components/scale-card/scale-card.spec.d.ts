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

declare namespace CP_SCALE_CARD {
  interface Spec {
    type: 'ScaleCard';
    operations?: Obj<CP_COMMON.Operation>;
    data: IData;
    onClick?: (v: Item) => void;
    props?: IProps;
  }

  interface IProps {
    align: 'left' | 'right';
    fixedActive?: string;
  }

  interface IData {
    list: Item[];
  }

  interface IconMap {
    active: JSX.Element;
    normal: JSX.Element;
  }

  interface Item {
    key: string;
    icon: string | IconMap;
    width?: number;
    label: string;
    operations?: Obj<CP_COMMON.Operation>;
    [pro: string]: any;
  }

  type Props = MakeProps<Spec>;
}
