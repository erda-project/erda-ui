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

// 通过权限配置页面导出角色数据覆盖，勿手动修改
export const projectRoleMap = {
  Owner: { name: i18n.t('user:Project Owner'), value: 'Owner' },
  Lead: { name: i18n.t('user:Project Leader'), value: 'Lead' },
  PM: { name: i18n.t('user:Project Manager'), value: 'PM' },
  PD: { name: i18n.t('user:Product Designer'), value: 'PD' },
  Dev: { name: i18n.t('user:Developer'), value: 'Dev' },
  QA: { name: i18n.t('user:Tester'), value: 'QA' },
  Support: { name: i18n.t('user:Q&A'), value: 'Support', isBuildIn: true },
  Ops: { name: i18n.t('org:operator'), value: 'Ops', isBuildIn: true },
  Reporter: { name: i18n.t('user:Reporter'), value: 'Reporter' },
  Creator: { name: i18n.t('user:Creator'), value: 'Creator', isCustomRole: true },
  Assignee: { name: i18n.t('user:Assignee'), value: 'Assignee', isCustomRole: true },
  Guest: { name: i18n.t('user:Guest'), value: 'Guest' },
};

// 通过权限配置页面导出数据覆盖，勿手动修改
export const projectPerm = {
  name: i18n.t('project'),
  addApp: {
    pass: false,
    name: i18n.t('add application'),
    role: ['Owner', 'Lead'],
  },
  editProject: {
    pass: false,
    name: i18n.t('user:edit project'),
    role: ['Owner', 'Lead'],
  },
  deleteProject: {
    pass: false,
    name: i18n.t('project:delete project'),
    role: ['Owner', 'Lead'],
  },
  service: {
    name: i18n.t('addonPlatform:addon category'),
    addProjectService: {
      pass: false,
      name: i18n.t('user:add project service'),
      role: ['Owner', 'Lead'],
    },
    viewService: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      name: i18n.t('application:view'),
    },
  },
  iteration: {
    name: i18n.t('project:sprint'),
    read: {
      pass: false,
      name: i18n.t('application:view'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Guest'],
    },
    operation: {
      pass: false,
      name: i18n.t('user:operation (new/edit/delete)'),
      role: ['Owner', 'PM', 'Lead', 'PD'],
    },
    handleFiled: {
      pass: false,
      role: ['Owner', 'PM'],
      name: i18n.t('user:archive/unarchive'),
    },
  },
  requirement: {
    name: i18n.t('requirement'),
    read: {
      pass: false,
      name: i18n.t('application:view'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
    },
    batchOperation: {
      pass: false,
      name: i18n.t('batch operate'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    create: {
      pass: false,
      name: i18n.t('add'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    edit: {
      pass: false,
      name: i18n.t('application:edit'),
      role: ['Owner', 'PM', 'PD', 'Creator', 'Assignee', 'Lead', 'Dev', 'QA'],
    },
    delete: {
      pass: false,
      name: i18n.t('application:delete'),
      role: ['Owner', 'PM', 'PD', 'Creator'],
    },
    updateStatus: {
      pass: false,
      name: i18n.t('user:status change'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee'],
    },
    export: {
      pass: false,
      name: i18n.t('export'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    switchType: {
      pass: false,
      role: ['Owner', 'Lead', 'PM'],
      name: i18n.t('user:switch type'),
    },
    import: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
      name: i18n.t('import'),
    },
  },
  epic: {
    name: i18n.t('project:milestone'),
    read: {
      pass: false,
      name: i18n.t('application:view'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
    },
    create: {
      pass: false,
      name: i18n.t('add'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    edit: {
      pass: false,
      name: i18n.t('application:edit'),
      role: ['Owner', 'PM', 'PD', 'Creator', 'Assignee', 'Lead', 'Dev', 'QA'],
    },
    delete: {
      pass: false,
      name: i18n.t('application:delete'),
      role: ['Owner', 'PM', 'PD', 'Creator'],
    },
    updateStatus: {
      pass: false,
      name: i18n.t('user:status change'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee'],
    },
    export: {
      pass: false,
      name: i18n.t('export'),
      role: ['Owner', 'Lead', 'PM', 'PD'],
    },
  },
  task: {
    name: i18n.t('task'),
    read: {
      pass: false,
      name: i18n.t('application:view'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
    },
    batchOperation: {
      pass: false,
      name: i18n.t('batch operate'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    create: {
      pass: false,
      name: i18n.t('add'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    edit: {
      pass: false,
      name: i18n.t('application:edit'),
      role: ['Owner', 'Lead', 'QA', 'Creator', 'Assignee', 'PM', 'PD', 'Dev'],
    },
    delete: {
      pass: false,
      name: i18n.t('application:delete'),
      role: ['Owner', 'Lead', 'Creator'],
    },
    updateStatus: {
      pass: false,
      name: i18n.t('user:state modification'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee'],
    },
    export: {
      pass: false,
      name: i18n.t('export'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    switchType: {
      pass: false,
      role: ['Owner', 'Lead', 'PM'],
      name: i18n.t('user:switch type'),
    },
    import: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
      name: i18n.t('import'),
    },
  },
  bug: {
    name: i18n.t('bug'),
    read: {
      pass: false,
      name: i18n.t('application:view'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
    },
    delete: {
      pass: false,
      name: i18n.t('application:delete'),
      role: ['Owner', 'Lead', 'PM', 'QA', 'Creator'],
    },
    export: {
      pass: false,
      name: i18n.t('export'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    batchOperation: {
      pass: false,
      name: i18n.t('batch operate'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    create: {
      pass: false,
      name: i18n.t('establish'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
    },
    edit: {
      pass: false,
      name: i18n.t('application:edit'),
      role: ['Owner', 'PM', 'QA', 'Creator', 'Assignee', 'Lead', 'PD', 'Dev'],
    },
    updateStatus: {
      pass: false,
      name: i18n.t('user:status change'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee'],
    },
    closeBug: {
      pass: false,
      name: i18n.t('application:close'),
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator'],
    },
    switchType: {
      pass: false,
      role: ['Owner', 'Lead', 'PM'],
      name: i18n.t('user:switch type'),
    },
    import: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
      name: i18n.t('import'),
    },
  },
  member: {
    name: i18n.t('user:project member management'),
    addProjectMember: {
      pass: false,
      name: i18n.t('common:add'),
      role: ['Owner', 'Lead', 'PM'],
    },
    editProjectMember: {
      pass: false,
      name: i18n.t('application:edit'),
      role: ['Owner', 'Lead', 'PM'],
    },
    removeProjectMember: {
      pass: false,
      name: i18n.t('application:delete'),
      role: ['Owner', 'Lead', 'PM'],
    },
    showAuthorize: {
      pass: false,
      name: i18n.t('authorize'),
      role: ['Owner', 'Lead', 'PM'],
    },
  },
  setting: {
    name: i18n.t('project setting'),
    branchRule: {
      name: i18n.t('project:branch rule'),
      operation: {
        pass: false,
        name: i18n.t('user:operation (add, delete, modify)'),
        role: ['Owner', 'Lead'],
      },
    },
    scanRule: {
      name: i18n.t('user:scanning rules'),
      operation: {
        pass: false,
        name: i18n.t('user:operation (add, delete, modify)'),
        role: ['Owner', 'Lead'],
      },
    },
    customWorkflow: {
      name: i18n.t('user:workflow management'),
      operation: {
        pass: false,
        name: i18n.t('user:operation (add, delete, modify)'),
        role: ['Owner', 'Lead', 'PM'],
      },
    },
    blockNetwork: {
      name: i18n.t('org:block network'),
      applyUnblock: {
        pass: false,
        name: i18n.t('user:apply for unblocking'),
        role: ['Owner', 'Lead', 'PM'],
      },
    },
    viewSetting: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      name: i18n.t('application:view'),
    },
  },
  ticket: {
    name: i18n.t('project:ticket'),
    read: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Reporter', 'Guest'],
      name: i18n.t('application:view'),
    },
    create: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Reporter', 'Guest'],
      name: i18n.t('establish'),
    },
    edit: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee', 'Guest'],
      name: i18n.t('application:edit'),
    },
    updateStatus: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Assignee', 'Guest'],
      name: i18n.t('user:status change'),
    },
    delete: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Creator', 'Assignee', 'Guest'],
      name: i18n.t('application:delete'),
    },
  },
  apiManage: {
    name: i18n.t('API'),
    apiMarket: {
      name: i18n.t('API market'),
      read: {
        pass: false,
        name: i18n.t('application:view'),
        role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      },
      edit: {
        pass: false,
        name: i18n.t('user:edit resources'),
        role: ['Owner', 'Lead', 'PM'],
      },
      delete: {
        pass: false,
        name: i18n.t('user:delete resource'),
        role: ['Owner', 'Lead', 'PM'],
      },
      publicAsset: {
        pass: false,
        name: i18n.t('user:public'),
        role: ['Owner', 'Lead', 'PM'],
      },
      addVersion: {
        pass: false,
        name: i18n.t('user:add version'),
        role: ['Owner', 'Lead', 'PM'],
      },
      deleteVersion: {
        pass: false,
        name: i18n.t('user:delete version'),
        role: ['Owner', 'Lead', 'PM'],
      },
      relatedProjectOrApp: {
        pass: false,
        name: i18n.t('user:associated projects/applications'),
        role: ['Owner', 'Lead', 'PM'],
      },
      relatedInstance: {
        pass: false,
        name: i18n.t('related instance'),
        role: ['Owner', 'Lead', 'PM'],
      },
    },
    accessManage: {
      name: i18n.t('access management'),
      read: {
        pass: false,
        name: i18n.t('application:view'),
        role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      },
      edit: {
        pass: false,
        name: i18n.t('application:edit'),
        role: ['Owner', 'Lead', 'PM'],
      },
      delete: {
        pass: false,
        name: i18n.t('application:delete'),
        role: ['Owner', 'Lead', 'PM'],
      },
      approve: {
        pass: false,
        name: i18n.t('user:approve'),
        role: ['Owner', 'Lead', 'PM'],
      },
    },
  },
  appList: {
    name: i18n.t('project:applications'),
    viewAppList: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Guest'],
      name: i18n.t('application:view'),
    },
  },
  backLog: {
    name: i18n.t('user:to do'),
    viewBackLog: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Guest'],
      name: i18n.t('application:view'),
    },
  },
  testManage: {
    name: i18n.t('project:test'),
    viewTest: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      name: i18n.t('application:view'),
    },
  },
  dashboard: {
    name: i18n.t('user:project market'),
    viewDashboard: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Guest'],
      name: i18n.t('application:view'),
    },
  },
  resource: {
    name: i18n.t('resource summary'),
    viewResource: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops'],
      name: i18n.t('application:view'),
    },
  },
  issue: {
    name: i18n.t('project:issue'),
    viewIssue: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Support', 'Ops', 'Guest'],
      name: i18n.t('application:view'),
    },
  },
  dataBank: {
    name: i18n.t('project:data bank'),
    dataSource: {
      name: i18n.t('project:data sources'),
      view: {
        pass: false,
        role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Ops'],
        name: i18n.t('application:view'),
      },
    },
    configData: {
      name: i18n.t('config sheet'),
      view: {
        pass: false,
        role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Ops'],
        name: i18n.t('application:view'),
      },
    },
  },
  pipeline: {
    name: i18n.t('application:pipeline'),
    view: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA'],
      name: i18n.t('application:view'),
    },
  },
  milestone: {
    name: i18n.t('project:milestone'),
    view: {
      pass: false,
      role: ['Owner', 'Lead', 'PM', 'PD', 'Dev', 'QA', 'Ops', 'Support'],
      name: i18n.t('application:view'),
    },
  },
};
