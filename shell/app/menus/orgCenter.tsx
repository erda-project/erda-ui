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
import permStore from 'user/stores/permission';
import {
  ApiApp as IconApiApp,
  CeMarking as IconCeMarking,
  Certificate as IconCertificate,
  Bill as IconBill,
  Log as IconLog,
  City as IconCity,
} from '@icon-park/react';
import React from 'react';
import { Icon as CustomIcon } from 'common';
import { filter } from 'lodash';

// 应用中心菜单
export const getOrgCenterMenu = () => {
  const orgPerm = permStore.getState((s) => s.org);
  return filterMenu(
    filter(
      [
        {
          key: 'orgProjects',
          href: goTo.resolve.orgCenterRoot(), // '/orgCenter/projects',
          icon: <IconApiApp />,
          text: i18n.t('projects'),
          show: orgPerm.orgCenter.viewProjects.pass,
        },
        {
          key: 'orgMarket',
          href: goTo.resolve.orgCenterMarket(), // '/orgCenter/market',
          icon: <IconCeMarking />,
          text: i18n.t('layout:market'),
          subMenu: [
            {
              key: 'orgMarketPublisher',
              text: i18n.t('org:publisher info'),
              href: goTo.resolve.orgCenterPublisherSetting(), // '/orgCenter/market/publisher/setting',
            },
          ],
          show: orgPerm.orgCenter.viewMarket.pass,
        },
        {
          key: 'orgCertificate',
          href: goTo.resolve.orgCenterCertificate(), // '/orgCenter/certificate',
          icon: <IconCertificate />,
          text: i18n.t('layout:certificate'),
          show: orgPerm.orgCenter.viewCertificate.pass,
        },
        {
          key: 'orgApproval',
          href: goTo.resolve.orgCenterApprovalUndone(), // '/orgCenter/approval/undone',
          icon: <CustomIcon type="shenpiguanli" />,
          text: i18n.t('layout:approval'),
          prefix: `${goTo.resolve.orgCenterApproval()}/`,
          show: orgPerm.orgCenter.viewApproval.pass,
        },
        {
          key: 'orgAnnouncement',
          href: goTo.resolve.orgCenterAnnouncement(), // '/orgCenter/announcement',
          icon: <IconBill />,
          text: i18n.t('org:announcement management'),
          show: orgPerm.orgCenter.viewAnnouncement.pass,
        },
        {
          key: 'orgSafety',
          href: goTo.resolve.orgCenterSafety(), // '/orgCenter/safety',
          icon: <IconLog />,
          text: i18n.t('org:audit log'),
          show: orgPerm.orgCenter.viewAuditLog.pass,
        },
        {
          key: 'orgSetting',
          href: goTo.resolve.cmpSetting(), // '/orgCenter/setting/detail',
          icon: <IconCity />,
          text: i18n.t('org setting'),
          show: orgPerm.orgCenter.viewSetting.pass,
        },
      ],
      (item) => item.show !== false,
    ),
    MENU_SCOPE.orgCenter,
  );
};
