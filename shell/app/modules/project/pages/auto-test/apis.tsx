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
import routeInfoStore from 'core/stores/route';
import DiceConfigPage from 'app/config-page';
import { cloneDeep } from 'lodash';

const AutoTestApis = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const inParams = {
    projectId,
  };
  return (
    <DiceConfigPage
      scenarioType="auto-test-apis"
      scenarioKey={'auto-test-apis'}
      inParams={inParams}
      // 提供给后端测试，可在路由上带上useMock来查看mock的数据，以便后端检查，对接完成后删除
      useMock={useMock}
    />
  );
};
export default AutoTestApis;

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockFileTree(payload));
    }, 2000);
  });
};

const getMockFileTree = (payload: any) => {
  const data = cloneDeep(mock);
  if (payload.event?.operation === 'delete') {
    const curData = data.protocol.components.fileTree.data;
    data.protocol.components.fileTree.data = curData?.map((item) => {
      return {
        ...item,
        children: (item.children || []).filter((cItem: any) => {
          return cItem.key !== payload.event.operationData.meta.key;
        }),
      };
    });
  }

  return data;
};

let mock = {
  scenario: {
    scenarioKey: 'project-auto-test',
    scenarioType: 'project-auto-test',
  },
  protocol: {
    hierarchy: {
      root: 'autoTestPage',
      structure: {
        autoTestPage: { left: 'leftPage', right: 'rightPage' },
        leftPage: ['fileTree', 'fileFormModal'],
        apiDetail: ['previewApi', 'editApi', 'apiExecut'],
        rightPage: ['apiDetail'],
        exportTreeData: ['exportForm', 'exportDataFilter', 'exportTable'],
        interfaceListView: ['interfaceFilter', 'interfaceList'],
      },
    },
    components: {
      autoTestPage: { type: 'SplitPage' },
      leftPage: { type: 'Container', props: { fullHeight: true } },
      exportData: { type: 'Container' },
      interfaceListView: { type: 'Container' },
      rightPage: { type: 'Container' },
      apiDetail: {
        type: 'Tabs',
        props: {
          tabMenu: [
            { key: 'preview', name: '预览' },
            { key: 'edit', name: '编辑' },
            { key: 'execut', name: '运行' },
          ],
        },
        state: {
          activeKey: 'edit',
        },
      },
      previewApi: { type: 'InfoPreview', data: {} },
      editApi: {
        type: 'ApiResource',
        data: {
          apiData: {
            apiMethod: 'get',
            apiName: '/api/get/1',
            operationId: 'test1',
            description: '描述',
            parameters: [
              {
                name: 'newQueryParameter',
                required: true,
                in: 'query',
                schema: {
                  example: 'Example',
                  type: 'string',
                },
              },
              {
                name: 'newHeader',
                required: true,
                in: 'header',
                schema: {
                  example: 'Example',
                  type: 'string',
                },
              },
              {
                name: 'newHeader1',
                required: true,
                in: 'header',
                schema: {
                  example: 'Example',
                  type: 'string',
                },
              },
            ],
            responses: {
              200: {
                description: '',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      description: 'get-response-desc',
                      required: ['myString'],
                      properties: {
                        myString: {
                          type: 'string',
                          description: 'description of myString',
                          example: 'stringExample',
                          default: 'defaultString',
                          maxLength: 15,
                          minLength: 8,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          operations: {
            submit: {
              key: 'submit',
              reload: true,
            },
          },
        },
      },
      fileTree: {
        type: 'FileTree',
        state: {
          searchKey: '',
          expandedKeys: ['g1'],
          selectedKeys: ['/api/get/1'],
        },
        operations: {
          addGroup: {
            // 添加第一层节点
          },
          search: {
            // 搜索：异步？
          },
          drag: {
            key: 'drag',
            reload: true,
          },
        },
        data: {
          treeData: [
            {
              key: 'g1',
              title: '分组',
              icon: 'folder',
              isColorIcon: true,
              isLeaf: false,
              clickToExpand: true,
              selectable: true,
              operations: {
                addNode: {
                  key: 'addNode',
                  text: '添加api',
                  reload: false,
                  command: { key: 'set', target: 'fileFormModal', state: { visible: true } },
                },
                addBefore: {
                  key: 'addBefore',
                  show: false,
                  reload: false,
                  command: {
                    key: 'set',
                    target: 'fileFormModal',
                    state: { visible: true, formData: { targetNode: 'g1', position: 'xx' } },
                  },
                },
                addAfter: {
                  key: 'addAfter',
                  show: false,
                  reload: false,
                  command: {
                    key: 'set',
                    target: 'fileFormModal',
                    state: { visible: true, targetNode: 'g1', position: 'xx' },
                  },
                },
                // export: {
                //   key: 'export',
                //   text: '导入api',
                //   reload: true,
                // },
              },
              children: [
                {
                  title: '/api/get/11111111111111111111111111111111111111111111',
                  key: '/api/get/1',
                  icon: 'dm',
                  isLeaf: true,
                  operations: {
                    delete: {
                      key: 'delete',
                      text: '删除',
                      disabled: true,
                      disabledTip: '无法删除',
                    },
                    addBefore: {
                      key: 'addBefore',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/get/1', position: 'xx' },
                      },
                    },
                    addAfter: {
                      key: 'addAfter',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/get/1', position: 'xx' },
                      },
                    },
                  },
                },
                {
                  key: '/api/get/2',
                  title: '/api/get/22222222222222222222222222222222',
                  icon: 'dm',
                  isLeaf: true,
                  operations: {
                    delete: {
                      key: 'delete',
                      text: '删除',
                      confirm: '是否确认删除',
                      reload: true,
                      meta: { key: '/api/get/2', group: 'g1' },
                    },
                    addAfter: {
                      key: 'addAfter',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/get/2', position: 'xx' },
                      },
                    },
                  },
                },
                {
                  key: '/api/get/3',
                  title: '/api/get/333333333333333333332222222222222222',
                  icon: 'dm',
                  isLeaf: true,
                  operations: {
                    delete: {
                      key: 'delete',
                      text: '删除',
                      confirm: '是否确认删除',
                      reload: true,
                      meta: { key: '/api/get/3', group: 'g1' },
                    },
                    addAfter: {
                      key: 'addAfter',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/get/3', position: 'xx' },
                      },
                    },
                  },
                },
              ],
            },
            {
              key: 'g2',
              title: '分组2',
              icon: 'folder',
              isColorIcon: true,
              isLeaf: false,
              selectable: true,
              clickToExpand: true,
              operations: {
                addNode: {
                  key: 'addNode',
                  text: '添加api',
                  reload: false,
                  command: { key: 'set', target: 'fileFormModal', state: { visible: true } },
                },
                addAfter: {
                  key: 'addAfter',
                  show: false,
                  reload: false,
                  command: {
                    key: 'set',
                    target: 'fileFormModal',
                    state: { visible: true, targetNode: 'g2', position: 'xx' },
                  },
                },
              },
              children: [
                {
                  key: '/api/user/1',
                  title: '/api/user/1',
                  icon: 'dm',
                  isLeaf: true,
                  operations: {
                    delete: {
                      key: 'delete',
                      text: '删除',
                      confirm: '是否确认删除',
                      reload: true,
                      meta: { key: '/api/user/2', group: 'g2' },
                    },
                    addBefore: {
                      key: 'addBefore',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/user/1', position: 'xx' },
                      },
                    },
                    addAfter: {
                      key: 'addAfter',
                      show: false,
                      reload: false,
                      command: {
                        key: 'set',
                        target: 'fileFormModal',
                        state: { visible: true, targetNode: '/api/user/1', position: 'xx' },
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        props: {
          title: '场景目录',
          draggable: true,
          titleButton: {
            text: '新建',
            operations: {
              click: {},
            },
          },
        },
      },
      fileFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          title: '添加api',
          fields: [
            {
              key: 'name',
              label: 'api名称',
              component: 'input',
              required: true,
              componentProps: {
                maxLength: 200,
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      exportTreeData: {
        type: 'Modal',
        props: {
          title: '导入api',
        },
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
      },
      exportForm: {
        type: 'Form',
        state: {
          formData: undefined,
        },
        props: {
          fields: [
            {
              key: 'apiDoc',
              type: 'select',
              operations: {
                onChange: {
                  key: 'changeApiDoc',
                  reload: true,
                },
              },
            },
            {
              key: 'version',
              type: 'select',
              operations: {
                onChange: {
                  key: 'changeVersion',
                  reload: true,
                },
              },
            },
          ],
        },
      },
      exportTable: {
        type: 'Table',
        operations: {
          // 当用户翻页的时候，我会先把上面state的pageNo改掉，然后再告诉你我执行了这个operation
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
        },
        state: {
          selectedRowKeys: [],
          selectAll: true,
          pageNo: 1,
          pageSize: 20,
          total: 100,
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: 'api路径', dataIndex: 'path' },
            { title: '描述', dataIndex: 'desc' },
          ],
          rowSelectAll: true,
          rowSelection: {
            hideDefaultSelections: true,
          },
        },
        data: {
          list: [
            {
              id: 1,
              path: '/api',
              desc: 'xxxx',
            },
          ],
        },
      },
      exportDataFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 1000,
        },
        state: {
          conditions: [
            {
              key: 'title',
              label: '标题',
              emptyText: '全部',
              fixed: true,
              showIndex: 1,
              // placeholder: '',
              type: 'input' as const,
            },
          ],
          values: {
            name: 'xxx',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      interfaceList: {
        type: 'Table',
        state: {
          total: 20,
          pageSize: 10,
          pageNo: 1,
        },
        operations: {
          changePageNo: {
            reload: true,
          },
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: '接口名称', dataIndex: 'interfaceName' },
            { title: '接口路径', dataIndex: 'interfacePath' },
            { title: '优先级', dataIndex: 'priority', width: 60 },
            { title: '调试状态', dataIndex: 'status', width: 80 },
            { title: '目录', dataIndex: 'menu' },
            { title: '最后更新', dataIndex: 'updatedAt', width: 180 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              interfaceName: '创建企业',
              interfacePath: {
                renderType: 'textWithExtraTag',
                text: '/api/org/create/api/org/create',
                prefix: {
                  type: 'label',
                  text: 'POST',
                  bgColor: '#00ffff',
                },
              },
              priority: 'P0',
              status: {
                renderType: 'textWithBadge',
                text: '未完成',
                status: 'default',
              },
              menu: {
                renderType: 'textWithLevel',
                data: [
                  {
                    level: 1,
                    text: 'DevOps',
                  },
                  {
                    level: 2,
                    text: 'v3.21',
                  },
                ],
              },
              updatedAt: '2021-01-01 12:00:00',
            },
            {
              id: 2,
              interfaceName: '创建项目',
              interfacePath: {
                renderType: 'textWithExtraTag',
                text: '/api/org/create/api/org/create',
                prefix: {
                  type: 'label',
                  text: 'PUT',
                  bgColor: 'green',
                },
              },
              priority: 'P0',
              status: {
                renderType: 'textWithBadge',
                text: '未完成',
                status: 'default',
              },
              menu: {
                renderType: 'textWithLevel',
                data: [
                  {
                    level: 1,
                    text: 'DevOps',
                  },
                  {
                    level: 2,
                    text: 'v3.21',
                  },
                ],
              },
              updatedAt: '2021-01-01 12:00:00',
            },
            {
              id: 3,
              interfaceName: '创建应用',
              interfacePath: {
                renderType: 'textWithExtraTag',
                text: '/api/org/create/api/org/create',
                prefix: {
                  type: 'label',
                  text: 'PUT',
                  bgColor: 'green',
                },
              },
              priority: 'P0',
              status: {
                renderType: 'textWithBadge',
                text: '未完成',
                status: 'default',
              },
              menu: {
                renderType: 'textWithLevel',
                data: [
                  {
                    level: 1,
                    text: 'DevOps',
                  },
                  {
                    level: 2,
                    text: 'v3.21',
                  },
                ],
              },
              updatedAt: '2021-01-01 12:00:00',
            },
            {
              id: 4,
              interfaceName: '编辑企业',
              interfacePath: {
                renderType: 'textWithExtraTag',
                text: '/api/org/create',
                prefix: {
                  type: 'label',
                  text: 'PUT',
                  bgColor: 'green',
                },
              },
              priority: 'P0',
              status: {
                renderType: 'textWithBadge',
                text: '未完成',
                status: 'default',
              },
              menu: {
                renderType: 'textWithLevel',
                data: [
                  {
                    level: 1,
                    text: 'DevOps',
                  },
                  {
                    level: 2,
                    text: 'v3.21',
                  },
                ],
              },
              updatedAt: '2021-01-01 12:00:00',
            },
          ],
        },
      },
      interfaceFilter: {
        type: 'Filter',
        props: {
          fields: [
            {
              key: 'searchKey',
              fixed: true,
              showIndex: 1,
              component: 'input',
              componentProps: {
                placeholder: '按路径搜索或名称搜索',
              },
            },
            {
              key: 'status',
              fixed: true,
              showIndex: 2,
              placeholder: '请选择状态',
              component: 'select',
              componentProps: {
                placeholder: '请选择状态',
                allowClear: true,
                options: [
                  {
                    value: 'unfinished',
                    label: '未完成',
                  },
                  {
                    value: 'finished',
                    label: '已完成',
                  },
                ],
              },
            },
          ],
        },
        state: {
          status: undefined,
          searchKey: undefined,
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
    },
  },
};
