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

import { mkDurationStr } from 'trace-insight/common/utils/traceSummary';

export function listToTree(arr: any[] = []) {
  const list = arr.map((x) => ({ ...x, children: [] })).sort((a, b) => a.startTime - b.startTime);
  const treeMap = {};
  const roots = [];
  const existIds = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    treeMap[node?.id] = i;
    existIds.push(node?.id);
    min = Math.min(min, node?.startTime);
    max = Math.max(max, node?.endTime);
  }

  for (let i = 0; i < list.length; i += 1) {
    const node = list[i];
    const parentSpanId = node?.parentSpanId;
    if (parentSpanId !== '' && existIds.includes(parentSpanId)) {
      list[treeMap[parentSpanId]].children.push(node);
    } else {
      roots.push(node);
    }
  }

  return { roots, min, max };
}

export const displayTimeString = (time: number) => {
  return time && time !== -Infinity ? mkDurationStr(time / 1000) : 0;
};
