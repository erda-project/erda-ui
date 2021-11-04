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
import { goTo, insertWhen } from 'common/utils';
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

export const getDopMenu = () => {
  const orgPerm = permStore.getState((s) => s.org);
  return filterMenu(
    filter(
      [
        {
          href: goTo.resolve.dopRoot(), // '/dop/projects',
          icon: <IconApiApp />,
          text: i18n.t('joined projects'),
          subtitle: i18n.t('Project'),
        },
        {
          href: goTo.resolve.dopApps(), // '/dop/apps',
          icon: <IconApplicationOne />,
          text: i18n.t('joined apps'),
          subtitle: i18n.t('App'),
        },
        {
          icon: <CustomIcon type="apijishi" />,
          key: 'apiManage',
          text: i18n.t('API'),
          subtitle: 'API',
          href: goTo.resolve.apiManageMarket(),
          show: orgPerm.dop.apiManage.read.pass,
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
        ...insertWhen(!process.env.FOR_COMMUNITY, [
          {
            href: goTo.resolve.dopService(), // '/dop/service',
            icon: <CustomIcon type="kuozhanfuwu" />,
            text: i18n.t('addon service'),
            subtitle: 'Addon',
            show: orgPerm.dop.addonService.read.pass,
          },
        ]),
        {
          key: 'approval',
          href: goTo.resolve.dopApprove(), // '/dop/approval/my-approve',
          icon: <IconSeal />,
          text: i18n.t('dop:approval request'),
          subtitle: i18n.t('Approve'),
          subMenu: [
            {
              text: i18n.t('dop:my approval'),
              href: goTo.resolve.dopApprovePending(), // '/dop/approval/my-approve/pending',
              prefix: `${goTo.resolve.dopApprove()}/`,
            },
            {
              text: i18n.t('dop:initiated'),
              href: goTo.resolve.dopMyInitiateWait(), // '/dop/approval/my-initiate/WaitApprove',
              prefix: `${goTo.resolve.dopMyInitiate()}/`,
            },
          ],
        },
        {
          key: 'dopPublisher',
          href: goTo.resolve.dopPublisher(), // '/dop/publisher',
          icon: <IconSend />,
          text: i18n.t('publisher:my release'),
          subtitle: i18n.t('Release'),
          show: orgPerm.dop.publisher.read.pass,
        },
        {
          href: goTo.resolve.dopPublicProjects(),
          icon: <IconBookOne />,
          text: i18n.t('public project'),
          subtitle: i18n.t('Public'),
        },
      ],
      (item) => item.show !== false,
    ),
    MENU_SCOPE.dop,
  );
};
