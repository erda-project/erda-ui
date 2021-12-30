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

import { enhanceMock } from 'config-page/mock/crud.mock';

const mockData = {
  scenario: {
    scenarioKey: 'chart', // 后端定义
    scenarioType: 'chart', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['grids', 'content'],
        grids: ['rps', 'avgDuration'],
        content: {
          slot: 'head',
          table: 'table',
        },
        head: {
          left: 'tableFilter',
        },
      },
    },
    components: {
      page: { type: 'Container' },
      grids: {
        type: 'Grid',
      },
      content: {
        type: 'ComposeTable',
      },
      head: {
        type: 'LRContainer',
      },
      tableFilter: {
        type: 'ContractiveFilter',
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
        props: {
          delay: 1000,
        },
        state: {
          conditions: [
            {
              emptyText: '全部',
              fixed: true,
              key: 'title',
              placeholder: '搜索项目名称',
              showIndex: 1,
              type: 'input',
            },
          ],
        },
      },
      rps: {
        type: 'LineGraph',
        name: 'linegraph',
        props: null,
        state: {},
        data: {
          dimensions: ['Dimension', 'Dimension2'],
          inverse: false,
          title: 'line graph demo',
          xAxis: {
            inverse: false,
            values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
          yAxis: [
            {
              dimension: 'Dimension2',
              inverse: false,
              values: [700000, 600000, 500000, 400000, 3, 2, 1],
            },
            {
              dimension: 'Dimension',
              inverse: false,
              values: [1, 200000, 3, 400000, 5, 6, 700000],
            },
          ],
        },
        operations: {},
        options: {
          visible: true,
          asyncAtInit: false,
          flatMeta: false,
          removeMetaAfterFlat: false,
        },
        version: '',
      },
      avgDuration: {
        type: 'LineGraph',
        name: 'linegraph',
        props: null,
        state: {},
        data: {
          dimensions: ['Dimension', 'Dimension2'],
          inverse: false,
          title: 'line graph demo',
          xAxis: {
            inverse: false,
            values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
          yAxis: [
            {
              dimension: 'Dimension2',
              inverse: false,
              values: [7, 6, 5, 4, 3, 2, 1],
            },
            {
              dimension: 'Dimension',
              inverse: false,
              values: [1, 2, 3, 4, 5, 6, 7],
            },
          ],
        },
        operations: {},
        options: {
          visible: true,
          asyncAtInit: false,
          flatMeta: false,
          removeMetaAfterFlat: false,
        },
        version: '',
      },
      table: {
        type: 'Table',
        name: 'table',
        props: null,
        state: {},
        data: {
          operations: {
            changePage: {
              reload: true,
            },
            changeSort: {
              reload: true,
            },
          },
          table: {
            columns: {
              columnsMap: {
                name: {
                  title: '接口名称',
                },
                callTimes: {
                  title: '调用次数',
                  sorter: true,
                },
                errorTimes: {
                  title: '错误次数',
                  sorter: true,
                },
                slowCallTimes: {
                  title: '慢调用次数',
                  sorter: true,
                },
                averageDelay: {
                  title: '平均延迟',
                  sorter: true,
                },
              },
              orders: ['name', 'callTimes', 'errorTimes', 'slowCallTimes', 'averageDelay'],
            },
            pageNo: 1,
            pageSize: 10,
            total: 99999,
            rows: [
              {
                id: 1,
                cellsMap: {
                  name: {
                    data: {
                      text: 'apm-demo-ui',
                    },
                    type: 'text',
                  },
                  callTimes: {
                    data: {
                      text: 22,
                    },
                    type: 'text',
                  },
                  errorTimes: {
                    data: {
                      text: 12,
                    },
                    type: 'text',
                  },
                  slowCallTimes: {
                    data: {
                      text: 44,
                    },
                    type: 'text',
                  },
                  averageDelay: {
                    data: {
                      text: 1111,
                    },
                    type: 'text',
                  },
                },
              },
              {
                id: 2,
                cellsMap: {
                  name: {
                    data: {
                      text: 'apm-demo-api',
                    },
                    type: 'text',
                  },
                  callTimes: {
                    data: {
                      text: 22,
                    },
                    type: 'text',
                  },
                  errorTimes: {
                    data: {
                      text: 12,
                    },
                    type: 'text',
                  },
                  slowCallTimes: {
                    data: {
                      text: 44,
                    },
                    type: 'text',
                  },
                  averageDelay: {
                    data: {
                      text: 1111,
                    },
                    type: 'text',
                  },
                },
              },
            ],
          },
        },
        operations: {},
        version: '2',
      },
    },
  },
};
export const useMock = (payload: Obj) => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.resolve();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(enhanceMock(mockData, payload));
      }, 200);
    });
  }
};
