export const enhanceMock = (data, payload) => {
  console.log('------', payload);
  return data;
};
export const mockData11 = {
  scenario: {
    scenarioKey: 'issue-kanban',
    scenarioType: 'issue-kanban',
  },
  protocol: {
    hierarchy: {
      root: 'issueManage',
      structure: {
        content: ['toolbar', 'issueKanbanV2'],

        toolbar: {
          left: 'inputFilter',
          right: 'issueOperations',
        },
        issueManage: ['topHead', 'issueTypeSelect', 'content'],
        issueOperations: ['issueFilter', 'issueExport', 'issueImport'],
        topHead: ['issueAddButton'],
      },
    },
    components: {
      content: {
        type: 'Container',
        props: { whiteBg: true },
      },
      issueFilter: {
        type: 'ConfigurableFilter',
        props: {
          processField: (field) => field,
        },
        data: {
          conditions: [
            {
              key: 'iterationIDs',
              type: 'select',
              label: '迭代',
              options: [
                {
                  label: '1.2',
                  value: 708,
                },
                {
                  label: '1.1',
                  value: 687,
                },
              ],
              placeholder: '选择迭代',
            },
            {
              label: '状态',
              options: [
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21005,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21006,
                      status: 'processing',
                    },
                    {
                      label: '已完成',
                      value: 21007,
                      status: 'success',
                    },
                  ],
                  label: '任务',
                  value: 'TASK',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21011,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21012,
                      status: 'processing',
                    },
                    {
                      label: '无需修复',
                      value: 21013,
                      status: 'default',
                    },
                    {
                      label: '重复提交',
                      value: 21014,
                      status: 'default',
                    },
                    {
                      label: '已解决',
                      value: 21015,
                      status: 'success',
                    },
                    {
                      label: '重新打开',
                      value: 21016,
                    },
                    {
                      label: '已关闭',
                      value: 21017,
                      status: 'success',
                    },
                  ],
                  label: '缺陷',
                  value: 'BUG',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21001,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21002,
                      status: 'processing',
                    },
                    {
                      label: '测试中',
                      value: 21003,
                      status: 'processing',
                    },
                    {
                      label: '已完成',
                      value: 21004,
                      status: 'success',
                    },
                  ],
                  label: '需求',
                  value: 'REQUIREMENT',
                },
              ],
              type: 'select',
              key: 'states',
            },
            {
              key: 'labelIDs',
              label: '标签',
              options: [
                {
                  label: 'cba',
                  value: 50,
                },
                {
                  label: 'abc',
                  value: 49,
                },
              ],
              placeholder: '请选择标签',
              type: 'select',
            },
            {
              type: 'select',
              key: 'priorities',
              label: '优先级',
              options: [
                {
                  label: '紧急',
                  value: 'URGENT',
                },
                {
                  value: 'HIGH',
                  label: '高',
                },
                {
                  label: '中',
                  value: 'NORMAL',
                },
                {
                  label: '低',
                  value: 'LOW',
                },
              ],
              placeholder: '选择优先级',
            },
            {
              label: '严重程度',
              options: [
                {
                  label: '致命',
                  value: 'FATAL',
                },
                {
                  value: 'SERIOUS',
                  label: '严重',
                },
                {
                  label: '一般',
                  value: 'NORMAL',
                },
                {
                  label: '轻微',
                  value: 'SLIGHT',
                },
                {
                  label: '建议',
                  value: 'SUGGEST',
                },
              ],
              key: 'severities',
              placeholder: '选择严重程度',
              type: 'select',
            },
            {
              key: 'creatorIDs',
              label: '创建人',
              options: [
                {
                  label: 'test',
                  value: '12022',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              type: 'select',
            },
            {
              key: 'assigneeIDs',
              options: [
                {
                  value: '12022',
                  label: 'test',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              type: 'select',
              label: '处理人',
            },
            {
              type: 'dateRange',
              key: 'createdAtStartEnd',
              label: '创建日期',
            },
            {
              type: 'dateRange',
              key: 'finishedAtStartEnd',
              label: '截止日期',
            },
          ],
          filterSet: [
            { id: 1, values: {}, label: '全部打开', isDefault: true },
            { id: 2, values: { states: [1, 2] }, label: '自定义筛选器', isDefault: false },
          ],
        },
        state: {
          values: {
            priorities: ['HIGH'],
          },
          filterSet: '1',
        },
        operations: {
          deleteFilter: { clientData: { dataRef: { id: 1, values: {}, label: '全部打开', isDefault: true } } },
          filter: { clientData: { dataRef: { values: {} } } },
          saveFilter: { clientData: { dataRef: { values: {}, label: 'xx' } } },
        },
      },
      issueTypeSelect: {
        type: 'Radio',
        props: {
          buttonStyle: 'solid',
          options: [
            {
              key: 'requirement',
              text: '需求(32)',
            },
            {
              key: 'task',
              text: '任务(22)',
            },
            {
              key: 'bug',
              text: '缺陷(12)',
            },
          ],
          radioType: 'button',
        },
        state: {
          value: 'requirement',
        },
        data: {
          options: [
            {
              key: 'requirement',
              text: '需求(32)',
            },
            {
              key: 'task',
              text: '任务(22)',
            },
            {
              key: 'bug',
              text: '缺陷(12)',
            },
          ],
        },
        operations: {
          onChange: {
            key: 'changeTab',
            reload: true,
          },
        },
      },
      toolbar: {
        type: 'LRContainer',
        name: 'head',
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      issueAddButton: {
        type: 'Button',
        name: 'issueAddButton',
      },
      issueExport: {
        type: 'Button',
        name: 'issueExport',
        props: {
          prefixIcon: 'export',
          size: 'small',
          tooltip: '导出',
        },
        state: {},
        data: {},
        operations: {
          click: {
            confirm: '是否确认导出',
            reload: false,
          },
        },
        options: null,
      },
      inputFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 2000,
        },
        state: {
          conditions: [
            {
              emptyText: 'all',
              fixed: true,
              key: 'title',
              label: 'title',
              placeholder: '按名称搜索',
              quickDelete: {},
              quickSelect: {},
              type: 'input',
            },
          ],
          values: {
            title: '',
          },
        },
        data: {},
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
        options: null,
      },
      issueImport: {
        type: 'Button',
        name: 'issueImport',
        props: {
          prefixIcon: 'import',
          size: 'small',
          tooltip: '导入',
          visible: true,
        },
        state: {},
        data: {},
        operations: {
          click: {
            disabled: false,
            reload: false,
          },
        },
        options: null,
      },
      issueKanbanV2: {
        type: 'IssueKanban',
        state: {},
        data: {
          boards: [
            {
              id: '1',
              pageNo: 1,
              total: 2,
              title: '已完成',
              cards: [
                {
                  id: '1-1',
                  title:
                    'ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1,ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1',
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['2', '3'],
                        },
                      },
                    },
                  },
                },
              ],
            },
            {
              id: '2',
              pageNo: 1,
              title: '进行中',
              total: 1,
              cards: [
                {
                  id: '2-1',
                  title: 'ttt2',
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['1', '3'],
                        },
                      },
                    },
                  },
                },
              ],
            },
            {
              cards: [
                {
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  id: '3-1',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['1', '2'],
                        },
                      },
                    },
                  },
                  title: '任务一',
                },
              ],
              id: '3',
              pageNo: 1,
              title: '待处理',
              total: 1,
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
      },
      issueManage: {
        type: 'Container',
        name: 'issueManage',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      issueOperations: {
        type: 'RowContainer',
        name: 'issueOperations',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
      },

      topHead: {
        type: 'RowContainer',
        name: 'topHead',
        props: {
          isTopHead: true,
        },
        state: {},
        data: {},
        operations: {},
        options: null,
      },
    },
    options: null,
  },
};

