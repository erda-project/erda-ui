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

import { goTo } from 'common/utils';
import i18n from 'i18n';
import {
  ApplicationOne as IconApplicationOne,
  DataAll as IconDataAll,
  SettingConfig as IconSettingConfig,
} from '@icon-park/react';
import React from 'react';

export const getEcpMenu = () => {
  return [
    {
      href: goTo.resolve.ecpApp(),
      icon: <IconApplicationOne />,
      text: i18n.t('ecp:application'),
      subtitle: i18n.t('App'),
    },
    {
      href: goTo.resolve.ecpResource(),
      icon: <IconDataAll />,
      text: i18n.t('resource management'),
      subtitle: i18n.t('Resource'),
    },
    {
      href: goTo.resolve.ecpSetting(),
      icon: <IconSettingConfig />,
      text: i18n.t('ecp:configuration'),
      subtitle: i18n.t('Config'),
    },
  ];
};
