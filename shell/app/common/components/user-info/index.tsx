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
import { useUserMap } from 'core/stores/userMap';
import { get } from 'lodash';
import i18n from 'i18n';
import { Avatar } from 'antd';
import { getAvatarChars } from 'common/utils';
import Ellipsis from 'common/components/ellipsis';

interface IPlatformUser {
  avatar: string;
  email: string;
  id: string;
  locked: boolean;
  name: string;
  nick: string;
  phone: string;
  lastLoginAt: string;
  pwdExpireAt: string;
}

interface IProps {
  id: string | number;
  render?: (data: IPlatformUser, id?: string | number) => React.ReactNode;
}

const defaultRender = (data: IPlatformUser, id: string | number) => {
  return data.nick || data.name || id || i18n.t('none');
};

const UserInfo = ({ id, render = defaultRender }: IProps) => {
  const userMap = useUserMap();
  const userInfo: IPlatformUser = get(userMap, id, {});
  return <>{render?.(userInfo, id)}</>;
};

UserInfo.RenderWithAvatar = ({
  id,
  showName = true,
  className = '',
}: {
  id: IProps['id'];
  showName?: boolean;
  className?: string;
}) => {
  return (
    <UserInfo
      id={id}
      render={(data) => {
        return (
          <div className={`flex items-center ${className}`}>
            <Avatar size="small" src={data.avatar}>
              {data.nick || data.name ? getAvatarChars(data.nick || data.name) : i18n.t('none')}
            </Avatar>
            {showName ? (
              <Ellipsis className={`ml-0.5 flex-1 leading-6`} title={data.nick || data.name || i18n.t('none')} />
            ) : null}
          </div>
        );
      }}
    />
  );
};

export default UserInfo;
