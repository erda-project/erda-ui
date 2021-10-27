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
import React from 'react';
import { Icon as CustomIcon } from 'common';
import { List as IconTask, Bug as IconBug } from '@icon-park/react';

import './issue-config.scss';

export enum ISSUE_TYPE {
  ALL = 'ALL',
  EPIC = 'EPIC',
  REQUIREMENT = 'REQUIREMENT',
  TASK = 'TASK',
  BUG = 'BUG',
  TICKET = 'TICKET',
}

export const ISSUE_ICON = {
  iteration: <CustomIcon type="bb1" className="issue-icon iteration" />,
  priority: {
    // 优先级icon
    URGENT: <CustomIcon type="jinji" className="issue-icon priority urgent" />,
    HIGH: <CustomIcon type="gao" className="issue-icon priority high" />,
    NORMAL: <CustomIcon type="zhong" className="issue-icon priority normal" />,
    LOW: <CustomIcon type="di" className="issue-icon priority low" />,
  },
  issue: {
    // 时间类型icon
    REQUIREMENT: <CustomIcon type="xiangfatianjia" className="issue-icon issue-type requirement" />,
    TASK: <IconTask className="issue-icon issue-type task" size="14px" fill="#498e9e" />,
    BUG: <IconBug className="issue-icon issue-type bug" size="14px" fill="#f47201" />,
    EPIC: <CustomIcon type="lichengbei" className="issue-icon issue-type epic" />,
  },
  severity: {
    // 严重程度icon（bug）
    FATAL: <CustomIcon type="P0" className="issue-icon severity fatal" />,
    SERIOUS: <CustomIcon type="P1" className="issue-icon severity serious" />,
    NORMAL: <CustomIcon type="P2" className="issue-icon severity normal" />,
    SLIGHT: <CustomIcon type="P3" className="issue-icon severity slight" />,
    SUGGEST: <CustomIcon type="P4" className="issue-icon severity suggest" />,
  },
  state: {
    // 状态
    OPEN: <CustomIcon type="wh" className="issue-icon state wh" />,
    WORKING: <CustomIcon type="jxz" className="issue-icon state jxz" />,
    TESTING: <CustomIcon type="jxz" className="issue-icon state jxz" />,
    DONE: <CustomIcon type="tg" className="issue-icon state tg" />,
    RESOLVED: <CustomIcon type="tg" className="issue-icon state tg" />,
    REOPEN: <CustomIcon type="zt" className="issue-icon state zt" />,
    WONTFIX: <CustomIcon type="zs" className="issue-icon state zs" />,
    DUP: <CustomIcon type="zs" className="issue-icon state zs" />,
    CLOSED: <CustomIcon type="tg" className="issue-icon state tg" />,
  },
};

export const ISSUE_COMPLEXITY_MAP = {
  HARD: { value: 'HARD', label: i18n.t('dop:complex') },
  NORMAL: { value: 'NORMAL', label: i18n.t('medium') },
  EASY: { value: 'EASY', label: i18n.t('dop:easy') },
};

export const BUG_SEVERITY_MAP = {
  FATAL: {
    value: 'FATAL',
    label: `P0 ${i18n.t('dop:severity-fatal')}`,
    icon: ISSUE_ICON.severity.FATAL,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.severity.FATAL}
        {i18n.t('dop:severity-fatal')}
      </div>
    ),
  },
  SERIOUS: {
    value: 'SERIOUS',
    label: `P1 ${i18n.t('dop:serious')}`,
    icon: ISSUE_ICON.severity.SERIOUS,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.severity.SERIOUS}
        {i18n.t('dop:serious')}
      </div>
    ),
  },
  NORMAL: {
    value: 'NORMAL',
    label: `P2 ${i18n.t('dop:normal')}`,
    icon: ISSUE_ICON.severity.NORMAL,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.severity.NORMAL}
        {i18n.t('dop:normal')}
      </div>
    ),
  },
  SLIGHT: {
    value: 'SLIGHT',
    label: `P3 ${i18n.t('dop:slight')}`,
    icon: ISSUE_ICON.severity.SLIGHT,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.severity.SLIGHT}
        {i18n.t('dop:slight')}
      </div>
    ),
  },
  SUGGEST: {
    value: 'SUGGEST',
    label: `P4 ${i18n.t('dop:suggest')}`,
    icon: ISSUE_ICON.severity.SUGGEST,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.severity.SUGGEST}
        {i18n.t('dop:suggest')}
      </div>
    ),
  },
};

