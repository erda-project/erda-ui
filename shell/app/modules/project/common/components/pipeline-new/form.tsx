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
import { Form, Button, Popover, Tooltip, Tree, Drawer, FormInstance, notification } from 'antd';
import i18n from 'i18n';
import { useEffectOnce } from 'react-use';
import { ErdaIcon, RenderFormItem, ErdaAlert, RenderForm, EmptyHolder } from 'common';
import routeInfoStore from 'core/stores/route';
import { getFileTree, createPipeline, getAppList, checkSource, editPipelineName } from 'project/services/pipeline';
import appStore from 'application/stores/application';
import { decode, encode } from 'js-base64';
import { groupBy, map, difference, uniqBy } from 'lodash';
import './form.scss';
import { firstCharToUpper } from 'app/common/utils';
import { TreeNodeNormal } from 'antd/lib/tree/Tree';
import { commit } from 'application/services/repo';
import { defaultPipelineYml } from 'yml-chart/config';

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

interface TreeNode {
  key: string;
  title: string | JSX.Element;
  children: TreeNode[];
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
  edit: firstCharToUpper(i18n.t('edit {name}', { name: i18n.t('Pipeline').toLowerCase() })),
  add: firstCharToUpper(i18n.t('create {name}', { name: i18n.t('Pipeline').toLowerCase() })),
};

const btnMap = {
  edit: i18n.t('Edit'),
  add: i18n.t('dop:Create'),
};

const successMsgMap = {
  edit: i18n.t('edited successfully'),
  add: i18n.t('created successfully'),
};

interface PipelineData {
  branch: string;
  pipelineName: string;
  isDefault: string;
}

const convertTreeData = (data: Node[]) => {
  if (!data?.length) return [];
  const dataGroup = groupBy(data, 'pinode');
  const pids: string[] = [];
  const ids: string[] = [];
  data.forEach((item) => {
    pids.push(item.pinode);
    ids.push(item.inode);
  });
  const rootPid = difference(pids, ids)?.[0];
  const getChildren = (arr: Node[], _branch?: string): TreeNode[] => {
    return (arr || []).map((item) => {
      const branch = _branch || item.name;
      return {
        title: item.name,
        key: item.inode,
        checkable: item.type === 'f',
        isLeaf: item.type === 'f',
        branch: branch,
        children: getChildren(dataGroup[item.inode] || [], branch),
      };
    });
  };

  return getChildren(dataGroup[rootPid]);
};

