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
export const orgRoleMap = {
  Manager: { name: '企业管理员', value: 'Manager' },
  Dev: { name: '企业研发工程师', value: 'Dev' },
  Ops: { name: '企业运维工程师', value: 'Ops' },
  EdgeOps: { name: '边缘运维工程师', value: 'EdgeOps' },
  DataManager: { name: '数据管理员', value: 'DataManager' },
  DataEngineer: { name: '数据开发工程师', value: 'DataEngineer' },
  PublisherManager: { name: '发布管理员', value: 'PublisherManager' },
  Support: { name: '技术支持', value: 'Support', isBuildIn: true }, // 内置角色
  Reporter: { name: '报告人员', value: 'Reporter' },
  Guest: { name: '访客用户', value: 'Guest' },
};

// 通过权限配置页面导出数据覆盖，勿手动修改
export const orgPerm = {
  name: '企业',
  dop: {
    name: 'DevOps平台',
    read: {
      pass: false,
      name: '查看',
      role: ['Manager', 'Dev', 'Support', 'DataManager', 'Reporter', 'PublisherManager', 'Guest'],
    },
    apiManage: {
      name: 'API管理',
      read: {
        pass: false,
        role: ['Manager', 'Dev', 'Support', 'DataManager', 'Reporter', 'PublisherManager', 'Guest'],
        name: '查看',
      },
    },
    addonService: {
      name: '扩展服务',
      read: {
        pass: false,
        role: ['Manager', 'Dev', 'Support', 'DataManager', 'Reporter', 'PublisherManager', 'Guest'],
        name: '查看',
      },
    },
    publisher: {
      name: '我的发布',
      read: {
        pass: false,
        role: ['Manager', 'Dev', 'Support', 'DataManager', 'Reporter', 'PublisherManager', 'Guest'],
        name: '查看',
      },
    },
  },
  entryMsp: {
    pass: false,
    name: '微服务治理平台',
    role: ['Manager', 'Dev', 'Support', 'DataManager'],
  },
  entryFastData: {
    pass: false,
    name: '快数据平台',
    role: ['Manager', 'DataManager', 'DataEngineer', 'Support'],
  },
  entryOrgCenter: {
    pass: false,
    name: '企业中心',
    role: ['Manager', 'Support'],
  },
  apiAssetEdit: {
    pass: false,
    name: 'API 资源编辑',
    role: ['Manager'],
  },
  cmp: {
    name: '云管平台',
    showApp: {
      pass: false,
      role: ['Manager', 'Ops', 'Support'],
      name: '应用菜单显示',
    },
    alarms: {
      name: '运维告警',
      addNotificationGroup: {
        pass: false,
        role: ['Manager', 'Support'],
        name: '添加通知组',
      },
    },
  },
  publisher: {
    name: '发布管理',
    operation: {
      pass: false,
      role: ['PublisherManager', 'Manager'],
      name: '操作(添加/发布/下架等)',
    },
  },
  ecp: {
    name: '边缘计算平台',
    view: {
      pass: false,
      role: ['Manager', 'EdgeOps', 'Support'],
      name: '查看',
    },
    operate: {
      pass: false,
      role: ['Manager', 'EdgeOps'],
      name: '操作(新建/编辑/删除/发布/下线/重启)',
    },
  },
};
