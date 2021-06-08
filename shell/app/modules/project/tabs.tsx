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

import React from 'react';
import i18n from 'i18n';
import { Icon as CustomIcon } from 'common';
import permStore from 'user/stores/permission';
import { Tooltip } from 'app/nusi';

export const ITERATION_DETAIL_TABS = (params: Obj) => {
  const { breadcrumbInfoMap } = params;
  const iterationName = breadcrumbInfoMap?.iterationName;
  const projectPerm = permStore.useStore((s) => s.project);
  const tabs = [
    {
      key: '../',
      hrefType: 'back',
      name: (
        <span>
          <CustomIcon type="back" />
          {i18n.t('project:iteration')}
          {iterationName ?
            (
              iterationName.length > 8 ?
                <Tooltip title={iterationName} placement="topLeft">
                  ({iterationName.slice(0, 8)}...)
                </Tooltip>
                : `(${iterationName})`
            )
            : ''}
        </span>
      ),
      show: projectPerm.iteration.read.pass,
    },
    {
      key: 'all',
      name: i18n.t('project:all issues'),
      show: [
        projectPerm.requirement.read.pass,
        projectPerm.task.read.pass,
        projectPerm.bug.read.pass,
      ].some((k) => k),
    },
    {
      key: 'requirement',
      name: i18n.t('requirement'),
      show: projectPerm.requirement.read.pass,
    },
    {
      key: 'task',
      name: i18n.t('task'),
      show: projectPerm.task.read.pass,
    },
    {
      key: 'bug',
      name: i18n.t('bug'),
      show: projectPerm.bug.read.pass,
    },
  ];
  return tabs;
};

export const AUTO_TEST_SPACE_TABS = (params: Obj) => {
  const { breadcrumbInfoMap } = params;
  const autoTestSpaceName = breadcrumbInfoMap?.autoTestSpaceName;
  const tabs = [
    {
      key: '../',
      hrefType: 'back',
      name: (
        <span><CustomIcon type="back" />{i18n.t('project:test space')}{autoTestSpaceName ? `(${autoTestSpaceName})` : ''}</span>
      ),
    },
    {
      key: 'apis',
      name: i18n.t('project:APIs'),
    },
    {
      key: 'scenes',
      name: i18n.t('project:Scenes'),
    },
  ];
  return tabs;
};

export const PROJECT_TABS = () => {
  const projectPerm = permStore.useStore((s) => s.project);

  const tabs = [
    {
      key: 'milestone',
      name: i18n.t('project:milestone'),
      show: projectPerm.epic.read.pass,
    },
    {
      key: 'backlog',
      name: i18n.t('project:backlog'),
      show: projectPerm.backLog.viewBackLog.pass,
    },
    {
      key: 'iteration',
      name: i18n.t('project:sprint'),
      show: projectPerm.iteration.read.pass,
    },
    {
      key: 'all',
      name: i18n.t('project:all issues'),
      show: [
        projectPerm.requirement.read.pass,
        projectPerm.task.read.pass,
        projectPerm.bug.read.pass,
      ].some((k) => k),
    },
    {
      key: 'requirement',
      name: i18n.t('requirement'),
      show: projectPerm.requirement.read.pass,
    },
    {
      key: 'task',
      name: i18n.t('task'),
      show: projectPerm.task.read.pass,
    },
    {
      key: 'bug',
      name: i18n.t('bug'),
      show: projectPerm.bug.read.pass,
    },
  ];
  return tabs;
};

export const TEST_TABS = [
  {
    key: 'manual',
    name: i18n.t('project:manual test'),
  },
  {
    key: 'auto',
    name: i18n.t('project:automatic test'),
  },
];

export const DATABANK_TABS = [
  {
    key: 'data-source',
    name: i18n.t('project:data sources'),
  },
  {
    key: 'config-sheet',
    name: i18n.t('project:config data'),
  },
];
