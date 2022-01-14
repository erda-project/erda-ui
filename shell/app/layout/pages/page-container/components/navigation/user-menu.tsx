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
import { Popover, Avatar, PopoverProps } from 'antd';
import { getAvatarChars, insertWhen, ossImg } from 'app/common/utils';
import { erdaEnv, UC_USER_SETTINGS } from 'app/common/constants';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import userStore from 'user/stores';
import './user-menu.scss';

const UserMenu = ({
  placement,
  size,
  className = '',
  ...rest
}: Merge<PopoverProps, { size: number; className: string }>) => {
  const loginUser = userStore.useStore((s) => s.loginUser);
  const operations = [
    ...insertWhen(!!loginUser.isSysAdmin, [
      {
        icon: <ErdaIcon className="mr-1" type="yunying" size="16" />,
        title: i18n.t('operation manage platform'),
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
        icon: <ErdaIcon className="mr-1" type="shezhi" size="16" />,
        title: i18n.t('layout:account settings'),
        onClick: () => {
          window.open(loginUser.isNewUser ? UC_USER_SETTINGS : erdaEnv.UC_PUBLIC_URL);
        },
      },
    ]),
    {
      icon: <ErdaIcon className="mr-1" type="tuichu" size="16" />,
      title: i18n.t('layout:logout'),
      onClick: () => userStore.effects.logout(),
      danger: true,
    },
  ];

  const avatar = loginUser.avatar ? ossImg(loginUser.avatar, { w: 32 }) : undefined;

  const nickOrName = loginUser.nick || loginUser.name;
  const nick = getAvatarChars(nickOrName);
  return (
    <Popover
      {...rest}
      placement={placement || 'rightBottom'}
      overlayClassName={`erda-global-nav-user-menu ${className}`}
      content={
        <div className="px-2 pb-2 pt-4 w-[160px] flex flex-col items-center truncate">
          <Avatar src={avatar} size={48} className="user-avatar">
            {nick}
          </Avatar>
          <div className="mt-2 w-full text-center truncate">{nickOrName}</div>
          <div className="mt-3 w-full self-start">
            {operations?.map(({ onClick, icon, title, danger }, i) => {
              return (
                <div
                  key={i}
                  onClick={onClick}
                  className={`h-8 px-2 flex items-center cursor-pointer rounded-sm text-default-9 ${
                    danger ? 'hover:text-danger hover:bg-red-1' : 'hover:text-default hover:bg-default-1'
                  }`}
                >
                  {icon}
                  {title}
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <Avatar className="cursor-pointer" src={avatar} size={size || 28}>
        {nick}
      </Avatar>
    </Popover>
  );
};

export default UserMenu;
