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
      root: 'BubbleGraph',
      structure: {
        myPage: ['BubbleGraph'],
      },
    },
    components: {
      myPage: { type: 'Container' },
      BubbleGraph: {
        type: 'BubbleGraph',
        data: {
          list: [
            {
              dimension: 'dimension A',
              group: 'group A',
              size: {
                value: 10,
              },
              x: {
                unit: '',
                value: 100,
              },
              y: {
                unit: '',
                value: 100,
              },
            },
            {
              dimension: 'dimension A',
              group: 'group B',
              size: {
                value: 15,
              },
              x: {
                unit: '',
                value: 150,
              },
              y: {
                unit: '',
                value: 200,
              },
            },
            {
              dimension: 'dimension B',
              group: 'group A',
              size: {
                value: 25,
              },
              x: {
                unit: '',
                value: 400,
              },
              y: {
                unit: '',
                value: 300,
              },
            },
            {
              dimension: 'dimension B',
              group: 'group B',
              size: {
                value: 30,
              },
              x: {
                unit: '',
                value: 1,
              },
              y: {
                unit: '',
                value: 400,
              },
            },
            {
              dimension: 'dimension B',
              group: 'group B',
              size: {
                value: 100,
              },
              x: {
                unit: '',
                value: 100,
              },
              y: {
                unit: '',
                value: 400,
              },
            },
          ],
        },
      },
    },
  },
};
