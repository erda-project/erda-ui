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
export const appRoleMap = {
  Owner: { name: '应用所有者', value: 'Owner' },
  Lead: { name: '应用主管', value: 'Lead' },
  Dev: { name: '开发工程师', value: 'Dev' },
  QA: { name: '测试工程师', value: 'QA' },
  Support: { name: '答疑', value: 'Support', isBuildIn: true },
  Ops: { name: '运维', value: 'Ops' },
  Creator: { name: '创建者', value: 'Creator', isCustomRole: true },
  Assignee: { name: '处理者', value: 'Assignee', isCustomRole: true },
  Guest: { name: '访客用户', value: 'Guest' },
};

// 通过权限配置页面导出数据覆盖，勿手动修改
export const appPerm = {
  name: '应用',
  externalRepo: {
    name: '外部代码仓库',
    edit: {
      pass: false,
      name: '编辑',
      role: [
        'Owner',
        'Lead',
      ],
    },
  },
  repo: {
    name: '代码仓库',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
    },
    branch: {
      name: '分支管理',
      writeNormal: {
        pass: false,
        name: '普通分支管理（创建分支/提交文件/修改文件/删除）',
        role: [
          'Owner',
          'Lead',
          'Dev',
          'QA',
        ],
      },
      writeProtected: {
        pass: false,
        name: '保护分支管理（创建分支/提交文件/修改文件/删除）',
        role: [
          'Owner',
          'Lead',
        ],
      },
      setDefaultBranch: {
        pass: false,
        role: [
          'Owner',
          'Lead',
        ],
        name: '设置默认分支',
      },
      addTag: {
        pass: false,
        role: [
          'Owner',
          'Lead',
          'Dev',
          'QA',
          'Support',
          'Ops',
        ],
        name: '添加标签',
      },
      deleteTag: {
        pass: false,
        role: [
          'Lead',
          'Owner',
          'Dev',
          'QA',
          'Support',
          'Ops',
        ],
        name: '删除标签',
      },
    },
    mr: {
      name: '合并请求',
      create: {
        pass: false,
        name: '新建',
        role: [
          'Owner',
          'Lead',
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
          'Creator',
        ],
      },
      close: {
        pass: false,
        name: '关闭',
        role: [
          'Owner',
          'Lead',
          'Creator',
        ],
      },
    },
    backup: {
      name: '备份管理',
      backupRepo: {
        pass: false,
        role: [
          'Owner',
          'Lead',
        ],
        name: '新建备份',
      },
      deleteBackup: {
        pass: false,
        role: [
          'Owner',
          'Lead',
        ],
        name: '删除备份',
      },
    },
  },
  pipeline: {
    name: '流水线',
    read: {
      pass: false,
      name: '查看',
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
    },
    executeNormal: {
      pass: false,
      name: '操作普通分支(开始/取消定时/立即执行/重试/停止)',
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
      ],
    },
    executeProtected: {
      pass: false,
      name: '操作受保护分支(开始/取消定时/立即执行/重试/停止)',
      role: [
        'Owner',
        'Lead',
      ],
    },
  },
  runtime: {
    name: '部署中心',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
    devDeployOperation: {
      pass: false,
      name: 'DEV操作（重启/回滚/域名设置/服务扩容）',
      role: [
        'Owner',
        'Lead',
        'Dev',
      ],
    },
    devDelete: {
      pass: false,
      name: 'DEV删除',
      role: [
        'Owner',
        'Lead',
        'Dev',
      ],
    },
    testDeployOperation: {
      pass: false,
      name: 'TEST操作（重启/回滚/域名设置/服务扩容）',
      role: [
        'Owner',
        'Lead',
        'QA',
      ],
    },
    testDelete: {
      pass: false,
      name: 'TEST删除',
      role: [
        'Owner',
        'Lead',
        'QA',
      ],
    },
    stagingDeployOperation: {
      pass: false,
      name: 'STAGING操作（重启/回滚/域名设置/服务扩容）',
      role: [
        'Owner',
        'Lead',
      ],
    },
    stagingDelete: {
      pass: false,
      name: 'STAGING删除',
      role: [
        'Owner',
        'Lead',
      ],
    },
    prodDeployOperation: {
      pass: false,
      name: 'PROD操作（重启/回滚/域名设置/服务扩容）',
      role: [
        'Owner',
        'Lead',
      ],
    },
    prodDelete: {
      pass: false,
      name: 'PROD删除',
      role: [
        'Owner',
        'Lead',
      ],
    },
    devConsole: {
      pass: false,
      name: 'DEV-详情-控制台',
      role: [
        'Owner',
        'Lead',
        'Dev',
        'Ops',
        'Support',
      ],
    },
    testConsole: {
      pass: false,
      name: 'TEST-详情-控制台',
      role: [
        'Owner',
        'Lead',
        'QA',
        'Ops',
        'Support',
      ],
    },
    stagingConsole: {
      pass: false,
      name: 'STAGING-详情-控制台',
      role: [
        'Owner',
        'Lead',
        'Support',
      ],
    },
    prodConsole: {
      pass: false,
      name: 'PROD-详情-控制台',
      role: [
        'Owner',
        'Lead',
        'Support',
      ],
    },
  },
  setting: {
    name: '应用设置',
    editApp: {
      pass: false,
      name: '编辑应用信息',
      role: [
        'Owner',
        'Lead',
      ],
    },
    deleteApp: {
      pass: false,
      name: '删除应用信息',
      role: [
        'Owner',
        'Lead',
      ],
    },
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
    repoSetting: {
      name: '仓库设置',
      lockRepo: {
        pass: false,
        role: [
          'Lead',
          'Owner',
        ],
        name: '锁定仓库',
      },
    },
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  member: {
    name: '成员管理',
    addAppMember: {
      pass: false,
      name: '应用成员 > 添加成员',
      role: [
        'Owner',
        'Lead',
      ],
    },
    editAppMember: {
      pass: false,
      name: '应用成员 > 编辑成员',
      role: [
        'Owner',
        'Lead',
      ],
    },
    deleteAppMember: {
      pass: false,
      name: '应用成员 > 移除成员',
      role: [
        'Owner',
        'Lead',
      ],
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
          'Dev',
          'QA',
          'Ops',
        ],
      },
      edit: {
        pass: false,
        name: '编辑资源',
        role: [
          'Owner',
          'Lead',
        ],
      },
      delete: {
        pass: false,
        name: '删除资源',
        role: [
          'Owner',
          'Lead',
        ],
      },
      publicAsset: {
        pass: false,
        name: '公开',
        role: [
          'Owner',
          'Lead',
        ],
      },
      addVersion: {
        pass: false,
        name: '添加版本',
        role: [
          'Owner',
          'Lead',
        ],
      },
      deleteVersion: {
        pass: false,
        name: '删除版本',
        role: [
          'Owner',
          'Lead',
        ],
      },
      relatedProjectOrApp: {
        pass: false,
        name: '关联项目/应用',
        role: [
          'Owner',
          'Lead',
        ],
      },
      relatedInstance: {
        pass: false,
        name: '关联实例',
        role: [
          'Owner',
          'Lead',
        ],
      },
    },
    accessManage: {
      name: '访问管理',
      edit: {
        pass: false,
        name: '编辑',
        role: [
          'Owner',
          'Lead',
        ],
      },
      delete: {
        pass: false,
        name: '删除',
        role: [
          'Owner',
          'Lead',
        ],
      },
      approve: {
        pass: false,
        name: '审批',
        role: [
          'Owner',
          'Lead',
        ],
      },
    },
  },
  apiDesign: {
    name: 'API设计',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  dataTask: {
    name: '数据任务',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  dataModel: {
    name: '数据模型',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  dataMarket: {
    name: '数据集市',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  codeQuality: {
    name: '代码质量',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
      ],
      name: '查看',
    },
  },
  release: {
    name: '制品管理',
    read: {
      pass: false,
      role: [
        'Owner',
        'Lead',
        'Dev',
        'QA',
        'Support',
        'Ops',
        'Guest',
      ],
      name: '查看',
    },
    info: {
      name: '详情信息',
      edit: {
        pass: false,
        role: [
          'Owner',
          'Lead',
          'Dev',
          'QA',
          'Support',
          'Ops',
        ],
        name: '编辑',
      },
    },
  },
};
