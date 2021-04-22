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

declare namespace CP_ICON {
  
  type IIconType = 
  'lock' 
  | 'unlock' 
  | 'time' 
  | 'application-one' 
  | 'user'
  | 'link-cloud-sucess'
  | 'link-cloud-faild'
  | 'category-management'
  | 'list-numbers'
  | 'api-app'
  
  type StrokeLinejoin = 'miter' | 'round' | 'bevel';
  type StrokeLinecap = 'butt' | 'round' | 'square';
  type Theme = 'outline' | 'filled' | 'two-tone' | 'multi-color';

  interface Spec {
    type: 'Icon',
    props: IProps;
  }

  interface IProps {
    iconType: IIconType;
    size?: number | string;
    strokeWidth?: number;
    strokeLinecap?: StrokeLinecap;
    strokeLinejoin?: StrokeLinejoin;
    theme?: Theme;
    fill?: string | string[];
  }

  type Props = MakeProps<Spec>;
}
