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
import { pages } from 'common/utils';
import { filter } from 'lodash';
import permStore from 'user/stores/permission';

export const getWorkBenchMenu = () => {
  const orgPerm = permStore.getState(s => s.org);
  return filterMenu(filter([
    {
      href: '/workBench/projects',
      icon: 'xm',
      text: i18n.t('joined projects'),
    },
    {
      href: '/workBench/apps',
      icon: 'yy',
      text: i18n.t('joined apps'),
    },
    {
      icon: 'apijs',
      key: 'apiManage',
      text: i18n.t('API'),
      href: pages.apiManageRoot,
      show: orgPerm.workBench.apiManage.read.pass,
      subMenu: [
        {
          href: pages.apiManageRoot,
          // icon: 'apijs',
          text: i18n.t('default:API market'),
          isActive: (key: string) => key.startsWith('/workBench/apiManage/api-market/'),
        },
        {
          href: pages.apiAccessManage,
          // icon: 'bianliang',
          text: i18n.t('access manage'),
        },
        {
          href: pages.apiMyVisit,
          // icon: 'renyuan',
          text: i18n.t('my visit'),
        },
      ],
    },
    {
      href: '/workBench/service',
      icon: 'fw',
      text: i18n.t('addon service'),
      show: orgPerm.workBench.addonService.read.pass,
    },
    {
      key: 'approval',
      href: '/workBench/approval/my-approve',
      icon: 'bssh',
      text: i18n.t('workBench:approval request'),
      subMenu: [
        {
          text: i18n.t('workBench:my approval'),
          href: '/workBench/approval/my-approve/pending',
          isActive: (key: string) => key.startsWith('/workBench/approval/my-approve/'),
        },
        {
          text: i18n.t('workBench:my initiated'),
          href: '/workBench/approval/my-initiate/WaitApprove',
          isActive: (key: string) => key.startsWith('/workBench/approval/my-initiate/'),
        },
      ],
    },
    {
      key: 'workBenchPublisher',
      href: '/workBench/publisher',
      icon: 'fb1',
      text: i18n.t('publisher:joined publisher'),
      show: orgPerm.workBench.publisher.read.pass,
    },
  ], item => item.show !== false), MENU_SCOPE.workBench);
};

