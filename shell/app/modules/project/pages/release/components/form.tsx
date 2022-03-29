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
import { Button, Upload, Progress, Collapse } from 'antd';
import { RenderForm, MarkdownEditor, ErdaIcon } from 'common';
import i18n from 'i18n';
import { goTo, insertWhen } from 'common/utils';
import { getUploadProps } from 'common/utils/upload-props';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';
import userStore from 'user/stores';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormInstance, UploadProps, UploadFile } from 'app/interface/common';
import ReleaseSelect from './release-select';
import {
  getReleaseDetail,
  addRelease,
  updateRelease,
  checkVersion,
  parseVersion,
  addReleaseByFile,
} from 'project/services/release';

import './form.scss';

import EmptySVG from 'app/images/upload_empty.svg';

const { Panel } = Collapse;

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
  const [active, setActive] = React.useState(['1']);

  const _releaseDetail = getReleaseDetail.useData();
  const releaseDetail = React.useMemo(() => {
    return {
      ..._releaseDetail,
      applicationReleaseList: _releaseDetail?.modes?.default?.applicationReleaseList?.map?.((group, index) => ({
        active: index === 0,
        list: [...group.map((item) => ({ ...item, id: item.releaseID, pId: item.applicationID }))],
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
          throw new Error(i18n.t('{name} already exists', { name: i18n.t('version') }));
        }
      }
    }),
    [releaseDetail, orgId, projectId],
  );

  const list = [
    {
      label: i18n.t('version'),
      name: 'version',
      type: 'input',
      itemProps: {
        placeholder: i18n.t('please enter {name}', { name: i18n.t('version') }),
        disabled: type === 'file',
      },
      rules: [
        { required: true, message: i18n.t('please enter {name}', { name: i18n.t('version') }) },
        { max: 30, message: i18n.t('dop:no more than 30 characters') },
        {
          pattern: /^[A-Za-z0-9._+-]+$/,
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
          className: 'flex-nowrap',
          getComp: () => <ReleaseSelect />,
          readOnlyRender: (value: Array<{ active: boolean; list: RELEASE.ReleaseDetail[] }>) => {
            const { dependOn } = releaseDetail?.modes?.default || {};
            return (
              <div className="erda-list-select flex">
                <div className="mr-3">
                  <div className="leading-5">
                    <i
                      className={`inline-block rounded-full border-primary border-solid w-2 h-2 ${
                        active.length ? 'bg-primary' : ''
                      }`}
                      style={{ borderWidth: 1 }}
                    />
                  </div>
                </div>

                <Collapse activeKey={active} ghost className="time-line-collapse" onChange={setActive}>
                  <Panel
                    header={
                      <span className={`time-line-collapse-header ${active ? 'active' : ''}`}>
                        <span className="group-title">default</span>
                        {value?.length ? (
                          <span className="bg-default-1 rounded-full px-2 py-0.5 text-xs ml-1">{value.length}</span>
                        ) : (
                          ''
                        )}
                      </span>
                    }
                    key="1"
                  >
                    <div className="text-black-4 mb-2">{i18n.t('dop:dependence')}</div>
                    <div className="mb-4">{dependOn?.length ? dependOn.join(',') : i18n.t('none')}</div>
                    <ReleaseSelect value={value} readOnly />
                  </Panel>
                </Collapse>
              </div>
            );
          },
          rules: [
            {
              validator: (_, value: Array<{ list: RELEASE.ReleaseDetail[] }>) => {
                if (value && value.length !== 0 && !value.find((item) => item.list.length !== 0)) {
                  return Promise.reject(new Error(i18n.t('please enter {name}', { name: i18n.t('dop:app release') })));
                }

                return Promise.resolve();
              },
            },
          ],
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
    ...insertWhen(type === 'app', [
      {
        label: i18n.t('content'),
        name: 'changelog',
        type: 'custom',
        getComp: () => <EditMd />,
        readOnlyRender: (value: string) => {
          return <MarkdownReadOnlyRender value={value} />;
        },
      },
    ]),
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
        const { applicationReleaseList = [], ..._payload } = payload;
        payload = {
          ..._payload,
          modes: {
            default: {
              dependOn: [],
              expose: true,
              applicationReleaseList: applicationReleaseList
                .filter((group: { list: Array<{ id: string }> }) => group.list?.length)
                .map((group: { list: Array<{ id: string }> }) => group.list.map((item: { id: string }) => item.id)),
            },
          },
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
          goTo(goTo.pages.projectReleaseListProject);
        } else {
          await addRelease({ ...payload, $options: { successMsg: i18n.t('created successfully') } });
          goTo(goTo.pages.projectReleaseListProject);
        }
      } else {
        await addReleaseByFile({ ...payload, $options: { successMsg: i18n.t('created successfully') } });
        goTo(goTo.pages.projectReleaseListProject);
      }
    });
  };

  return (
    <div className="release-form h-full flex flex-col">
      <div className="flex-1">
        <RenderForm ref={formRef} layout="vertical" list={list} readOnly={readyOnly} />
      </div>

      {!readyOnly ? (
        <div className="pb-2">
          <Button className="mr-3" type="primary" onClick={submit}>
            {i18n.t('submit')}
          </Button>
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

  const fileType = 'application/zip';

  const props: UploadProps = {
    fileList,
    accept: '.zip',
    beforeUpload: (file) => {
      if (file.type !== fileType) {
        onChange('type-error');
        return false;
      }

      return true;
    },
    onChange: async ({ file }) => {
      if (file.type !== fileType) {
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
            <div className="text-left text-default text-base">{i18n.t('dop:upload zip file')}</div>
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
