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
import * as React from 'react';
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
  iteration: <CustomIcon type='bb1' className='issue-icon iteration' />,
  priority: { // 优先级icon
    URGENT: <CustomIcon type='jinji' className='issue-icon priority urgent' />,
    HIGH: <CustomIcon type='gao' className='issue-icon priority high' />,
    NORMAL: <CustomIcon type='zhong' className='issue-icon priority normal' />,
    LOW: <CustomIcon type='di' className='issue-icon priority low' />,
  },
  issue: { // 时间类型icon
    REQUIREMENT: <CustomIcon type='xiangfatianjia' className='issue-icon issue-type requirement' />,
    TASK: <IconTask className='issue-icon issue-type task' size="14px" fill="#498e9e" />,
    BUG: <IconBug className='issue-icon issue-type bug' size="14px" fill="#f47201" />,
    EPIC: <CustomIcon type='lichengbei' className='issue-icon issue-type epic' />,
  },
  severity: { // 严重程度icon（bug）
    FATAL: <CustomIcon type='P0' className='issue-icon severity fatal' />,
    SERIOUS: <CustomIcon type='P1' className='issue-icon severity serious' />,
    NORMAL: <CustomIcon type='P2' className='issue-icon severity normal' />,
    SLIGHT: <CustomIcon type='P3' className='issue-icon severity slight' />,
    SUGGEST: <CustomIcon type='P4' className='issue-icon severity suggest' />,
  },
  state: { // 状态
    OPEN: <CustomIcon type='wh' className='issue-icon state wh' />,
    WORKING: <CustomIcon type='jxz' className='issue-icon state jxz' />,
    TESTING: <CustomIcon type='jxz' className='issue-icon state jxz' />,
    DONE: <CustomIcon type='tg' className='issue-icon state tg' />,
    RESOLVED: <CustomIcon type='tg' className='issue-icon state tg' />,
    REOPEN: <CustomIcon type='zt' className='issue-icon state zt' />,
    WONTFIX: <CustomIcon type='zs' className='issue-icon state zs' />,
    DUP: <CustomIcon type='zs' className='issue-icon state zs' />,
    CLOSED: <CustomIcon type='tg' className='issue-icon state tg' />,
  },
};

export const ISSUE_COMPLEXITY_MAP = {
  HARD: { value: 'HARD', label: i18n.t('project:hard') },
  NORMAL: { value: 'NORMAL', label: i18n.t('project:normal') },
  EASY: { value: 'EASY', label: i18n.t('project:easy') },
};

export const BUG_SEVERITY_MAP = {
  FATAL: {
    value: 'FATAL',
    label: `P0 ${i18n.t('project:severity-fatal')}`,
    icon: ISSUE_ICON.severity.FATAL,
    iconLabel: <div className='v-align'>{ISSUE_ICON.severity.FATAL}{i18n.t('project:severity-fatal')}</div>,
  },
  SERIOUS: {
    value: 'SERIOUS',
    label: `P1 ${i18n.t('project:severity-serious')}`,
    icon: ISSUE_ICON.severity.SERIOUS,
    iconLabel: <div className='v-align'>{ISSUE_ICON.severity.SERIOUS}{i18n.t('project:severity-serious')}</div>,
  },
  NORMAL: {
    value: 'NORMAL',
    label: `P2 ${i18n.t('project:severity-normal')}`,
    icon: ISSUE_ICON.severity.NORMAL,
    iconLabel: <div className='v-align'>{ISSUE_ICON.severity.NORMAL}{i18n.t('project:severity-normal')}</div>,
  },
  SLIGHT: {
    value: 'SLIGHT',
    label: `P3 ${i18n.t('project:severity-slight')}`,
    icon: ISSUE_ICON.severity.SLIGHT,
    iconLabel: <div className='v-align'>{ISSUE_ICON.severity.SLIGHT}{i18n.t('project:severity-slight')}</div>,
  },
  SUGGEST: {
    value: 'SUGGEST',
    label: `P4 ${i18n.t('project:severity-suggest')}`,
    icon: ISSUE_ICON.severity.SUGGEST,
    iconLabel: <div className='v-align'>{ISSUE_ICON.severity.SUGGEST}{i18n.t('project:severity-suggest')}</div>,
  },
};

export const ISSUE_TYPE_MAP = {
  REQUIREMENT: {
    value: 'REQUIREMENT',
    label: i18n.t('requirement'),
    icon: ISSUE_ICON.issue.REQUIREMENT,
    iconLabel: <div className='v-align'>{ISSUE_ICON.issue.REQUIREMENT}{i18n.t('requirement')}</div>,
  },
  TASK: {
    value: 'TASK',
    label: i18n.t('task'),
    icon: ISSUE_ICON.issue.TASK,
    iconLabel: <div className='v-align'>{ISSUE_ICON.issue.TASK}{i18n.t('task')}</div>,
  },
  BUG: {
    value: 'BUG',
    label: i18n.t('bug'),
    icon: ISSUE_ICON.issue.BUG,
    iconLabel: <div className='v-align'>{ISSUE_ICON.issue.BUG}{i18n.t('bug')}</div>,
  },
  TICKET: {
    value: 'TICKET',
    label: i18n.t('project:ticket'),
    icon: null,
    iconLabel: <div className='v-align'>{i18n.t('project:ticket')}</div>,
  },
  EPIC: {
    value: 'EPIC',
    label: i18n.t('project:milestone'),
    icon: ISSUE_ICON.issue.EPIC,
    iconLabel: <div className='v-align'>{ISSUE_ICON.issue.EPIC}{i18n.t('project:milestone')}</div>,
  },
};

