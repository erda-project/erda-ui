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

import * as React from 'react';
import { Input, Tooltip, List } from 'app/nusi';
import { useDebounce, useUnmount } from 'react-use';
import i18n from 'i18n';
import { Icon as CustomIcon, EmptyListHolder, LoadMore, IF, connectCube } from 'common';
import { goTo, fromNow, ossImg } from 'common/utils';
import { theme } from 'app/themes';
import { modeOptions, appMode } from 'application/common/config';
import userStore from 'app/user/stores';
import routeInfoStore from 'app/common/stores/route';
import { useLoading } from 'app/common/stores/loading';
import BlockNetworkStatus, { BlockNetworkTips } from 'dop/pages/projects/block-comp';
import './app-list.scss';

const { Search } = Input;

const Mapper = () => {
  const [list, appPaging] = userStore.useStore((s) => [s.appList, s.appPaging]);
  const [userLoading] = useLoading(userStore, ['getJoinedApps']);
  const { getJoinedApps } = userStore.effects;
  const { clearAppList } = userStore.reducers;
  return {
    list,
    paging: appPaging,
    isFetching: userLoading,
    getList: getJoinedApps,
    clearList: clearAppList,
  };
};

interface IProps extends ReturnType<typeof Mapper> {
  placeHolderMsg?: string;
  getList: (p: any) => Promise<any>;
}

export const PureAppList = ({
  list = [],
  paging,
  getList,
  clearList,
  isFetching,
  placeHolderMsg = i18n.t('application:search by application name'),
}: IProps) => {
  const { pinApp, unpinApp } = userStore.effects;
  const [q, setQ] = React.useState('');
  const params = routeInfoStore.useStore((s) => s.params);

  useUnmount(clearList);

  useDebounce(
    () => {
      params.projectId && clearList();
      getList({
        q,
        pageNo: 1,
      });
    },
    600,
    [clearList, q, getList, params.projectId],
  );

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQ(value);
  };

  const goToProject = ({ projectId }: IApplication, e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(goTo.pages.project, { projectId });
  };

  const goToApp = ({ projectId, id: appId }: IApplication) => {
    goTo(goTo.pages.app, { projectId, appId });
  };

  const goToDeploy = ({ projectId, id: appId }: IApplication) => {
    goTo(goTo.pages.deploy, { projectId, appId });
  };

  const load = () => {
    return getList({
      q,
      loadMore: true,
      pageNo: paging.pageNo + 1,
    });
  };

  const togglePin = (e: React.MouseEvent, item: IApplication) => {
    e.stopPropagation();
    const { id: appId, pined } = item;
    (pined ? unpinApp : pinApp)(appId).then(() => getList({ q, pageNo: 1 }));
  };

  const Holder = ({ children }: any) => (isFetching || list.length ? children : <EmptyListHolder />);
  const renderList = (item: IApplication) => {
    return (
      <div className="item-container" onClick={() => goToApp(item)}>
        <div className="item-left">
          <div className="item-img">
            <IF check={item.logo}>
              <img src={ossImg(item.logo, { w: 64 })} alt="logo" />
              <IF.ELSE />
              <CustomIcon color type={theme.appIcon} />
            </IF>
          </div>
          <div className="item-content">
            <div className="item-name nowrap bold-500">
              <span className="mr16">{item.name}</span>
            </div>
            <div className="item-desc nowrap">
              {item.desc || i18n.t('application:edit description in application setting')}
            </div>
            <div className="item-footer">
              <Tooltip title={`${i18n.t('application:owned project')}: ${item.projectName}`}>
                <span className="p-name hover-active" onClick={(e) => goToProject(item, e)}>
                  <CustomIcon type="xm-2" />
                  <span className="nowrap">{`${item.projectDisplayName}`}</span>
                </span>
              </Tooltip>
              <IF check={[appMode.MOBILE, appMode.LIBRARY, appMode.SERVICE].includes(item.mode)}>
                <Tooltip title={i18n.t('application:number of application instance')}>
                  <span
                    className="b-count"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDeploy(item);
                    }}
                  >
                    <CustomIcon type="sl" />
                    <span>{item.stats.countRuntimes}</span>
                  </span>
                </Tooltip>
              </IF>
              <span className="time">
                <CustomIcon type="sj" />
                <span>
                  {item.updatedAt ? fromNow(item.updatedAt, { prefix: `${i18n.t('update time')}:` }) : i18n.t('none')}
                </span>
              </span>
              <Tooltip title={i18n.t('application:application type')}>
                <span>
                  <CustomIcon type="fenlei" />
                  <span>{(modeOptions.find((mode) => mode.value === item.mode) as { name: string }).name}</span>
                </span>
              </Tooltip>
              <BlockNetworkStatus
                scope="app"
                canOperate={false}
                status={item.blockStatus}
                unBlockStart={item.unBlockStart}
                unBlockEnd={item.unBlockEnd}
              />
            </div>
            <div className="to-top">
              <IF check={item.pined}>
                <Tooltip title={i18n.t('application:unpin')}>
                  <span onClick={(e) => togglePin(e, item)}>
                    <CustomIcon type="qxzd" />
                  </span>
                </Tooltip>
                <IF.ELSE />
                <Tooltip title={i18n.t('application:sticky')}>
                  <span onClick={(e) => togglePin(e, item)}>
                    <CustomIcon type="zd1" />
                  </span>
                </Tooltip>
              </IF>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="app-list-section">
      <BlockNetworkTips />
      <Search className="search-input" placeholder={placeHolderMsg} value={q} onChange={onSearch} />
      <Holder>
        <List dataSource={list} renderItem={renderList} />
      </Holder>
      <LoadMore load={load} hasMore={paging.hasMore} isLoading={isFetching} />
    </div>
  );
};

export const MyAppList = connectCube(PureAppList, Mapper);
