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

/**
 * Created by 含光<jiankang.pjk@alibaba-inc.com> on 2021/1/22 14:59.
 */
declare namespace CP_TITLE {
  interface Spec {
    type: 'Title',
    props: IProps;
  }

  interface IProps {
    title: string;
    level?: number;
    tips?: string;
    prefixIcon?: string;
    imageUrl?: string;
    imageSize?: string;
    showDivider?: boolean;
    titleStyles?: object;
    showSubtitle?: boolean;
    subtitle?: string;
    subtitleStyles?: object;
    visible?: boolean;
    noMarginBottom?: boolean;
  }

  type Props = MakeProps<Spec>;
}
