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

declare namespace CP_BUBBLE_GRAPH {
  interface IProps {
    theme: 'dark' | 'light';
    className?: string;
    useRealSize?: boolean;
    style: import('react').CSSProperties;
  }

  interface Spec {
    type: 'BubbleGraph';
    props: IProps;
    data: {
      title: string;
      subTitle?: string;
      list: {
        dimension: string;
        group: string;
        size: {
          value: number;
        };
        x: {
          unit: string;
          value: number;
        };
        y: {
          unit: string;
          value: number;
        };
      }[];
    };
  }

  type Props = MakeProps<Spec>;
}
