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
import { Button, message, Spin } from 'antd';
import moment from 'moment';
import { RenderForm, ListSelect, MarkdownEditor } from 'common';
import { FormInstance } from 'app/interface/common';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import { goTo } from 'common/utils';
import releaseStore from 'project/stores/release';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';
import userStore from 'user/stores';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLoading } from 'core/stores/loading';
import { getReleaseList, getReleaseDetail, addRelease, updateRelease } from 'project/services/release';

import './form.scss';

const ReleaseForm = ({ readyOnly = false }: { readyOnly: boolean }) => {
  const formRef = React.useRef<FormInstance>();
  const { params } = routeInfoStore.getState((s) => s);
  const { projectId, releaseID } = params;
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const loginUser = userStore.useStore((s) => s.loginUser);
  const { appList } = releaseStore.getState((s) => s);
  const { getAppList } = releaseStore.effects;
  const [pageNo, setPageNo] = React.useState(1);
  const [appId, setAppId] = React.useState<number | undefined>();
  const [query, setQuery] = React.useState<string>('');
  const [loading] = useLoading(releaseStore, ['getAppList']);
  const [releaseDetail, setReleaseDetail] = React.useState<RELEASE.ReleaseDetail>({} as RELEASE.ReleaseDetail);
  const [releaseList, setReleaseList] = React.useState<RELEASE.ReleaseDetail[]>([] as RELEASE.ReleaseDetail[]);
  const [releaseTotal, setReleaseTotal] = React.useState<number>(0);

  const getDetail = React.useCallback(async () => {
    if (releaseID) {
      const res = await getReleaseDetail({ releaseID });
      if (res.success) {
        const { data } = res;
        setReleaseDetail({
          ...data,
          applicationReleaseList: data.applicationReleaseList.map((item) => ({ ...item, releaseId: item.releaseID })),
        });
      }
    }
  }, [releaseID, setReleaseDetail]);

  React.useEffect(() => {
    getDetail();
  }, [getDetail]);

  React.useEffect(() => {
    formRef.current?.setFieldsValue(releaseDetail);
  }, [releaseDetail]);

  const getReleases = React.useCallback(
    async (_pageNo: number, applicationId?: string | number) => {
      const res = await getReleaseList({
        projectId,
        applicationId: applicationId !== 0 ? applicationId : undefined,
        pageNo: _pageNo,
        isProjectRelease: false,
        pageSize: PAGINATION.pageSize,
        isStable: true,
        q: query,
      });

      if (res.success) {
        const { list, total } = res.data;
        setReleaseList(list);
        setReleaseTotal(total);
      }
    },
    [projectId, query],
  );

  React.useEffect(() => {
    getAppList({ projectId });
  }, [projectId, getAppList]);

  React.useEffect(() => {
    getReleases(1);
  }, [getReleases]);

  const selectApp = React.useCallback(
    (item: RELEASE.ApplicationDetail) => {
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
      },
      rules: [
        { required: true, message: i18n.t('please enter {name}', { name: i18n.t('dop:version name') }) },
        { max: 30, message: i18n.t('dop:no more than 30 characters') },
        {
          pattern: /^[A-Za-z0-9._-]+$/,
          message: i18n.t('dop:Must be composed of letters, numbers, underscores, hyphens and dots.'),
        },
      ],
    },
    {
      label: i18n.t('dop:app release'),
      name: 'applicationReleaseList',
      type: 'custom',
      getComp: () => <ListSelect label={i18n.t('dop:app release')} />,
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
      name: 'changelog',
      type: 'custom',
      getComp: () => <EditMd />,
      readOnlyRender: (value: string) => {
        return <MarkdownReadOnlyRender value={value} />;
      },
    },
  ];

  const submit = () => {
    formRef.current?.validateFields().then(async (values) => {
      const { applicationReleaseList = [] } = values;
      const payload = {
        ...values,
        applicationReleaseList: applicationReleaseList.map((item: { releaseId: string }) => item.releaseId),
        isStable: true,
        isFormal: false,
        isProjectRelease: true,
        orgId,
        userId: loginUser.id,
        projectID: +projectId,
      };
      if (releaseID) {
        const res = await updateRelease({ ...payload, releaseID });
        if (res.success) {
          message.success(i18n.t('edited successfully'));
          goTo(goTo.pages.projectRelease);
        }
      } else {
        const res = await addRelease({ ...payload });
        if (res.success) {
          message.success(i18n.t('created successfully'));
          goTo(goTo.pages.projectRelease);
        }
      }
    });
  };

  return (
    <div className="release-form">
      <Spin spinning={loading}>
        <RenderForm ref={formRef} layout="vertical" list={list} readOnly={readyOnly} />
      </Spin>

      {!readyOnly ? (
        <div className="mb-2">
          <Button className="mr-3" type="primary" onClick={submit}>
            {i18n.t('submit')}
          </Button>
          <Button onClick={() => goTo(goTo.pages.projectRelease)}>{i18n.t('return to previous page')}</Button>
        </div>
      ) : null}
    </div>
  );
};

const EditMd = ({ value, onChange, ...itemProps }: { value: string; onChange: (value: string) => void }) => {
  return <MarkdownEditor value={value} onChange={onChange} {...itemProps} defaultHeight={400} />;
};

const MarkdownReadOnlyRender = ({ value }: { value: string }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || i18n.t('no description yet')}</ReactMarkdown>;
};

export default ReleaseForm;