const PipelineForm = ({ onCancel, pipelineCategory, onOk, data: editData, fixedApp }: IProps) => {
  const { key: pipelineCategoryKey, rules: pipelineCategoryRules } = pipelineCategory || {};
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [form] = Form.useForm();
  const [appList, setAppList] = React.useState<App[]>([]);
  const [app, setApp] = React.useState<App>({} as App);
  const [tree, setTree] = React.useState<Node[]>([]);
  const [treeValue, setTreeValue] = React.useState('');
  const [sourceErrorMessage, setSourceErrorMessage] = React.useState('');
  const appDetail = appStore.useStore((s) => s.detail);
  const [visible, setVisible] = React.useState(false);
  const [isDefault, setIsDefault] = React.useState(false);
  const [disabledDefault, setDisabledDefault] = React.useState(false);
  const [disabledName, setDiabledName] = React.useState(true);

  const pipelineFromRef = React.useRef<FormInstance>(null);

  const type = editData ? 'edit' : 'add';

  const getTree = React.useCallback(
    async (pinode: string) => {
      const res = await getFileTree.fetch({
        scopeID: projectId,
        scope: 'project-app',
        pinode,
        pipelineCategoryKey: !pipelineCategoryKey || pipelineCategoryKey === 'all' ? '' : pipelineCategoryKey,
      });

      if (res.success) {
        return res.data || [];
      } else {
        return [];
      }
    },
    [projectId, pipelineCategoryKey],
  );

  const loadTree = async (node: TreeNode) => {
    const data = await getTree(node.key);
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

  const treeData = React.useMemo(() => {
    return convertTreeData(uniqBy(tree, 'inode'));
  }, [tree]);

  React.useEffect(() => {
    if (fixedApp) {
      form.setFieldsValue?.({ app: fixedApp });
      setApp({ value: fixedApp });
    }
  }, [form, fixedApp]);

  useEffectOnce(() => {
    if (editData) {
      const { name, app, inode } = editData;
      form.setFieldsValue({ name, app, tree: inode });
      setApp({ value: app });
      setTreeValue(inode);
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
    const node = tree.find((item) => item.inode === value);
    if (node?.type === 'f') {
      const path = decode(node.pinode);
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

  const fieldsList = [
    {
      label: i18n.t('dop:branch'),
      name: 'branch',
      itemProps: {
        disabled: true,
      },
    },
    {
      label: i18n.s('default pipeline', 'dop'),
      name: 'isDefault',
      type: 'switch',
      itemProps: {
        checkedChildren: i18n.t('common:Yes'),
        unCheckedChildren: i18n.t('common:No'),
        disabled: disabledDefault,
        className: 'ml-2',
        onChange: (checked: boolean) => {
          setIsDefault(checked);
          if (checked) {
            setDiabledName(true);
            pipelineFromRef.current?.setFieldsValue({ pipelineName: 'pipeline.yml' });
          } else {
            setDiabledName(false);
            pipelineFromRef.current?.setFieldsValue({ pipelineName: '' });
          }
        },
      },
    },
    {
      label: i18n.s('pipeline name', 'dop'),
      name: 'pipelineName',
      itemProps: {
        disabled: disabledName,
        addonBefore: isDefault ? '' : '.erda/pipelines/',
      },
      rules: [
        {
          validator: (_rule: any, value: string, callback: Function) => {
            let errMsg;
            if (value) {
              if (!value.endsWith('.yml')) {
                errMsg = i18n.s('pipeline name must end with .yml', 'dop');
              } else if (
                pipelineCategoryKey === 'others' &&
                ['pipeline.yml', 'ci-artifact.yml', 'combine-artifact.yml', 'integration.yml'].includes(value)
              ) {
                errMsg = i18n.s(
                  'can not be special name：pipeline.yml, ci-artifact.yml, combine-artifact.yml, integration.yml',
                  'dop',
                );
              }
            }
            callback(errMsg);
          },
        },
      ],
    },
    {
      getComp: () => (
        <div className="flex justify-center mt-4">
          <Button
            className=""
            type="primary"
            onClick={() => {
              handleSubmit(pipelineFromRef.current as FormInstance);
            }}
          >
            {i18n.t('Save')}
          </Button>
          <Button className="ml-8" onClick={() => setVisible(false)}>
            {i18n.t('Cancel')}
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (pipelineForm: FormInstance) => {
    pipelineForm.validateFields().then((values: PipelineData) => {
      const { branch, pipelineName, isDefault } = values;
      let gitRepoAbbrev = fixedApp ? `${appDetail.projectName}/${appDetail.name}` : '';
      if (!gitRepoAbbrev) {
        const curProjectName = appList.find((item) => item.value === app?.value)?.projectName;
        // gitRepoAbbrev后端为兼容旧的数据没有改，由前端指定
        gitRepoAbbrev = `${curProjectName}/${app?.label}`;
      }

      commit({
        repoPrefix: gitRepoAbbrev,
        data: {
          message: `Add ${pipelineName}`,
          branch,
          actions: [
            {
              action: 'add',
              path: `${isDefault ? '' : '.erda/pipelines/'}${pipelineName}`,
              pathType: 'blob',
              content: defaultPipelineYml,
            },
          ],
        },
      }).then(() => {
        const treeId = encode(
          `${projectId}/${app.value}/tree/${branch}/${isDefault ? '' : '.erda/pipelines'}/${pipelineName}`,
        );
        setTreeValue(treeId);
        form.setFieldsValue({ tree: treeId });
        notification.success({ message: i18n.s('added successfully') });
        setVisible(false);
      });
    });
  };

  const initAdd = (nodeData: TreeNodeNormal) => {
    setVisible(true);
    if (nodeData) {
      const curTreeChildren = groupBy(tree, 'pinode');
      if (!curTreeChildren[nodeData.key]?.length) {
        getFileTree({
          scopeID: projectId,
          scope: 'project-app',
          pinode: `${nodeData.key}`,
          pipelineCategoryKey: !pipelineCategoryKey || pipelineCategoryKey === 'all' ? '' : pipelineCategoryKey,
        }).then((res) => {
          const hasDefault = res?.data?.find((item) => item.name === 'pipeline.yml');
          initAddPipelineForm({ hasDefault: !!hasDefault, branch: nodeData.branch as string });
        });
      } else {
        const hasDefault = (curTreeChildren[nodeData.key] || []).find((item) => item.name === 'pipeline.yml');
        initAddPipelineForm({ hasDefault: !!hasDefault, branch: nodeData.branch as string });
      }
    }
  };

  const initAddPipelineForm = (_data: { branch: string; hasDefault: boolean }) => {
    const mameMap = {
      all: '',
      'build-deploy': 'pipeline.yml',
      'build-artifact': 'ci-artifact.yml',
      'build-combine-artifact': 'combine-artifact.yml',
      'build-integration': 'integration.yml',
      others: '',
    };

    const curName = mameMap[pipelineCategoryKey || 'all'];

    setDisabledDefault(!!curName || pipelineCategoryKey === 'others');
    setDiabledName(!!curName);

    const formData = {
      branch: _data.branch,
      isDefault: pipelineCategoryKey === 'build-deploy',
      pipelineName: curName,
    };
    setIsDefault(pipelineCategoryKey === 'build-deploy');
    // make the element render before use.
    setTimeout(() => {
      pipelineFromRef.current?.setFieldsValue(formData);
    }, 0);
  };
  return (
    <div className="flex flex-col h-full">
      <div className="header py-2.5 pl-4 bg-default-02 flex-h-center">
        <span className="text-base text-default">{titleMap[type]}</span>
        <ErdaIcon type="zhedie" className="ml-1" />

        <div className="flex-h-center cursor-pointer mx-2 px-2 py-1 flex-1 justify-end">
          <ErdaIcon type="guanbi" size="20" onClick={() => onCancel()} />
        </div>
      </div>

      <div className="flex-1 min-h-0 pt-4 pl-4 pr-[50%] overflow-auto">
        <Form form={form} className="flex flex-col h-full">
          <RenderFormItem
            name={'name'}
            type={'input'}
            rules={[
              {
                required: true,
                message: i18n.t('Please enter the {name}', { name: i18n.t('Pipeline').toLowerCase() }),
              },
              { max: 30, message: i18n.t('dop:no more than 30 characters') },
              {
                pattern: /^[\u4e00-\u9fa5A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of Chinese, letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0 text-xl bg-transparent',
              placeholder: i18n.t('Please enter the {name}', { name: i18n.t('Pipeline').toLowerCase() }),
            }}
          />
          <div>
            <div className="text-default">{i18n.t('dop:Code source')}</div>
            <CodeResource />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-default mb-3">{i18n.t('Configuration')}</div>
            <div className="flex-h-center">
              <div className="mb-3 w-32 text-default-6 flex-h-center">
                <ErdaIcon type="yingyongmingcheng" size={20} className="text-default-4 mr-1" />
                {i18n.t('App')}
              </div>
              <div className="flex-1 pr-6 mb-3">
                {fixedApp ? (
                  appDetail?.displayName || appDetail?.name
                ) : (
                  <RenderFormItem
                    name="app"
                    type="select"
                    options={appList}
                    rules={[{ required: true, message: i18n.t('please choose the {name}', { name: i18n.t('App') }) }]}
                    itemProps={{
                      disabled: type === 'edit',
                      className: 'project-release-select',
                      onChange: (_: string, _app: App) => setApp(_app),
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-32 text-default-6">
                <div className="flex-h-center mt-1.5">
                  <ErdaIcon type="pipeline" size={20} className="text-default-4 mr-1" />
                  {i18n.t('dop:Pipeline file')}
                </div>
              </div>
              <div className="flex-1 flex flex-col pipeline-form-add-tree">
                <div className="flex items-center">
                  <RenderFormItem
                    name="tree"
                    className="h-full flex-1 overflow-auto "
                    type="custom"
                    rules={[
                      {
                        validator: (_: string, value: string) => {
                          if (!value) {
                            return Promise.reject(
                              new Error(
                                i18n.t('please choose the {name}', { name: i18n.t('Pipelines').toLowerCase() }),
                              ),
                            );
                          }

                          return sourceCheck(value);
                        },
                      },
                    ]}
                    getComp={() => {
                      const curVal = form.getFieldsValue();
                      const treePath = treeValue ? decode(treeValue) : '';
                      const treeTitle = treePath.split('tree/')?.[1] || '';
                      const curApp = curVal?.app || fixedApp;

                      return (
                        <div className="flex flex-col h-full">
                          <div
                            className={`${
                              treeTitle ? 'text-default-8' : 'text-default-4'
                            } h-[32px] rounded bg-default-06 w-full px-3 py-[5px]`}
                          >
                            {treeTitle || (curApp ? i18n.s('Please choose a pipeline', 'dop') : '')}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {pipelineCategoryRules ? (
                    <Tooltip title={pipelineCategoryRules?.join(', ')}>
                      <ErdaIcon type="help" className="text-default-6 ml-2" size="16" />
                    </Tooltip>
                  ) : (
                    <div className="w-6" />
                  )}
                </div>
                {treeData.length ? (
                  <div className={'w-full flex-1 overflow-auto relative'}>
                    <Tree
                      checkable
                      selectable={false}
                      treeData={treeData}
                      showLine
                      checkedKeys={[treeValue]}
                      className="w-full flex-1 overflow-auto pr-6"
                      loadData={loadTree}
                      onCheck={(_, e) => {
                        const v = treeValue === e.node.key ? '' : `${e.node.key}`;
                        setTreeValue(v);
                        form.setFieldsValue({ tree: v });
                      }}
                      blockNode
                      titleRender={(nodeData: TreeNodeNormal) => {
                        return (
                          <div className="flex-h-center justify-between group" key={nodeData.key}>
                            <div> {nodeData.title}</div>
                            {!nodeData.isLeaf && !visible ? (
                              <ErdaIcon
                                type="plus"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  initAdd(nodeData);
                                }}
                                size={14}
                                className="px-1 font-medium invisible group-hover:visible text-purple-deep"
                              />
                            ) : null}
                          </div>
                        );
                      }}
                    />
                    <Popover
                      trigger={['click']}
                      placement="right"
                      overlayClassName="pipeline-add-popover"
                      visible={visible}
                      content={
                        <div className="w-[400px] px-2">
                          <div className="font-medium pb-3 text-base">
                            {i18n.t('Add {name}', { name: i18n.t('Pipeline') })}
                          </div>
                          <RenderForm ref={pipelineFromRef} className="w-full" list={fieldsList} />
                        </div>
                      }
                    >
                      <div className="absolute top-0 right-0 w-2 h-2 invisible" />
                    </Popover>
                  </div>
                ) : (
                  <EmptyHolder className="w-full flex-1" relative />
                )}
              </div>
            </div>

            {sourceErrorMessage ? (
              <ErdaAlert message={sourceErrorMessage} type="error" closeable={false} className="py-1.5" />
            ) : null}
          </div>
        </Form>
      </div>

      <div className="py-3 px-4 bg-white shadow">
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
      zIndex={1009}
    >
      <PipelineForm {...rest} onCancel={onCancel} />
    </Drawer>
  );
};

export default PipelineFormDrawer;
