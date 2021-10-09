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
import { Popover, Menu, Avatar } from 'core/nusi';
import { UserMenuProps } from './interface';

const UserMenu = ({ avatar, name, operations }: UserMenuProps) => {
  const userMenuContent = () => {
    return (
      <div className="container">
        <div className="user-info">
          <div className="avatar">
            <Avatar src={avatar?.src} size={48}>
              {avatar?.chars || ''}
            </Avatar>
          </div>
          <div className="desc-container">
            <div className="name">{name}</div>
          </div>
        </div>
        <div className="operation-group">
          <Menu>
            {operations?.map(({ onClick, icon, title }) => {
              return (
                <Menu.Item key={title} onClick={onClick}>
                  {icon}
                  {title}
                </Menu.Item>
              );
            })}
          </Menu>
        </div>
      </div>
    );
  };

  return (
    <Popover placement={'rightBottom'} content={userMenuContent()} overlayClassName="erda-global-nav-user-menu">
      <Avatar src={avatar?.src}>{avatar?.chars || ''}</Avatar>
    </Popover>
  );
};

export default UserMenu;
