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
import { Form, Button, TreeSelect, Tooltip, Drawer } from 'antd';
import i18n from 'i18n';
import { useEffectOnce } from 'react-use';
import { ErdaIcon, RenderFormItem, ErdaAlert } from 'common';
import routeInfoStore from 'core/stores/route';
import { getFileTree, createPipeline, getAppList, checkSource, editPipelineName } from 'project/services/pipeline';
import appStore from 'application/stores/application';
import { decode } from 'js-base64';

import './form.scss';

interface IProps {
  onOk: () => void;
  onCancel: () => void;
  fixedApp?: string;
  pipelineCategory?: {
    key: string;
    rules?: string[];
  };
  data: { id: string; name: string; fileName: string; app: number; inode: string } | null;
}

interface TreeNode extends Node {
  id: string;
  pId: string;
  title: string;
  isLeaf: boolean;
}

interface Node {
  inode: string;
  pinode: string;
  name: string;
  type: string;
}

interface App {
  value: string | number;
  label?: string;
  projectName?: string;
}

const interfaceMap = {
  add: createPipeline,
  edit: editPipelineName,
};

const titleMap = {
  edit: i18n.t('edit {name}', { name: i18n.t('Pipeline') }),
  add: i18n.t('create {name}', { name: i18n.t('Pipeline') }),
};

const btnMap = {
  edit: i18n.t('Edit'),
  add: i18n.t('dop:Add-create'),
};

const successMsgMap = {
  edit: i18n.t('edited successfully'),
  add: i18n.t('created successfully'),
};

