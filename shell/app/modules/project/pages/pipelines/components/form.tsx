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
import { Form, Button, TreeSelect } from 'antd';
import i18n from 'i18n';
import { ErdaIcon, RenderFormItem } from 'common';
import routeInfoStore from 'core/stores/route';
import { getFileTree, createPipeline, getAppList } from 'project/services/pipeline';

import './form.scss';

interface IProps {
  onOk: () => void;
  onCancel: () => void;
  application?: { ID: string; name?: string };
}

interface TreeNode extends Node {
  id: string;
  pId: string;
  title: string;
}

interface Node {
  inode: string;
  pinode: string;
  name: string;
  type: string;
}

const PipelineForm = ({ onCancel, application, onOk }: IProps) => {
  const { ID: id, name } = application || {};
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [form] = Form.useForm();
  const [appList, setAppList] = React.useState([]);
  const [app, setApp] = React.useState<{ value: string; label: string }>({ value: id, label: name });
  const [tree, setTree] = React.useState<TreeNode[]>([]);

  const convertTreeData = (data: Node[]) => {
    return data.map((item) => ({
      ...item,
      id: item.inode,
      pId: item.pinode,
      title: item.name,
      isLeaf: item.type === 'f',
      disabled: item.type !== 'f',
    }));
  };

  const getTree = React.useCallback(
    async (pinode: string) => {
      const res = await getFileTree.fetch({
        scopeID: projectId,
        scope: 'project-app',
        pinode,
      });

      if (res.success) {
        return convertTreeData(res.data || []);
      } else {
        return [];
      }
    },
    [projectId],
  );

  const loadTree = async (node: TreeNode) => {
    const data = await getTree(node.id);
    setTree((prev) => [...prev, ...data]);
    return Promise.resolve();
  };

  const getApps = React.useCallback(async () => {
    const res = await getAppList.fetch({ projectID: projectId });
    if (res.success) {
      setAppList(
        res.data?.map((item) => ({ value: item.ID, label: item.displayName, projectName: item.projectName })) || [],
      );
    }
  }, [projectId]);

  React.useEffect(() => {
    if (!id) {
      getApps();
    }
  }, [id, getApps]);

  React.useEffect(() => {
    const initialTree = async () => {
      const data = await getTree(btoa(encodeURI(`${projectId}/${app.value}`)));
      setTree(data);
    };
    if (app.value) {
      initialTree();
    }
  }, [app.value, projectId, getTree]);

  const submit = () => {
    form.validateFields().then(async (value) => {
      const node = tree.find((item) => item.id === value.tree) || ({} as TreeNode);
      const path = atob(decodeURI(node.pId));
      const appId = path.split('/')[1];
      const branch = path.split('tree/')[1].split('/.dice')[0].split('/.erda')[0];
      const ymlPath = (path.split(branch)[1] || '').substr(1);
      const params = {
        sourceType: 'erda',
        projectID: +projectId,
        name: value.name,
        appID: appId,
        ref: branch,
        path: ymlPath,
        fileName: node.name,
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
                pattern: /^[\u4e00-\u9fa5A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of Chinese, letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0 text-xl',
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
                <div className="mb-6 w-28 text-default-6">{i18n.t('App')}</div>
                <div className="flex-1">
                  <RenderFormItem
                    name="app"
                    type="select"
                    options={appList}
                    rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('App') }) }]}
                    itemProps={{
                      className: 'project-release-select',
                      onChange: (v: string, app: Obj) => setApp(app),
                    }}
                  />
                </div>
              </div>
            ) : null}
            <div className="flex-h-center">
              <div className="mb-6 w-28 text-default-6">pipeline {i18n.t('file')}</div>
              <div className="flex-1">
                <RenderFormItem
                  name="tree"
                  type="custom"
                  rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('Pipeline') }) }]}
                  getComp={() => <TreeSelect treeDataSimpleMode treeData={tree} loadData={loadTree} />}
                  itemProps={{
                    className: 'project-release-select',
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
