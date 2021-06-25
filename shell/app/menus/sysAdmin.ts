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

export const getSysAdminMenu = () => {
  return [
    {
      href: '/sysAdmin/orgs',
      icon: 'qiye',
      text: i18n.t('org management'),
    },
    {
      href: '/sysAdmin/user-manage',
      icon: 'sidebarUser',
      text: i18n.t('user management'),
    },
    {
      href: '/sysAdmin/audit-log',
      icon: 'anquan',
      text: i18n.t('org:audit log'),
    },
    {
      href: '/sysAdmin/overall-config',
      icon: 'sz',
      text: i18n.t('global config'),
    },
    {
      href: '/sysAdmin/cluster-manage',
      icon: 'sz',
      text: i18n.t('clusters'),
    },
  ];
};
