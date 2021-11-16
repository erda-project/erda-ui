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

declare namespace CP_PIE_CHART {
  interface Spec {
    type: 'PieChart';
    props: IProps;
    data: IData;
    cId: string;
  }

  interface IData {
    label: string;
    data: IList[];
  }

  interface IList {
    name: string;
    value: number;
    color: string;
    formatter?: string;
  }

  interface IProps {
    option: Obj;
    style: Obj;
    direction?: 'col' | 'row';
    size?: 'small' | 'normal' | 'big';
    pureChart?: boolean;
    visible?: boolean;
    title: string;
    tip?: string | string[];
    isLoadMore?: boolean;
  }

  type Props = MakeProps<Spec> & {
    extraContent?: React.ReactElement;
  };
}
