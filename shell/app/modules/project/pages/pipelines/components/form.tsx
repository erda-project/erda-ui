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
import { Form, Button } from 'antd';
import { get } from 'lodash';
import i18n from 'i18n';
import { ErdaIcon, RenderFormItem } from 'common';
import routeInfoStore from 'core/stores/route';
import { getAppList, getBranchList, getFileDetail, createPipeline, getPipelineList } from 'project/services/pipeline';

interface IProps {
  onCancel: () => void;
  application?: { ID: string; name?: string };
}

interface Node {
  value: string;
  name: string;
  onOk: () => void;
}

const PipelineForm = ({ onCancel, application, onOk }: IProps) => {
  const { ID: id, name, projectName: projectNameProps } = application || {};
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [form] = Form.useForm();
  const [appList, setAppList] = React.useState<Node[]>([]);
  const [app, setApp] = React.useState<string>({ value: id, label: name, projectName: projectNameProps });
  const [branchList, setBranchList] = React.useState<Node[]>([]);
  const [branchId, setBranchId] = React.useState<string>('');
  const [pipelineList, setPipelineList] = React.useState<Node[]>([]);
  const [pipeline, setPipeline] = React.useState('');

  const getApps = React.useCallback(async () => {
    const res = await getAppList.fetch({ projectID: projectId });
    if (res.success) {
      setAppList(
        res.data?.map((item) => ({ value: item.ID, label: item.displayName, projectName: item.projectName })) || [],
      );
    }
  }, [projectId]);

  const getBranch = React.useCallback(async () => {
    const { value } = app;
    const application = appList.find((item) => item.value === value) || {};
    const { projectName, label } = id ? app : application;
    const res = await getBranchList({ projectName, applicationName: label });
    if (res.success) {
      setBranchList(res.data.branches?.map((item) => ({ value: item, name: item })) || ([] as Node[]));
    }
  }, [app, appList]);

  const getPipelines = React.useCallback(async () => {
    const { value } = app;
    const res = await getPipelineList({ appID: value, branch: branchId });
    if (res.success) {
      const { result } = res.data;
      setPipelineList(result?.map((item) => ({ value: item.ymlPath, name: item.ymlName })) || ([] as Node[]));
    }
  }, [branchId, app]);

  React.useEffect(() => {
    if (!id) {
      getApps();
    }
  }, [id, getApps]);

  React.useEffect(() => {
    if (app) {
      getBranch();
    }
  }, [app, getBranch]);

  React.useEffect(() => {
    if (branchId) {
      getPipelines();
    }
  }, [branchId, getPipelines]);

  const submit = () => {
    form.validateFields().then(async (value) => {
      const params = {
        sourceType: 'erda',
        projectID: +projectId,
        name: value.name,
        appID: value.app || id,
        ref: branchId,
        path: pipeline.value,
        fileName: pipeline.label,
      };

      const res = await createPipeline.fetch({ ...params, $options: { successMsg: i18n.t('created successfully') } });
      if (res.success) {
        onOk();
      }
    });
  };

  return (
    <div className="project-pipeline-form flex flex-col h-full">
      <div className="header py-2.5 pl-4 bg-default-02 flex-h-center">
        <span className="text-base text-default">{i18n.t('create {name}', { name: i18n.t('pipeline') })}</span>
        <ErdaIcon type="zhedie" className="ml-1" />
        {name ? (
          <div className="flex-1 flex">
            <div className="flex-h-center ml-2 bg-default-08 px-2 py-1">
              <ErdaIcon type="wodeyingyong" className="mr-0.5" size={18} />
              {name}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex-h-center cursor-pointer mx-2 px-2 py-1">
          <ErdaIcon type="guanbi" size="20" onClick={() => onCancel()} />
        </div>
      </div>

      <div className="flex-1 min-h-0 pl-4 pt-4 w-1/2">
        <Form form={form}>
          <RenderFormItem
            name={'name'}
            type={'input'}
            rules={[
              { required: true, message: i18n.t('please enter {name}', { name: i18n.t('pipeline') }) },
              { max: 30, message: i18n.t('dop:no more than 30 characters') },
              {
                pattern: /^[A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0',
              placeholder: i18n.t('please enter {name}', { name: i18n.t('pipeline') }),
            }}
          />
          <div>
            <div className="text-default">{i18n.t('dop:code source')}</div>
            <CodeResource />
          </div>
          <div>
            <div className="text-default mb-3">{i18n.t('Config')}</div>
            {!id ? (
              <div className="flex-h-center">
                <div className="mb-6 w-28 text-default-6a">{i18n.t('App')}</div>
                <div className="flex-1">
                  <RenderFormItem
                    name="app"
                    type="select"
                    options={appList}
                    rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('App') }) }]}
                    itemProps={{
                      className: 'bg-default-06',
                      onChange: (v: string, app: Obj) => setApp(app),
                    }}
                  />
                </div>
              </div>
            ) : null}
            <div className="flex-h-center">
              <div className="mb-6 w-28 text-default-6a">{i18n.t('dop:branch')}</div>
              <div className="flex-1">
                <RenderFormItem
                  name="branch"
                  type="select"
                  options={branchList}
                  rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('dop:branch') }) }]}
                  itemProps={{
                    className: 'bg-default-06',
                    onChange: (bId: string) => setBranchId(bId),
                  }}
                />
              </div>
            </div>
            <div className="flex-h-center">
              <div className="mb-6 w-28 text-default-6a">pipeline {i18n.t('file')}</div>
              <div className="flex-1">
                <RenderFormItem
                  name="pipeline"
                  type="select"
                  options={pipelineList}
                  rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('pipeline') }) }]}
                  itemProps={{
                    className: 'bg-default-06',
                    onChange: (_, node: { label: string }) => setPipeline(node),
                  }}
                />
              </div>
            </div>
          </div>
        </Form>
      </div>

      <div className="py-3 px-4">
        <Button type="primary" className="mr-2" onClick={submit}>
          {i18n.t('establish')}
        </Button>
        <Button className="bg-default-06 border-default-06 text-default-8" onClick={() => onCancel()}>
          {i18n.t('cancel')}
        </Button>
      </div>
    </div>
  );
};

const CodeResource = () => {
  const list = [
    {
      icon: <ErdaIcon type="Erdadaimacangku" size={30} />,
      label: i18n.t('dop:Built-in code base'),
    },
  ];
  return (
    <div className="my-6 flex">
      {list.map((item) => (
        <div className="flex-h-center">
          <div className="w-5 h-5 inline-block rounded-full border border-solid border-white-300 flex-all-center bg-purple-deep border-purple-deep mr-2">
            <ErdaIcon type="check" className="text-white" size="12" />
          </div>
          <div className="mr-2 flex-h-center">{item.icon}</div>
          <div className="text-default-9">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PipelineForm;
