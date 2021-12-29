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

import { Avatar } from 'antd';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import React from 'react';
import './index.scss';

export interface UserProfileProps {
  className?: string;
  data: {
    name: string;
    avatar: string;
    id: string;
    email: string;
    phone: string;
    lastLoginTime: string;
  };
}

const UserProfile = ({ data, className = '' }: UserProfileProps) => {
  const { name, avatar, id, email, phone, lastLoginTime } = data;
  const infoList = [
    ['youxiang', i18n.t('email'), email],
    ['shouji', i18n.t('cellphone'), phone],
    ['shijian-2', i18n.t('last login time'), lastLoginTime],
  ];

  return (
    <div className={`erda-user-profile bg-white rounded-sm shadow-card ${className}`}>
      <div
        className="blur-bg"
        style={{
          background: `center / cover no-repeat url(${avatar})`,
        }}
      />
      <div className="name-warp p-4">
        <Avatar src={avatar} size={64} alt="user-avatar" />
        <div className="truncate mt-2 font-medium text-lg">{name}</div>
        <div className="truncate text-xs text-desc">{id}</div>
      </div>
      <div className="px-4 py-3">
        {infoList.map(([icon, key, value], i) => (
          <div key={key} className={`flex items-center ${i !== 0 ? 'mt-4' : ''}`}>
            <ErdaIcon type={icon} className="icon-wrap mr-2 text-base text-desc" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate value font-medium">{value || '-'}</div>
              <div className="text-desc key">{key}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
