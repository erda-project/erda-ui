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
import { Menu, Dropdown } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { map } from 'lodash';
import { Down as IconDown } from '@icon-park/react';
import './status-toggle.scss';
import i18n from 'i18n';

export enum CaseStatus {
  INIT = 'INIT',
  PASSED = 'PASSED',
  FAIL = 'FAIL',
  BLOCK = 'BLOCK',
}

export const caseStateMap = {
  INIT: { name: i18n.t('project:not performed'), value: 'INIT' },
  PASSED: { name: i18n.t('project:passed'), value: 'PASSED' },
  FAIL: { name: i18n.t('project:not pass'), value: 'FAIL' },
  BLOCK: { name: i18n.t('project:blocking'), value: 'BLOCK' },
};

interface IProps {
  isPlan?: boolean;
  state: TEST_CASE.CaseResult | TEST_PLAN.PlanStatus;
  onChange: (k: string) => any;
}

export const StatusToggle = ({ isPlan, state, onChange }: IProps) => {
  const curState = state || CaseStatus.INIT;

  let stateMap = {
    INIT: {
      child: (
        <span className="test-status-toggle">
          <CustomIcon className="bg-color-icon" type="wh" />
          <span>{i18n.t('project:not performed')}</span>
        </span>
      ),
    },
    PASSED: {
      child: (
        <span className="test-status-toggle green">
          <CustomIcon className="bg-color-icon" type="tg" />
          <span>{i18n.t('project:passed')}</span>
        </span>
      ),
    },
    FAIL: {
      child: (
        <span className="test-status-toggle red">
          <CustomIcon className="bg-color-icon" type="wtg" />
          <span>{i18n.t('project:not pass')}</span>
        </span>
      ),
    },
    BLOCK: {
      child: (
        <span className="test-status-toggle yellow">
          <CustomIcon className="bg-color-icon" type="zs" />
          <span>{i18n.t('project:blocking')}</span>
        </span>
      ),
    },
  } as any;
  if (isPlan) {
    stateMap = {
      PAUSE: {
        child: (
          <span className="test-status-toggle yellow">
            <CustomIcon className="bg-color-icon" type="zs" />
            <span>{i18n.t('project:time out')}</span>
          </span>
        ),
      },
      DOING: {
        child: (
          <span className="test-status-toggle blue">
            <CustomIcon className="bg-color-icon" type="wh" />
            <span>{i18n.t('project:processing')}</span>
          </span>
        ),
      },
      DONE: {
        child: (
          <span className="test-status-toggle green">
            <CustomIcon className="bg-color-icon" type="tg" />
            <span>{i18n.t('project:completed')}</span>
          </span>
        ),
      },
    };
  }

  const handleClick = ({ key, domEvent }: any) => {
    domEvent.stopPropagation();
    onChange(key);
  };
  const menu = (
    <Menu onClick={handleClick}>
      {
        map(stateMap, (v, k) => {
          return (
            <Menu.Item key={k}>
              {v.child}
            </Menu.Item>
          );
        })
      }
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <span>
        {(stateMap[curState] || {}).child} <IconDown size="16px" />
      </span>
    </Dropdown>
  );
};
