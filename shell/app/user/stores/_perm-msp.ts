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

import i18n from 'i18n';

export const mspRoleMap = {
  Owner: { name: '项目所有者', value: 'Owner' },
  Lead: { name: '研发主管', value: 'Lead' },
  Dev: { name: '开发工程师', value: 'Dev' },
};

export const mspPerm = {
  name: i18n.t('msp'),
  MSP: {
    name: i18n.t('org:microservice governance project'),
    member: {
      name: i18n.t('org:member management'),
      addProjectMember: {
        name: i18n.t('add member'),
        pass: false,
        role: ['Owner', 'Lead'],
      },
      editProjectMember: {
        name: i18n.t('edit {name}', { name: i18n.t('member') }),
        pass: false,
        role: ['Owner', 'Lead'],
      },
      removeProjectMember: {
        name: i18n.t('delete {name}', { name: i18n.t('member') }),
        pass: false,
        role: ['Owner', 'Lead'],
      },
    },
    accessConfiguration: {
      name: '接入配置',
      createAccessKey: {
        name: '创建 AccessKey',
        pass: false,
        role: ['Owner', 'Lead'],
      },
      deleteAccessKey: {
        name: '删除 AccessKey',
        pass: false,
        role: ['Owner', 'Lead'],
      },
      enableAccessKey: {
        name: '启用 AccessKey',
        pass: false,
        role: ['Owner', 'Lead'],
      },
      disableAccessKey: {
        name: '禁用 AccessKey',
        pass: false,
        role: ['Owner', 'Lead'],
      },
      viewAccessKeySecret: {
        name: '查看 AccessKeySecret',
        pass: false,
        role: ['Owner', 'Lead'],
      },
    },
  },
};
