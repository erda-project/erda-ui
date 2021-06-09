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

const configItemList = () => {
  const [{ id }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    id: +id,
  };

  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="edge-configSet-item"
        scenarioType="edge-configSet-item"
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
    scenarioKey: 'edge-configSet-item',
    scenarioType: 'edge-configSet-item',
  },
  protocol: {
    hierarchy: {
      root: 'configItemManage',
      structure: {
        configItemManage: ['topHead', 'configItemListFilter', 'configItemList', 'configItemFormModal'],
        topHead: ['clusterAddButton'],
      },
    },
    components: {
      configItemManage: { type: 'Container' },
      configItemList: {
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
            { title: '配置项', dataIndex: 'configName', width: 150 },
            { title: '值', dataIndex: 'configValue', width: 150 },
            { title: '站点', dataIndex: 'siteName', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [{
            id: 1,
            configName: '配置项名称',
            configValue: '值',
            siteName: '站点名称',
            operate: {
              renderType: 'tableOperation',
              operations: {
                update: {
                  key: 'update',
                  text: '编辑',
                  reload: true,
                  meta: { id: 1 },
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
          }],
        },
      },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      configItemFormModal: {
        type: 'FormModal',
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
        props: {
          name: '配置项',
          fields: [
            {
              key: 'key',
              label: '键',
              component: 'input',
              required: true,
              componentProps: {
                maxLength: 50,
              },
              disabled: false,
            },
            {
              key: 'value',
              label: '值',
              component: 'input',
              required: true,
              componentProps: {
                maxLength: 50,
              },
              disabled: false,
            },
            {
              key: 'scope',
              label: '范围',
              component: 'select',
              required: true,
              defaultValue: 'COMMON',
              componentProps: {
                placeholder: '请选择范围',
                options: [{ name: '通用', value: 'COMMON' }, { name: '站点', value: 'SITE' }],
              },
            },
            {
              key: 'sites',
              label: '站点',
              component: 'select',
              required: true,
              componentProps: {
                mode: 'multiple',
                placeholder: '请选择范围',
                options: [{ name: '北京-0001', value: '1' }, { name: '北京-0002', value: '2' }],
              },
              removeWhen: [
                [{ field: 'scope', operator: '=', value: 'COMMON' }],
              ],
            },
          ],
        },
        state: {
          visible: false,
          formData: { scope: 'SITE' },
        },
      },
      clusterAddButton: {
        type: 'Button',
        operations: {
          click: {
            key: 'addCluster',
            reload: false,
            command: {
              key: 'set',
              target: 'configItemFormModal',
              state: { visible: true, formData: {} },
            },
          },
        },
        props: {
          text: '新建配置项',
          type: 'primary',
        },
      },
      configItemListFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 300,
        },
        state: {
          conditions: [
            {
              fixed: true,
              key: 'name',
              label: '标题',
              placeholder: '请输入键或值',
              showIndex: 2,
              type: 'input',
            },
          ],
          values: {
            name: '',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
          ownerSelectMe: {
            key: 'ownerSelectMe',
            reload: true,
          },
        },
      },
    },
  },
};

export default configItemList;
