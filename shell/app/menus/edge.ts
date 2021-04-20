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

import { pages } from 'common/utils';
import i18n from 'i18n';

export const getEdgeMenu = () => {
  return [
    {
      href: pages.edgeApp,
      icon: 'application-one',
      text: i18n.t('edge:application'),
    },
    {
      href: pages.edgeResource,
      icon: 'data-all',
      text: i18n.t('resources'),
    },
    {
      href: pages.edgeSetting,
      icon: 'setting-config',
      text: i18n.t('edge:configuration'),
    },
  ];
};
