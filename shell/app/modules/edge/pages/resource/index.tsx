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
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'common/stores/route';
import { cloneDeep } from 'app/external/custom-lodash';

const siteList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectId: +projectId,
  };

  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="edge-site"
        scenarioType="edge-site"
        inParams={inParams}
        useMock={location.search.includes('useMock') ? useMock : undefined}
      />
    </div>
  );
};

const useMock = (payload: Record<string, any>) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMock(payload));
    }, 100);
  });

const getMock = (payload?: Record<string, any>) => {
  // console.clear();
  // console.log('request', payload);
  const temp = cloneDeep(mock);
  return temp;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'edge-site',
    scenarioType: 'edge-site',
  },
  protocol: {
    hierarchy: {
      root: 'resourceManage',
      structure: {
        resourceManage: ['topHead', 'siteNameFilter', 'siteList', 'siteFormModal', 'siteAddDrawer'],
        topHead: ['siteAddButton'],
        siteAddDrawer: { content: 'sitePreview' },
      },
    },
    components: {
      resourceManage: { type: 'Container' },
      siteList: {
        type: 'Table',
        state: {
          total: 20,
          pageSize: 10,
          pageNo: 1,
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changePageSize: {
            key: 'changePageSize',
            reload: true,
          },
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',
          columns: [
            { title: '站点名称', dataIndex: 'siteName', width: 150 },
            { title: '节点数量', dataIndex: 'nodeNum', width: 150 },
            { title: '关联集群', dataIndex: 'relatedCluster', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              siteName: {
                renderType: 'linkText',
                value: 'beijing-001',
                operations: {
                  click: {
                    reload: false,
                    key: 'gotoMachine',
                    command: {
                      key: 'goto',
                      target: 'edgeSiteMachine',
                      jumpOut: false,
                      state: { params: { id: 1 }, query: { siteName: 'test', clusterName: 'beijing' } },
                    },
                  },
                },
              },
              nodeNum: '1/2',
              relatedCluster: 'terminus-dev',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  update: {
                    key: 'update',
                    text: '编辑',
                    reload: false,
                    command: {
                      key: 'set',
                      target: 'siteFormModal',
                      state: {
                        formData: { id: 1, siteName: '站点名', relatedCluster: ['dev'] },
                        visible: true,
                      },
                    },
                  },
                  add: {
                    key: 'add',
                    text: '添加节点',
                    reload: false,
                    meta: { id: 1 },
                    command: {
                      key: 'add',
                      target: 'siteAddDrawer',
                      state: { visible: true },
                    },
                  },
                  delete: {
                    key: 'delete',
                    text: '删除',
                    confirm: '是否确认删除',
                    reload: true,
                    meta: { id: 1 },
                    disabled: false,
                    disabledTip: '无法删除',
                  },
                },
              },
            },
          ],
        },
      },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      siteAddDrawer: {
        type: 'Drawer',
        state: { visible: false },
        props: { size: 'l', title: '添加节点' },
      },
      siteFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          name: '创建站点',
          fields: [
            {
              key: 'siteName',
              label: '站点名称',
              component: 'input',
              required: true,
              rules: [
                {
                  pattern: '/^[a-z0-9-]*$/',
                  msg: '可输入小写字母、数字或中划线',
                },
              ],
              componentProps: {
                maxLength: 50,
              },
              disableWhen: [[{ mode: 'edit' }]],
            },
            {
              key: 'relatedCluster',
              label: '关联集群',
              component: 'select',
              required: true,
              componentProps: {
                placeholder: '请选择关联集群',
                options: [
                  { name: 'terminus-dev', value: 'dev' },
                  { name: 'terminus-prod', value: 'prod' },
                ],
              },
              disableWhen: [[{ mode: 'edit' }]],
            },
            {
              key: 'desc',
              label: '站点描述',
              component: 'textarea',
              required: false,
              componentProps: {
                maxLength: 1024,
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      siteAddButton: {
        type: 'Button',
        operations: {
          click: {
            key: 'addSite',
            reload: false,
            command: { key: 'set', state: { visible: true }, target: 'siteFormModal' },
          },
        },
        props: {
          text: '新建站点',
          type: 'primary',
        },
      },
      sitePreview: {
        type: 'InfoPreview',
        data: {
          info: {
            siteName: '北京001',
            firstStep: '使用root账号登陆到待添加节点中',
            secondStep: '拷贝如下命令在节点中执行',

            operationCode: 'git push',
          },
        },
        props: {
          render: [
            { type: 'Desc', dataIndex: 'siteName', props: { title: '站点' } },
            { type: 'Desc', dataIndex: 'firstStep', props: { title: '步骤一' } },
            { type: 'Desc', dataIndex: 'secondStep', props: { title: '步骤二' } },
            { type: 'FileEditor', dataIndex: 'operationCode', props: { actions: { copy: true } } },
          ],
        },
      },
      siteNameFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 300,
        },
        state: {
          conditions: [
            {
              key: 'siteName',
              label: '名称',
              placeholder: '按名称模糊搜索',
              type: 'input' as const,
            },
          ],
          values: {
            siteName: '',
          },
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

export default siteList;
