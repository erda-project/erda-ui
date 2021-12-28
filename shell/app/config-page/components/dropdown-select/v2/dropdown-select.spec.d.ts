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

declare namespace CP_DROPDOWN_SELECT_V2 {
  interface Spec {
    type: 'DropdownSelect';
    version: '2';
    props: IProps;
    data?: IData;
    state: IState;
  }

  interface IData {
    title?: string;
    options: Option[];
  }

  interface Option {
    label: string;
    key: string;
    icon?: string;
    img?: string;
    desc?: string;
    disabled?: boolean;
    children?: Option[];
  }

  interface IProps extends IData {
    size?: 'small' | 'middle' | 'large';
    showFilter?: boolean;
    onlyIcon?: boolean;
    required?: boolean;
    trigger?: Array<'click' | 'hover' | 'contextMenu'>;
    className?: string;
    overlayClassName?: string;
  }

  interface IState {
    value: string;
  }

  type Props = MakeProps<Spec>;
}
