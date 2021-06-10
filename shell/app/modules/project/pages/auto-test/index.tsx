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

/**
 * Created by 含光<jiankang.pjk@alibaba-inc.com> on 2021/1/20 14:43.
 */
import React from 'react';
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'common/stores/route';
import { cloneDeep } from 'app/external/custom-lodash';

const SpaceList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectId: +projectId,
  };
  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="auto-test-space-list"
        scenarioType="auto-test-space-list"
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
  const temp = cloneDeep(mock);
  return temp;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'auto-test-space-list',
    scenarioType: 'auto-test-space-list',
  },
  protocol: {
    hierarchy: {
      root: 'spaceManage',
      structure: {
        spaceManage: ['spaceList', 'topHead', 'spaceFormModal'],
        topHead: ['spaceAddButton'],
      },
    },
    components: {
      spaceManage: { type: 'Container' },
      spaceList: {
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
          clickRow: {
            key: 'clickRow',
            reload: false,
            command: {
              key: 'goto',
              target: 'project_test_spaceDetail_scenes',
              jumpOut: false,
            },
          },
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',
          columns: [
            { title: '空间名', dataIndex: 'name' },
            { title: '描述', dataIndex: 'desc' },
            { title: '状态', dataIndex: 'status' },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              name: '测试空间 A',
              desc: '测试description',
              status: { renderType: 'textWithBadge', value: '复制中', status: 'processing' },
              // status枚举 "default" | "success" | "processing" | "error" | "warning" | undefined
              operate: {
                renderType: 'tableOperation',
                operations: {
                  edit: {
                    key: 'edit',
                    text: '编辑',
                    reload: true,
                    meta: { id: 1 },
                  },
                  copy: {
                    key: 'copy',
                    text: '复制',
                    reload: true,
                    meta: { id: 1 },
                  },
                  delete: {
                    key: 'delete',
                    text: '删除',
                    confirm: '是否确认删除',
                    reload: true,
                    meta: { id: 1 },
                    disabled: true,
                    disabledTip: '无法删除',
                  },
                },
              },
            },
            {
              id: 3,
              name: '测试空间 B',
              desc: '测试description',
              status: { renderType: 'textWithBadge', value: '复制失败', status: 'error' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  edit: {
                    key: 'edit',
                    text: '编辑',
                    reload: true,
                    meta: { id: 1 },
                  },
                  copy: {
                    key: 'copy',
                    text: '复制',
                    reload: true,
                    meta: { id: 1 },
                  },
                  delete: {
                    key: 'delete',
                    text: '删除',
                    confirm: '是否确认删除',
                    reload: true,
                    meta: { id: 1 },
                  },
                },
              },
            },
          ],
        },
      },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      spaceFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          name: '空间',
          fields: [
            {
              key: 'name',
              label: '空间名',
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
              key: 'desc',
              label: '描述',
              component: 'textarea',
              required: false,
              componentProps: {
                maxLength: 1000,
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      spaceAddButton: {
        type: 'Button',
        operations: {
          click: {
            key: 'addSpace',
            reload: false,
            command: { key: 'set', state: { visible: true }, target: 'spaceFormModal' },
          },
        },
        props: {
          text: '新建空间',
          type: 'primary',
        },
      },
    },
  },
};

export default SpaceList;
