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
import { pages } from 'common/utils';
import { filter, compact, get } from 'lodash';
import diceEnv from 'dice-env';
import userStore from 'app/user/stores';
import produce from 'immer';

interface IMenuItem {
  key?: string;
  [pro: string]: any;
}

const defaultFunc = (a: any) => a;

const { ENABLE_MPAAS } = diceEnv || {};
// const menuFilterMap = {
//   workBenchPublisher: (item: IMenuItem) => {
//     const orgPublisherAuth = userStore.getState(s => s.loginUser.orgPublisherAuth);
//     return ENABLE_MPAAS && orgPublisherAuth ? item : null;
//   },
// };

const filterMenu = (menu: IMenuItem[]) => {
  return produce(menu, draft => filter(draft, item => {
    const itemHasAuth = item.authCheck ? item.authCheck() : true;
    if (!itemHasAuth) return false;
    if (item.subMenu) {
      item.subMenu = filter(item.subMenu, subItem => {
        return subItem.authCheck ? subItem.authCheck() : true;
      });
    }
    return true;
  }));
};


export default () => {
  return filterMenu([
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
      subMenu: [
        {
          href: pages.apiManageRoot,
          text: i18n.t('default:API market'),
          isActive: (key: string) => key.startsWith('/workBench/apiManage/api-market/'),
        },
        {
          href: pages.apiAccessManage,
          text: i18n.t('access manage'),
        },
        {
          href: pages.apiMyVisit,
          text: i18n.t('my visit'),
        },
      ],
    },
    {
      href: '/workBench/service',
      icon: 'fw',
      text: i18n.t('addon service'),
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
      authCheck: (item: IMenuItem) => {
        const orgPublisherAuth = userStore.getState(s => s.loginUser.orgPublisherAuth);
        return ENABLE_MPAAS && orgPublisherAuth;
      },
    },
  ]);
};

