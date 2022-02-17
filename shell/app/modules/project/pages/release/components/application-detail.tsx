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
import { Button, Tabs, Modal, message, Form, Divider } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { UserInfo, FileEditor, RenderFormItem, MarkdownEditor } from 'common';
import ErdaTable from 'common/components/table';
import routeInfoStore from 'core/stores/route';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import orgStore from 'app/org-home/stores/org';
import FileContainer from 'application/common/components/file-container';
import { getReleaseDetail, formalRelease, updateRelease, checkVersion } from 'project/services/release';

import './form.scss';

const { TabPane } = Tabs;

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

const ReleaseApplicationDetail = ({ isEdit = false }: { isEdit: boolean }) => {
  const [params] = routeInfoStore.useStore((s) => [s.params]);
  const { releaseID, projectId } = params;
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const releaseDetail = getReleaseDetail.useData() || ({} as RELEASE.ReleaseDetail);
  const [form] = Form.useForm();
  const {
    version,
    applicationName,
    userId,
    createdAt,
    labels = {} as RELEASE.Labels,
    changelog,
    serviceImages = [],
    isFormal,
    clusterName,
    resources,
  } = releaseDetail;

  const getDetail = React.useCallback(async () => {
    if (releaseID) {
      const res = await getReleaseDetail.fetch({ releaseID });
      const { data } = res;
      if (data) {
        if (isEdit) {
          form.setFieldsValue({
            version: data.version,
            changelog: data.changelog,
          });
        }
      }
    }
  }, [releaseID, isEdit, form]);

  React.useEffect(() => {
    getDetail();
  }, [getDetail]);

  const formal = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: version,
        interpolation: { escapeValue: false },
      }),
      onOk: async () => {
        await formalRelease({
          releaseID,
          $options: { successMsg: i18n.t('{action} successfully', { action: i18n.t('dop:be formal') }) },
        });
        getDetail();
      },
    });
  };

  const submit = () => {
    form.validateFields().then(async (values) => {
      const payload = {
        ...values,
        isStable: true,
        isFormal: false,
        isProjectRelease: false,
        releaseID,
        projectID: +projectId,
      };
      await updateRelease({ ...payload, $options: { successMsg: i18n.t('edited successfully') } });
      goTo(goTo.pages.applicationReleaseList);
    });
  };

  const check = React.useCallback(
    promiseDebounce(async (value) => {
      if (value && value !== version) {
        const payload = {
          orgID: orgId,
          isProjectRelease: true,
          projectID: +projectId,
          version: value,
        };
        const res = await checkVersion(payload);
        const { data } = res;
        if (data && !data.isUnique) {
          throw new Error(i18n.t('{name} already exists', { name: i18n.t('version') }));
        }
      }
    }),
    [releaseDetail],
  );

  return (
    <div className="release-releaseDetail release-form h-full pb-16 relative">
      <Form layout="vertical" form={form} className="h-full overflow-auto">
        <Tabs defaultActiveKey="1">
          <TabPane tab={i18n.t('dop:basic information')} key="1">
            <div className="mb-4 pl-0.5">
              {isEdit ? (
                <div className="w-2/5">
                  <RenderFormItem
                    label={i18n.t('version')}
                    name="version"
                    type="input"
                    rules={[
                      { required: true, message: i18n.t('please enter {name}', { name: i18n.t('version') }) },
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
                    ]}
                  />
                </div>
              ) : (
                renderItems([{ label: i18n.t('version'), value: version }])
              )}
              {renderItems([
                { label: i18n.t('dop:app name'), value: applicationName },
                { label: i18n.t('cluster name'), value: clusterName },
                { label: i18n.t('creator'), value: userId ? <UserInfo id={userId} /> : '-' },
                { label: i18n.t('create time'), value: createdAt && moment(createdAt).format('YYYY/MM/DD HH:mm:ss') },
                { label: i18n.t('dop:code branch'), value: labels.gitBranch },
                { label: 'commitId', value: labels.gitCommitId },
                { label: `GitRepo ${i18n.t('dop:address')}`, value: labels.gitRepo },
              ])}
              {isEdit ? (
                <div className="w-4/5">
                  <RenderFormItem label={i18n.t('content')} name="changelog" type="custom" getComp={() => <EditMd />} />
                </div>
              ) : (
                <div className="mb-2">
                  <div className="text-black-4 mb-2">{i18n.t('content')}</div>
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {changelog || i18n.t('dop:no content yet')}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </TabPane>
          <TabPane tab={i18n.t('dop:images list')} key="2">
            <ErdaTable
              columns={[
                { title: i18n.t('service name'), dataIndex: 'name' },
                { title: i18n.t('dop:image name'), dataIndex: 'image' },
              ]}
              dataSource={serviceImages}
              onChange={() => getReleaseDetail({ releaseID })}
            />
          </TabPane>
          <TabPane tab="dice.yml" key="3">
            <FileContainer className="mt-3" name="dice.yml">
              <FileEditor name="dice.yml" fileExtension="yml" value={releaseDetail.diceyml} readOnly />
            </FileContainer>
          </TabPane>
          {resources ? (
            <TabPane tab="resource" key="4">
              <div className="mb-4 pl-0.5">
                {resources.map((item, index) => (
                  <div>
                    {renderItems([
                      { label: 'name', value: item.name },
                      { label: 'type', value: item.type },
                      { label: 'url', value: item.url },
                      ...(item.meta ? [{ label: 'meta', value: item.meta }] : []),
                    ])}
                    {index !== resources.length - 1 ? <Divider /> : ''}
                  </div>
                ))}
              </div>
            </TabPane>
          ) : (
            ''
          )}
        </Tabs>
      </Form>

      <div className="absolute bottom-0 left-0 right-0 bg-white z-10 py-4">
        {isEdit ? (
          <Button className="mr-3 bg-default" type="primary" onClick={submit}>
            {i18n.t('submit')}
          </Button>
        ) : null}
        {!isFormal ? (
          <Button className="mr-3 bg-default" type="primary" onClick={formal}>
            {i18n.t('dop:be formal')}
          </Button>
        ) : null}
        <Button className="bg-default-06 border-default-06" onClick={() => goTo(goTo.pages.applicationReleaseList)}>
          {i18n.t('return to previous page')}
        </Button>
      </div>
    </div>
  );
};

const EditMd = ({ value, onChange, ...itemProps }: { value: string; onChange: (value: string) => void }) => {
  return <MarkdownEditor value={value} onChange={onChange} {...itemProps} defaultHeight={400} />;
};

const renderItems = (list: Array<{ label: string; value: string }>) => {
  return list.map((item) => (
    <div className="mb-2">
      <div className="text-black-4 mb-2">{item.label}</div>
      <div>{item.value || '-'}</div>
    </div>
  ));
};

export default ReleaseApplicationDetail;