export const ISSUE_TYPE_MAP = {
  REQUIREMENT: {
    value: 'REQUIREMENT',
    label: i18n.t('requirement'),
    icon: ISSUE_ICON.issue.REQUIREMENT,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.issue.REQUIREMENT}
        {i18n.t('requirement')}
      </div>
    ),
  },
  TASK: {
    value: 'TASK',
    label: i18n.t('task'),
    icon: ISSUE_ICON.issue.TASK,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.issue.TASK}
        {i18n.t('task')}
      </div>
    ),
  },
  BUG: {
    value: 'BUG',
    label: i18n.t('bug'),
    icon: ISSUE_ICON.issue.BUG,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.issue.BUG}
        {i18n.t('bug')}
      </div>
    ),
  },
  TICKET: {
    value: 'TICKET',
    label: i18n.t('dop:ticket'),
    icon: null,
    iconLabel: <div className="flex items-center">{i18n.t('dop:ticket')}</div>,
  },
  EPIC: {
    value: 'EPIC',
    label: i18n.t('dop:milestone'),
    icon: ISSUE_ICON.issue.EPIC,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.issue.EPIC}
        {i18n.t('dop:milestone')}
      </div>
    ),
  },
};

export const ISSUE_PRIORITY_MAP = {
  URGENT: {
    value: 'URGENT',
    label: i18n.t('dop:urgent'),
    icon: ISSUE_ICON.priority.URGENT,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.priority.URGENT}
        {i18n.t('dop:urgent')}
      </div>
    ),
  },
  HIGH: {
    value: 'HIGH',
    label: i18n.t('high'),
    icon: ISSUE_ICON.priority.HIGH,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.priority.HIGH}
        {i18n.t('high')}
      </div>
    ),
  },
  NORMAL: {
    value: 'NORMAL',
    label: i18n.t('medium'),
    icon: ISSUE_ICON.priority.NORMAL,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.priority.NORMAL}
        {i18n.t('medium')}
      </div>
    ),
  },
  LOW: {
    value: 'LOW',
    label: i18n.t('low'),
    icon: ISSUE_ICON.priority.LOW,
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.priority.LOW}
        {i18n.t('low')}
      </div>
    ),
  },
};

export const ISSUE_PRIORITY_LIST = Object.values(ISSUE_PRIORITY_MAP);

export const REQUIREMENT_STATE_MAP = {
  OPEN: {
    value: 'OPEN',
    icon: ISSUE_ICON.state.OPEN,
    label: i18n.t('dop:open'),
    color: 'yellow',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.OPEN}
        {i18n.t('dop:open')}
      </div>
    ),
  },
  WORKING: {
    value: 'WORKING',
    icon: ISSUE_ICON.state.WORKING,
    label: i18n.t('dop:processing'),
    color: 'blue',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.WORKING}
        {i18n.t('dop:processing')}
      </div>
    ),
  },
  TESTING: {
    value: 'TESTING',
    icon: ISSUE_ICON.state.TESTING,
    label: i18n.t('dop:testing'),
    color: 'blue',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.TESTING}
        {i18n.t('dop:testing')}
      </div>
    ),
  },
  DONE: {
    value: 'DONE',
    icon: ISSUE_ICON.state.DONE,
    label: i18n.t('dop:done'),
    color: 'green',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.DONE}
        {i18n.t('dop:done')}
      </div>
    ),
  },
};
export const REQUIREMENT_STATE = Object.keys(REQUIREMENT_STATE_MAP);

export const REQUIREMENT_PANEL_ICON = {
  OPEN: 'wks',
  WORKING: 'jxz1',
  TESTING: 'csz',
  DONE: 'yjs',
};

export const TASK_STATE_MAP: ISSUE.TaskMap = {
  OPEN: {
    value: 'OPEN',
    icon: ISSUE_ICON.state.OPEN,
    label: i18n.t('dop:open'),
    nextStates: ['WORKING'],
    color: 'yellow',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.OPEN}
        {i18n.t('dop:open')}
      </div>
    ),
  },
  WORKING: {
    value: 'WORKING',
    icon: ISSUE_ICON.state.WORKING,
    label: i18n.t('dop:processing'),
    nextStates: ['DONE'],
    color: 'blue',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.WORKING}
        {i18n.t('dop:processing')}
      </div>
    ),
  },
  DONE: {
    value: 'DONE',
    icon: ISSUE_ICON.state.DONE,
    label: i18n.t('dop:done'),
    nextStates: [],
    color: 'green',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.DONE}
        {i18n.t('dop:done')}
      </div>
    ),
  },
};
export const TASK_STATE = Object.keys(TASK_STATE_MAP) as ISSUE.TaskState[];

export const TASK_PANEL_ICON = {
  OPEN: 'wks',
  WORKING: 'jxz1',
  DONE: 'yjs',
};

