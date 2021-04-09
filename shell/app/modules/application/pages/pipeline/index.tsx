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

import * as React from 'react';
import { SplitPage } from 'layout/common';
import { EmptyHolder } from 'common';
import PipelineDetail from './pipeline-detail';
import routeInfoStore from 'app/common/stores/route';
import fileTreeStore from 'common/stores/file-tree';
import { scopeConfig } from './scope-config';
import { updateSearch } from 'common/utils';
import { cloneDeep, get } from 'lodash';
import { getINodeByPipelineId } from 'application/services/build';
import DiceConfigPage from 'app/config-page';

import './index.scss';

interface IProps{
  scope: string;
}

const curScope = 'appPipeline';

const PipelineManage = (props: IProps) => {
  const { scope = curScope } = props;
  const scopeConfigData = scopeConfig[scope];
  const { clearTreeNodeDetail } = fileTreeStore;
  const [{ projectId, appId }, { nodeId, pipelineID }] = routeInfoStore.useStore(s => [s.params, s.query]);
  const scopeParams = React.useMemo(() => ({ scopeID: projectId, scope: scopeConfigData.scope }), [projectId, scopeConfigData.scope]);

  const nodeIdRef = React.useRef(null as any);

  React.useEffect(() => {
    nodeIdRef.current = nodeId;
  }, [nodeId]);

  if (pipelineID && !nodeId) {
    getINodeByPipelineId({ pipelineId: pipelineID }).then((res:any) => {
      const inode = res?.data?.inode;
      inode && updateSearch({ nodeId: inode });
    });
  }

  const inParams = {
    projectId,
    appId,
    ...scopeParams,
    selectedKeys: nodeId,
  };
  return (
    <SplitPage>
      <SplitPage.Left className='pipeline-manage-left'>
        {
          pipelineID && !nodeId
            ? <EmptyHolder relative />
            : <DiceConfigPage
              scenarioType=''
              scenarioKey={'app-pipeline-tree'}
              inParams={inParams}
              showLoading
              // 提供给后端测试，可在路由上带上useMock来查看mock的数据，以便后端检查，对接完成后删除
              useMock={location.search.includes('useMock') ? useMock : undefined}
              customProps={{
                fileTree: {
                  onClickNode: (_inode: string) => {
                    if (nodeIdRef.current !== _inode) {
                      clearTreeNodeDetail();
                      setTimeout(() => {
                        updateSearch({ nodeId: _inode, pipelineID: undefined });
                      }, 0);
                    }
                  },
                },
              }}
            />
        }
      </SplitPage.Left>
      <SplitPage.Right>
        {
         nodeId ? <PipelineDetail scopeParams={scopeParams} key={nodeId} scope={scope} /> : <EmptyHolder relative />
        }
      </SplitPage.Right>
    </SplitPage>
  );
};

export default PipelineManage;

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockFileTree(payload));
    }, 2000);
  });
};

const getMockFileTree = (payload:any) => {
  const data = cloneDeep(mock);
  if (payload.event?.operation === 'delete') {
    const curData = data.protocol.components.fileTree.data;
    data.protocol.components.fileTree.data = curData?.map(item => {
      return ({
        ...item,
        children: (item.children || []).filter((cItem:any) => {
          return cItem.key !== payload.event.operationData.meta.key;
        }),
      });
    });
  } else if (payload.event?.operation === 'expandChildren') {
    data.protocol.components.fileTree.data.treeData[1].children = [
      {
        key: 'feature/abc-default',
        title: '默认流水线',
        icon: 'dm',
        isLeaf: true,
        operations: {
          delete: {
            key: 'delete',
            text: '删除',
            disabled: true,
            disabledTip: '默认流水线无法删除',
          },
        },
      },
    ];
    const curExKey = get(payload, 'protocol.components.fileTree.state.expandedKeys') || [];
    data.protocol.components.fileTree.state.expandedKeys = [...curExKey, 'feature/abc'];
  }

  return data;
};

