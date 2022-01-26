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

declare namespace CP_COMPLEX_GRAPH {
  interface IProps {
    theme: 'dark' | 'light';
    className?: string;
    style: import('react').CSSProperties;
  }

  type ValueType = 'string' | 'number' | 'capacity' | 'trafficRate' | 'storage' | 'timestamp' | 'time';

  interface Axis {
    data: Array<string | number>;
    dimensions: string[];
    structure: {
      enable: boolean;
      precision: string;
      type: ValueType;
    };
    position: string;
    type: 'value' | 'category';
  }

  interface Spec {
    type: 'ComplexGraph';
    props: IProps;
    data: {
      dimensions: string[];
      title: string;
      inverse: boolean;
      xAxis: Axis[];
      yAxis: Axis[];
      series: {
        data: number[];
        dimension: string;
        name: string;
        type: 'bar' | 'line';
      }[];
    };
  }

  type Props = MakeProps<Spec>;
}
