import React from 'react';
import { Avatar, Input } from 'antd';
import { useMount } from 'react-use';
import ImgMap from 'config-page/img-map';
import { map, find, filter } from 'lodash';
import { ErdaIcon, EmptyHolder, Ellipsis } from 'common';
import { getActiveRankList } from '../../services/personal-home';

interface IProps {
  currentUser: ILoginUser;
}

const RANK_ICONS = {
  '1': 'jin',
  '2': 'yin',
  '3': 'tong',
};

const ActiveRank = (props: IProps) => {
  const { currentUser } = props;
  const [inputVisible, setInputVisible] = React.useState(false);
  const [searchKey, setSearchKey] = React.useState('');

  useMount(() => {
    getActiveRankList.fetch();
  });

  const sourceList = getActiveRankList.useData();

  const selfRank = React.useMemo(() => {
    const rank = find(sourceList, (item) => item.id === currentUser.id);
    return rank;
  }, [currentUser.id, sourceList]);

  const rankList = React.useMemo(() => {
    return filter(sourceList, (item) => item.name.toLowerCase().includes(searchKey.toLowerCase()));
  }, [searchKey, sourceList]);

  const toggleSearchInput = () => {
    setInputVisible(!inputVisible);
  };

  const onChangeSearchKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(event.target.value);
  };

  return (
    <div className="bg-white shadow-card pb-4 w-60">
      <div className="flex justify-between items-center h-12 px-4">
        <div className="text-normal">活跃排行</div>
        <div className="flex items-center">
          {inputVisible && (
            <Input
              className="bg-hover-gray-bg mr-1"
              size="small"
              autoFocus
              bordered={false}
              allowClear
              onChange={onChangeSearchKey}
              value={searchKey}
              style={{ width: '120px' }}
              placeholder="搜索姓名"
            />
          )}
          <ErdaIcon type="search" className="cursor-pointer" color="normal" size="16" onClick={toggleSearchInput} />
        </div>
      </div>
      <div className={`${searchKey ? 'hidden' : 'px-4 mb-2'}`}>
        <div className="flex items-center flex-col">
          <Avatar src={currentUser.avatar || ImgMap.default_user_avatar} size={64} alt="user-avatar" />
          <div className="truncate mt-2">{currentUser.nick || currentUser.name}</div>
        </div>
        <div className="grid grid-cols-12 items-center h-16 bg-default-01 h-17">
          <div className="col-span-6 flex flex-col items-center">
            <div className="leading-8 truncate text-xl">{selfRank?.rank ?? '-'}</div>
            <div className="text-xs text-sub">排名</div>
          </div>
          <div className="col-span-6 flex flex-col items-center">
            <div className="text-purple-deep text-xl">{selfRank?.value ?? '0'}</div>
            <div className="text-xs text-sub">活跃值</div>
          </div>
        </div>
      </div>
      <div style={{ height: searchKey ? '386px' : '224px' }} className="overflow-y-auto">
        {map(rankList, ({ rank, name, value, id, avatar }) => {
          return (
            <div key={id} className="grid grid-cols-12 h-11 items-center px-5 py-2">
              <div className="col-span-2 flex justify-center w-6 h-6 leading-6">
                {rank <= 3 && rank >= 1 ? <ErdaIcon type={RANK_ICONS[`${rank}`]} size="24" /> : rank}
              </div>
              <div className="col-span-7 flex items-center">
                <div className="mr-1 w-7">
                  <Avatar src={avatar || ImgMap.default_user_avatar} size={28} alt="user-avatar" />
                </div>
                <Ellipsis title={name} />
              </div>
              <div className="col-span-3 text-purple-deep justify-self-end">{value}</div>
            </div>
          );
        })}
        {!rankList.length && <EmptyHolder relative style={{ maxWidth: '240px' }} />}
      </div>
    </div>
  );
};

export default ActiveRank;
