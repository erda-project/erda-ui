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

import { cloneDeep } from 'lodash';

export const enhanceMock = (data: any, payload: any) => {
  console.log('------', payload);
  if (payload?.event?.operation === 'update') {
    const _data = cloneDeep(data);
    _data.protocol.components.gantt.data = {
      updateList: [
        // {
        //   start: getDate(1),
        //   end: getDate(10),
        //   title: 'R1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
        //   key: 'R1',
        //   isLeaf: false,
        //   extra: {
        //     type: 'requirement',
        //     user: '张三',
        //     status: { text: '进行中', status: 'processing' },
        //   },
        // },
        {
          key: payload.event.operationData.meta.nodes.key,
          title: `T${payload.event.operationData.meta.nodes.key}测试测试测试测试测试测试测试测试测试测试测试`,
          start: payload.event.operationData.meta.nodes.start,
          end: payload.event.operationData.meta.nodes.end,
          isLeaf: true,
          extra: {
            type: 'task',
            user: '张三',
            status: { text: '进行中', status: 'processing' },
          },
        },
      ],
      expandList: null,
    };
    return _data;
  }
  if (payload.event?.operation === 'expandNode') {
    const _data = cloneDeep(data);
    _data.protocol.components.gantt.data = {
      expandList: {
        R2: [
          {
            id: '2-1',
            name: 'T1-1测试测试测试测试测试测试测试测试测试测试测试',
            start: getDate(1),
            end: getDate(5),
            isLeaf: true,
            extra: {
              type: 'task',
              user: '张三',
              status: { text: '进行中', status: 'processing' },
            },
          },
        ],
      },
    };
    return _data;
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

export const mockData12 = {
  scenario: {
    scenarioKey: 'issue-manage',
    scenarioType: '',
  },
  protocol: {
    version: '',
    scenario: 'issue-manage',
    state: {
      IssuePagingRequest: {
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
        projectID: 75,
        projectIDs: null,
        relatedIssueId: null,
        requirementID: null,
        severity: null,
        source: '',
        startClosedAt: 0,
        startCreatedAt: 0,
        startFinishedAt: 0,
        state: [5539, 5540],
        stateBelongs: null,
        taskType: null,
        title: '',
        type: ['TASK'],
        userID: '12028',
      },
      _error_: null,
      _userIDs_: ['12028'],
    },
    hierarchy: {
      root: 'issueManage',
      structure: {
        content: ['issueTable'],
        head: {
          left: 'issueFilter',
          right: 'issueOperations',
        },
        issueManage: ['topHead', 'head', 'content'],
        issueOperations: ['issueExport', 'issueImport'],
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
                  label: 'PIPELINE',
                  value: 48,
                },
                {
                  label: 'DOP',
                  value: 47,
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
          issueFilter__urlQuery: 'eyJzdGF0ZXMiOls1NTM5LDU1NDBdfQ==',
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
            orgID: 0,
            owner: null,
            pageNo: 0,
            pageSize: 0,
            priority: null,
            projectID: 0,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: null,
            stateBelongs: null,
            taskType: null,
            title: '',
            type: null,
            userID: '',
          },
          values: {
            states: [5539, 5540],
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
          columns: [
            {
              dataIndex: 'id',
              hidden: true,
              title: 'ID',
            },
            {
              dataIndex: 'name',
              title: '标题',
            },
            {
              dataIndex: 'complexity',
              hidden: true,
              title: '复杂度',
            },
            {
              dataIndex: 'priority',
              title: '优先级',
            },
            {
              dataIndex: 'state',
              title: '状态',
            },
            {
              dataIndex: 'assignee',
              title: '处理人',
            },
            {
              dataIndex: 'deadline',
              title: '截止日期',
            },
          ],
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',
          visible: true,
        },
        state: {
          issueTable__urlQuery: 'eyJwYWdlTm8iOjEsICJwYWdlU2l6ZSI6MTB9',
          pageNo: 1,
          pageSize: 10,
          total: 1,
        },
        data: {
          list: [
            {
              assignee: {
                disabled: false,
                disabledTip: '',
                operations: {
                  onChange: {
                    disabled: false,
                    fillMeta: 'assignee',
                    key: 'updateAssignee',
                    meta: {
                      assignee: '',
                      id: '233904',
                    },
                    reload: true,
                    text: 'sfwn',
                  },
                },
                renderType: 'memberSelector',
                scope: 'project',
                value: '12028',
              },
              closedAt: {
                noBorder: true,
                renderType: 'datePicker',
                value: '',
              },
              complexity: {
                prefixIcon: 'ISSUE_ICON.complexity.HARD',
                renderType: 'textWithIcon',
                value: '复杂',
              },
              deadline: {
                disabledAfter: '',
                disabledBefore: '',
                noBorder: true,
                operations: {
                  onChange: {
                    disabled: false,
                    fillMeta: 'deadlineValue',
                    key: 'changeDeadline',
                    meta: {
                      deadlineValue: '',
                      id: '233904',
                    },
                    reload: true,
                  },
                },
                renderType: 'datePicker',
                value: '',
              },
              id: '233904',
              iterationID: -1,
              name: {
                extraContent: {
                  renderType: 'tags',
                  value: [
                    {
                      color: 'blue',
                      label: 'DOP',
                    },
                    {
                      color: 'water-blue',
                      label: 'PIPELINE',
                    },
                  ],
                },
                prefixIcon: 'ISSUE_ICON.issue.TASK',
                renderType: 'doubleRowWithIcon',
                value: '任务一',
              },
              priority: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changePriorityToaURGENT: {
                    key: 'changePriorityToaURGENT',
                    meta: {
                      id: '233904',
                      priority: 'URGENT',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.URGENT',
                    reload: true,
                    text: '紧急',
                  },
                  changePriorityTobHIGH: {
                    key: 'changePriorityTobHIGH',
                    meta: {
                      id: '233904',
                      priority: 'HIGH',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.HIGH',
                    reload: true,
                    text: '高',
                  },
                  changePriorityTocNORMAL: {
                    key: 'changePriorityTocNORMAL',
                    meta: {
                      id: '233904',
                      priority: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.NORMAL',
                    reload: true,
                    text: '中',
                  },
                  changePriorityTodLOW: {
                    key: 'changePriorityTodLOW',
                    meta: {
                      id: '233904',
                      priority: 'LOW',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.LOW',
                    reload: true,
                    text: '低',
                  },
                },
                prefixIcon: 'ISSUE_ICON.priority.HIGH',
                renderType: 'operationsDropdownMenu',
                value: '高',
              },
              progress: {
                renderType: 'progress',
                value: '',
              },
              severity: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changeSeverityToaFATAL: {
                    key: 'changeSeverityToaFATAL',
                    meta: {
                      id: '233904',
                      severity: 'FATAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.FATAL',
                    reload: true,
                    text: '致命',
                  },
                  changeSeverityTobSERIOUS: {
                    key: 'changeSeverityTobSERIOUS',
                    meta: {
                      id: '233904',
                      severity: 'SERIOUS',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SERIOUS',
                    reload: true,
                    text: '严重',
                  },
                  changeSeverityTocNORMAL: {
                    key: 'changeSeverityTocNORMAL',
                    meta: {
                      id: '233904',
                      severity: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                    reload: true,
                    text: '一般',
                  },
                  changeSeverityTodSLIGHT: {
                    key: 'changeSeverityTodSLIGHT',
                    meta: {
                      id: '233904',
                      severity: 'SLIGHT',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SLIGHT',
                    reload: true,
                    text: '轻微',
                  },
                  changeSeverityToeSUGGEST: {
                    key: 'changeSeverityToeSUGGEST',
                    meta: {
                      id: '233904',
                      severity: 'SUGGEST',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SUGGEST',
                    reload: true,
                    text: '建议',
                  },
                },
                prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                renderType: 'operationsDropdownMenu',
                value: '一般',
              },
              state: {
                disabled: false,
                disabledTip: '',
                menus: [
                  {
                    disabled: true,
                    disabledTip: '无法转移',
                    hidden: true,
                    id: '待处理',
                    key: 'changeStateTo0待处理',
                    meta: {
                      id: '233904',
                      state: '5539',
                    },
                    reload: true,
                    status: 'warning',
                    text: '待处理',
                  },
                  {
                    disabled: false,
                    disabledTip: '',
                    id: '进行中',
                    key: 'changeStateTo1进行中',
                    meta: {
                      id: '233904',
                      state: '5540',
                    },
                    reload: true,
                    status: 'processing',
                    text: '进行中',
                  },
                  {
                    disabled: true,
                    disabledTip: '无法转移',
                    hidden: true,
                    id: '已完成',
                    key: 'changeStateTo2已完成',
                    meta: {
                      id: '233904',
                      state: '5541',
                    },
                    reload: true,
                    status: 'success',
                    text: '已完成',
                  },
                ],
                renderType: 'dropdownMenu',
                value: '待处理',
              },
              type: 'TASK',
            },
          ],
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changePageSize: {
            key: 'changePageSize',
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
    rendering: {
      issueFilter: [
        {
          name: 'issueTable',
          state: null,
        },
      ],
    },
    options: {
      syncIntervalSecond: 0,
    },
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
        issueManage: ['topHead', 'content'],
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
            {
              id: 1,
              values: {},
              label: '全部打开',
              isDefault: true,
            },
            {
              id: 2,
              values: {
                states: [1, 2],
              },
              label: '自定义筛选器',
              isDefault: false,
            },
          ],
        },
        state: {
          values: {
            priorities: ['HIGH'],
          },
          filterSet: 1,
        },
        operations: {
          deleteFilterSet: {
            clientData: {
              dataRef: {
                id: 1,
                values: {},
                label: '全部打开',
                isDefault: true,
              },
            },
          },
          filter: {
            clientData: {
              values: {},
            },
          },
          saveFilterSet: {
            clientData: {
              values: {},
              label: 'xx',
            },
          },
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
        type: 'Kanban',
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
    scenarioType: 'issue-gantt',
    scenarioKey: 'issue-gantt',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['topHead', 'filter', 'ganttContainer'],
        topHead: ['issueAddButton'],
        ganttContainer: ['gantt'],
      },
    },
    components: {
      ganttContainer: { type: 'Container' },
      page: { type: 'Container' },
      topHead: {
        data: {},
        name: 'topHead',
        operations: {},

        state: {},
        type: 'RowContainer',
      },
      issueAddButton: {
        data: {},
        name: 'issueAddButton',
        operations: {},
        state: {},
        type: 'Button',
      },
      gantt: {
        type: 'Gantt',
        data: {
          expandList: {
            0: [
              {
                start: null, //new Date('2019-1-1').getTime(),
                end: null,
                title: 'Rss1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R1ss',
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                start: getDate(1), //new Date('2019-1-1').getTime(),
                end: getDate(15),
                title:
                  'R1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R1',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                start: getDate(10),
                end: getDate(20),
                title: 'R2-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R2',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                start: getDate(10),
                end: getDate(20),
                title: 'R3-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R3',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
            ],
            // R1: makeData(1000),
            R11: [
              {
                key: '1-1',
                title: 'T1-1测试测试测试测试测试测试测试测试测试测试测试',
                // start: getDate(1),
                // end: getDate(5),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
            ],
            R1: [
              {
                id: '1-1',
                name: 'T1-1测试测试测试测试测试测试测试测试测试测试测试',
                // start: getDate(1),
                // end: getDate(5),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-2',
                name: 'T1-2测试测试测试测试测试测试测试测试测试测试测试',
                // start: getDate(2),
                // end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'error' },
                },
              },
              {
                id: '1-3',
                name: 'T1-3测试测试测试测试测试测试测试测试测试测试测试',
                // start: getDate(2),
                // end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-4',
                name: 'T1-4测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(28),
                end: getDate(29),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'error' },
                },
              },
              {
                id: '1-5',
                name: 'T1-5测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(1),
                end: getDate(30),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'success' },
                },
              },
              {
                id: '1-6',
                name: 'T1-6测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-7',
                name: 'T1-7测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-8',
                name: 'T1-8测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-9',
                name: 'T1-9测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-10',
                name: 'T1-10测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-11',
                name: 'T1-11测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                id: '1-12',
                name: 'T1-12测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(2),
                end: getDate(10),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
            ],
          },
        },
        operations: {
          update: {
            key: 'update',
            reload: true,
            fillMeta: 'nodes',
            async: true,
            meta: {
              // 前端修改的数据放在meta.nodes里，update后，后端data.updateList返回相关修改
              nodes: [{ key: 'R1-1', start: 100, end: 1000 }],
            },
          },
          expandNode: {
            key: 'expandNode',
            reload: true,
            fillMate: 'keys',
            meta: { keys: ['xxx'] },
          },
        },
      },
      filter: {
        type: 'ContractiveFilter',
        name: 'filter',
        state: {
          conditions: [
            {
              emptyText: '全部',
              fixed: true,
              key: 'iteration',
              label: '迭代',
              options: [
                { label: '1.1', value: '1.1' },
                { label: '1.2', value: '1.2' },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              haveFilter: true,
              key: 'user',
              label: '成员',
              options: [
                { label: '张三', value: '1' },
                { label: '李四', value: '1' },
              ],
              type: 'select',
            },
            {
              fixed: true,
              key: 'q',
              placeholder: '根据名称过滤',
              type: 'input',
            },
          ],
          values: {
            spaceName: '4',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
    },
  },
};
