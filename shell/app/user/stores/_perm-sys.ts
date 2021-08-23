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

export const sysRoleMap = {
  Admin: { name: '系统管理员', value: 'Admin' },
  Auditor: { name: '审计人员', value: 'Auditor' },
};

export const sysPerm = {
  name: '系统',
  view: {
    role: ['Admin'],
    pass: false,
    name: '查看组织管理/用户管理/全局配置/集群管理页面',
  },
};