export const ISSUE_PRIORITY_MAP = {
  URGENT: {
    value: 'URGENT',
    label: i18n.t('project:urgent'),
    icon: ISSUE_ICON.priority.URGENT,
    iconLabel: <div className='v-align'>{ISSUE_ICON.priority.URGENT}{i18n.t('project:urgent')}</div>,
  },
  HIGH: {
    value: 'HIGH',
    label: i18n.t('project:high'),
    icon: ISSUE_ICON.priority.HIGH,
    iconLabel: <div className='v-align'>{ISSUE_ICON.priority.HIGH}{i18n.t('project:high')}</div>,
  },
  NORMAL: {
    value: 'NORMAL',
    label: i18n.t('project:normal'),
    icon: ISSUE_ICON.priority.NORMAL,
    iconLabel: <div className='v-align'>{ISSUE_ICON.priority.NORMAL}{i18n.t('project:normal')}</div>,
  },
  LOW: {
    value: 'LOW',
    label: i18n.t('project:low'),
    icon: ISSUE_ICON.priority.LOW,
    iconLabel: <div className='v-align'>{ISSUE_ICON.priority.LOW}{i18n.t('project:low')}</div>,
  },
};

export const ISSUE_PRIORITY_LIST = Object.values(ISSUE_PRIORITY_MAP);


export const REQUIREMENT_STATE_MAP = {
  OPEN: {
    value: 'OPEN',
    icon: ISSUE_ICON.state.OPEN,
    label: i18n.t('project:open'),
    color: 'yellow',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.OPEN}{i18n.t('project:open')}</div>,
  },
  WORKING: {
    value: 'WORKING',
    icon: ISSUE_ICON.state.WORKING,
    label: i18n.t('project:working'),
    color: 'blue',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.WORKING}{i18n.t('project:working')}</div>,
  },
  TESTING: {
    value: 'TESTING',
    icon: ISSUE_ICON.state.TESTING,
    label: i18n.t('project:testing'),
    color: 'blue',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.TESTING}{i18n.t('project:testing')}</div>,
  },
  DONE: {
    value: 'DONE',
    icon: ISSUE_ICON.state.DONE,
    label: i18n.t('project:done'),
    color: 'green',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.DONE}{i18n.t('project:done')}</div>,
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
    label: i18n.t('project:open'),
    nextStates: ['WORKING'],
    color: 'yellow',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.OPEN}{i18n.t('project:open')}</div>,
  },
  WORKING: {
    value: 'WORKING',
    icon: ISSUE_ICON.state.WORKING,
    label: i18n.t('project:working'),
    nextStates: ['DONE'],
    color: 'blue',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.WORKING}{i18n.t('project:working')}</div>,
  },
  DONE: {
    value: 'DONE',
    icon: ISSUE_ICON.state.DONE,
    label: i18n.t('project:done'),
    nextStates: [],
    color: 'green',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.DONE}{i18n.t('project:done')}</div>,
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
    label: i18n.t('project:open'),
    color: 'yellow',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.OPEN}{i18n.t('project:open')}</div>,
  },
  RESOLVED: {
    value: 'RESOLVED',
    icon: ISSUE_ICON.state.RESOLVED,
    label: i18n.t('project:resolved'),
    color: 'green',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.RESOLVED}{i18n.t('project:resolved')}</div>,
  },
  REOPEN: {
    value: 'REOPEN',
    icon: ISSUE_ICON.state.REOPEN,
    label: i18n.t('project:reopen'),
    color: 'red',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.REOPEN}{i18n.t('project:reopen')}</div>,
  },
  WONTFIX: {
    value: 'WONTFIX',
    icon: ISSUE_ICON.state.WONTFIX,
    label: i18n.t('project:won\'t fix'),
    color: 'text',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.WONTFIX}{i18n.t('project:won\'t fix')}</div>,
  },
  DUP: {
    value: 'DUP',
    icon: ISSUE_ICON.state.DUP,
    label: i18n.t('project:won\'t fix, duplicated'),
    color: 'text',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.DUP}{i18n.t('project:won\'t fix, duplicated')}</div>,
  },
  CLOSED: {
    value: 'CLOSED',
    icon: ISSUE_ICON.state.CLOSED,
    label: i18n.t('project:closed'),
    color: 'green',
    iconLabel: <div className='v-align'>{ISSUE_ICON.state.CLOSED}{i18n.t('project:closed')}</div>,
  },
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
  canWontfix: { label: i18n.t('project:won\'t fix'), state: 'WONTFIX' },
  canWorking: { label: i18n.t('project:working'), state: 'WORKING' },
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

export const BUG_STAGE_OPTION = [
  {
    name: i18n.t('project:demand design'),
    value: 'demandDesign',
  },
  {
    name: i18n.t('project:architecture design'),
    value: 'architectureDesign',
  },
  {
    name: i18n.t('project:code development'),
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
    name: i18n.t('org:operator'),
    value: 'operator',
  },
];
