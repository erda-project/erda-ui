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

declare namespace CP_LINEAR_DISTRIBUTION {
  interface Spec {
    type: 'LinearDistribution';
    props: IProps;
    state: IState;
    data: {
      list: IData[];
      total?: number;
    };
  }

  interface IState {}

  interface IData {
    value: number;
    label: string;
    color: string;
    tip: string;
  }

  interface IProps {
    size: 'small' | 'normal' | 'big';
  }

  type Props = MakeProps<Spec>;
}
