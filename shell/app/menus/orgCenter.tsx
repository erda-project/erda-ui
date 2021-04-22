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

// 应用中心菜单
export const getOrgCenterMenu = () => {
  return filterMenu([
    {
      key: 'orgProjects',
      href: goTo.resolve.orgCenterRoot(), // '/orgCenter/projects',
      icon: 'xm',
      text: i18n.t('projects'),
    },
    {
      key: 'orgMarket',
      href: goTo.resolve.orgCenterMarket(), //'/orgCenter/market',
      icon: 'fb1',
      text: i18n.t('layout:market'),
      subMenu: [
        {
          key: 'orgMarketPublisher',
          text: i18n.t('org:publisher info'),
          href: goTo.resolve.orgCenterPublisherSetting(), // '/orgCenter/market/publisher/setting',
        },
      ],
    },
    {
      key: 'orgCertificate',
      href: goTo.resolve.orgCenterCertificate(), // '/orgCenter/certificate',
      icon: 'zs2',
      text: i18n.t('layout:certificate'),
    },
    {
      key: 'orgApproval',
      href: goTo.resolve.orgCenterApprovalUndone(), // '/orgCenter/approval/undone',
      icon: 'sp',
      text: i18n.t('layout:approval'),
      prefix: `${goTo.resolve.orgCenterApproval()}/`
    },
    {
      key: 'orgAnnouncement',
      href: goTo.resolve.orgCenterAnnouncement(), // '/orgCenter/announcement',
      icon: 'gg',
      text: i18n.t('org:announcement'),
    },
    {
      key: 'orgSafety',
      href: goTo.resolve.orgCenterSafety(), // '/orgCenter/safety',
      icon: 'anquan',
      text: i18n.t('org:audit log'),
    },
    {
      key: 'orgSetting',
      href: goTo.resolve.dataCenterSetting(), // '/orgCenter/setting/detail',
      icon: 'sz',
      text: i18n.t('org setting'),
    },
  ], MENU_SCOPE.orgCenter);
};
