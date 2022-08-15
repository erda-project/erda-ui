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

export const ApiMap = {
  sortList: {
    getFetchObj: ({ sortTab, terminusKey }: { sortTab: string; terminusKey: string }) => {
      const fetchMap = {
        time: {
          group: 'req_path',
          expr: 'avg',
          field: 'tt::field',
          extendHandler: { unit: 'ms' },
        },
        cpm: {
          group: 'req_path',
          expr: 'count',
          field: 'tt::field',
        },
      };
      const { group, expr, field } = fetchMap[sortTab] || {};
      const postData = {
        from: ['ta_timing'],
        select: [
          {
            expr: `${group}::tag`,
            alias: 'type',
          },
          {
            expr: `${expr}(${field})`,
            alias: 'value',
          },
        ],
        where: [`tk::tag='${terminusKey}'`, `${field} > 0`],
        limit: 20,
        groupby: [`${group}::tag`],
        orderby: [
          {
            expr: `${expr}(${field}) DESC`,
          },
        ],
      };
      return { postData, extendHandler: fetchMap[sortTab]?.extendHandler || {} };
    },
    dataHandler: (res: { data: Array<{ type: string; value: string }> }, rest: Obj) => {
      const unit = rest?.extendHandler?.unit;
      return { list: (res?.data || []).map((item) => ({ name: item.type, value: item.value, unit })) };
    },
  },
};
