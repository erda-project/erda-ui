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

import { groupBy, set, findIndex } from 'lodash';

export const convertDataForGantt = (
  data: { expandList: CP_GANTT.IData[]; updateList: CP_GANTT.IData[] },
  prevList: CP_GANTT.IGanttData[],
) => {
  let ganttData: CP_GANTT.IGanttData[] = [...prevList];

  const { expandList, updateList } = data;
  const timeLimit = (t) => (t && new Date(t).getTime() > new Date('2019-1-1').getTime() ? t : 0);

  const prevDataGroup = { ...groupBy(prevList, 'pId'), ...expandList };

  const convert = (dataTemp: CP_GANTT.IData[], level = 0, pId?: string) => {
    dataTemp.forEach((item) => {
      const { key, title, start, end, isLeaf = true, hideChildren, ...rest } = item;
      const validTime = timeLimit(start) && timeLimit(end);
      const curData = {
        type: !isLeaf ? 'project' : 'task',
        id: key,
        name: title,
        start: validTime ? new Date(start) : undefined,
        end: validTime ? new Date(end) : undefined,
        progress: 0,
        isLeaf,
        hideChildren: hideChildren === undefined ? (!isLeaf ? !prevDataGroup[key]?.length : undefined) : hideChildren,
        level,
        pId: pId || 0,
        ...(pId ? { project: pId } : {}),
        ...rest,
      };
      ganttData.push(curData);
      if (prevDataGroup[curData.id]) {
        convert(prevDataGroup[curData.id], level + 1, curData.id);
      }
    });
  };

  if (expandList) {
    ganttData = [];
    convert(prevDataGroup['0']); // root: 0
  }
  if (updateList?.length) {
    updateList.forEach((item) => {
      const curDataIndex = findIndex(ganttData, (gItem) => gItem.id === item.key);
      if (curDataIndex !== -1) {
        const { key, title, start, end, isLeaf = true, hideChildren, ...rest } = item;

        set(ganttData, `[${curDataIndex}]`, {
          ...ganttData[curDataIndex],
          ...rest,
          isLeaf,
          hideChildren: hideChildren === undefined ? (!isLeaf ? !prevDataGroup[key]?.length : undefined) : hideChildren,
          id: key,
          name: title,
          start: start && new Date(start),
          end: end && new Date(end),
          type: !isLeaf ? 'project' : 'task',
        });
      }
    });
  }
  return ganttData;
};
