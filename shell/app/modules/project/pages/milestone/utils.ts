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

import moment from 'moment';

// 获得某天开始持续n天，每天的moment对象
export function getDaysMomentFrom(fisrtDay: moment, daysNum: number) {
  return Array.from(new Array(daysNum).keys()).map((v) => moment(fisrtDay).add(v, 'days'));
}

export function sortByStartDate(list: ISSUE.Task[]) {
  return [...list].sort(
    (a, b) => moment(a.planStartedAt || '2000-01-01').valueOf() - moment(b.planFinishedAt || '2000-01-01').valueOf(),
  );
}

export function deduplicate(list) {
  return Array.from(new Set(list));
}
