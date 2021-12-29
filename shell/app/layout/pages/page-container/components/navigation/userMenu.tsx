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

import React from 'react';
import { Popover, Menu, Avatar } from 'antd';
import { getAvatarChars, insertWhen, ossImg } from 'app/common/utils';
import { erdaEnv, UC_USER_SETTINGS } from 'app/common/constants';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import userStore from 'user/stores';

const UserMenu = () => {
  const loginUser = userStore.useStore((s) => s.loginUser);

  const operations = [
    ...insertWhen(!!loginUser.isSysAdmin, [
      {
        icon: <ErdaIcon type="user-config" />,
        title: <span className="ml-1">{i18n.t('operation manage platform')}</span>,
        onClick: () => {
          window.localStorage.setItem('lastOrg', window.location.pathname.split('/')[1]);
          if (erdaEnv.UI_PUBLIC_ADDR) {
            window.location.href = `${window.location.protocol}//${erdaEnv.UI_PUBLIC_ADDR}/-/sysAdmin`; // jump to wildcard domain
          }
        },
      },
    ]),
    ...insertWhen(loginUser.isNewUser || !!erdaEnv.UC_PUBLIC_URL, [
      {
        icon: <ErdaIcon type="user-config" />,
        title: i18n.t('layout:personal settings'),
        onClick: () => {
          window.open(loginUser.isNewUser ? UC_USER_SETTINGS : erdaEnv.UC_PUBLIC_URL);
        },
      },
    ]),
    {
      icon: <ErdaIcon className="mr-1" type="logout" size="14" />,
      title: i18n.t('layout:logout'),
      onClick: userStore.effects.logout,
    },
  ];

  const avatar = loginUser.avatar ? ossImg(loginUser.avatar, { w: 32 }) : undefined;

  const nickOrName = loginUser.nick || loginUser.name;
  const nick = getAvatarChars(nickOrName);
  return (
    <Popover
      placement={'rightBottom'}
      overlayClassName="erda-global-nav-user-menu"
      content={
        <div className="container flex flex-col">
          <div className="user-info flex">
            <div className="avatar">
              <Avatar src={avatar} size={28}>
                {nick}
              </Avatar>
            </div>
            <div className="desc-container flex items-baseline justify-center flex-col truncate">
              <div className="name">{nickOrName}</div>
            </div>
          </div>
          <div className="operation-group">
            <Menu>
              {operations?.map(({ onClick, icon, title }) => {
                return (
                  <Menu.Item key={title} onClick={onClick}>
                    <div className="flex items-center">
                      {icon}
                      {title}
                    </div>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
        </div>
      }
    >
      <Avatar src={avatar} size={28}>
        {nick}
      </Avatar>
    </Popover>
  );
};

export default UserMenu;
