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

const configSetList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectId: +projectId,
  };
  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="edge-configSet"
        scenarioType="edge-configSet"
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
  // console.clear();
  // console.log('request', payload);
  const temp = cloneDeep(mock);
  return temp;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'edge-configSet',
    scenarioType: 'edge-configSet',
  },
  protocol: {
    hierarchy: {
      root: 'configSetManage',
      structure: {
        configSetManage: ['topHead', 'configSetList', 'configSetFormModal'],
        topHead: ['clusterAddButton'],
      },
    },
    components: {
      configSetManage: { type: 'Container' },
      configSetList: {
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
            { title: '配置集名称', dataIndex: 'configSetName', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [{
            id: 1,
            configSetName: '配置集名称',
            operate: {
              renderType: 'tableOperation',
              operations: {
                viewDetail: {
                  showIndex: 2,
                  key: 'viewDetail',
                  text: '详情',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'edgeSettingDetail',
                    jumpOut: false,
                    state: { params: { id: 11 }, query: { configSetName: '配置集名称' } },
                  },
                },
                delete: {
                  showIndex: 1,
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
          }],
        },
      },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      configSetFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          name: '配置集合',
          fields: [
            {
              key: 'name',
              label: '名称',
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
            },
            {
              key: 'cluster',
              label: '集群',
              component: 'select',
              required: true,
              componentProps: {
                placeholder: '请选择集群',
                options: [{ name: '集群1', value: 'test1' }, { name: '集群2', value: 'test2' }, { name: '集群3', value: 'test3' }],
              },
            },
          ],
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      clusterAddButton: {
        type: 'Button',
        operations: {
          click: { key: 'addCluster', reload: false, command: { key: 'set', state: { visible: true }, target: 'configSetFormModal' } },
        },
        props: {
          text: '新建配置集',
          type: 'primary',
        },
      },
    },
  },
};

export default configSetList;
