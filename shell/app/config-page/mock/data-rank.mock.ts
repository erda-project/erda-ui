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

export const enhanceMock = (mockData: any, payload: any) => {
  if (!payload.hierarchy) {
    return mockData;
  }
  return payload;
};

export const mockData = {
  scenario: {
    scenarioKey: 'project-list-my', // 后端定义
    scenarioType: 'project-list-my', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'myPage',
      structure: {
        myPage: ['graph'],
      },
    },
    components: {
      myPage: {
        type: 'Container',
        props: {
          className: 'bg-white',
        },
      },
      graph: {
        type: 'ComplexGraph',
        data: {
          dimensions: ['Fatal1', 'Fatal'],
          inverse: false,
          series: [
            {
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              dimension: 'Fatal1',
              name: '',
              type: 'line',
            },
            {
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 78, 148, 140],
              dimension: 'Fatal',
              name: '',
              type: 'line',
            },
          ],
          title: 'alertEventGroupByLevelCountLine',
          xAxis: [
            {
              data: [
                1644384894333, 1644385014333, 1644385134333, 1644385254333, 1644385374333,
                1644385494333, 1644385614333, 1644385734333, 1644385854333, 1644385974333,
                1644386094333, 1644386214333, 1644386334333, 1644386454333, 1644386574333,
                1644386694333, 1644386814333, 1644386934333, 1644387054333, 1644387174333,
                1644387294333, 1644387414333, 1644387534333, 1644387654333, 1644387774333,
                1644387894333, 1644388014333, 1644388134333, 1644388254333, 1644388374333,
              ],
              structure: {
                enable: true,
                precision: 'ms',
                type: 'timestamp',
              },
              type: 'category',
            },
          ],
          yAxis: [
            {
              dimensions: ['Fatal1', 'Fatal'],
              structure: {
                enable: true,
                precision: '',
                type: 'number',
              },
              type: 'value',
            },
          ],
        },
      },
    },
  },
};
