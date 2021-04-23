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
  ApiApp, 
  ApplicationOne,
  Api,
  Puzzle,
  Seal,
  Send,
} from '@icon-park/react';
import React from 'react';

export const getWorkBenchMenu = () => {
  const orgPerm = permStore.getState(s => s.org);
  return filterMenu(filter([
    {
      href: goTo.resolve.workBenchRoot(), // '/workBench/projects',
      icon: <ApiApp />,
      text: i18n.t('joined projects'),
    },
    {
      href: goTo.resolve.workBenchApps(), //'/workBench/apps',
      icon: <ApplicationOne />,
      text: i18n.t('joined apps'),
    },
    {
      icon: <Api />,
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
          text: i18n.t('access manage'),
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
      icon: <Puzzle />,
      text: i18n.t('addon service'),
      show: orgPerm.workBench.addonService.read.pass,
    },
    {
      key: 'approval',
      href: goTo.resolve.workBenchApprove(), // '/workBench/approval/my-approve',
      icon: <Seal />,
      text: i18n.t('workBench:approval request'),
      subMenu: [
        {
          text: i18n.t('workBench:my approval'),
          href: goTo.resolve.workBenchApprovePending(), //'/workBench/approval/my-approve/pending',
          prefix: `${goTo.resolve.workBenchApprove()}/`,
        },
        {
          text: i18n.t('workBench:my initiated'),
          href: goTo.resolve.workBenchMyInitiateWait(), // '/workBench/approval/my-initiate/WaitApprove',
          prefix: `${goTo.resolve.workBenchMyInitiate()}/`
        },
      ],
    },
    {
      key: 'workBenchPublisher',
      href: goTo.resolve.workBenchPublisher(), // '/workBench/publisher',
      icon: <Send />,
      text: i18n.t('publisher:joined publisher'),
      show: orgPerm.workBench.publisher.read.pass,
    },
  ], item => item.show !== false), MENU_SCOPE.workBench);
};

