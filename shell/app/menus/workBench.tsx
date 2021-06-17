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
import { filterMenu, MENU_SCOPE } from './util';
import { goTo } from 'common/utils';
import { filter } from 'lodash';
import permStore from 'user/stores/permission';
import {
  ApiApp as IconApiApp,
  ApplicationOne as IconApplicationOne,
  Seal as IconSeal,
  Send as IconSend,
  BookOne as IconBookOne,
} from '@icon-park/react';
import { Icon as CustomIcon } from 'common';
import React from 'react';

export const getWorkBenchMenu = () => {
  const orgPerm = permStore.getState((s) => s.org);
  return filterMenu(
    filter(
      [
        {
          href: goTo.resolve.workBenchRoot(), // '/workBench/projects',
          icon: <IconApiApp />,
          text: i18n.t('joined projects'),
        },
        {
          href: goTo.resolve.workBenchApps(), // '/workBench/apps',
          icon: <IconApplicationOne />,
          text: i18n.t('joined apps'),
        },
        {
          icon: <CustomIcon type="apijishi" />,
          key: 'apiManage',
          text: i18n.t('API'),
          href: goTo.resolve.apiManageRoot(),
          show: orgPerm.workBench.apiManage.read.pass,
          subMenu: [
            {
              href: goTo.resolve.apiManageRoot(),
              // icon: 'apijs',
              text: i18n.t('default:API market'),
              prefix: `${goTo.resolve.apiManageMarket()}/`,
            },
            {
              href: goTo.resolve.apiAccessManage(),
              // icon: 'bianliang',
              text: i18n.t('access management'),
            },
            {
              href: goTo.resolve.apiMyVisit(),
              // icon: 'renyuan',
              text: i18n.t('my visit'),
            },
          ],
        },
        {
          href: goTo.resolve.workBenchService(), // '/workBench/service',
          icon: <CustomIcon type="kuozhanfuwu" />,
          text: i18n.t('addon service'),
          show: orgPerm.workBench.addonService.read.pass,
        },
        {
          key: 'approval',
          href: goTo.resolve.workBenchApprove(), // '/workBench/approval/my-approve',
          icon: <IconSeal />,
          text: i18n.t('workBench:approval request'),
          subMenu: [
            {
              text: i18n.t('workBench:approved'),
              href: goTo.resolve.workBenchApprovePending(), // '/workBench/approval/my-approve/pending',
              prefix: `${goTo.resolve.workBenchApprove()}/`,
            },
            {
              text: i18n.t('workBench:initiated'),
              href: goTo.resolve.workBenchMyInitiateWait(), // '/workBench/approval/my-initiate/WaitApprove',
              prefix: `${goTo.resolve.workBenchMyInitiate()}/`,
            },
          ],
        },
        {
          key: 'workBenchPublisher',
          href: goTo.resolve.workBenchPublisher(), // '/workBench/publisher',
          icon: <IconSend />,
          text: i18n.t('publisher:my release'),
          show: orgPerm.workBench.publisher.read.pass,
        },
        {
          href: goTo.resolve.workBenchPublicProjects(),
          icon: <IconBookOne />,
          text: i18n.t('public project'),
        },
      ],
      (item) => item.show !== false,
    ),
    MENU_SCOPE.workBench,
  );
};
