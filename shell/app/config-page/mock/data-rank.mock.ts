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
          dimensions: ['Evaporation', 'Precipitation', 'Temperature'],
          inverse: false,
          series: [
            {
              data: [2, 4.9, 7, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20, 6.4, 3.3],
              dimension: 'Evaporation',
              name: 'Evaporation',
              type: 'bar',
            },
            {
              data: [2.6, 5.9, 9, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6, 2.3],
              dimension: 'Precipitation',
              name: 'Precipitation',
              type: 'bar',
            },
            {
              data: [2, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23, 16.5, 12, 118],
              dimension: 'Temperature',
              name: 'Temperature',
              type: 'line',
            },
          ],
          title: '柱状图 📊 DEMO',
          xAxis: [
            {
              data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              structure: {
                enable: false,
                precision: '',
                type: 'string',
              },
              type: 'category',
            },
          ],
          yAxis: [
            {
              dimensions: ['Evaporation', 'Precipitation', 'Temperature'],
              name: 'Evaporation',
              position: 'left',
              structure: {
                enable: true,
                precision: 'ml',
                type: 'string',
              },
              type: 'value',
            },
          ],
        },
      },
    },
  },
};
