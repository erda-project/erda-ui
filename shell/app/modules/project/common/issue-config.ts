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

import i18n, { isZh } from 'i18n';

export enum ISSUE_TYPE {
  ALL = 'ALL',
  EPIC = 'EPIC',
  REQUIREMENT = 'REQUIREMENT',
  TASK = 'TASK',
  BUG = 'BUG',
  TICKET = 'TICKET',
}

export const ISSUE_COMPLEXITY_MAP = {
  HARD: { value: 'HARD', label: i18n.t('project:complex'), icon: 'fz3' },
  NORMAL: { value: 'NORMAL', label: i18n.t('medium'), icon: 'fz5' },
  EASY: { value: 'EASY', label: i18n.t('project:easy'), icon: 'fz2' },
};

export const BUG_SEVERITY_MAP = {
  FATAL: { value: 'FATAL', label: `P0 ${i18n.t('project:severity-fatal')}`, icon: 'yz5' },
  SERIOUS: { value: 'SERIOUS', label: `P1 ${i18n.t('project:serious')}`, icon: 'yz4' },
  NORMAL: { value: 'NORMAL', label: `P2 ${i18n.t('project:normal')}`, icon: 'yz3' },
  SLIGHT: { value: 'SLIGHT', label: `P3 ${i18n.t('project:slight')}`, icon: 'yz2' },
  SUGGEST: { value: 'SUGGEST', label: `P4 ${i18n.t('project:suggest')}`, icon: 'yz1' },
};

export const ISSUE_PRIORITY_MAP = {
  URGENT: { value: 'URGENT', label: i18n.t('project:urgent'), icon: 'yx4' },
  HIGH: { value: 'HIGH', label: i18n.t('high'), icon: 'yx3' },
  NORMAL: { value: 'NORMAL', label: i18n.t('medium'), icon: 'yx2' },
  LOW: { value: 'LOW', label: i18n.t('low'), icon: 'yx1' },
};
export const ISSUE_PRIORITY_ICON_STYLE = { height: '20px', width: '20px', verticalAlign: 'sub' };
export const ISSUE_PRIORITY_LIST = Object.values(ISSUE_PRIORITY_MAP);

export const REQUIREMENT_STATE_MAP = {
  OPEN: { icon: 'wh', label: i18n.t('project:open') },
  WORKING: { icon: 'jxz', label: i18n.t('project:processing') },
  TESTING: { icon: 'jxz', label: i18n.t('project:testing') },
  DONE: { icon: 'tg', label: i18n.t('project:done') },
};
export const REQUIREMENT_STATE = Object.keys(REQUIREMENT_STATE_MAP);

export const REQUIREMENT_PANEL_ICON = {
  OPEN: 'wks',
  WORKING: 'jxz1',
  TESTING: 'csz',
  DONE: 'yjs',
};

export const TASK_STATE_MAP: ISSUE.TaskMap = {
  OPEN: { icon: 'wh', label: i18n.t('project:open'), nextStates: ['WORKING'] },
  WORKING: { icon: 'jxz', label: i18n.t('project:processing'), nextStates: ['DONE'] },
  DONE: { icon: 'tg', label: i18n.t('project:done'), nextStates: [] },
};
export const TASK_STATE = Object.keys(TASK_STATE_MAP) as ISSUE.TaskState[];

export const TASK_PANEL_ICON = {
  OPEN: 'wks',
  WORKING: 'jxz1',
  DONE: 'yjs',
};

export const BUG_STATE_MAP = {
  OPEN: { icon: 'wh', label: i18n.t('project:open') },
  RESOLVED: { icon: 'tg', label: i18n.t('project:resolved') },
  REOPEN: { icon: 'zt', label: i18n.t('project:reopen') },
  WONTFIX: { icon: 'zs', label: i18n.t("project:won't fix") },
  DUP: { icon: 'zs', label: i18n.t("project:won't fix, duplicated") },
  CLOSED: { icon: 'tg', label: i18n.t('project:closed') },
};
export const BUG_STATE = Object.keys(BUG_STATE_MAP);

export const ISSUE_STATE_MAP = {
  ...REQUIREMENT_STATE_MAP,
  ...TASK_STATE_MAP,
  ...BUG_STATE_MAP,
};

export const ISSUE_BUTTON_STATE = {
  canOpen: { label: i18n.t('project:open'), state: 'OPEN' },
  canDup: { label: i18n.t('project:duplicated'), state: 'DUP' },
  canReOpen: { label: i18n.t('project:reopen'), state: 'REOPEN' },
  canResolved: { label: i18n.t('project:resolved'), state: 'RESOLVED' },
  canTesting: { label: i18n.t('project:testing'), state: 'TESTING' },
  canWontfix: { label: i18n.t("project:won't fix"), state: 'WONTFIX' },
  canWorking: { label: i18n.t('project:processing'), state: 'WORKING' },
  canClosed: { label: i18n.t('project:close'), state: 'CLOSED' },
  canDone: { label: i18n.t('project:completed'), state: 'DONE' },
};

export const EDIT_PROPS = {
  [ISSUE_TYPE.REQUIREMENT]: {
    titlePlaceHolder: i18n.t('project:input requirement name'),
    contentLabel: i18n.t('project:requirement description'),
  },
  [ISSUE_TYPE.TASK]: {
    titlePlaceHolder: i18n.t('project:input task name'),
    contentLabel: i18n.t('project:task description'),
  },
  [ISSUE_TYPE.BUG]: {
    titlePlaceHolder: i18n.t('project:input bug name'),
    contentLabel: i18n.t('project:bug description'),
  },
  [ISSUE_TYPE.TICKET]: {
    titlePlaceHolder: i18n.t('project:input ticket name'),
    contentLabel: i18n.t('project:ticket description'),
    panelTitle: i18n.t('project:related task'),
  },
  [ISSUE_TYPE.EPIC]: {
    titlePlaceHolder: i18n.t('project:input milestone name'),
    contentLabel: i18n.t('project:milestone description'),
  },
};

export enum ISSUE_OPTION {
  REQUIREMENT = 'REQUIREMENT',
  TASK = 'TASK',
  BUG = 'BUG',
}

export const templateMap = isZh()
  ? {
      [ISSUE_TYPE.REQUIREMENT]: `### 【用户故事/要解决的问题】*


### 【意向用户】*


### 【用户体验目标】*


### 【链接/参考】

`,
      [ISSUE_TYPE.TASK]: `### 【用户故事/要解决的问题】*


### 【意向用户】*


### 【用户体验目标】*


### 【链接/参考】

`,
      [ISSUE_TYPE.BUG]: ``,
    }
  : {
      [ISSUE_TYPE.REQUIREMENT]: `### [User story/problem to solve] *


### [Intended users] *


### [User experience Goals] *


### [Link/Reference]

`,
      [ISSUE_TYPE.TASK]: ``,
      [ISSUE_TYPE.BUG]: `### [Environment Information]


### [Defect Description] *


### [Reoccurrence Procedure]


### [Actual Result]


### [Expected Result] *


### [Repair suggestion]
`,
    };
