export const Mock: CONFIG_PAGE.RenderConfig = {
  protocol: {
    components: {
      content: {
        data: {},
        name: 'content',
        operations: {},
        props: null,
        state: {},
        type: 'Container',
      },
      head: {
        data: {},
        name: 'head',
        operations: {},
        props: {
          whiteBg: true,
        },
        state: {},
        type: 'LRContainer',
      },
      issueAddButton: {
        data: {},
        name: 'issueAddButton',
        operations: {},
        props: {
          disabled: false,
          menu: [
            {
              disabled: false,
              disabledTip: '',
              key: 'requirement',
              operations: {
                click: {
                  key: 'createRequirement',
                  reload: false,
                },
              },
              prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
              text: '需求',
            },
            {
              disabled: false,
              disabledTip: '',
              key: 'task',
              operations: {
                click: {
                  key: 'createTask',
                  reload: false,
                },
              },
              prefixIcon: 'ISSUE_ICON.issue.TASK',
              text: '任务',
            },
            {
              disabled: false,
              disabledTip: '',
              key: 'bug',
              operations: {
                click: {
                  key: 'createBug',
                  reload: false,
                },
              },
              prefixIcon: 'ISSUE_ICON.issue.BUG',
              text: '缺陷',
            },
          ],
          operations: {
            click: {
              key: '',
              reload: false,
            },
          },
          suffixIcon: 'di',
          text: '新建事项',
          type: 'primary',
        },
        state: {},
        type: 'Button',
      },
      issueFilter: {
        data: {},
        name: 'issueFilter',
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
                  label: 'dice-ui-bugfix-0708',
                  value: 7,
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
              key: 'states',
              label: '状态',
              options: [
                {
                  children: [
                    {
                      label: '待处理',
                      value: 10547,
                    },
                    {
                      label: '进行中',
                      value: 10548,
                    },
                    {
                      label: '测试中',
                      value: 10549,
                    },
                    {
                      label: '已完成',
                      value: 10550,
                    },
                  ],
                  icon: 'ISSUE_ICON.issue.REQUIREMENT',
                  label: '需求',
                  value: 'REQUIREMENT',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 10551,
                    },
                    {
                      label: '进行中',
                      value: 10552,
                    },
                    {
                      label: '已完成',
                      value: 10553,
                    },
                  ],
                  icon: 'ISSUE_ICON.issue.TASK',
                  label: '任务',
                  value: 'TASK',
                },
                {
                  children: [
                    {
                      label: '待处理',
                      value: 10557,
                    },
                    {
                      label: '无需修复',
                      value: 10558,
                    },
                    {
                      label: '重复提交',
                      value: 10559,
                    },
                    {
                      label: '已解决',
                      value: 10560,
                    },
                    {
                      label: '重新打开',
                      value: 10561,
                    },
                    {
                      label: '已关闭',
                      value: 10562,
                    },
                  ],
                  icon: 'ISSUE_ICON.issue.BUG',
                  label: '缺陷',
                  value: 'BUG',
                },
              ],
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {},
              showIndex: 3,
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
                  label: 'dhuohdafgdfligwgjskdagbgdaouwerbgakjdnsagbkadgsbjl',
                  value: 248,
                },
                {
                  label: '灰色',
                  value: 247,
                },
                {
                  label: '1133',
                  value: 243,
                },
                {
                  label: 'www',
                  value: 239,
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
                  label: 'jun',
                  value: '1000002',
                },
                {
                  label: 'erda 前端',
                  value: '1000175',
                },
                {
                  label: 'kakj',
                  value: '1000188',
                },
                {
                  label: '自动化测试执行',
                  value: '1000330',
                },
                {
                  label: '澄潭',
                  value: '1000335',
                },
                {
                  label: 'kakj',
                  value: '1000338',
                },
                {
                  label: '刘浩杨',
                  value: '1000855',
                },
                {
                  label: 'lijun',
                  value: '1001103',
                },
                {
                  label: '羽零',
                  value: '1001407',
                },
                {
                  label: 'pjy',
                  value: '1001456',
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
                  label: 'jun',
                  value: '1000002',
                },
                {
                  label: 'erda 前端',
                  value: '1000175',
                },
                {
                  label: 'kakj',
                  value: '1000188',
                },
                {
                  label: '自动化测试执行',
                  value: '1000330',
                },
                {
                  label: '澄潭',
                  value: '1000335',
                },
                {
                  label: 'kakj',
                  value: '1000338',
                },
                {
                  label: '刘浩杨',
                  value: '1000855',
                },
                {
                  label: 'lijun',
                  value: '1001103',
                },
                {
                  label: '羽零',
                  value: '1001407',
                },
                {
                  label: 'pjy',
                  value: '1001456',
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
              haveFilter: true,
              key: 'ownerIDs',
              label: '负责人',
              options: [
                {
                  label: 'jun',
                  value: '1000002',
                },
                {
                  label: 'erda 前端',
                  value: '1000175',
                },
                {
                  label: 'kakj',
                  value: '1000188',
                },
                {
                  label: '自动化测试执行',
                  value: '1000330',
                },
                {
                  label: '澄潭',
                  value: '1000335',
                },
                {
                  label: 'kakj',
                  value: '1000338',
                },
                {
                  label: '刘浩杨',
                  value: '1000855',
                },
                {
                  label: 'lijun',
                  value: '1001103',
                },
                {
                  label: '羽零',
                  value: '1001407',
                },
                {
                  label: 'pjy',
                  value: '1001456',
                },
              ],
              quickAdd: {
                show: false,
              },
              quickDelete: {},
              quickSelect: {
                label: '选择自己',
                operationKey: 'ownerSelectMe',
              },
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
          issueFilter__urlQuery:
            'eyJzdGF0ZXMiOlsxMDU0NywxMDU0OCwxMDU0OSwxMDU1MSwxMDU1MiwxMDU1NywxMDU1OCwxMDU1OSwxMDU2MCwxMDU2MV19',
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
            onlyIdResult: false,
            orderBy: '',
            orgID: 1,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 455,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [10547, 10548, 10549, 10551, 10552, 10557, 10558, 10559, 10560, 10561],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['EPIC', 'REQUIREMENT', 'TASK', 'BUG'],
            userID: '1000175',
          },
          issueViewGroupChildrenValue: {
            kanban: 'priority',
          },
          issueViewGroupValue: 'kanban',
          values: {
            states: [10547, 10548, 10549, 10551, 10552, 10557, 10558, 10559, 10560, 10561],
          },
        },
        type: 'ContractiveFilter',
      },
      issueKanban: {
        data: {
          board: [
            {
              label: '紧急',
              labelKey: 'URGENT',
              list: [
                {
                  assignee: '1000175',
                  id: 2036,
                  issueButton: [
                    {
                      permission: true,
                      stateBelong: 'OPEN',
                      stateID: 10547,
                      stateName: '待处理',
                    },
                    {
                      permission: false,
                      stateBelong: 'WORKING',
                      stateID: 10548,
                      stateName: '进行中',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10549,
                      stateName: '测试中',
                    },
                    {
                      permission: true,
                      stateBelong: 'DONE',
                      stateID: 10550,
                      stateName: '已完成',
                    },
                  ],
                  iterationID: 7,
                  operations: {
                    MoveToPriorityHIGH: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2036,
                        issueAssignee: '',
                        issuePriority: 'HIGH',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority高',
                    },
                    MoveToPriorityLOW: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2036,
                        issueAssignee: '',
                        issuePriority: 'LOW',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority低',
                    },
                    MoveToPriorityNORMAL: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2036,
                        issueAssignee: '',
                        issuePriority: 'NORMAL',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority中',
                    },
                    MoveToPriorityURGENT: {
                      disabled: true,
                      disabledTip: '',
                      meta: {
                        ID: 2036,
                        issueAssignee: '',
                        issuePriority: 'URGENT',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority紧急',
                    },
                    drag: {
                      disabled: false,
                      meta: {
                        ID: 2036,
                        issueAssignee: '',
                        issuePriority: '',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      targetKeys: {
                        HIGH: true,
                        LOW: true,
                        NORMAL: true,
                      },
                    },
                  },
                  planFinishedAt: null,
                  priority: 'HIGH',
                  state: 10548,
                  title:
                    '√ç√√列表每个分组展开时，发起请求到后端，返回分组下的聚合列表列表每个分组展开时，发起请求到后端，返回分组下的聚合列表列表每个分组展开时，发起请求到后端，返回分组下的聚合列表',
                  type: 'REQUIREMENT',
                  labels: {
                    showCount: 1,
                    value: [
                      { label: 'msp', color: 'red' },
                      { label: 'dop', color: 'blue' },
                    ],
                  },
                  status: { text: '待处理', status: 'warning' },
                },
                {
                  assignee: '1000175',
                  id: 2832,
                  issueButton: [
                    {
                      permission: false,
                      stateBelong: 'OPEN',
                      stateID: 10547,
                      stateName: '待处理',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10548,
                      stateName: '进行中',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10549,
                      stateName: '测试中',
                    },
                    {
                      permission: true,
                      stateBelong: 'DONE',
                      stateID: 10550,
                      stateName: '已完成',
                    },
                  ],
                  labels: {
                    value: [
                      { label: 'msp无敌多个字，看看是什么样的效果，哈哈哈哈哈哈', color: 'red' },
                      { label: 'dop', color: 'blue', checked: true },
                      { label: 'ehzldk无敌多个字', color: 'yellow' },
                    ],
                  },
                  iterationID: -1,
                  operations: {
                    MoveToPriorityHIGH: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2832,
                        issueAssignee: '',
                        issuePriority: 'HIGH',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority高',
                    },
                    MoveToPriorityLOW: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2832,
                        issueAssignee: '',
                        issuePriority: 'LOW',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority低',
                    },
                    MoveToPriorityNORMAL: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2832,
                        issueAssignee: '',
                        issuePriority: 'NORMAL',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority中',
                    },
                    MoveToPriorityURGENT: {
                      disabled: true,
                      disabledTip: '',
                      meta: {
                        ID: 2832,
                        issueAssignee: '',
                        issuePriority: 'URGENT',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority紧急',
                    },
                    drag: {
                      disabled: false,
                      meta: {
                        ID: 2832,
                        issueAssignee: '',
                        issuePriority: '',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      targetKeys: {
                        HIGH: true,
                        LOW: true,
                        NORMAL: true,
                      },
                    },
                  },
                  planFinishedAt: null,
                  priority: 'NORMAL',
                  state: 10547,
                  title: '112',
                  type: 'REQUIREMENT',
                  status: { text: '已完成', status: 'success' },
                },
                {
                  assignee: '1000175',
                  id: 2833,
                  labels: {
                    value: [
                      { label: 'msp', color: 'red' },
                      { label: 'dop', color: 'blue' },
                    ],
                  },
                  issueButton: [
                    {
                      permission: false,
                      stateBelong: 'OPEN',
                      stateID: 10547,
                      stateName: '待处理',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10548,
                      stateName: '进行中',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10549,
                      stateName: '测试中',
                    },
                    {
                      permission: true,
                      stateBelong: 'DONE',
                      stateID: 10550,
                      stateName: '已完成',
                    },
                  ],
                  iterationID: -1,
                  operations: {
                    MoveToPriorityHIGH: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2833,
                        issueAssignee: '',
                        issuePriority: 'HIGH',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority高',
                    },
                    MoveToPriorityLOW: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2833,
                        issueAssignee: '',
                        issuePriority: 'LOW',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority低',
                    },
                    MoveToPriorityNORMAL: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2833,
                        issueAssignee: '',
                        issuePriority: 'NORMAL',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority中',
                    },
                    MoveToPriorityURGENT: {
                      disabled: true,
                      disabledTip: '',
                      meta: {
                        ID: 2833,
                        issueAssignee: '',
                        issuePriority: 'URGENT',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority紧急',
                    },
                    drag: {
                      disabled: false,
                      meta: {
                        ID: 2833,
                        issueAssignee: '',
                        issuePriority: '',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      targetKeys: {
                        HIGH: true,
                        LOW: true,
                        NORMAL: true,
                      },
                    },
                  },
                  planFinishedAt: null,
                  priority: 'LOW',
                  state: 10547,
                  title: '33',
                  type: 'REQUIREMENT',
                  status: { text: '进行中', status: 'processing' },
                },
                {
                  assignee: '1000175',
                  id: 2834,
                  labels: {
                    value: [
                      { label: 'msp', color: 'red' },
                      { label: 'dop', color: 'blue' },
                    ],
                  },
                  issueButton: [
                    {
                      permission: false,
                      stateBelong: 'OPEN',
                      stateID: 10547,
                      stateName: '待处理',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10548,
                      stateName: '进行中',
                    },
                    {
                      permission: true,
                      stateBelong: 'WORKING',
                      stateID: 10549,
                      stateName: '测试中',
                    },
                    {
                      permission: true,
                      stateBelong: 'DONE',
                      stateID: 10550,
                      stateName: '已完成',
                    },
                  ],
                  iterationID: -1,
                  operations: {
                    MoveToPriorityHIGH: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2834,
                        issueAssignee: '',
                        issuePriority: 'HIGH',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority高',
                    },
                    MoveToPriorityLOW: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2834,
                        issueAssignee: '',
                        issuePriority: 'LOW',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority低',
                    },
                    MoveToPriorityNORMAL: {
                      disabled: false,
                      disabledTip: '',
                      meta: {
                        ID: 2834,
                        issueAssignee: '',
                        issuePriority: 'NORMAL',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority中',
                    },
                    MoveToPriorityURGENT: {
                      disabled: true,
                      disabledTip: '',
                      meta: {
                        ID: 2834,
                        issueAssignee: '',
                        issuePriority: 'URGENT',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      text: 'MoveToPriority紧急',
                    },
                    drag: {
                      disabled: false,
                      meta: {
                        ID: 2834,
                        issueAssignee: '',
                        issuePriority: '',
                        panelID: 0,
                        panelName: '',
                        stateID: 0,
                      },
                      reload: true,
                      targetKeys: {
                        HIGH: true,
                        LOW: true,
                        NORMAL: true,
                      },
                    },
                  },
                  planFinishedAt: null,
                  priority: 'URGENT',
                  state: 10547,
                  title: '33',
                  type: 'REQUIREMENT',
                  status: { text: '进行中', status: 'processing' },
                },
              ],
              operations: {
                changePageNo: {
                  fillMeta: 'pageData',
                  key: 'changePageNo',
                  meta: {
                    kanbanKey: 'URGENT',
                  },
                  reload: true,
                },
              },
              pageNo: 1,
              pageSize: 50,
              total: 4,
            },
            {
              label: '高',
              labelKey: 'HIGH',
              list: null,
              operations: {
                changePageNo: {
                  fillMeta: 'pageData',
                  key: 'changePageNo',
                  meta: {
                    kanbanKey: 'HIGH',
                  },
                  reload: true,
                },
              },
              pageNo: 1,
              pageSize: 50,
              total: 0,
            },
            {
              label: '中',
              labelKey: 'NORMAL',
              list: null,
              operations: {
                changePageNo: {
                  fillMeta: 'pageData',
                  key: 'changePageNo',
                  meta: {
                    kanbanKey: 'NORMAL',
                  },
                  reload: true,
                },
              },
              pageNo: 1,
              pageSize: 50,
              total: 0,
            },
            {
              label: '低',
              labelKey: 'LOW',
              list: null,
              operations: {
                changePageNo: {
                  fillMeta: 'pageData',
                  key: 'changePageNo',
                  meta: {
                    kanbanKey: 'LOW',
                  },
                  reload: true,
                },
              },
              pageNo: 1,
              pageSize: 50,
              total: 0,
            },
          ],
          refreshBoard: true,
        },
        name: 'issueKanban',
        operations: {},
        props: {
          isLoadMore: true,
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
            onlyIdResult: false,
            orderBy: '',
            orgID: 1,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 455,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [10547, 10548, 10549, 10551, 10552, 10557, 10558, 10559, 10560, 10561],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['EPIC', 'REQUIREMENT', 'TASK', 'BUG'],
            userID: '1000175',
          },
          issueViewGroupChildrenValue: {
            kanban: 'priority',
          },
          issueViewGroupValue: 'kanban',
        },
        type: 'IssueKanban',
      },
      issueManage: {
        data: {},
        name: 'issueManage',
        operations: {},
        props: null,
        state: {},
        type: 'Container',
      },
      issueOperations: {
        data: {},
        name: 'issueOperations',
        operations: {},
        props: null,
        state: {},
        type: 'RowContainer',
      },
      issueTable: {
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
                      id: '2834',
                    },
                    reload: true,
                    text: 'erda 前端',
                  },
                },
                renderType: 'memberSelector',
                scope: 'project',
                value: '1000175',
              },
              closedAt: {
                noBorder: true,
                renderType: 'datePicker',
                value: '',
              },
              complexity: '中',
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
                      id: '2834',
                    },
                    reload: true,
                  },
                },
                renderType: 'datePicker',
                value: '',
              },
              id: '2834',
              iterationID: -1,
              priority: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changePriorityToaURGENT: {
                    key: 'changePriorityToaURGENT',
                    meta: {
                      id: '2834',
                      priority: 'URGENT',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.URGENT',
                    reload: true,
                    text: '紧急',
                  },
                  changePriorityTobHIGH: {
                    key: 'changePriorityTobHIGH',
                    meta: {
                      id: '2834',
                      priority: 'HIGH',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.HIGH',
                    reload: true,
                    text: '高',
                  },
                  changePriorityTocNORMAL: {
                    key: 'changePriorityTocNORMAL',
                    meta: {
                      id: '2834',
                      priority: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.NORMAL',
                    reload: true,
                    text: '中',
                  },
                  changePriorityTodLOW: {
                    key: 'changePriorityTodLOW',
                    meta: {
                      id: '2834',
                      priority: 'LOW',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.LOW',
                    reload: true,
                    text: '低',
                  },
                },
                prefixIcon: 'ISSUE_ICON.priority.URGENT',
                renderType: 'operationsDropdownMenu',
                value: '紧急',
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
                      id: '2834',
                      severity: 'FATAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.FATAL',
                    reload: true,
                    text: '致命',
                  },
                  changeSeverityTobSERIOUS: {
                    key: 'changeSeverityTobSERIOUS',
                    meta: {
                      id: '2834',
                      severity: 'SERIOUS',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SERIOUS',
                    reload: true,
                    text: '严重',
                  },
                  changeSeverityTocNORMAL: {
                    key: 'changeSeverityTocNORMAL',
                    meta: {
                      id: '2834',
                      severity: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                    reload: true,
                    text: '一般',
                  },
                  changeSeverityTodSLIGHT: {
                    key: 'changeSeverityTodSLIGHT',
                    meta: {
                      id: '2834',
                      severity: 'SLIGHT',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SLIGHT',
                    reload: true,
                    text: '轻微',
                  },
                  changeSeverityToeSUGGEST: {
                    key: 'changeSeverityToeSUGGEST',
                    meta: {
                      id: '2834',
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
                operations: {
                  changeStateTo1进行中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo1进行中',
                    meta: {
                      id: '2834',
                      state: '10548',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '进行中',
                  },
                  changeStateTo2测试中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo2测试中',
                    meta: {
                      id: '2834',
                      state: '10549',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '测试中',
                  },
                  changeStateTo3已完成: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo3已完成',
                    meta: {
                      id: '2834',
                      state: '10550',
                    },
                    prefixIcon: 'ISSUE_ICON.state.DONE',
                    reload: true,
                    text: '已完成',
                  },
                },
                prefixIcon: 'ISSUE_ICON.state.OPEN',
                renderType: 'operationsDropdownMenu',
                value: '待处理',
              },
              title: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                      renderType: 'textWithIcon',
                      value: '33',
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      showCount: 5,
                      value: [
                        {
                          color: 'red',
                          label: '1133',
                        },
                        {
                          color: 'red',
                          label: 'www',
                        },
                      ],
                    },
                  ],
                ],
              },
              type: 'REQUIREMENT',
            },
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
                      id: '2833',
                    },
                    reload: true,
                    text: 'erda 前端',
                  },
                },
                renderType: 'memberSelector',
                scope: 'project',
                value: '1000175',
              },
              closedAt: {
                noBorder: true,
                renderType: 'datePicker',
                value: '',
              },
              complexity: '中',
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
                      id: '2833',
                    },
                    reload: true,
                  },
                },
                renderType: 'datePicker',
                value: '',
              },
              id: '2833',
              iterationID: -1,
              priority: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changePriorityToaURGENT: {
                    key: 'changePriorityToaURGENT',
                    meta: {
                      id: '2833',
                      priority: 'URGENT',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.URGENT',
                    reload: true,
                    text: '紧急',
                  },
                  changePriorityTobHIGH: {
                    key: 'changePriorityTobHIGH',
                    meta: {
                      id: '2833',
                      priority: 'HIGH',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.HIGH',
                    reload: true,
                    text: '高',
                  },
                  changePriorityTocNORMAL: {
                    key: 'changePriorityTocNORMAL',
                    meta: {
                      id: '2833',
                      priority: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.NORMAL',
                    reload: true,
                    text: '中',
                  },
                  changePriorityTodLOW: {
                    key: 'changePriorityTodLOW',
                    meta: {
                      id: '2833',
                      priority: 'LOW',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.LOW',
                    reload: true,
                    text: '低',
                  },
                },
                prefixIcon: 'ISSUE_ICON.priority.URGENT',
                renderType: 'operationsDropdownMenu',
                value: '紧急',
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
                      id: '2833',
                      severity: 'FATAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.FATAL',
                    reload: true,
                    text: '致命',
                  },
                  changeSeverityTobSERIOUS: {
                    key: 'changeSeverityTobSERIOUS',
                    meta: {
                      id: '2833',
                      severity: 'SERIOUS',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SERIOUS',
                    reload: true,
                    text: '严重',
                  },
                  changeSeverityTocNORMAL: {
                    key: 'changeSeverityTocNORMAL',
                    meta: {
                      id: '2833',
                      severity: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                    reload: true,
                    text: '一般',
                  },
                  changeSeverityTodSLIGHT: {
                    key: 'changeSeverityTodSLIGHT',
                    meta: {
                      id: '2833',
                      severity: 'SLIGHT',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SLIGHT',
                    reload: true,
                    text: '轻微',
                  },
                  changeSeverityToeSUGGEST: {
                    key: 'changeSeverityToeSUGGEST',
                    meta: {
                      id: '2833',
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
                operations: {
                  changeStateTo1进行中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo1进行中',
                    meta: {
                      id: '2833',
                      state: '10548',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '进行中',
                  },
                  changeStateTo2测试中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo2测试中',
                    meta: {
                      id: '2833',
                      state: '10549',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '测试中',
                  },
                  changeStateTo3已完成: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo3已完成',
                    meta: {
                      id: '2833',
                      state: '10550',
                    },
                    prefixIcon: 'ISSUE_ICON.state.DONE',
                    reload: true,
                    text: '已完成',
                  },
                },
                prefixIcon: 'ISSUE_ICON.state.OPEN',
                renderType: 'operationsDropdownMenu',
                value: '待处理',
              },
              title: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                      renderType: 'textWithIcon',
                      value: '33',
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      showCount: 5,
                    },
                  ],
                ],
              },
              type: 'REQUIREMENT',
            },
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
                      id: '2832',
                    },
                    reload: true,
                    text: 'erda 前端',
                  },
                },
                renderType: 'memberSelector',
                scope: 'project',
                value: '1000175',
              },
              closedAt: {
                noBorder: true,
                renderType: 'datePicker',
                value: '',
              },
              complexity: '中',
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
                      id: '2832',
                    },
                    reload: true,
                  },
                },
                renderType: 'datePicker',
                value: '',
              },
              id: '2832',
              iterationID: -1,
              priority: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changePriorityToaURGENT: {
                    key: 'changePriorityToaURGENT',
                    meta: {
                      id: '2832',
                      priority: 'URGENT',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.URGENT',
                    reload: true,
                    text: '紧急',
                  },
                  changePriorityTobHIGH: {
                    key: 'changePriorityTobHIGH',
                    meta: {
                      id: '2832',
                      priority: 'HIGH',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.HIGH',
                    reload: true,
                    text: '高',
                  },
                  changePriorityTocNORMAL: {
                    key: 'changePriorityTocNORMAL',
                    meta: {
                      id: '2832',
                      priority: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.NORMAL',
                    reload: true,
                    text: '中',
                  },
                  changePriorityTodLOW: {
                    key: 'changePriorityTodLOW',
                    meta: {
                      id: '2832',
                      priority: 'LOW',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.LOW',
                    reload: true,
                    text: '低',
                  },
                },
                prefixIcon: 'ISSUE_ICON.priority.URGENT',
                renderType: 'operationsDropdownMenu',
                value: '紧急',
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
                      id: '2832',
                      severity: 'FATAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.FATAL',
                    reload: true,
                    text: '致命',
                  },
                  changeSeverityTobSERIOUS: {
                    key: 'changeSeverityTobSERIOUS',
                    meta: {
                      id: '2832',
                      severity: 'SERIOUS',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SERIOUS',
                    reload: true,
                    text: '严重',
                  },
                  changeSeverityTocNORMAL: {
                    key: 'changeSeverityTocNORMAL',
                    meta: {
                      id: '2832',
                      severity: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                    reload: true,
                    text: '一般',
                  },
                  changeSeverityTodSLIGHT: {
                    key: 'changeSeverityTodSLIGHT',
                    meta: {
                      id: '2832',
                      severity: 'SLIGHT',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SLIGHT',
                    reload: true,
                    text: '轻微',
                  },
                  changeSeverityToeSUGGEST: {
                    key: 'changeSeverityToeSUGGEST',
                    meta: {
                      id: '2832',
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
                operations: {
                  changeStateTo1进行中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo1进行中',
                    meta: {
                      id: '2832',
                      state: '10548',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '进行中',
                  },
                  changeStateTo2测试中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo2测试中',
                    meta: {
                      id: '2832',
                      state: '10549',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '测试中',
                  },
                  changeStateTo3已完成: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo3已完成',
                    meta: {
                      id: '2832',
                      state: '10550',
                    },
                    prefixIcon: 'ISSUE_ICON.state.DONE',
                    reload: true,
                    text: '已完成',
                  },
                },
                prefixIcon: 'ISSUE_ICON.state.OPEN',
                renderType: 'operationsDropdownMenu',
                value: '待处理',
              },
              title: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                      renderType: 'textWithIcon',
                      value: '112',
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      showCount: 5,
                    },
                  ],
                ],
              },
              type: 'REQUIREMENT',
            },
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
                      id: '2036',
                    },
                    reload: true,
                    text: 'erda 前端',
                  },
                },
                renderType: 'memberSelector',
                scope: 'project',
                value: '1000175',
              },
              closedAt: {
                noBorder: true,
                renderType: 'datePicker',
                value: '',
              },
              complexity: '中',
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
                      id: '2036',
                    },
                    reload: true,
                  },
                },
                renderType: 'datePicker',
                value: '',
              },
              id: '2036',
              iterationID: 7,
              priority: {
                disabled: false,
                disabledTip: '',
                operations: {
                  changePriorityToaURGENT: {
                    key: 'changePriorityToaURGENT',
                    meta: {
                      id: '2036',
                      priority: 'URGENT',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.URGENT',
                    reload: true,
                    text: '紧急',
                  },
                  changePriorityTobHIGH: {
                    key: 'changePriorityTobHIGH',
                    meta: {
                      id: '2036',
                      priority: 'HIGH',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.HIGH',
                    reload: true,
                    text: '高',
                  },
                  changePriorityTocNORMAL: {
                    key: 'changePriorityTocNORMAL',
                    meta: {
                      id: '2036',
                      priority: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.NORMAL',
                    reload: true,
                    text: '中',
                  },
                  changePriorityTodLOW: {
                    key: 'changePriorityTodLOW',
                    meta: {
                      id: '2036',
                      priority: 'LOW',
                    },
                    prefixIcon: 'ISSUE_ICON.priority.LOW',
                    reload: true,
                    text: '低',
                  },
                },
                prefixIcon: 'ISSUE_ICON.priority.URGENT',
                renderType: 'operationsDropdownMenu',
                value: '紧急',
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
                      id: '2036',
                      severity: 'FATAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.FATAL',
                    reload: true,
                    text: '致命',
                  },
                  changeSeverityTobSERIOUS: {
                    key: 'changeSeverityTobSERIOUS',
                    meta: {
                      id: '2036',
                      severity: 'SERIOUS',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SERIOUS',
                    reload: true,
                    text: '严重',
                  },
                  changeSeverityTocNORMAL: {
                    key: 'changeSeverityTocNORMAL',
                    meta: {
                      id: '2036',
                      severity: 'NORMAL',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.NORMAL',
                    reload: true,
                    text: '一般',
                  },
                  changeSeverityTodSLIGHT: {
                    key: 'changeSeverityTodSLIGHT',
                    meta: {
                      id: '2036',
                      severity: 'SLIGHT',
                    },
                    prefixIcon: 'ISSUE_ICON.severity.SLIGHT',
                    reload: true,
                    text: '轻微',
                  },
                  changeSeverityToeSUGGEST: {
                    key: 'changeSeverityToeSUGGEST',
                    meta: {
                      id: '2036',
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
                operations: {
                  changeStateTo0待处理: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo0待处理',
                    meta: {
                      id: '2036',
                      state: '10547',
                    },
                    prefixIcon: 'ISSUE_ICON.state.OPEN',
                    reload: true,
                    text: '待处理',
                  },
                  changeStateTo2测试中: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo2测试中',
                    meta: {
                      id: '2036',
                      state: '10549',
                    },
                    prefixIcon: 'ISSUE_ICON.state.WORKING',
                    reload: true,
                    text: '测试中',
                  },
                  changeStateTo3已完成: {
                    disabled: false,
                    disabledTip: '',
                    key: 'changeStateTo3已完成',
                    meta: {
                      id: '2036',
                      state: '10550',
                    },
                    prefixIcon: 'ISSUE_ICON.state.DONE',
                    reload: true,
                    text: '已完成',
                  },
                },
                prefixIcon: 'ISSUE_ICON.state.WORKING',
                renderType: 'operationsDropdownMenu',
                value: '进行中',
              },
              title: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                      renderType: 'textWithIcon',
                      value:
                        '√ç√√列表每个分组展开时，发起请求到后端，返回分组下的聚合列表列表每个分组展开时，发起请求到后端，返回分组下的聚合列表列表每个分组展开时，发起请求到后端，返回分组下的聚合列表',
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      showCount: 5,
                    },
                  ],
                ],
              },
              type: 'REQUIREMENT',
            },
          ],
        },
        name: 'issueTable',
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
            onlyIdResult: false,
            orderBy: '',
            orgID: 1,
            owner: null,
            pageNo: 1,
            pageSize: 0,
            priority: null,
            projectID: 455,
            projectIDs: null,
            relatedIssueId: null,
            requirementID: null,
            severity: null,
            source: '',
            startClosedAt: 0,
            startCreatedAt: 0,
            startFinishedAt: 0,
            state: [10547, 10548, 10549, 10551, 10552, 10557, 10558, 10559, 10560, 10561],
            stateBelongs: null,
            taskType: null,
            title: '',
            type: ['EPIC', 'REQUIREMENT', 'TASK', 'BUG'],
            userID: '1000175',
          },
          issueTable__urlQuery: 'eyJwYWdlTm8iOjEsICJwYWdlU2l6ZSI6MTB9',
          issueViewGroupValue: 'kanban',
          pageNo: 1,
          pageSize: 10,
          total: 4,
        },
        type: 'Table',
      },
      issueViewGroup: {
        data: {},
        name: 'issueViewGroup',
        operations: {
          onChange: {
            key: 'changeViewType',
            reload: true,
          },
        },
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
              ],
              key: 'kanban',
              prefixIcon: 'data-matrix',
              suffixIcon: 'di',
              text: '看板',
              tooltip: '看板视图',
            },
            {
              key: 'gantt',
              prefixIcon: 'gantetu',
              text: '甘特图',
              tooltip: '',
            },
          ],
          radioType: 'button',
          size: 'small',
        },
        state: {
          childrenValue: {
            kanban: 'priority',
          },
          issueViewGroup__urlQuery: 'eyJ2YWx1ZSI6ImthbmJhbiIsImNoaWxkcmVuVmFsdWUiOnsia2FuYmFuIjoicHJpb3JpdHkifX0=',
          value: 'kanban',
        },
        type: 'Radio',
      },
      topHead: {
        data: {},
        name: 'topHead',
        operations: {},
        props: {
          isTopHead: true,
        },
        state: {},
        type: 'RowContainer',
      },
    },
    hierarchy: {
      root: 'issueManage',
      structure: {
        content: ['issueTable', 'issueKanban', 'issueGantt'],
        head: {
          left: 'issueFilter',
          right: 'issueOperations',
        },
        issueManage: ['topHead', 'head', 'content'],
        issueOperations: ['issueViewGroup', 'issueExport', 'issueImport'],
        topHead: ['issueAddButton'],
      },
    },
    options: {
      syncIntervalSecond: 0,
    },
    rendering: {
      __DefaultRendering__: [
        {
          name: 'issueManage',
          state: null,
        },
        {
          name: 'topHead',
          state: null,
        },
        {
          name: 'issueAddButton',
          state: null,
        },
        {
          name: 'head',
          state: null,
        },
        {
          name: 'issueOperations',
          state: null,
        },
        {
          name: 'issueViewGroup',
          state: null,
        },
        {
          name: 'issueFilter',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'issueViewGroupChildrenValue',
              value: '{{ issueViewGroup.childrenValue }}',
            },
          ],
        },
        {
          name: 'issueExport',
          state: null,
        },
        {
          name: 'issueImport',
          state: null,
        },
        {
          name: 'content',
          state: null,
        },
        {
          name: 'issueTable',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueKanban',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'issueViewGroupChildrenValue',
              value: '{{ issueViewGroup.childrenValue }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueGantt',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
      ],
      issueFilter: [
        {
          name: 'issueViewGroup',
          state: null,
        },
        {
          name: 'issueTable',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueKanban',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'issueViewGroupChildrenValue',
              value: '{{ issueViewGroup.childrenValue }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueGantt',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
      ],
      issueViewGroup: [
        {
          name: 'issueFilter',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'issueViewGroupChildrenValue',
              value: '{{ issueViewGroup.childrenValue }}',
            },
          ],
        },
        {
          name: 'issueTable',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueKanban',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'issueViewGroupChildrenValue',
              value: '{{ issueViewGroup.childrenValue }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
        {
          name: 'issueGantt',
          state: [
            {
              name: 'issueViewGroupValue',
              value: '{{ issueViewGroup.value }}',
            },
            {
              name: 'filterConditions',
              value: '{{ issueFilter.issuePagingRequest }}',
            },
          ],
        },
      ],
    },
    scenario: 'issue-manage',
    state: {
      _error_: null,
      _userIDs_: ['1000175'],
    },
    version: '',
  },
  scenario: {
    scenarioKey: 'issue-manage',
    scenarioType: 'issue-manage',
  },
};
