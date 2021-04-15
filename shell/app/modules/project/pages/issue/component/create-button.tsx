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

import * as React from 'react';
import i18n from 'i18n';
import { Button, Tooltip, Dropdown, Menu } from 'app/nusi';
import { goTo } from 'common/utils';
import { WithAuth, usePerm } from 'user/common';
import { Icon as CustomIcon } from 'common';
import iterationStore from 'app/modules/project/stores/iteration';
import { ISSUE_TYPE_MAP, ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import { isEmpty, map } from 'lodash';

interface IProps {
  issueType: string;
  onClick: (val: string) => void
}

const options = [
  ISSUE_TYPE_MAP.REQUIREMENT,
  ISSUE_TYPE_MAP.TASK,
  ISSUE_TYPE_MAP.BUG,
];

const infoMap = {
  [ISSUE_TYPE.ALL]: {
    text: i18n.t('project:new issue'),
    icon: 'di',
  },
  [ISSUE_TYPE.REQUIREMENT]: {
    text: i18n.t('new requirement'),
  },
  [ISSUE_TYPE.TASK]: {
    text: i18n.t('application:new task'),
  },
  [ISSUE_TYPE.BUG]: {
    text: i18n.t('project:new bug'),
  },
};

export default ({ onClick, issueType }: IProps) => {
  const iterationList = iterationStore.useStore(s => s.iterationList);
  const authObj = usePerm(s => s.project);
  const typeInfo = infoMap[issueType];

  const menu = issueType === ISSUE_TYPE.ALL ? (
    <Menu onClick={(e:any) => onClick(e.key)}>
      {map(options, op => {
        return <Menu.Item key={op.value} disabled={!authObj[op.value.toLowerCase()].create.pass}>{op.iconLabel}</Menu.Item>;
      })}
    </Menu>
  ) : null;

  const btnContent = (
    <div>
      <span>{typeInfo.text}</span>
      {typeInfo.icon && <CustomIcon type={typeInfo.icon} />}
    </div>
  );
  return (
    <div className="top-button-group">
      {
        isEmpty(iterationList) ? (
          <Tooltip
            placement="left"
            title={(
              <span>
                {i18n.t('project:you need')}&nbsp;
                <span onClick={() => goTo('../iteration')} className="fake-link">{i18n.t('project:new iteration')}</span>
              </span>
            )}
          >
            <Button type="primary" disabled>{btnContent}</Button>
          </Tooltip>
        ) : (
          menu ? (
            <Dropdown overlay={menu}>
              <Button type="primary">{btnContent}</Button>
            </Dropdown>
          ) :
            <WithAuth pass={authObj[issueType.toLowerCase()].create.pass} >
              <Button type='primary' onClick={() => onClick(issueType)}>{btnContent}</Button>
            </WithAuth>
        )
      }
    </div>
  );
};
