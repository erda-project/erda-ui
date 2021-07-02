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
import { Table, Input, Spin, Tooltip } from 'app/nusi';
import userStore from 'user/stores';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import { useDebounce, useUnmount } from 'react-use';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';
import { fromNow, goTo } from 'common/utils';
import { appMode, modeOptions } from 'application/common/config';
import { CustomFilter } from 'common';
import { Link } from 'react-router-dom';

interface IFilter {
  placeHolderMsg: string | undefined;
  onSubmit: (value: Obj) => void;
}

const Filter = React.memo(({ onSubmit, placeHolderMsg }: IFilter) => {
  const config: FilterItemConfig[] = React.useMemo(
    () => [
      {
        type: Input.Search,
        name: 'q',
        customProps: {
          placeholder: placeHolderMsg,
          autoComplete: 'off',
        },
      },
    ],
    [placeHolderMsg],
  );
  return <CustomFilter config={config} onSubmit={onSubmit} />;
});

interface Iprops {
  placeHolderMsg?: string;
  paging: IPaging;
  isFetching: boolean;
  list: IApplication[];
  getList: (payload: any) => Promise<{ list: IApplication[]; total: number }>;
  clearList: () => void;
}

export const AppList = ({
  placeHolderMsg = i18n.t('application:search by application name'),
  getList,
  clearList,
  list,
  paging,
  isFetching,
}: Iprops) => {
  const { pinApp, unpinApp } = userStore.effects;
  const [q, setQ] = React.useState();
  const params = routeInfoStore.useStore((s) => s.params);
  const onSubmit = React.useCallback(({ q: value }: { q: string }) => {
    setQ(value);
  }, []);

  React.useEffect(() => {
    params.projectId && clearList();
  }, [clearList, params.projectId]);

  useUnmount(clearList);

  useDebounce(
    () => {
      clearList();
      getList({
        q,
        pageNo: 1,
      });
    },
    600,
    [q],
  );
  const goToApp = ({ projectId, id: appId }: IApplication) => {
    goTo(goTo.pages.app, { projectId, appId });
  };
  const goToProject = (e: React.MouseEvent, { projectId }: IApplication) => {
    e.stopPropagation();
    goTo(goTo.pages.project, { projectId });
  };
  const togglePin = (e: React.MouseEvent, item: IApplication) => {
    e.stopPropagation();
    const { id: appId, pined } = item;
    (pined ? unpinApp : pinApp)(appId).then(() => getList({ q, pageNo: 1 }));
  };
  const handlePageChange = (pageNo: number) => {
    getList({ q, pageNo });
  };
  const columns: Array<ColumnProps<IApplication>> = [
    {
      title: i18n.t('application:app name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('project:application description'),
      dataIndex: 'desc',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => {
        const title = text || i18n.t('application:edit description in application setting');
        return (
          <Tooltip title={title}>
            <span>{title}</span>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('application:owned project'),
      dataIndex: 'projectDisplayName',
      render: (text, record) => {
        return (
          <Tooltip title={record.projectName}>
            <span
              className="hover-active"
              onClick={(e) => {
                goToProject(e, record);
              }}
            >
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('application:number of application instance'),
      width: 120,
      dataIndex: ['stats', 'countRuntimes'],
      render: (text, record) => {
        const { projectId, id, mode } = record;
        const show = [appMode.MOBILE, appMode.LIBRARY, appMode.SERVICE].includes(mode);
        return show ? (
          <Link
            className="bold"
            to={goTo.resolve.deploy({ projectId, appId: id })}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {text}
          </Link>
        ) : null;
      },
    },
    {
      title: i18n.t('update time'),
      width: 100,
      dataIndex: 'updatedAt',
      render: (text) => (text ? fromNow(text) : i18n.t('no data')),
    },
    {
      title: i18n.t('application:application type'),
      width: 120,
      dataIndex: 'mode',
      render: (text) => (modeOptions.find((mode) => mode.value === text) as { name: string }).name,
    },
    {
      title: i18n.t('application:operation'),
      width: 100,
      dataIndex: 'pined',
      render: (text, record) => {
        return (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={(e) => {
                togglePin(e, record);
              }}
            >
              {text ? i18n.t('application:unpin') : i18n.t('application:sticky')}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="app-list-section">
      <Filter onSubmit={onSubmit} placeHolderMsg={placeHolderMsg} />
      <Spin spinning={isFetching}>
        <Table
          pagination={{
            ...paging,
            current: paging.pageNo,
            onChange: handlePageChange,
          }}
          onRow={(record: IApplication) => {
            return {
              onClick: () => {
                goToApp(record);
              },
            };
          }}
          rowClassName={() => 'pointer'}
          rowKey="id"
          columns={columns}
          dataSource={list}
          tableLayout="fixed"
        />
      </Spin>
    </div>
  );
};
export const MyAppList = () => {
  const [list, appPaging] = userStore.useStore((s) => [s.appList, s.appPaging]);
  const [userLoading] = useLoading(userStore, ['getJoinedApps']);
  const { getJoinedApps } = userStore.effects;
  const { clearAppList } = userStore.reducers;
  return (
    <AppList list={list} paging={appPaging} isFetching={userLoading} getList={getJoinedApps} clearList={clearAppList} />
  );
};
