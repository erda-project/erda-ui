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

export const enhanceMock = (data: any, payload: any) => {
  console.log('------', payload);
  if (payload?.event?.operation === 'ssa') {
    return data;
  }

  return data;
};
const currentDate = new Date();
const getDate = (day: number) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime();

const makeData = (num: number) => {
  return new Array(num).fill('').map((_, idx) => ({
    key: `1-${idx + 1}`,
    title: `T1-${idx + 1}测试测试测试测试测试测试测试测试测试测试测试`,
    start: getDate(1),
    end: getDate(5),
    isLeaf: true,
    extra: {
      type: 'task',
      user: '张三',
      status: { text: '进行中', status: 'processing' },
    },
  }));
};

export const mockData = {
  scenario: {
    scenarioKey: 'table-demo',
    scenarioType: 'table-demo',
  },
  protocol: {
    version: '',
    scenario: 'table-demo',
    state: {
      _error_: null,
    },
    hierarchy: {
      root: 'page',
      structure: {
        page: ['table'],
      },
    },
    components: {
      page: {
        type: 'Container',
        name: 'page',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
        version: '',
      },
      table: {
        type: 'Table',
        name: 'table',
        props: null,
        state: {},
        data: {
          operations: {
            batchRowsHandle: {
              serverData: {
                options: [
                  {
                    allowedRowIDs: ['row1'],
                    id: 'delete',
                    text: '删除',
                  },
                  {
                    allowedRowIDs: ['row2'],
                    id: 'start',
                    text: '启动',
                  },
                ],
              },
              // text: '批量操作',
            },
            changePage: {
              serverData: {},
            },
            changeSort: {},
          },
          table: {
            columns: {
              columnsMap: {
                assignee: {
                  title: '处理人',
                },
                finishedAt: {
                  title: '截止日期',
                },
                priority: {
                  title: '优先级',

                  sorter: true,
                },
                state: {
                  title: '状态',
                },
                mergedTitle: {
                  title: '合并单元',
                },
              },
              merges: {
                mergedTitle: {
                  orders: ['icon', 'title', 'labels'],
                },
              },
              orders: ['mergedTitle', 'priority', 'state', 'assignee', 'finishedAt'],
            },
            pageNo: 1,
            pageSize: 10,
            rows: [
              {
                cellsMap: {
                  assignee: {
                    data: {
                      operations: {
                        userSelector: {},
                      },
                      scope: 'project',
                      scopeID: '1000300',
                      selectedUserIDs: ['92'],
                    },
                    type: 'userSelector',
                  },
                  finishedAt: {
                    data: {
                      text: '2021-12-29',
                    },
                    type: 'text',
                  },
                  icon: {
                    data: {
                      type: 'ISSUE_ICON.issue.TASK',
                    },
                    type: 'icon',
                  },
                  labels: {
                    data: {
                      labels: [
                        {
                          id: 'label-id-1',
                          title: 'area/监控',
                        },
                        {
                          color: 4,
                          id: 'label-id-2',
                          title: 'team/前端',
                        },
                      ],
                    },
                    type: 'labels',
                  },
                  priority: {
                    data: {
                      menus: [
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.URGENT',
                          },
                          id: 'urgent',
                          text: '紧急',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.HIGH',
                          },
                          id: 'high',
                          text: '高',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.NORMAL',
                          },
                          id: 'normal',
                          selected: true,
                          text: '中',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.LOW',
                          },
                          id: 'low',
                          text: '低',
                        },
                      ],
                      operations: {
                        dropDownMenuChange: {},
                      },
                    },
                    type: 'dropDownMenu',
                  },
                  state: {
                    data: {
                      menus: [
                        {
                          disabled: true,
                          hidden: true,
                          id: 'state-id-for-open',
                          text: '待处理',
                          tip: '无法转移',
                        },
                        {
                          id: 'state-id-for-working',
                          selected: true,
                          text: '进行中',
                        },
                        {
                          id: 'state-id-for-done',
                          text: '已完成',
                        },
                        {
                          id: 'state-id-for-abandoned',
                          text: '已作废',
                        },
                      ],
                      operations: {
                        dropDownMenuChange: {},
                      },
                    },
                    type: 'dropDownMenu',
                  },
                  title: {
                    data: {
                      text: '【服务监控】增加链路查询页面',
                    },
                    type: 'text',
                  },
                },
                id: 'row1',
                operations: {
                  rowAdd: {},
                  rowDelete: {},
                  rowEdit: {},
                  rowSelect: {},
                },
                selectable: true,
              },
              {
                cellsMap: {
                  assignee: {
                    data: {
                      operations: {
                        userSelector: {},
                      },
                      scope: 'project',
                      scopeID: '1000300',
                      selectedUserIDs: ['92'],
                    },
                    type: 'userSelector',
                  },
                  finishedAt: {
                    data: {
                      text: '2021-12-29',
                    },
                    type: 'text',
                  },
                  icon: {
                    data: {
                      type: 'ISSUE_ICON.issue.TASK',
                    },
                    type: 'icon',
                  },
                  labels: {
                    data: {
                      labels: [
                        {
                          id: 'label-id-1',
                          title: 'area/监控',
                        },
                        {
                          color: 4,
                          id: 'label-id-2',
                          title: 'team/前端',
                        },
                      ],
                    },
                    type: 'labels',
                  },
                  priority: {
                    data: {
                      menus: [
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.URGENT',
                          },
                          id: 'urgent',
                          text: '紧急',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.HIGH',
                          },
                          id: 'high',
                          text: '高',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.NORMAL',
                          },
                          id: 'normal',
                          selected: true,
                          text: '中',
                        },
                        {
                          icon: {
                            type: 'ISSUE_ICON.priority.LOW',
                          },
                          id: 'low',
                          text: '低',
                        },
                      ],
                      operations: {
                        dropDownMenuChange: {},
                      },
                    },
                    type: 'dropDownMenu',
                  },
                  state: {
                    data: {
                      menus: [
                        {
                          disabled: true,
                          hidden: true,
                          id: 'state-id-for-open',
                          text: '待处理',
                          tip: '无法转移',
                        },
                        {
                          id: 'state-id-for-working',
                          selected: true,
                          text: '进行中',
                        },
                        {
                          id: 'state-id-for-done',
                          text: '已完成',
                        },
                        {
                          id: 'state-id-for-abandoned',
                          text: '已作废',
                        },
                      ],
                      operations: {
                        dropDownMenuChange: {},
                      },
                    },
                    type: 'dropDownMenu',
                  },
                  title: {
                    data: {
                      text: '【服务监控】增加链路查询页面',
                    },
                    type: 'text',
                  },
                },
                id: 'row2',
                operations: {
                  rowAdd: {},
                  rowDelete: {},
                  rowEdit: {},
                  rowSelect: {},
                },
                selectable: true,
              },
            ],
            total: 1,
          },
        },
        operations: {},
        version: '2',
      },
    },
    rendering: {},
    options: null,
  },
};