const PipelineForm = ({ onCancel, pipelineCategory, onOk, data: editData, fixedApp }: IProps) => {
  const { key: pipelineCategoryKey, rules: pipelineCategoryRules } = pipelineCategory || {};
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [form] = Form.useForm();
  const [appList, setAppList] = React.useState<App[]>([]);
  const [app, setApp] = React.useState<App>({} as App);
  const [tree, setTree] = React.useState<TreeNode[]>([]);
  const [treeVisible, setTreeVisible] = React.useState(false);
  const [treeValue, setTreeValue] = React.useState('');
  const [treeExpandedKeys, setTreeExpandedKeys] = React.useState<Array<string | number>>([]);
  const canTreeSelectClose = React.useRef(true);
  const [sourceErrorMessage, setSourceErrorMessage] = React.useState('');
  const appDetail = appStore.useStore((s) => s.detail);

  const type = editData ? 'edit' : 'add';

  const convertTreeData = (data: Node[]) => {
    return data.map((item) => ({
      ...item,
      key: item.inode,
      id: item.inode,
      pId: item.pinode,
      title: item.name,
      isLeaf: item.type === 'f',
    }));
  };

  const getTree = React.useCallback(
    async (pinode: string) => {
      const res = await getFileTree.fetch({
        scopeID: projectId,
        scope: 'project-app',
        pinode,
        pipelineCategoryKey: !pipelineCategoryKey || pipelineCategoryKey === 'all' ? '' : pipelineCategoryKey,
      });

      if (res.success) {
        return convertTreeData(res.data || []);
      } else {
        return [];
      }
    },
    [projectId, pipelineCategoryKey],
  );

  const loadTree = async (node: TreeNode) => {
    const data = await getTree(node.id);
    setTree((prev) => [...prev, ...data]);
    return Promise.resolve();
  };

  const getApps = React.useCallback(async () => {
    if (!fixedApp) {
      const res = await getAppList.fetch({ projectID: projectId });
      if (res.success) {
        setAppList(
          res.data?.map((item) => ({ value: item.ID, label: item.displayName, projectName: item.projectName })) || [],
        );
      }
    }
  }, [projectId, fixedApp]);

  React.useEffect(() => {
    getApps();
  }, [getApps]);

  React.useEffect(() => {
    const initialTree = async () => {
      const data = await getTree(btoa(encodeURI(`${projectId}/${app.value || fixedApp}`)));
      setTree(data);
    };
    if (app.value || fixedApp) {
      initialTree();
      setSourceErrorMessage('');

      if (tree.length !== 0) {
        setTreeValue('');
        form.resetFields(['tree']);
      }
    }
  }, [app.value, projectId, getTree, form, fixedApp]);

  React.useEffect(() => {
    if (fixedApp) {
      form.setFieldsValue?.({ app: fixedApp });
      setApp({ value: fixedApp });
    }
  }, [form, fixedApp]);

  useEffectOnce(() => {
    if (editData) {
      const { name, app, fileName, inode } = editData;
      form.setFieldsValue({ name, app, tree: inode });
      setApp({ value: app });
      setTreeValue(fileName);
    }
  });

  const submit = () => {
    form.validateFields().then(async (value) => {
      const path = decode(value.tree).split('/');
      const fileName = path[path.length - 1];
      path.length--;
      const appId = path[1];
      const branch = path.join('/').split('tree/')[1].split('/.dice')[0].split('/.erda')[0];
      const ymlPath = (path.join('/').split(branch)[1] || '').substr(1);

      const params = {
        edit: {
          projectID: +projectId,
          name: value.name,
          id: editData?.id,
          projectPipelineSource: {
            sourceType: 'erda',
            appID: appId,
            ref: branch,
            path: ymlPath,
            fileName,
          },
        },
        add: {
          projectID: +projectId,
          name: value.name,
          sourceType: 'erda',
          appID: appId,
          ref: branch,
          path: ymlPath,
          fileName,
        },
      };

      const res = await interfaceMap[type].fetch({ ...params[type], $options: { successMsg: successMsgMap[type] } });
      if (res.success) {
        onOk();
      }
    });
  };

  const sourceCheck = async (value: string) => {
    if (value === editData?.inode) {
      return Promise.resolve();
    }
    const node = tree.find((item) => item.id === value);
    if (node?.isLeaf) {
      const path = decode(node.pId);
      const _appID = path.split('/')[1];
      const ref = path.split('tree/')[1].split('/.dice')[0].split('/.erda')[0];
      const payload = {
        appID: _appID,
        ref,
        fileName: node.name,
        sourceType: 'erda',
      };

      const res = await checkSource.fetch(payload);
      const { data } = res;
      if (data?.pass) {
        setSourceErrorMessage('');
      } else {
        data?.message && setSourceErrorMessage(data.message);
      }
    }

    return Promise.resolve();
  };

  return (
    <div className="project-pipeline-form flex flex-col h-full">
      <div className="header py-2.5 pl-4 bg-default-02 flex-h-center">
        <span className="text-base text-default">{titleMap[type]}</span>
        <ErdaIcon type="zhedie" className="ml-1" />

        <div className="flex-h-center cursor-pointer mx-2 px-2 py-1 flex-1 justify-end">
          <ErdaIcon type="guanbi" size="20" onClick={() => onCancel()} />
        </div>
      </div>

      <div className="flex-1 min-h-0 pl-4 pt-4 w-1/2">
        <Form form={form}>
          <RenderFormItem
            name={'name'}
            type={'input'}
            rules={[
              { required: true, message: i18n.t('Please enter {name}', { name: i18n.t('Pipeline') }) },
              { max: 30, message: i18n.t('dop:no more than 30 characters') },
              {
                pattern: /^[\u4e00-\u9fa5A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of Chinese, letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0 text-xl bg-transparent',
              placeholder: i18n.t('Please enter {name}', { name: i18n.t('Pipeline') }),
            }}
          />
          <div>
            <div className="text-default">{i18n.t('dop:Code source')}</div>
            <CodeResource />
          </div>
          <div>
            <div className="text-default mb-3">{i18n.t('Config')}</div>
            <div className="flex-h-center">
              <div className="mb-3 w-32 text-default-6 flex-h-center">
                <ErdaIcon type="yingyongmingcheng" size={20} className="text-default-4 mr-1" />
                {i18n.t('App')}
              </div>
              <div className="flex-1 pr-6">
                {fixedApp ? (
                  appDetail?.displayName || appDetail?.name
                ) : (
                  <RenderFormItem
                    name="app"
                    type="select"
                    options={appList}
                    rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('App') }) }]}
                    itemProps={{
                      disabled: type === 'edit',
                      className: 'project-release-select',
                      onChange: (_: string, _app: App) => setApp(_app),
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex">
              <div className="w-32 text-default-6">
                <div className="flex-h-center mt-1.5">
                  <ErdaIcon type="pipeline" size={20} className="text-default-4 mr-1" />
                  pipeline {i18n.t('File')}
                </div>
              </div>
              <div className="flex-1">
                <RenderFormItem
                  name="tree"
                  type="custom"
                  rules={[
                    {
                      validator: (_: string, value: string) => {
                        if (!value) {
                          return Promise.reject(
                            new Error(i18n.t('please choose {name}', { name: i18n.t('Pipelines') })),
                          );
                        }

                        return sourceCheck(value);
                      },
                    },
                  ]}
                  getComp={() => (
                    <div className="flex">
                      <TreeSelect
                        className="project-release-select"
                        treeDataSimpleMode
                        treeData={tree}
                        open={treeVisible}
                        onDropdownVisibleChange={(_visible) => {
                          if (canTreeSelectClose.current) {
                            setTreeVisible(_visible);
                          } else {
                            canTreeSelectClose.current = true;
                          }
                        }}
                        value={treeValue}
                        onSelect={(value, node) => {
                          if (node.isLeaf === false) {
                            canTreeSelectClose.current = false;
                            if (treeExpandedKeys.includes(value)) {
                              setTreeExpandedKeys((pre) => pre.filter((item) => item !== value));
                            } else {
                              setTreeExpandedKeys((pre) => [...pre, value]);
                            }
                          } else {
                            setTreeValue(value);
                            form.setFieldsValue({ tree: value });
                          }
                        }}
                        treeExpandedKeys={treeExpandedKeys}
                        onTreeExpand={(expandedKeys: Array<string | number>) => {
                          setTreeExpandedKeys(expandedKeys);
                        }}
                        loadData={loadTree}
                      />
                      {pipelineCategoryRules ? (
                        <Tooltip title={pipelineCategoryRules?.join(', ')}>
                          <ErdaIcon type="help" className="text-default-6 ml-2" size="16" />
                        </Tooltip>
                      ) : (
                        <div className="w-6" />
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            {sourceErrorMessage ? (
              <ErdaAlert message={sourceErrorMessage} type="error" closeable={false} className="py-1.5" />
            ) : null}
          </div>
        </Form>
      </div>

      <div className="py-3 px-4">
        <Button type="primary" className="mr-2" onClick={submit}>
          {btnMap[type]}
        </Button>
        <Button className="bg-default-06 border-default-06 text-default-8" onClick={() => onCancel()}>
          {i18n.t('Cancel')}
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
        <div className="flex-h-center" key={item.label}>
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

const PipelineFormDrawer = ({ onCancel, visible, ...rest }: Merge<IProps, { visible: boolean }>) => {
  return (
    <Drawer
      onClose={onCancel}
      visible={visible}
      width="80%"
      bodyStyle={{ padding: 0 }}
      destroyOnClose
      closable={false}
      zIndex={1045}
    >
      <PipelineForm {...rest} onCancel={onCancel} />
    </Drawer>
  );
};

export default PipelineFormDrawer;
