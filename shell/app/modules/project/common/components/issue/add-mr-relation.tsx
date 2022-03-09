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

import { ContractiveFilter, ErdaIcon, Table as ErdaTable, UserInfo } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Dropdown } from 'antd';
import React from 'react';
import i18n from 'i18n';
import { getJoinedApps } from 'app/user/services/user';
import routeInfoStore from 'core/stores/route';
import projectStore from 'project/stores/project';
import { getAppMR } from 'application/services/repo';
import { WithAuth } from 'user/common';
import { ColumnProps } from 'antd/lib/table';
import moment from 'moment';
import { batchCreateCommentStream } from 'project/services/issue';
import userStore from 'user/stores';

import './add-mr-relation.scss';
import issueStore from 'project/stores/issues';
import { goTo } from 'app/common/utils';

interface IProps {
  expand: boolean;
  editAuth: boolean;
  issueDetail: ISSUE.IssueType;
  afterAdd: () => Promise<void>;
  setMrCount?: (v: number) => void;
}

const initState = {
  visible: false,
  relateMrList: [],
  filterData: {
    query: undefined,
    appID: undefined,
    authorId: undefined,
    state: undefined,
  },
};
export const useAddMrRelation = ({
  expand,
  issueDetail,
  editAuth,
  afterAdd,
}: IProps): [JSX.Element, JSX.Element, ISSUE.IssueStream[]] => {
  const { projectId } = routeInfoStore.getState((s) => s.params);
  const { name: projectName } = projectStore.getState((s) => s.info);
  const [appList, setAppList] = React.useState([] as IApplication[]);
  const loginUser = userStore.useStore((s) => s.loginUser);
  const issueStreamList: ISSUE.IssueStream[] = issueStore.useStore(
    (s) => s[`${issueDetail?.type.toLowerCase()}StreamList`],
  );

  const [{ visible, relateMrList, filterData }, updater] = useUpdate<{
    visible: boolean;
    relateMrList: ISSUE.IssueStream[];
    filterData: {
      query?: string;
      appID?: number;
      authorId?: number;
      state?: REPOSITORY.MrState;
    };
  }>(initState);
  const [mrListPaging, loadingMr] = getAppMR.useState();
  const mrList = mrListPaging?.list || [];
  React.useEffect(() => {
    const mrMap = {};
    issueStreamList
      ?.filter((item) => item.streamType === 'RelateMR')
      .forEach((item) => {
        mrMap[item.mrInfo?.mrID as number] = item;
      });
    updater.relateMrList(Object.values(mrMap));
  }, [issueStreamList, updater]);

  React.useEffect(() => {
    const { query, appID, authorId, state } = filterData;
    const curApp = appList.find((app) => app.id === appID);
    if (projectName && curApp) {
      getAppMR.fetch({ projectName, query, appName: curApp.name, authorId, state, pageSize: 7 });
    }
  }, [appList, filterData, projectName]);

  React.useEffect(() => {
    if (visible) {
      if (!appList.length) {
        getJoinedApps.fetch({ projectId: +projectId, pageSize: 200, pageNo: 1 }).then((res) => {
          if (res?.data?.list) {
            setAppList(res.data.list);
            updater.filterData({ appID: res.data.list[0]?.id });
          }
        });
      }
    }
  }, [appList.length, projectId, updater, visible]);

  const columns: Array<ColumnProps<REPOSITORY.MRItem>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: i18n.t('title'),
      dataIndex: 'title',
      width: 240,
    },
    {
      title: i18n.t('creator'),
      dataIndex: ['authorUser', 'id'],
      render: (id: string) => <UserInfo.RenderWithAvatar id={id} />,
    },
    {
      title: i18n.t('created at'),
      dataIndex: 'createdAt',
      render: (item: string) => moment(item).format('YYYY/MM/DD HH:mm:ss'),
    },
  ];

  const overlay = (
    <div className="w-[800px] shadow-card-lg bg-white">
      <div className="flex items-center justify-between px-4 py-3 font-medium">
        <span>{i18n.t('dop:choose MR')}</span>
        <ErdaIcon type="guanbi" size={20} className="hover-active" onClick={() => updater.visible(false)} />
      </div>
      <ContractiveFilter
        values={filterData}
        className="px-4 py-2"
        conditions={[
          {
            key: 'query',
            type: 'input',
            label: i18n.t('title'),
            fixed: true,
            showIndex: 1,
            placeholder: i18n.t('filter by {name}', { name: i18n.t('title') }),
          },
          {
            label: i18n.t('application'),
            type: 'select',
            key: 'appID',
            options: appList.map((a) => ({ label: a.name, value: a.id })),
            haveFilter: true,
            fixed: true,
            emptyText: i18n.t('dop:all'),
            showIndex: 2,
            placeholder: i18n.t('dop:search by application name'),
            customProps: {
              mode: 'single',
            },
          },
          {
            label: i18n.t('state'),
            type: 'select',
            key: 'state',
            options: [
              { label: i18n.t('dop:all'), value: 'all' },
              { label: i18n.t('dop:open'), value: 'open' },
              { label: i18n.t('dop:closed'), value: 'closed' },
              { label: i18n.t('dop:merged'), value: 'merged' },
            ],
            fixed: true,
            emptyText: i18n.t('dop:all'),
            showIndex: 3,
            customProps: {
              mode: 'single',
            },
          },
          {
            key: 'authorId',
            type: 'memberSelector',
            label: i18n.t('dop:creator'),
            emptyText: i18n.t('dop:all'),
            fixed: true,
            showIndex: 5,
            customProps: {
              mode: 'single',
              scopeType: 'project',
            },
          },
        ]}
        onChange={(v) => {
          updater.filterData(v);
        }}
        delay={1000}
      />
      <ErdaTable
        rowKey="id"
        hideHeader
        loading={loadingMr}
        rowSelection={{
          actions: [
            {
              key: 'batchSelect',
              name: i18n.t('choose'),
              onClick: (keys) => {
                if (keys.length) {
                  const idMap = {};
                  mrList.forEach((mr) => {
                    idMap[mr.id] = mr;
                  });
                  batchCreateCommentStream({
                    issueStreams: (keys as number[]).map((id) => ({
                      issueID: issueDetail.id,
                      userID: loginUser.id,
                      content: '',
                      type: 'RelateMR',
                      mrInfo: {
                        appID: filterData.appID as number,
                        mrID: idMap[id].mergeId,
                        mrTitle: idMap[id].title,
                      },
                    })),
                  }).then(() => {
                    updater.filterData({
                      query: undefined,
                      state: undefined,
                    });
                    updater.visible(false);
                    afterAdd();
                  });
                }
              },
              isVisible: (keys) => keys.length > 0,
            },
          ],
        }}
        dataSource={mrList || []}
        columns={columns}
      />
    </div>
  );

  return [
    <Dropdown overlay={overlay} visible={visible} trigger={['click']}>
      <WithAuth pass={editAuth}>
        <span
          className="h-7 mr-1 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
          onClick={() => updater.visible(true)}
        >
          <ErdaIcon type="xuanze-43le7k0l" size={20} />
        </span>
      </WithAuth>
    </Dropdown>,

    <If condition={expand}>
      {relateMrList?.map((stream) => {
        return (
          <div
            key={stream.id}
            className={'backlog-issue-item px-2 hover:bg-default-04 cursor-pointer'}
            onClick={() =>
              goTo(goTo.pages.appMr, {
                projectId,
                appId: stream.mrInfo?.appID,
                mrId: stream.mrInfo?.mrID,
                jumpOut: true,
              })
            }
          >
            <div className="issue-info h-full">
              <div className="backlog-item-content mr-6">
                <span className="mr-1">
                  #{stream.mrInfo?.mrID}-{stream.mrInfo?.mrTitle}
                </span>
              </div>
              <div className="text-sub flex items-center flex-wrap justify-end">
                <UserInfo.RenderWithAvatar id={stream.operator} className="w-24 mr-6" />
              </div>
            </div>
          </div>
        );
      })}
    </If>,

    relateMrList,
  ];
};
