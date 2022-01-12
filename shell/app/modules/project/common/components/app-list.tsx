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
import routeInfoStore from 'core/stores/route';
import { Input } from 'antd';
import { ErdaIcon } from 'common';
import { useUpdate } from 'common/use-hooks';
import projectStore from 'project/stores/project';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import { useLoading } from 'core/stores/loading';
import './app-list.scss';

interface AppListProps {
  onSelect?: (app: IApplication) => void;
  selectedAppId?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

interface PureAppListProps {
  appList: IApplication[];
  onSearch?: (v: string) => void;
  className?: string;
  hasMore?: boolean;
  onSelect?: (app: IApplication) => void;
  theme?: 'light' | 'dark';
  onLoadMore?: () => void;
  loading?: boolean;
}

interface PureAppListState {
  searchValue: string;
  selectedApp: null | IApplication;
}

export const PureAppList = (props: PureAppListProps) => {
  const { className = '', appList, onSearch, hasMore, onSelect, theme = 'light', onLoadMore, loading } = props;
  const [{ searchValue, selectedApp }, updater, update] = useUpdate<PureAppListState>({
    searchValue: '',
    selectedApp: null,
  });

  React.useEffect(() => {
    if (appList.length && !selectedApp) {
      updater.selectedApp(appList[0]);
    }
  }, [appList, selectedApp, updater]);

  React.useEffect(() => {
    selectedApp && onSelect?.(selectedApp);
  }, [selectedApp]);

  const useAppList = searchValue ? appList.filter((item) => item.name.includes(searchValue)) : appList;

  return (
    <div className={`py-4 ${className} h-full flex flex-col project-app-list theme-${theme}`}>
      <div className="px-4">
        <Input
          size="small"
          bordered={false}
          className={`theme-${theme}`}
          value={searchValue}
          prefix={<ErdaIcon size="16" fill={theme === 'dark' ? 'white-3' : 'default-3'} type="search" />}
          onChange={(e) => {
            const { value } = e.target;
            updater.searchValue(value);
          }}
          placeholder={i18n.t('search by keyword')}
        />
      </div>
      <div className="flex-1 overflow-auto mt-1 px-4">
        {useAppList.map((app) => {
          return (
            <div
              key={app.id}
              className={`app-item px-2 py-1 mb-0.5 rounded-sm cursor-pointer ${
                selectedApp?.id === app.id ? 'selected' : ''
              }`}
              onClick={() => updater.selectedApp(app)}
            >
              {app.displayName || app.name}
            </div>
          );
        })}
        {hasMore ? (
          <div className="app-item px-2 py-1 rounded-sm cursor-pointer" onClick={() => onLoadMore?.()}>
            <ErdaIcon type="loading" className="align-middle" spin={loading ? true : undefined} />
            {i18n.t('load more')}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AppList = (props: AppListProps) => {
  const { onSelect, ...rest } = props;
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const { getProjectApps } = projectStore.effects;
  const { clearProjectAppList } = projectStore.reducers;
  const [appList, appPaging] = projectStore.useStore((s) => [s.projectAppList, s.projectAppPaging]);
  const pageSize = 20;
  const [loading] = useLoading(projectStore, ['getProjectApps']);
  useEffectOnce(() => {
    getProjectApps({ projectId, loadMore: true, pageNo: 1, pageSize });
    return () => {
      clearProjectAppList();
    };
  });

  const onLoadMore = () => {
    getProjectApps({ projectId, loadMore: true, pageNo: appPaging.pageNo + 1, pageSize });
  };

  const hasMore = Math.ceil(appPaging.total / pageSize) > appPaging.pageNo;
  return (
    <PureAppList
      {...rest}
      appList={appList}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      loading={loading}
      onSelect={onSelect}
    />
  );
};

export default AppList;
