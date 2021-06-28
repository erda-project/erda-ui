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

// 通过权限配置页面导出角色数据覆盖，勿手动修改
export const projectRoleMap = {
  Owner: { name: '项目所有者', value: 'Owner' },
  Lead: { name: '研发主管', value: 'Lead' },
  PM: { name: '项目经理', value: 'PM' },
  PD: { name: '产品经理', value: 'PD' },
  Dev: { name: '开发工程师', value: 'Dev' },
  QA: { name: '测试工程师', value: 'QA' },
  Support: { name: '答疑', value: 'Support', isBuildIn: true },
  Ops: { name: '运维', value: 'Ops', isBuildIn: true },
  Reporter: { name: '报告人员', value: 'Reporter' },
  Creator: { name: '创建者', value: 'Creator', isCustomRole: true },
  Assignee: { name: '处理者', value: 'Assignee', isCustomRole: true },
  Guest: { name: '访客用户', value: 'Guest' },
};

// 通过权限配置页面导出数据覆盖，勿手动修改
export const projectPerm = {
  name: '项目',
  addApp: {
    pass: false,
    name: '新建应用',
    role: [
      'Owner',
      'Lead',
    ],
  },
  editProject: {
    pass: false,
    name: '编辑项目',
    role: [
      'Owner',
      'Lead',
    ],
  },
  deleteProject: {
    pass: false,
    name: '删除项目',
    role: [
      'Owner',
      'Lead',
    ],
  },
  service: {
    name: '服务目录',
    addProjectService: {
      pass: false,
      name: '添加项目服务',
      role: [
        'Owner',
        'Lead',
      ],
    },
    viewService: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  iteration: {
    name: '迭代',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
    },
    operation: {
      pass: false,
      name: '操作（新建/编辑/删除）',
      role: [
        'Owner',
        'PM',
        'Lead',
        'PD',
      ],
    },
    handleFiled: {
      pass: false,
      role: [
        'Owner',
        'PM',
      ],
      name: '归档/取消归档',
    },
  },
  requirement: {
    name: '需求',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
    },
    batchOperation: {
      pass: false,
      name: '批量操作',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    create: {
      pass: false,
      name: '新建',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    edit: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'PM',
        'PD',
        'Creator',
        'Assignee',
        'Lead',
        'Dev',
        'QA',
      ],
    },
    delete: {
      pass: false,
      name: '删除',
      role: [
        'Owner',
        'PM',
        'PD',
        'Creator',
      ],
    },
    updateStatus: {
      pass: false,
      name: '状态变更',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
      ],
    },
    export: {
      pass: false,
      name: '导出',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    switchType: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
      name: '切换事项类型',
    },
    import: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
      name: '导入',
    },
  },
  epic: {
    name: '里程碑',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
    },
    create: {
      pass: false,
      name: '新建',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    edit: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'PM',
        'PD',
        'Creator',
        'Assignee',
        'Lead',
        'Dev',
        'QA',
      ],
    },
    delete: {
      pass: false,
      name: '删除',
      role: [
        'Owner',
        'PM',
        'PD',
        'Creator',
      ],
    },
    updateStatus: {
      pass: false,
      name: '状态变更',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
      ],
    },
    export: {
      pass: false,
      name: '导出',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
      ],
    },
  },
  task: {
    name: '任务',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
    },
    batchOperation: {
      pass: false,
      name: '批量操作',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    create: {
      pass: false,
      name: '新建',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    edit: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'Lead',
        'QA',
        'Creator',
        'Assignee',
        'PM',
        'PD',
        'Dev',
      ],
    },
    delete: {
      pass: false,
      name: '删除',
      role: [
        'Owner',
        'Lead',
        'Creator',
      ],
    },
    updateStatus: {
      pass: false,
      name: '状态修改',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
      ],
    },
    export: {
      pass: false,
      name: '导出',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    switchType: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
      name: '切换事项类型',
    },
    import: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
      name: '导入',
    },
  },
  bug: {
    name: '缺陷',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
    },
    delete: {
      pass: false,
      name: '删除',
      role: [
        'Owner',
        'Lead',
        'PM',
        'QA',
        'Creator',
      ],
    },
    export: {
      pass: false,
      name: '导出',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    batchOperation: {
      pass: false,
      name: '批量操作',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    create: {
      pass: false,
      name: '创建',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
    },
    edit: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'PM',
        'QA',
        'Creator',
        'Assignee',
        'Lead',
        'PD',
        'Dev',
      ],
    },
    updateStatus: {
      pass: false,
      name: '状态变更',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
      ],
    },
    closeBug: {
      pass: false,
      name: '关闭',
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
      ],
    },
    switchType: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
      name: '切换事项类型',
    },
    import: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
      ],
      name: '导入',
    },
  },
  member: {
    name: '项目成员管理',
    addProjectMember: {
      pass: false,
      name: '添加',
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
    },
    editProjectMember: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
    },
    removeProjectMember: {
      pass: false,
      name: '删除',
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
    },
    showAuthorize: {
      pass: false,
      name: '授权',
      role: [
        'Owner',
        'Lead',
        'PM',
      ],
    },
  },
  setting: {
    name: '项目设置',
    branchRule: {
      name: '分支规则',
      operation: {
        pass: false,
        name: '操作（增删改）',
        role: [
          'Owner',
          'Lead',
        ],
      },
    },
    scanRule: {
      name: '扫描规则',
      operation: {
        pass: false,
        name: '操作（增删改）',
        role: [
          'Owner',
          'Lead',
        ],
      },
    },
    customWorkflow: {
      name: '工作流管理',
      operation: {
        pass: false,
        name: '操作（增删改）',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
    },
    blockNetwork: {
      name: '封网',
      applyUnblock: {
        pass: false,
        name: '申请解封',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
    },
    viewSetting: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  ticket: {
    name: '工单',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Reporter',
        'Guest',
      ],
      name: '查看',
    },
    create: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Reporter',
        'Guest',
      ],
      name: '创建',
    },
    edit: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
        'Guest',
      ],
      name: '编辑',
    },
    updateStatus: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Assignee',
        'Guest',
      ],
      name: '状态变更',
    },
    delete: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Creator',
        'Assignee',
        'Guest',
      ],
      name: '删除',
    },
  },
  apiManage: {
    name: 'API 管理',
    apiMarket: {
      name: 'API 集市',
      read: {
        pass: false,
        name: '查看',
        role: [
          'Owner',
          'Lead',
          'PM',
          'PD',
          'Dev',
          'QA',
          'Support',
          'Ops',
        ],
      },
      edit: {
        pass: false,
        name: '编辑资源',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      delete: {
        pass: false,
        name: '删除资源',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      publicAsset: {
        pass: false,
        name: '公开',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      addVersion: {
        pass: false,
        name: '添加版本',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      deleteVersion: {
        pass: false,
        name: '删除版本',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      relatedProjectOrApp: {
        pass: false,
        name: '关联项目/应用',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      relatedInstance: {
        pass: false,
        name: '关联实例',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
    },
    accessManage: {
      name: '访问管理',
      read: {
        pass: false,
        name: '查看',
        role: [
          'Owner',
          'Lead',
          'PM',
          'PD',
          'Dev',
          'QA',
          'Support',
          'Ops',
        ],
      },
      edit: {
        pass: false,
        name: '编辑',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      delete: {
        pass: false,
        name: '删除',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
      approve: {
        pass: false,
        name: '审批',
        role: [
          'Owner',
          'Lead',
          'PM',
        ],
      },
    },
  },
  appList: {
    name: '应用列表',
    viewAppList: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
      name: '查看',
    },
  },
  backLog: {
    name: '待办事项',
    viewBackLog: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
      name: '查看',
    },
  },
  testManage: {
    name: '测试管理',
    viewTest: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  dashboard: {
    name: '项目大盘',
    viewDashboard: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
      name: '查看',
    },
  },
  resource: {
    name: '资源汇总',
    viewResource: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  issue: {
    name: '事项',
    viewIssue: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
      name: '查看',
    },
  },
  dataBank: {
    name: '数据银行',
    dataSource: {
      name: '数据源',
      view: {
        pass: false,
        role: [
          'Owner',
          'Lead',
          'PM',
          'PD',
          'Dev',
          'QA',
          'Ops',
        ],
        name: '查看',
      },
    },
    configData: {
      name: '配置单',
      view: {
        pass: false,
        role: [
          'Owner',
          'Lead',
          'PM',
          'PD',
          'Dev',
          'QA',
          'Ops'
        ],
        name: '查看',
      },
    },
  },
  pipeline: {
    name: '流水线',
    view: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA'
      ],
      name: '查看',
    },
  },
  milestone: {
    name: '里程碑',
    view: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'PM',
        'PD',
        'Dev',
        'QA',
        'Ops',
        'Support',
      ],
      name: '查看',
    },
  },
};
