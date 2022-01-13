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
import { getFileTree, getFileDetail, createPipeline } from 'project/services/pipeline';

interface IProps {
  onCancel: () => void;
  application?: { ID: string; name?: string };
}

interface Node {
  value: string;
  name: string;
}

const PipelineForm = ({ onCancel, application }: IProps) => {
  const { ID: id, name } = application || {};
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [form] = Form.useForm();
  const [appList, setAppList] = React.useState<Node[]>([]);
  const [appNodeId, setAppNodeId] = React.useState<string>((id && btoa(encodeURI(`${projectId}/${id}`))) || '');
  const [branchList, setBranchList] = React.useState<Node[]>([]);
  const [branchId, setBranchId] = React.useState<string>('');
  const [pipelineList, setPipelineList] = React.useState<Node[]>([]);
  const [pipelineName, setPipelineName] = React.useState('');

  const getList = React.useCallback(
    async (pinode: string) => {
      const res = await getFileTree.fetch({
        scopeID: projectId,
        scope: 'project-app',
        pinode,
      });

      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    },
    [projectId],
  );

  const getAppList = React.useCallback(async () => {
    const list = await getList('0');
    setAppList(list?.map((item) => ({ value: item.inode, name: item.name })) || ([] as Node[]));
  }, [getList]);

  const getBranchList = React.useCallback(async () => {
    const list = await getList(appNodeId as string);
    setBranchList(list?.map((item) => ({ value: item.inode, name: item.name })) || ([] as Node[]));
  }, [appNodeId, getList]);

  const getPipelineList = React.useCallback(async () => {
    const list = await getList(branchId as string);
    setPipelineList(list?.map((item) => ({ value: item.inode, name: item.name })) || ([] as Node[]));
  }, [branchId, getList]);

  React.useEffect(() => {
    if (!appNodeId) {
      getAppList();
    }
  }, [appNodeId, getAppList]);

  React.useEffect(() => {
    if (appNodeId) {
      getBranchList();
    }
  }, [appNodeId, getBranchList]);

  React.useEffect(() => {
    if (branchId) {
      getPipelineList();
    }
  }, [branchId, getPipelineList]);

  const getPipelineDetail = async (pipelineId: string) => {
    const res = await getFileDetail.fetch({
      scopeID: projectId,
      scope: 'project-app',
      id: pipelineId,
    });
    if (res.success) {
      return res.data;
    } else {
      return Promise.reject();
    }
  };

  const submit = () => {
    form.validateFields().then(async (value) => {
      const detail = await getPipelineDetail(value.pipeline);
      if (detail) {
        const path = get(detail, 'meta.snippetAction.snippet_config.labels.gittarYmlPath');
        const branchPath = atob(decodeURI(value.branch)).split('/');
        const params = {
          sourceType: 'erda',
          projectID: +projectId,
          name: value.name,
          appID: +branchPath[1],
          ref: branchPath[branchPath.length - 1],
          path,
          fileName: pipelineName,
        };

        const res = await createPipeline.fetch({ ...params, $options: { successMsg: i18n.t('created successfully') } });
        if (res.success) {
          onCancel();
        }
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
              { required: true, message: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }) },
              { max: 30, message: i18n.t('dop:no more than 30 characters') },
              {
                pattern: /^[A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0',
              placeholder: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }),
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
                    itemProps={{
                      className: 'bg-default-06',
                      onChange: (appId: string) => setAppNodeId(appId),
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
                  itemProps={{
                    className: 'bg-default-06',
                    onChange: (_, node: { label: string }) => setPipelineName(node.label),
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