let mock = {
  scenario: {
    scenarioKey: 'app-pipeline-tree',
    scenarioType: 'file-tree',
  },
  protocol: {
    hierarchy: {
      root: 'fileTreePage',
      structure: {
        fileTreePage: ['fileTree', 'nodeFormModal'],
      },
    },

    components: {
      fileTreePage: { type: 'Container', props: { fullHeight: true } },
      fileTree: {
        type: 'FileTree',
        state: {
          searchKey: '',
          expandedKeys: ['master'],
          selectedKeys: ['MTEvNDIvdHJlZS9tYXN0ZXIvcGlwZWxpbmUueW1s'],
        },
        data: { treeData: [
          {
            key: 'master',
            title: 'master',
            icon: 'fz',
            isLeaf: false,
            clickToExpand: true,
            selectable: false,
            operations: {
              addNode: {
                key: 'addNode',
                text: '添加流水线',
                reload: false,
                command: { key: 'set', target: 'nodeFormModal', state: { visible: true, formData: { branch: 'master' } } },
              },
            },
            children: [
              {
                key: 'MTEvNDIvdHJlZS9tYXN0ZXIvcGlwZWxpbmUueW1s',
                title: '默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线',
                icon: 'dm',
                isLeaf: true,
                operations: {
                  delete: {
                    key: 'delete',
                    text: '删除',
                    disabled: true,
                    disabledTip: '默认流水线无法删除',
                  },
                },
              },
              {
                key: 'MTEvNDIvdHJlZS9tYXN0ZXIvLmRpY2UvcGlwZWxpbmVzL2FtZW4ueW1s',
                title: 'a',
                icon: 'dm',
                isLeaf: true,
                operations: {
                  delete: {
                    key: 'delete',
                    text: '删除',
                    confirm: '是否确认删除',
                    reload: true,
                    meta: { key: 'MTEvNDIvdHJlZS9tYXN0ZXIvLmRpY2UvcGlwZWxpbmVzL2FtZW4ueW1s', branch: 'master' },
                  },
                },
              },
              {
                key: 'master-b',
                title: 'b',
                icon: 'dm',
                isLeaf: true,
                operations: {
                  delete: {
                    key: 'delete',
                    text: '删除',
                    confirm: '是否确认删除',
                    reload: true,
                    meta: { key: 'master-b', branch: 'master' },
                  },
                },
              },
            ],
          },
          {
            key: 'feature/abc',
            title: 'feature/abc',
            icon: 'fz',
            isLeaf: false,
            selectable: false,
            clickToExpand: true,
            operations: {
              addNode: {
                key: 'addNode',
                text: '添加流水线',
                reload: false,
                command: { key: 'set', target: 'nodeFormModal', state: { visible: true, formData: { branch: 'feature/abc' } } },
              },
              click: {
                key: 'expandChildren', // 展开子
                reload: true,
                text: '展开',
                show: false,
                meta: { parentKey: 'master' }, // 用于后端自己识别
              },
            },
          },
          {
            key: 'release/3.21',
            title: 'release/3.2111111111111111111111111111111111111111111111111',
            icon: 'fz',
            isLeaf: false,
            selectable: false,
            clickToExpand: true,
            operations: {
              addNode: {
                key: 'addNode',
                text: '添加流水线',
                reload: false,
                command: { key: 'set', target: 'nodeFormModal', state: { visible: true, formData: { branch: 'feature/abc' } } },
              },
            },
            children: [
              {
                key: 'release/3.21-addDefault',
                title: '添加默认流水线添加默认流水线添加默认流水线',
                icon: 'tj1',
                isLeaf: true,
                operations: {
                  click: {
                    key: 'addNode',
                    text: '添加默认',
                    reload: true,
                    show: false,
                    meta: { branch: 'release/3.21', name: 'pipeline' },
                  },
                },
              },
            ],
          },
          {
            key: 'release/3.22',
            title: 'release/3.2222222222222222222222222222222222',
            icon: 'fz',
            isLeaf: false,
            selectable: false,
            clickToExpand: true,
            operations: {
              addNode: {
                key: 'addNode',
                text: '添加流水线',
                reload: false,
                disabled: true,
                disabledTip: '您无权限操作保护分支',
              },
            },
            children: [
              {
                key: 'release/3.22-addDefault',
                title: '添加默认流水线默认流水线默认流水线默认流水线默认流水线默认流水线',
                icon: 'tj1',
                isLeaf: true,
                operations: {
                  click: {
                    key: 'addNode',
                    text: '添加默认',
                    reload: true,
                    show: false,
                    disabled: true,
                    disabledTip: '无权限了',
                    // meta: { branch: 'release/3.21', name: 'pipeline' },
                  },
                },
              },
            ],
          },
        ],
        },
      },
      nodeFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          title: '添加流水线',
          fields: [
            {
              key: 'branch',
              label: '分支',
              component: 'input',
              required: true,
              visible: false,
              componentProps: { },
            },
            {
              key: 'name',
              label: '流水线名称',
              component: 'input',
              required: true,
              componentProps: {
                maxLength: 10,
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
    },
  },
};
