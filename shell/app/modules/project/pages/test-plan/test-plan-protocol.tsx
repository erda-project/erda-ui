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

const AutoTestPlanList = () => {
  const [{ projectId }] = routeInfoStore.useStore(s => [s.params]);
  const inParams = {
    projectId: +projectId,
  };
  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey='auto-test-plan-list'
        scenarioType='auto-test-plan-list'
        inParams={inParams}
        useMock={location.search.includes('useMock') ? useMock : undefined}
      />
    </div>
  );
};

const useMock = (payload: Record<string, any>) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(getMock(payload));
  }, 100);
});

const getMock = (payload?: Record<string, any>) => {
  const temp = cloneDeep(mock);
  return temp;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'auto-test-plan-list',
    scenarioType: 'auto-test-plan-list',
  },
  protocol: {
    hierarchy: {
      root: 'autoTestPlan',
      structure: {
        autoTestPlan: ['filter', 'table', 'topHead', 'formModal'],
        topHead: ['addButton'],
      },
    },
    components: {
      autoTestPlan: { type: 'Container' },
      filter: {
        type: 'ContractiveFilter',
        props: {
          delay: 1000,
        },
        state: {
          values: {},
          conditions: [
            {
              key: 'title',
              label: '标题',
              fixed: true,
              placeholder: '输入关键字按回车键查询',
              type: 'input' as const,
            },
          ],
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      table: {
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
          clickRow: {
            key: 'clickRow',
            reload: false,
            command: {
              key: 'goto',
              target: 'project_test_autoTestPlanDetail',
              jumpOut: false,
            },
          },
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: '计划名', dataIndex: 'name' },
            { title: '测试空间', dataIndex: 'space' },
            { title: '负责人', dataIndex: 'owner' },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              name: '测试计划 A',
              space: '测试空间A',
              owner: { renderType: 'userAvatar', value: ['1'], showIcon: false },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  edit: {
                    key: 'edit',
                    text: '编辑',
                    reload: true,
                    meta: { id: 1 },
                  },
                },
              },
            },
            {
              id: 3,
              name: '测试计划 B',
              space: '测试空间A',
              owner: { renderType: 'userAvatar', value: '1' },
              operate: {
                renderType: 'tableOperation',
                value: '',
                operations: {
                  edit: {
                    key: 'edit',
                    text: '编辑',
                    reload: true,
                    meta: { id: 3 },
                  },
                },
              },
            },
          ],
        },
      },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      formModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          name: '计划',
          fields: [
            {
              key: 'name',
              label: '计划名称',
              component: 'input',
              required: true,
              rules: [
                {
                  pattern: '/^[a-z\u4e00-\u9fa5A-Z0-9_-]*$/',
                  msg: '可输入中文、英文、数字、中划线或下划线',
                },
              ],
              componentProps: {
                maxLength: 50,
              },
            },
            {
              label: '测试空间',
              component: 'select',
              required: true,
              disabled: true,
              key: 'space',
              componentProps: {
                options: [
                  { name: '空间1', value: 'space-1' },
                  { name: '空间2', value: 'space-2' },
                ],
              },
            },
            {
              label: '负责人',
              component: 'memberSelector',
              required: true,
              key: 'owner',
              componentProps: {
                scopeType: 'project',
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      addButton: {
        type: 'Button',
        operations: {
          click: { key: 'addTest', reload: false, command: { key: 'set', state: { visible: true }, target: 'formModal' } },
        },
        props: {
          text: '新建计划',
          type: 'primary',
        },
      },
    },
  },
};

export default AutoTestPlanList;
