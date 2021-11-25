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

declare namespace CP_GANTT {
  interface Spec {
    type: 'Gantt';
    props: IProps;
    data: {
      list: IData[];
    };
  }

  type TaskType = 'task' | 'milestone' | 'project';
  interface IData {
    id: string;
    type: TaskType;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    styles?: {
      backgroundColor?: string;
      backgroundSelectedColor?: string;
      progressColor?: string;
      progressSelectedColor?: string;
    };
    isDisabled?: boolean;
    project?: string;
    dependencies?: string[];
    hideChildren?: boolean;
  }

  interface IProps {
    rowHeight?: number;
  }

  type Props = MakeProps<Spec> & {};
}
