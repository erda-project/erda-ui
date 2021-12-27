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
import { Button, Spin } from 'antd';
import moment from 'moment';
import { RenderForm } from 'common';
import { FormInstance } from 'app/interface/common';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import { useLoading } from 'core/stores/loading';
import { goTo } from 'common/utils';
import releaseStore from 'project/stores/release';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';
import userStore from 'user/stores';

import './form.scss';

const ReleaseForm = ({ readyOnly = false }: { readyOnly: boolean }) => {
  const formRef = React.useRef<FormInstance>();
  const { params } = routeInfoStore.getState((s) => s);
  const { projectId, releaseID } = params;
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const loginUser = userStore.useStore((s) => s.loginUser);
  const { appList, releaseList, releaseTotal, releaseDetail } = releaseStore.getState((s) => s);
  const { getAppList, getReleaseList, addRelease, updateRelease, getReleaseDetail } = releaseStore.effects;
  const { updateReleaseDetail } = releaseStore.reducers;
  const [loading] = useLoading(releaseStore, ['getReleaseDetail']);
  const [pageNo, setPageNo] = React.useState(1);
  const [appId, setAppId] = React.useState<string | undefined>();
  const [query, setQuery] = React.useState<string>('');

  React.useEffect(() => {
    if (releaseID) {
      getReleaseDetail({ releaseID });
    }
  }, [releaseID, getReleaseDetail]);

  React.useEffect(() => {
    formRef.current?.setFieldsValue(releaseDetail);

    return () => {
      updateReleaseDetail({});
    };
  }, [releaseDetail, updateReleaseDetail]);

  const getReleases = React.useCallback(
    (_pageNo: number, applicationId?: string | number) => {
      getReleaseList({
        projectId,
        applicationId: applicationId !== 0 ? applicationId : undefined,
        pageNo: _pageNo,
        isProjectRelease: false,
        pageSize: PAGINATION.pageSize,
        isStable: true,
        q: query,
      });
    },
    [projectId, getReleaseList, query],
  );

  React.useEffect(() => {
    getAppList({ projectId });
    getReleases(1);
  }, [projectId, getAppList, getReleases]);

  const selectApp = React.useCallback(
    (item: Obj) => {
      setAppId(item.id);
      setPageNo(1);
      getReleases(1, item.id);
    },
    [setAppId, setPageNo, getReleases],
  );

  const searchApp = (q: string) => {
    getAppList({ projectId, q });
  };

  const searchRelease = (q: string) => {
    setQuery(q);
  };

  const list = [
    {
      label: i18n.t('dop:version name'),
      name: 'version',
      type: 'input',
      itemProps: {
        placeholder: i18n.t('please enter {name}', { name: i18n.t('dop:version name') }),
        maxLength: 30,
      },
    },
    {
      label: i18n.t('dop:app release'),
      name: 'applicationReleaseList',
      type: 'listSelect',
      itemProps: {
        renderSelectedItem: (item: RELEASE.ReleaseDetail) => {
          return (
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="text-hover truncate" title={item.releaseName}>
                  {item.releaseName}
                </div>
                <div className="text-xs flex mt-1">
                  <div className="desc">{i18n.t('dop:owned application')}</div>
                  <div className="ml-2 flex-1 min-w-0 truncate" title={item.applicationName}>
                    {item.applicationName}
                  </div>
                </div>
              </div>
              <div className="desc">{item.createdAt ? moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss') : null}</div>
            </div>
          );
        },
        renderItem: (item: RELEASE.ReleaseDetail) => {
          return (
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="truncate" title={item.releaseName}>
                  {item.releaseName}
                </div>
                <div className="text-xs flex">
                  <div className="desc">{i18n.t('dop:owned application')}</div>
                  <div className="ml-2 truncate" title={item.applicationName}>
                    {item.applicationName}
                  </div>
                </div>
              </div>
              <span className="text-xs text-white-6">{moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
            </div>
          );
        },
        rowKey: 'releaseId',
        parentKey: 'applicationId',
        menus: appList,
        list: releaseList,
        onMenuChange: selectApp,
        onMenuFilter: searchApp,
        onListFilter: searchRelease,
        listPagination: {
          total: releaseTotal,
          current: pageNo,
          pageSize: PAGINATION.pageSize,
          onChange: (_pageNo: number) => {
            setPageNo(_pageNo);
            getReleases(_pageNo, appId);
          },
        },
      },
      readOnlyRender: (value: RELEASE.ReleaseDetail[]) => {
        return (value || []).map((item: RELEASE.ReleaseDetail) => (
          <div className="flex justify-between items-center bg-default-01 p-2">
            <div>
              <div>{item.releaseName}</div>
              <div className="text-xs flex mt-1">
                <div className="text-default-6">{i18n.t('dop:owned application')}</div>
                <div className="ml-2">{item.applicationName}</div>
              </div>
            </div>
            <div className="text-default-6">{item.createdAt}</div>
          </div>
        ));
      },
    },
    {
      label: i18n.t('content'),
      name: 'markdown',
      type: 'markdown',
    },
  ];

  const submit = () => {
    formRef.current?.validateFields().then((values) => {
      const { applicationReleaseList = [] } = values;
      const payload = {
        ...values,
        applicationReleaseList: applicationReleaseList.map((item: { releaseId: string }) => item.releaseId),
        isStable: true,
        isFormal: false,
        isProjectRelease: true,
        orgId,
        userId: loginUser.id,
        releaseName: 'test-3',
      };
      if (releaseID) {
        updateRelease({
          ...payload,
          releaseID,
        }).then((res: { success: boolean }) => {
          if (res.success) {
            goTo(goTo.pages.projectRelease);
          }
        });
      } else {
        addRelease({
          ...payload,
        }).then((res: { success: boolean }) => {
          if (res.success) {
            goTo(goTo.pages.projectRelease);
          }
        });
      }
    });
  };

  return (
    <div className="release-form">
      <Spin spinning={loading}>
        <RenderForm ref={formRef} layout="vertical" list={list} readOnly={readyOnly} />
        {!readyOnly ? (
          <div className="mb-2">
            <Button className="mr-3" type="primary" onClick={submit}>
              {i18n.t('submit')}
            </Button>
            <Button onClick={() => goTo(goTo.pages.projectRelease)}>{i18n.t('return to previous page')}</Button>
          </div>
        ) : null}
      </Spin>
    </div>
  );
};

export default ReleaseForm;
