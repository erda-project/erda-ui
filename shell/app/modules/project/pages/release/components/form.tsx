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
import { Button, Upload, Spin, Progress } from 'antd';
import moment from 'moment';
import { RenderForm, ListSelect, MarkdownEditor, ErdaIcon } from 'common';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import { goTo } from 'common/utils';
import { getUploadProps } from 'common/utils/upload-props';
import releaseStore from 'project/stores/release';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';
import userStore from 'user/stores';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLoading } from 'core/stores/loading';
import { FormInstance, UploadProps, UploadFile } from 'app/interface/common';
import {
  getReleaseList,
  getReleaseDetail,
  addRelease,
  updateRelease,
  checkVersion,
  parseVersion,
  addReleaseByFile,
} from 'project/services/release';

import './form.scss';

import EmptySVG from 'app/images/upload_empty.svg';

const promiseDebounce = (func: Function, delay = 1000) => {
  let timer: NodeJS.Timeout | undefined;
  return (...args: unknown[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    return new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          await func(...args);
          resolve();
        } catch (e) {
          reject(e);
        }
      }, delay);
    });
  };
};

const { Dragger } = Upload;

const ReleaseForm = ({ readyOnly = false }: { readyOnly?: boolean }) => {
  const formRef = React.useRef<FormInstance>();
  const { params } = routeInfoStore.getState((s) => s);
  const { projectId, releaseID, type = 'app' } = params;
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const loginUser = userStore.useStore((s) => s.loginUser);
  const { appList } = releaseStore.getState((s) => s);
  const { getAppList } = releaseStore.effects;
  const [pageNo, setPageNo] = React.useState(1);
  const [appId, setAppId] = React.useState<number | undefined>();
  const [query, setQuery] = React.useState<string>('');
  const [loading] = useLoading(releaseStore, ['getAppList']);

  const [releaseList, setReleaseList] = React.useState<RELEASE.ReleaseDetail[]>([] as RELEASE.ReleaseDetail[]);
  const [releaseTotal, setReleaseTotal] = React.useState(0);

  const _releaseDetail = getReleaseDetail.useData();
  const releaseDetail = React.useMemo(() => {
    return {
      ..._releaseDetail,
      applicationReleaseList: _releaseDetail?.applicationReleaseList?.map?.((item) => ({
        ...item,
        releaseId: item.releaseID,
      })),
    };
  }, [_releaseDetail]);

  const getDetail = React.useCallback(async () => {
    if (releaseID) {
      await getReleaseDetail.fetch({ releaseID });
    }
  }, [releaseID]);

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
      const { data } = res;
      if (data) {
        const { list, total } = data;
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

  const check = React.useCallback(
    promiseDebounce(async (version: string) => {
      if (version && version !== releaseDetail.version) {
        const payload = {
          orgID: orgId,
          isProjectRelease: true,
          projectID: +projectId,
          version,
        };
        const res = await checkVersion.fetch(payload);
        const { data } = res;
        if (data && !data.isUnique) {
          throw new Error(i18n.t('{name} already exists', { name: i18n.t('dop:release name') }));
        }
      }
    }),
    [releaseDetail, orgId, projectId],
  );

  const list = [
    {
      label: i18n.t('dop:release name'),
      name: 'version',
      type: 'input',
      itemProps: {
        placeholder: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }),
        disabled: type === 'file',
      },
      rules: [
        { required: true, message: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }) },
        { max: 30, message: i18n.t('dop:no more than 30 characters') },
        {
          pattern: /^[A-Za-z0-9._-]+$/,
          message: i18n.t('dop:Must be composed of letters, numbers, underscores, hyphens and dots.'),
        },
        {
          validator: (_, value: string) => {
            return check(value);
          },
        },
      ],
    },
    type === 'app'
      ? {
          label: i18n.t('dop:app release'),
          name: 'applicationReleaseList',
          type: 'custom',
          getComp: () => <ListSelect label={i18n.t('dop:app release')} />,
          itemProps: {
            renderSelectedItem: (item: RELEASE.ReleaseDetail) => {
              return (
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-hover truncate cursor-pointer"
                      title={item.version}
                      onClick={() => window.open(goTo.resolve.applicationReleaseDetail({ releaseId: item.releaseId }))}
                    >
                      {item.version}
                    </div>
                    <div className="text-xs flex mt-1">
                      <div className="desc">{i18n.t('dop:owned application')}</div>
                      <div className="ml-2 flex-1 min-w-0 truncate" title={item.applicationName}>
                        {item.applicationName}
                      </div>
                    </div>
                  </div>
                  <div className="desc">
                    {item.createdAt ? moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss') : null}
                  </div>
                </div>
              );
            },
            renderItem: (item: RELEASE.ReleaseDetail) => {
              return (
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="truncate" title={item.version}>
                      {item.version}
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
                  <div>{item.version}</div>
                  <div className="text-xs flex mt-1">
                    <div className="text-default-6">{i18n.t('dop:owned application')}</div>
                    <div className="ml-2">{item.applicationName}</div>
                  </div>
                </div>
                <div className="text-default-6">{item.createdAt}</div>
              </div>
            ));
          },
        }
      : {
          label: i18n.t('dop:upload files'),
          name: 'diceFileID',
          className: 'flex-nowrap',
          getComp: (form: { form: FormInstance }) => <CustomUpload form={form} />,
          rules: [
            { required: true, message: i18n.t('dop:please upload files') },
            {
              validator: (_, value: string) => {
                if (value === 'type-error') {
                  return Promise.reject(new Error(i18n.t('dop:file type error')));
                }

                return Promise.resolve();
              },
            },
          ],
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
      let payload = {
        ...values,
        orgId,
        userId: loginUser.id,
        projectID: +projectId,
      };

      if (type === 'app') {
        const { applicationReleaseList = [] } = values;
        payload = {
          ...payload,
          applicationReleaseList: applicationReleaseList.map((item: { releaseId: string }) => item.releaseId),
          isStable: true,
          isFormal: false,
          isProjectRelease: true,
        };
        if (releaseID) {
          await updateRelease({
            ...payload,
            releaseID,
            $options: { successMsg: i18n.t('edited successfully') },
          });
          goTo(goTo.pages.projectReleaseList);
        } else {
          await addRelease({ ...payload, $options: { successMsg: i18n.t('created successfully') } });
          goTo(goTo.pages.projectReleaseList);
        }
      } else {
        await addReleaseByFile({ ...payload, $options: { successMsg: i18n.t('created successfully') } });
        goTo(goTo.pages.projectReleaseList);
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
          <Button onClick={() => goTo(goTo.pages.projectReleaseList)}>{i18n.t('return to previous page')}</Button>
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

const progressStatusMap = {
  uploading: 'active',
  done: 'success',
  error: 'exception',
};

const CustomUpload = ({ form, onChange }: { form: { form: FormInstance }; onChange: (value?: string) => void }) => {
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const props: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      if (file.type !== 'application/x-tar') {
        onChange('type-error');
        return false;
      }

      return true;
    },
    onChange: async ({ file }) => {
      if (file.type !== 'application/x-tar') {
        setFileList([{ ...file, status: 'error', percent: 100, name: file.name }]);
      } else {
        setFileList([file]);
        if (file.response?.success) {
          const diceFileID = file.response?.data.uuid;
          const res = await parseVersion.fetch({ diceFileID });
          if (res.success) {
            onChange(diceFileID);
            form.form.setFieldsValue({ version: res.data?.version });
          }
        }
      }
    },
  };

  const remove = () => {
    setFileList([]);
    onChange();
  };

  return (
    <div className="w-1/2">
      <Dragger {...getUploadProps(props, 10)}>
        <div className="flex-all-center py-1">
          <img src={EmptySVG} style={{ height: 80 }} />
          <div className="ml-2.5">
            <div className="text-left text-default text-base">{i18n.t('dop:upload yml file')}</div>
            <div className="text-xs text-default-6 leading-5">{i18n.t('dop:click this area to browse and upload')}</div>
          </div>
        </div>
      </Dragger>
      {fileList.map((item) => (
        <div className="mt-4">
          <div className="flex-h-center justify-between">
            {item.name}
            <ErdaIcon type="guanbi" className="text-default-4 cursor-pointer" onClick={remove} />
          </div>
          <Progress showInfo={false} percent={item.percent || 0} status={progressStatusMap[item.status]} />
        </div>
      ))}
    </div>
  );
};

export default ReleaseForm;