export const BUG_STATE_MAP = {
  OPEN: {
    value: 'OPEN',
    icon: ISSUE_ICON.state.OPEN,
    label: i18n.t('dop:open'),
    color: 'yellow',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.OPEN}
        {i18n.t('dop:open')}
      </div>
    ),
  },
  RESOLVED: {
    value: 'RESOLVED',
    icon: ISSUE_ICON.state.RESOLVED,
    label: i18n.t('dop:resolved'),
    color: 'green',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.RESOLVED}
        {i18n.t('dop:resolved')}
      </div>
    ),
  },
  REOPEN: {
    value: 'REOPEN',
    icon: ISSUE_ICON.state.REOPEN,
    label: i18n.t('dop:reopen'),
    color: 'red',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.REOPEN}
        {i18n.t('dop:reopen')}
      </div>
    ),
  },
  WONTFIX: {
    value: 'WONTFIX',
    icon: ISSUE_ICON.state.WONTFIX,
    label: i18n.t("dop:won't fix"),
    color: 'text',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.WONTFIX}
        {i18n.t("dop:won't fix")}
      </div>
    ),
  },
  DUP: {
    value: 'DUP',
    icon: ISSUE_ICON.state.DUP,
    label: i18n.t("dop:won't fix, duplicated"),
    color: 'text',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.DUP}
        {i18n.t("dop:won't fix, duplicated")}
      </div>
    ),
  },
  CLOSED: {
    value: 'CLOSED',
    icon: ISSUE_ICON.state.CLOSED,
    label: i18n.t('dop:closed'),
    color: 'green',
    iconLabel: (
      <div className="flex items-center">
        {ISSUE_ICON.state.CLOSED}
        {i18n.t('dop:closed')}
      </div>
    ),
  },
};
export const BUG_STATE = Object.keys(BUG_STATE_MAP);

export const ISSUE_STATE_MAP = {
  ...REQUIREMENT_STATE_MAP,
  ...TASK_STATE_MAP,
  ...BUG_STATE_MAP,
};

export const ISSUE_BUTTON_STATE = {
  canOpen: { label: i18n.t('dop:open'), state: 'OPEN' },
  canDup: { label: i18n.t('dop:duplicated'), state: 'DUP' },
  canReOpen: { label: i18n.t('dop:reopen'), state: 'REOPEN' },
  canResolved: { label: i18n.t('dop:resolved'), state: 'RESOLVED' },
  canTesting: { label: i18n.t('dop:testing'), state: 'TESTING' },
  canWontfix: { label: i18n.t("dop:won't fix"), state: 'WONTFIX' },
  canWorking: { label: i18n.t('dop:processing'), state: 'WORKING' },
  canClosed: { label: i18n.t('dop:close'), state: 'CLOSED' },
  canDone: { label: i18n.t('dop:completed'), state: 'DONE' },
};

export const EDIT_PROPS = {
  [ISSUE_TYPE.REQUIREMENT]: {
    titlePlaceHolder: i18n.t('dop:input requirement name'),
    contentLabel: i18n.t('dop:requirement description'),
  },
  [ISSUE_TYPE.TASK]: {
    titlePlaceHolder: i18n.t('dop:input task name'),
    contentLabel: i18n.t('dop:task description'),
  },
  [ISSUE_TYPE.BUG]: {
    titlePlaceHolder: i18n.t('dop:input bug name'),
    contentLabel: i18n.t('dop:bug description'),
  },
  [ISSUE_TYPE.TICKET]: {
    titlePlaceHolder: i18n.t('dop:input ticket name'),
    contentLabel: i18n.t('dop:ticket description'),
    panelTitle: i18n.t('dop:related task'),
  },
  [ISSUE_TYPE.EPIC]: {
    titlePlaceHolder: i18n.t('dop:input milestone name'),
    contentLabel: i18n.t('dop:milestone description'),
  },
};

export enum ISSUE_OPTION {
  REQUIREMENT = 'REQUIREMENT',
  TASK = 'TASK',
  BUG = 'BUG',
}

export const BUG_STAGE_OPTION = [
  {
    name: i18n.t('dop:demand design'),
    value: 'demandDesign',
  },
  {
    name: i18n.t('dop:architecture design'),
    value: 'architectureDesign',
  },
  {
    name: i18n.t('dop:code development'),
    value: 'codeDevelopment',
  },
];

export const TASK_TYPE_OPTION = [
  {
    name: i18n.t('design'),
    value: 'design',
  },
  {
    name: i18n.t('dev'),
    value: 'dev',
  },
  {
    name: i18n.t('test'),
    value: 'test',
  },
  {
    name: i18n.t('implement'),
    value: 'implement',
  },
  {
    name: i18n.t('deploy'),
    value: 'deploy',
  },
  {
    name: i18n.t('cmp:operator'),
    value: 'operator',
  },
];
