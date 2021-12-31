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
import { Avatar, Empty } from 'antd';
import { map, find } from 'lodash';
import { ErdaIcon, Ellipsis } from 'common';
import { getAvatarChars } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import { useUserMap } from 'core/stores/userMap';
import { getActiveRankList } from '../../services/personal-home';
import i18n from 'i18n';

const RANK_ICONS = {
  '1': 'jin',
  '2': 'yin',
  '3': 'tong',
};

const ActiveRank = (props: { currentUser: ILoginUser }) => {
  const { currentUser } = props;
  const orgId = orgStore.getState((s) => s.currentOrg.id);
  const userMap = useUserMap();

  React.useEffect(() => {
    getActiveRankList.fetch({ orgId });
  }, [orgId]);

  const sourceList = getActiveRankList.useData();

  const selfRank = React.useMemo(() => {
    const rank = find(sourceList, (item) => item.id === currentUser.id);
    return rank;
  }, [currentUser.id, sourceList]);

  const rankList = React.useMemo(() => {
    return map(sourceList, (item) => {
      const user = userMap[item.id];
      if (user) {
        return { ...item, name: user.nick || user.name, avatar: user.avatar };
      }
      return { ...item, name: '-', avatar: '' };
    });
  }, [sourceList, userMap]);

  return (
    <div className="bg-white shadow-card pb-4 w-60">
      <div className="flex justify-between items-center h-12 px-4">
        <div className="text-normal font-bold">{i18n.t('dop:contribution ranking')}</div>
      </div>
      <div className="px-4 mb-2">
        <div className="flex items-center flex-col">
          <Avatar src={currentUser.avatar} size={64} alt="user-avatar">
            {getAvatarChars(currentUser.nick || currentUser.name)}
          </Avatar>
          <div className="truncate mt-2">{currentUser.nick || currentUser.name}</div>
        </div>
        <div className="grid grid-cols-12 items-center h-16 bg-default-01 h-17">
          <div className="col-span-6 flex flex-col items-center">
            <div className="leading-8 truncate text-xl">{selfRank?.rank ?? '-'}</div>
            <div className="text-xs text-sub">{i18n.t('dop:rank')}</div>
          </div>
          <div className="col-span-6 flex flex-col items-center">
            <div className="text-purple-deep text-xl">{selfRank?.value ?? '0'}</div>
            <div className="text-xs text-sub">{i18n.t('dop:contribution value')}</div>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-56">
        {map(rankList, ({ rank, name, avatar, value, id }) => {
          return (
            <div key={id} className="grid grid-cols-12 h-11 items-center px-5 py-2">
              <div className="col-span-2 flex justify-center w-6 h-6 leading-6">
                {rank <= 3 && rank >= 1 ? <ErdaIcon type={RANK_ICONS[`${rank}`]} size="24" /> : rank}
              </div>
              <div className="col-span-7 flex items-center">
                <div className="mr-1 w-7">
                  <Avatar src={avatar} size={28} alt="user-avatar">
                    {getAvatarChars(name)}
                  </Avatar>
                </div>
                <Ellipsis title={name} />
              </div>
              <div className="col-span-3 text-purple-deep justify-self-end">{value}</div>
            </div>
          );
        })}
        {!rankList.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className="max-w-[240px] mt-20" />}
      </div>
    </div>
  );
};

export default ActiveRank;