export const mockData = {
  scenario: {
    scenarioKey: 'issue-kanban',
    scenarioType: 'issue-kanban',
  },
  protocol: {
    hierarchy: {
      root: 'issueManage',
      structure: {
        content: ['toolbar', 'issueKanbanV2'],
        toolbar: {
          left: 'inputFilter',
          right: 'issueOperations',
        },
        issueManage: ['topHead', 'issueTypeSelect', 'content'],
        issueOperations: ['issueFilter', 'issueExport', 'issueImport'],
        topHead: ['issueAddButton'],
      },
    },
    components: {
      content: {
        type: 'Container',
      },
      issueFilter: {
        type: 'ConfigurableFilter',
        data: {
          conditions: [
            {
              key: 'iterationIDs',
              type: 'select',
              label: '迭代',
              options: [
                {
                  label: '1.2',
                  value: 708,
                },
                {
                  label: '1.1',
                  value: 687,
                },
              ],
              placeholder: '选择迭代',
            },
            {
              label: '状态',
              options: [
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21005,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21006,
                      status: 'processing',
                    },
                    {
                      label: '已完成',
                      value: 21007,
                      status: 'success',
                    },
                  ],
                  label: '任务',
                  value: 'TASK',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21011,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21012,
                      status: 'processing',
                    },
                    {
                      label: '无需修复',
                      value: 21013,
                      status: 'default',
                    },
                    {
                      label: '重复提交',
                      value: 21014,
                      status: 'default',
                    },
                    {
                      label: '已解决',
                      value: 21015,
                      status: 'success',
                    },
                    {
                      label: '重新打开',
                      value: 21016,
                    },
                    {
                      label: '已关闭',
                      value: 21017,
                      status: 'success',
                    },
                  ],
                  label: '缺陷',
                  value: 'BUG',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 21001,
                      status: 'warning',
                    },
                    {
                      label: '进行中',
                      value: 21002,
                      status: 'processing',
                    },
                    {
                      label: '测试中',
                      value: 21003,
                      status: 'processing',
                    },
                    {
                      label: '已完成',
                      value: 21004,
                      status: 'success',
                    },
                  ],
                  label: '需求',
                  value: 'REQUIREMENT',
                },
              ],
              type: 'select',
              key: 'states',
            },
            {
              key: 'labelIDs',
              label: '标签',
              options: [
                {
                  label: 'cba',
                  value: 50,
                },
                {
                  label: 'abc',
                  value: 49,
                },
              ],
              placeholder: '请选择标签',
              type: 'select',
            },
            {
              type: 'select',
              key: 'priorities',
              label: '优先级',
              options: [
                {
                  label: '紧急',
                  value: 'URGENT',
                },
                {
                  value: 'HIGH',
                  label: '高',
                },
                {
                  label: '中',
                  value: 'NORMAL',
                },
                {
                  label: '低',
                  value: 'LOW',
                },
              ],
              placeholder: '选择优先级',
            },
            {
              label: '严重程度',
              options: [
                {
                  label: '致命',
                  value: 'FATAL',
                },
                {
                  value: 'SERIOUS',
                  label: '严重',
                },
                {
                  label: '一般',
                  value: 'NORMAL',
                },
                {
                  label: '轻微',
                  value: 'SLIGHT',
                },
                {
                  label: '建议',
                  value: 'SUGGEST',
                },
              ],
              key: 'severities',
              placeholder: '选择严重程度',
              type: 'select',
            },
            {
              key: 'creatorIDs',
              label: '创建人',
              options: [
                {
                  label: 'test',
                  value: '12022',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              type: 'select',
            },
            {
              key: 'assigneeIDs',
              options: [
                {
                  value: '12022',
                  label: 'test',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              type: 'select',
              label: '处理人',
            },
            {
              type: 'dateRange',
              key: 'createdAtStartEnd',
              label: '创建日期',
            },
            {
              type: 'dateRange',
              key: 'finishedAtStartEnd',
              label: '截止日期',
            },
          ],
          filterSet: [
            { id: 1, values: {}, label: '全部打开', isDefault: true },
            { id: 2, values: { states: [1, 2] }, label: '自定义筛选器', isDefault: false },
          ],
        },
        state: {
          values: {
            priorities: ['HIGH'],
          },
          filterSet: 1,
        },
        operations: {
          deleteFilterSet: { clientData: { dataRef: { id: 1, values: {}, label: '全部打开', isDefault: true } } },
          filter: { clientData: { values: {} } },
          saveFilterSet: { clientData: { values: {}, label: 'xx' } },
        },
      },
      issueTypeSelect: {
        type: 'Radio',
        state: {
          value: 'requirement',
        },
        data: {
          options: [
            {
              key: 'requirement',
              text: '需求(32)',
            },
            {
              key: 'task',
              text: '任务(22)',
            },
            {
              key: 'bug',
              text: '缺陷(12)',
            },
          ],
        },
        operations: {
          onChange: {
            key: 'changeTab',
            reload: true,
          },
        },
      },
      toolbar: {
        type: 'LRContainer',
      },
      issueAddButton: {
        type: 'Button',
      },
      issueExport: {
        type: 'Button',
      },
      inputFilter: {
        type: 'ContractiveFilter',
        state: {
          conditions: [
            {
              emptyText: 'all',
              fixed: true,
              key: 'title',
              label: 'title',
              placeholder: '按名称搜索',
              quickDelete: {},
              quickSelect: {},
              type: 'input',
            },
          ],
          values: {
            title: '',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      issueImport: {
        type: 'Button',
      },
      issueKanbanV2: {
        type: 'IssueKanban',
        state: {},
        data: {
          boards: [
            {
              id: '1',
              pageNo: 1,
              total: 2,
              title: '已完成',
              cards: [
                {
                  id: '1-1',
                  title:
                    'ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1ttt1ttt1ttt1ttt1,ttt1ttt1ttt1,ttt1,ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1ttt1',
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['2', '3'],
                        },
                      },
                    },
                  },
                },
              ],
            },
            {
              id: '2',
              pageNo: 1,
              title: '进行中',
              total: 1,
              cards: [
                {
                  id: '2-1',
                  title: 'ttt2',
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['1', '3'],
                        },
                      },
                    },
                  },
                },
              ],
            },
            {
              cards: [
                {
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  id: '3-1',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedMoveToTargetBoardIDs: ['1', '2'],
                        },
                      },
                    },
                  },
                  title: '任务一',
                },
              ],
              id: '3',
              pageNo: 1,
              title: '待处理',
              total: 1,
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
      },
      issueManage: {
        type: 'Container',
      },
      issueOperations: {
        type: 'RowContainer',
      },

      topHead: {
        type: 'RowContainer',
        name: 'topHead',
      },
    },
  },
};

