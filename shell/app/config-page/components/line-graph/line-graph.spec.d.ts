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

declare namespace CP_LINE_GRAPH {
  interface IProps {
    theme: 'dark' | 'light';
    className?: string;
    style: import('react').CSSProperties;
  }

  type ValueType = 'string' | 'number' | 'capacity' | 'trafficRate' | 'storage' | 'timestamp' | 'time';

  interface AxisOptions {
    inverse: boolean;
    structure: {
      enable: boolean;
      precision: string;
      type: ValueType;
    };
  }

  interface Spec {
    type: 'LineGraph';
    props: IProps;
    data: {
      dimensions: string[];
      title: string;
      inverse: boolean;
      xAxis: {
        values: Array<string | number>;
      };
      xOptions: AxisOptions | null;
      yAxis: {
        dimension: string;
        values: Array<string | number>;
      }[];
      yOptions: Array<
        AxisOptions & {
          dimension: string[];
        }
      >;
    };
  }

  type Props = MakeProps<Spec>;
}