export const mockData1 = {
  scenario: {
    scenarioKey: 'issue-manage',
    scenarioType: 'issue-manage',
  },
  protocol: {
    version: '',
    scenario: 'issue-manage',
    state: {
      _error_: null,
    },
    hierarchy: {
      root: 'issueManage',
      structure: {
        content: ['issueTable', 'issueKanbanV2', 'issueGantt'],
        head: {
          left: 'issueFilter',
          right: 'issueOperations',
        },
        issueManage: ['topHead', 'head', 'content'],
        issueOperations: ['issueViewGroup', 'issueExport', 'issueImport'],
        topHead: ['issueAddButton'],
      },
    },
    components: {
      content: {
        type: 'Container',
        name: 'content',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      head: {
        type: 'LRContainer',
        name: 'head',
        props: {
          whiteBg: true,
        },
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      issueAddButton: {
        type: 'Button',
        name: 'issueAddButton',
        props: {
          disabled: false,
          menu: null,
          operations: {
            click: {
              key: '',
              reload: false,
            },
          },
          suffixIcon: '',
          text: '新建任务',
          type: 'primary',
        },
        state: {},
        data: {},
        operations: {
          click: {
            disabled: false,
            key: 'createTask',
            reload: false,
          },
        },
        options: null,
      },
      issueExport: {
        type: 'Button',
        name: 'issueExport',
        props: {
          prefixIcon: 'export',
          size: 'small',
          tooltip: '导出',
        },
        state: {},
        data: {},
        operations: {
          click: {
            confirm: '是否确认导出',
            reload: false,
          },
        },
        options: null,
      },
      issueFilter: {
        type: 'ContractiveFilter',
        name: 'issueFilter',
        props: {
          delay: 2000,
        },
        state: {
          conditions: [
            {
              customProps: {
                mode: 'single',
              },
              emptyText: '未选择',
              fixed: true,
              haveFilter: true,
              key: 'filterID',
              label: '我的筛选器',
              placeholder: '选择筛选器',
              quickAdd: {
                operationKey: 'saveFilter',
                placeholder: '请输入名称保存当前筛选',
                show: true,
              },
              quickDelete: {
                operationKey: 'deleteFilter',
              },
              quickSelect: {},
              showIndex: 1,
              split: true,
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              haveFilter: true,
              key: 'iterationIDs',
              label: '迭代',
              options: [
                {
                  label: '迭代1',
                  value: 694,
                },
              ],
              placeholder: '选择迭代',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              showIndex: 2,
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              key: 'title',
              label: '标题',
              placeholder: '请输入标题或ID',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              showIndex: 3,
              type: 'input',
            },
            {
              emptyText: '全部',
              haveFilter: true,
              key: 'labelIDs',
              label: '标签',
              options: [
                {
                  label: '6',
                  value: 44,
                },
                {
                  label: '5',
                  value: 43,
                },
                {
                  label: '4',
                  value: 42,
                },
                {
                  label: 'ERDA',
                  value: 41,
                },
                {
                  label: 'PIPELINE',
                  value: 40,
                },
                {
                  label: 'DOP',
                  value: 39,
                },
              ],
              placeholder: '请选择标签',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'select',
            },
            {
              emptyText: '全部',
              key: 'priorities',
              label: '优先级',
              options: [
                {
                  label: '紧急',
                  value: 'URGENT',
                },
                {
                  label: '高',
                  value: 'HIGH',
                },
                {
                  label: '中',
                  value: 'NORMAL',
                },
                {
                  label: '低',
                  value: 'LOW',
                },
              ],
              placeholder: '选择优先级',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'select',
            },
            {
              emptyText: '全部',
              key: 'severities',
              label: '严重程度',
              options: [
                {
                  label: '致命',
                  value: 'FATAL',
                },
                {
                  label: '严重',
                  value: 'SERIOUS',
                },
                {
                  label: '一般',
                  value: 'NORMAL',
                },
                {
                  label: '轻微',
                  value: 'SLIGHT',
                },
                {
                  label: '建议',
                  value: 'SUGGEST',
                },
              ],
              placeholder: '选择严重程度',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'select',
            },
            {
              emptyText: '全部',
              haveFilter: true,
              key: 'creatorIDs',
              label: '创建人',
              options: [
                {
                  label: 'sfwn',
                  value: '12028',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {
                label: '选择自己',
                operationKey: 'creatorSelectMe',
              },
              type: 'select',
            },
            {
              emptyText: '全部',
              haveFilter: true,
              key: 'assigneeIDs',
              label: '处理人',
              options: [
                {
                  label: 'sfwn',
                  value: '12028',
                },
                {
                  label: 'dice',
                  value: '2',
                },
              ],
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {
                label: '选择自己',
                operationKey: 'assigneeSelectMe',
              },
              type: 'select',
            },
            {
              emptyText: '全部',
              key: 'bugStages',
              label: '任务类型',
              options: [
                {
                  label: '开发',
                  value: '开发',
                },
                {
                  label: '设计',
                  value: '设计',
                },
              ],
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'select',
            },
            {
              customProps: {
                borderTime: true,
              },
              emptyText: '全部',
              key: 'createdAtStartEnd',
              label: '创建日期',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'dateRange',
            },
            {
              customProps: {
                borderTime: true,
              },
              key: 'finishedAtStartEnd',
              label: '截止日期',
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              type: 'dateRange',
            },
          ],
          issueFilter__urlQuery: 'eyJzdGF0ZXMiOls1MjM5LDUyNDBdfQ==',
          issuePagingRequest: {
            IDs: null,
            WithProcessSummary: false,
            appID: null,
            asc: false,
            assignee: null,
            bugStage: null,
            complexity: null,
            creator: null,
            customPanelID: 0,
            endClosedAt: 0,
            endCreatedAt: 0,
            endFinishedAt: 0,
            exceptIDs: null,
            isEmptyPlanFinishedAt: false,
            iterationID: 0,
            iterationIDs: null,
            label: null,
            notIncluded: false,
            onlyIdResult: false,
            orderBy: '',
            orgID: 4,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 62,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [5239, 5240],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['TASK'],
            userID: '12028',
          },
          issueViewGroupChildrenValue: {
            kanban: 'status',
          },
          issueViewGroupValue: 'kanban',
          values: {
            states: [5239, 5240],
          },
        },
        data: {},
        operations: {
          assigneeSelectMe: {
            key: 'assigneeSelectMe',
            reload: true,
          },
          creatorSelectMe: {
            key: 'creatorSelectMe',
            reload: true,
          },
          deleteFilter: {
            fillMeta: 'id',
            key: 'deleteFilter',
            reload: true,
          },
          filter: {
            key: 'filter',
            reload: true,
          },
          ownerSelectMe: {
            key: 'ownerSelectMe',
            reload: true,
          },
          saveFilter: {
            fillMeta: 'name',
            key: 'saveFilter',
            reload: true,
          },
        },
        options: null,
      },
      issueGantt: {
        type: 'Table',
        name: 'issueGantt',
        props: {
          visible: false,
        },
        state: {
          filterConditions: {
            IDs: null,
            WithProcessSummary: false,
            appID: null,
            asc: false,
            assignee: null,
            bugStage: null,
            complexity: null,
            creator: null,
            customPanelID: 0,
            endClosedAt: 0,
            endCreatedAt: 0,
            endFinishedAt: 0,
            exceptIDs: null,
            isEmptyPlanFinishedAt: false,
            iterationID: 0,
            iterationIDs: null,
            label: null,
            notIncluded: false,
            onlyIdResult: false,
            orderBy: '',
            orgID: 4,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 62,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [5239, 5240],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['TASK'],
            userID: '12028',
          },
          issueViewGroupValue: 'kanban',
        },
        data: {},
        operations: {},
        options: null,
      },
      issueImport: {
        type: 'Button',
        name: 'issueImport',
        props: {
          prefixIcon: 'import',
          size: 'small',
          tooltip: '导入',
          visible: true,
        },
        state: {},
        data: {},
        operations: {
          click: {
            disabled: false,
            reload: false,
          },
        },
        options: null,
      },
      issueKanbanV2: {
        type: 'IssueKanban',
        name: 'issueKanbanV2',
        props: {
          visible: true,
        },
        state: {
          filterConditions: {
            IDs: null,
            WithProcessSummary: false,
            appID: null,
            asc: false,
            assignee: null,
            bugStage: null,
            complexity: null,
            creator: null,
            customPanelID: 0,
            endClosedAt: 0,
            endCreatedAt: 0,
            endFinishedAt: 0,
            exceptIDs: null,
            isEmptyPlanFinishedAt: false,
            iterationID: 0,
            iterationIDs: null,
            label: null,
            notIncluded: false,
            onlyIdResult: false,
            orderBy: '',
            orgID: 4,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 62,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [5239, 5240],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['TASK'],
            userID: '12028',
          },
          issueViewGroupChildrenValue: {
            kanban: 'status',
          },
          issueViewGroupValue: 'kanban',
        },
        data: {
          boards: [
            {
              cards: [
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234312',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234311',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234310',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234309',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234308',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234307',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234306',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task4',
                },
                {
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  id: '234305',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task3',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234304',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task2',
                },
                {
                  extra: {
                    priority: 'LOW',
                    type: 'TASK',
                  },
                  id: '234303',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task1',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234302',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234301',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234300',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234299',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234298',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234297',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234296',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task4',
                },
                {
                  extra: {
                    priority: 'HIGH',
                    type: 'TASK',
                  },
                  id: '234295',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task3',
                },
                {
                  extra: {
                    priority: 'NORMAL',
                    type: 'TASK',
                  },
                  id: '234294',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task2',
                },
                {
                  extra: {
                    priority: 'LOW',
                    type: 'TASK',
                  },
                  id: '234293',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5240'],
                        },
                      },
                    },
                  },
                  title: 'task1',
                },
              ],
              id: '5239',
              operations: {
                boardDelete: {},
                boardLoadMore: {},
                boardUpdate: {},
              },
              pageNo: 1,
              pageSize: 20,
              title: '待处理',
              total: 442,
            },
            {
              cards: [
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '233751',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {
                        extra: {
                          allowedTargetBoardIDs: ['5241'],
                        },
                      },
                    },
                  },
                  title: 'task5',
                },
              ],
              id: '5240',
              operations: {
                boardDelete: {},
                boardLoadMore: {},
                boardUpdate: {},
              },
              pageNo: 1,
              pageSize: 20,
              title: '进行中',
              total: 1,
            },
            {
              cards: [
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234351',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234350',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234349',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234348',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234347',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234346',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234345',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234344',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234343',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234342',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234341',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234340',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234332',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234331',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234330',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234329',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234328',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234327',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234326',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
                {
                  extra: {
                    priority: 'URGENT',
                    type: 'TASK',
                  },
                  id: '234325',
                  operations: {
                    cardMoveTo: {
                      async: true,
                      serverData: {},
                    },
                  },
                  title: 'task5',
                },
              ],
              id: '5241',
              operations: {
                boardDelete: {},
                boardLoadMore: {},
                boardUpdate: {},
              },
              pageNo: 1,
              pageSize: 20,
              title: '已完成',
              total: 32,
            },
          ],
          operations: {
            boardCreate: {
              confirm: '创建看板',
            },
          },
        },
        operations: {},
        options: {
          visible: true,
          asyncAtInit: false,
          flatMeta: false,
          removeMetaAfterFlat: false,
        },
      },
      issueManage: {
        type: 'Container',
        name: 'issueManage',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      issueOperations: {
        type: 'RowContainer',
        name: 'issueOperations',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
      },
      issueTable: {
        type: 'Table',
        name: 'issueTable',
        props: {
          visible: false,
        },
        state: {
          filterConditions: {
            IDs: null,
            WithProcessSummary: false,
            appID: null,
            asc: false,
            assignee: null,
            bugStage: null,
            complexity: null,
            creator: null,
            customPanelID: 0,
            endClosedAt: 0,
            endCreatedAt: 0,
            endFinishedAt: 0,
            exceptIDs: null,
            isEmptyPlanFinishedAt: false,
            iterationID: 0,
            iterationIDs: null,
            label: null,
            notIncluded: false,
            onlyIdResult: false,
            orderBy: '',
            orgID: 4,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 62,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [5239, 5240],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['TASK'],
            userID: '12028',
          },
          issueViewGroupValue: 'kanban',
        },
        data: {},
        operations: {},
        options: null,
      },
      issueViewGroup: {
        type: 'Radio',
        name: 'issueViewGroup',
        props: {
          buttonStyle: 'solid',
          options: [
            {
              key: 'table',
              prefixIcon: 'default-list',
              text: '列表',
              tooltip: '',
            },
            {
              children: [
                {
                  key: 'priority',
                  text: '优先级',
                },
                {
                  key: 'deadline',
                  text: '截止日期',
                },
                {
                  key: 'custom',
                  text: '自定义',
                },
                {
                  key: 'status',
                  text: '状态',
                },
              ],
              key: 'kanban',
              prefixIcon: 'data-matrix',
              suffixIcon: 'di',
              text: '看板',
              tooltip: '看板视图',
            },
          ],
          radioType: 'button',
          size: 'small',
        },
        state: {
          childrenValue: {
            kanban: 'status',
          },
          issueViewGroup__urlQuery: 'eyJ2YWx1ZSI6ImthbmJhbiIsImNoaWxkcmVuVmFsdWUiOnsia2FuYmFuIjoic3RhdHVzIn19',
          value: 'kanban',
        },
        data: {},
        operations: {
          onChange: {
            key: 'changeViewType',
            reload: true,
          },
        },
        options: null,
      },
      topHead: {
        type: 'RowContainer',
        name: 'topHead',
        props: {
          isTopHead: true,
        },
        state: {},
        data: {},
        operations: {},
        options: null,
      },
    },
    options: null,
  },
};
