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
import { cloneDeep, isEmpty } from 'app/external/custom-lodash';
import { useUpdate } from 'common';
import { MonitorDrawer } from '../components/monitor-drawer';

const applicationList = () => {
  const [{
    monitorVisible,
    chosenSite,
  }, updater] = useUpdate({
    monitorVisible: false,
    chosenSite: {} as MACHINE_MANAGE.IMonitorInfo,
  });

  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey='edge-application'
        scenarioType='edge-application'
        useMock={location.search.includes('useMock') ? useMock : undefined}
      />
      {
        !isEmpty(chosenSite) ? (
          <MonitorDrawer
            data={chosenSite}
            visible={monitorVisible}
            onClose={() => updater.monitorVisible(false)}
          />
        ) : null
      }
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
  const temp = cloneDeep(mock);
  return temp;
};

const formFields = [
  {
    key: 'appName',
    label: '应用名',
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
      disabled: false,
    },
  },
  {
    key: 'deployResource',
    label: '部署源',
    component: 'select',
    required: true,
    componentProps: {
      placeholder: '请选择部署源',
      options: [
        { name: '镜像', value: 'MIRROR' },
        { name: '中间件', value: 'MIDDLEWARE' },
      ],
    },
    defaultValue: 'MIDDLEWARE',
  },
  {
    key: 'depends',
    label: '依赖',
    component: 'select',
    required: false,
    componentProps: {
      mode: 'multiple',
      placeholder: '请选择依赖',
      options: [
        { name: '依赖1', value: 'depends1' },
        { name: '依赖2', value: 'depends2' },
      ],
      allowClear: true,
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    key: 'middlewareType',
    label: '中间件类型',
    component: 'select',
    required: true,
    componentProps: {
      placeholder: '请选择中间件类型',
      options: [
        { name: 'MYSQL', value: 'MYSQL' },
      ],
      disabled: false,
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIRROR' }],
    ],
  },
  {
    key: 'cluster',
    label: '集群',
    component: 'select',
    required: true,
    componentProps: {
      placeholder: '请选择集群',
      options: [
        { name: 'terminus-dev', value: '1' },
        { name: 'terminus-prod', value: '2' },
      ],
      disabled: false,
    },
    operations: {
      change: {
        reload: true,
        key: 'clusterChange',
      },
    },
  },
  {
    key: 'sites',
    label: '站点 (新增的站点会部署对应的实例, 被删除的站点上应用对应的实例会被销毁)',
    component: 'select',
    required: true,
    componentProps: {
      placeholder: '请选择站点',
      mode: 'multiple',
      options: [
        { name: '北京', value: 'beijing' },
        { name: '杭州', value: 'hangzhou' },
        { name: '上海', value: 'shanghai' },
        { name: '宁波', value: 'ningbo' },
        { name: '天津', value: 'tianjin' },
        { name: '绍兴', value: 'shaoxing' },
        { name: '南京', value: 'nanjing' },
        { name: '广州', value: 'guangzhou' },
        { name: '温州', value: 'wenzhou' },
        { name: '重庆', value: 'chongqing' },
        { name: '深圳', value: 'shenzhen' },
        { name: '香港', value: 'xianggang' },
        { name: '澳门', value: 'aomen' },
        { name: '西藏', value: 'xizang' },
      ],
      disabled: false,
      selectAll: true,
    },
  },
  {
    key: 'configSets',
    label: '配置集',
    component: 'select',
    required: false,
    componentProps: {
      placeholder: '请选择站点',
      options: [
        { name: '配置集1', value: 'config1' },
        { name: '配置集2', value: 'config2' },
      ],
      disabled: false,
      allowClear: true,
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    key: 'copyNum',
    label: '副本数',
    component: 'inputNumber',
    required: true,
    componentProps: {
      className: 'full-width',
      precision: 0,
      disabled: false,
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    label: '',
    key: 'storage',
    component: 'formGroup',
    group: 'storage',
    componentProps: {
      indentation: true,
      showDivider: false,
      title: 'CPU和内存',
      disabled: false,
      direction: 'row',
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    label: 'cpu需求(核)',
    component: 'inputNumber',
    required: true,
    key: 'storage.cpuRequest',
    group: 'storage',
    componentProps: { className: 'full-width', disabled: false, min: 0 },
  },
  {
    label: 'cpu限制(核)',
    component: 'inputNumber',
    required: true,
    key: 'storage.cpuLimit',
    group: 'storage',
    componentProps: { className: 'full-width', disabled: false, min: 0 },
  },
  {
    label: '内存需求(MB)',
    component: 'inputNumber',
    required: true,
    key: 'storage.memoryRequest',
    group: 'storage',
    componentProps: { className: 'full-width', precision: 0, disabled: false, min: 0 },
  },
  {
    label: '内存限制(MB)',
    component: 'inputNumber',
    required: true,
    key: 'storage.memoryLimit',
    group: 'storage',
    componentProps: { className: 'full-width', precision: 0, disabled: false, min: 0 },
  },
  {
    label: '',
    key: 'mirror',
    component: 'formGroup',
    group: 'mirror',
    componentProps: {
      indentation: true,
      title: '镜像配置',
      direction: 'row',
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    label: '镜像地址',
    component: 'input',
    required: true,
    key: 'mirror.mirrorAddress',
    group: 'mirror',
    componentProps: {
      disabled: false,
      maxLength: 100,
    },
  },
  {
    label: '镜像仓库用户名',
    component: 'input',
    required: false,
    key: 'mirror.registryUser',
    group: 'mirror',
    componentProps: {
      disabled: false,
      maxLength: 50,
    },
  },
  {
    label: '镜像仓库密码',
    component: 'input',
    required: false,
    key: 'mirror.registryPassword',
    group: 'mirror',
    isPassword: true,
    componentProps: {
      disabled: false,
      maxLength: 50,
    },
  },
  {
    key: 'healthCheckConfig',
    component: 'formGroup',
    group: 'healthCheckConfig',
    componentProps: {
      indentation: true,
      showDivider: false,
      direction: 'row',
      title: '健康检查配置',
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    key: 'healthCheckConfig.healthCheckType',
    label: '检查方式',
    component: 'select',
    required: true,
    group: 'healthCheckConfig',
    componentProps: {
      placeholder: '请选择健康检查方式',
      options: [
        { name: 'HTTP', value: 'HTTP' },
        { name: 'COMMAND', value: 'COMMAND' },
      ],
      disabled: false,
    },
    defaultValue: 'HTTP',
  },
  {
    key: 'healthCheckConfig.HealthCheckExec',
    label: '检查命令',
    component: 'input',
    required: true,
    group: 'healthCheckConfig',
    componentProps: {
      placeholder: '请输入健康检查命令',
      disabled: false,
    },
    removeWhen: [
      [{ field: 'healthCheckConfig.healthCheckType', operator: '=', value: 'HTTP' }],
    ],
  },
  {
    label: '检查路径',
    component: 'input',
    required: true,
    key: 'healthCheckConfig.path',
    group: 'healthCheckConfig',
    componentProps: {
      placeholder: '请输入健康检查路径',
      maxLength: 50,
      disabled: false,
    },
    removeWhen: [
      [{ field: 'healthCheckConfig.healthCheckType', operator: '=', value: 'COMMAND' }],
    ],
  },
  {
    label: '端口',
    component: 'inputNumber',
    required: true,
    key: 'healthCheckConfig.port',
    group: 'healthCheckConfig',
    componentProps: {
      min: 1,
      max: 65535,
      precision: 0,
      className: 'full-width',
    },
    removeWhen: [
      [{ field: 'healthCheckConfig.healthCheckType', operator: '=', value: 'COMMAND' }],
    ],
  },
  {
    label: '',
    key: 'portMap',
    component: 'formGroup',
    group: 'portMap',
    componentProps: {
      expandable: true,
      defaultExpand: true,
      indentation: true,
      showDivider: false,
      title: '端口映射',
      disabled: false,
    },
    removeWhen: [
      [{ field: 'deployResource', operator: '=', value: 'MIDDLEWARE' }],
    ],
  },
  {
    label: '映射规则 (协议-容器端口-服务端口)',
    component: 'arrayObj',
    required: true,
    key: 'portMap.data',
    group: 'portMap',
    labelTip: '请依次填写协议，容器端口和服务端口，容器端口为容器内应用程序监听的端口，服务端口建议与容器端口一致',
    componentProps: {
      direction: 'row',
      disabled: false,
      objItems: [
        {
          key: 'protocol',
          component: 'select',
          options: 'k1:TCP',
          required: true,
          componentProps: {
            placeholder: '请选择协议',
            disabled: false,
          },
        },
        {
          key: 'container',
          component: 'inputNumber',
          required: true,
          componentProps: {
            className: 'full-width',
            precision: 0,
            min: 1,
            max: 65535,
            placeholder: '请输入容器端口',
            disabled: false,
          },
        },
        {
          key: 'service',
          component: 'inputNumber',
          required: true,
          componentProps: {
            className: 'full-width',
            precision: 0,
            min: 1,
            max: 65535,
            placeholder: '请输入服务端口',
            disabled: false,
          },
        },
      ],
    },
  },
];

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'edge-application',
    scenarioType: 'edge-application',
  },
  protocol: {
    hierarchy: {
      root: 'appManage',
      structure: {
        appManage: ['topHead', 'applicationList', 'addAppDrawer'],
        topHead: ['addAppButton'],
        addAppDrawer: { content: ['appConfigForm', 'keyValueListTitle', 'keyValueList'] },
      },
    },
    components: {
      appManage: { type: 'Container' },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      applicationList: {
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
            { title: '应用名称', dataIndex: 'appName', width: 150 },
            { title: '部署来源', dataIndex: 'deployResource', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              appName: {
                renderType: 'linkText',
                value: 'dice-ui',
                operations: {
                  click: {
                    reload: false,
                    key: 'gotoDetail',
                    command: {
                      key: 'goto',
                      target: 'edgeAppSiteManage',
                      jumpOut: false,
                      state: { params: { id: 1 }, query: { appName: 'test_edge' } },
                    },
                  },
                },
              },
              deployStatus: { renderType: 'textWithBadge', value: '100/100', status: 'success' },
              deployResource: '镜像(xxx.com/nginx:1.0)',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  viewDetail: {
                    key: 'viewDetail',
                    text: '详情',
                    reload: false,
                    command: {
                      key: 'set',
                      state: {
                        formData: { id: 1, appName: '应用名', deployResource: 'MIRROR' },
                        visible: true,
                      },
                      target: 'addAppDrawer',
                    },
                  },
                  update: {
                    key: 'update',
                    text: '编辑',
                    reload: false,
                    command: {
                      key: 'set',
                      state: {
                        formData: { id: 1, appName: '应用名', deployResource: 'MIDDLEWARE' },
                        visible: true,
                      },
                      target: 'addAppDrawer',
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
            {
              id: 2,
              appName: {
                renderType: 'linkText',
                value: 'fdp',
                operations: {
                  click: {
                    reload: false,
                    key: 'gotoDetail',
                    command: {
                      key: 'goto',
                      target: 'edgeAppSiteManage',
                      jumpOut: false,
                      state: { params: { id: 2 }, query: { appName: 'pos' } },
                    },
                  },
                },
              },
              deployStatus: { renderType: 'textWithBadge', value: '99/100', status: 'error' },
              deployResource: '制品(00001)',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  viewDetail: {
                    key: 'viewDetail',
                    text: '详情',
                    reload: false,
                    command: {
                      key: 'set',
                      state: {
                        formData: { id: 1, appName: '应用名', deployResource: 'MIDDLEWARE', disabledForm: true },
                        visible: true,
                      },
                      target: 'addAppDrawer',
                    },
                  },
                  update: {
                    key: 'update',
                    text: '编辑',
                    reload: false,
                    command: {
                      key: 'set',
                      state: {
                        formData: { id: 1, appName: '应用名', deployResource: 'MIDDLEWARE' },
                        visible: true,
                      },
                      target: 'addAppDrawer',
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
      keyValueListTitle: {
        type: 'Title',
        props: {
          title: '链接信息',
          level: 2,
          visible: false,
        },
      },
      keyValueList: {
        type: 'Table',
        props: {
          visible: false,
          pagination: false,
          rowKey: 'keyName',
          columns: [
            { dataIndex: 'keyName', colSpan: 0 },
            { dataIndex: 'valueName', colSpan: 0 },
          ],
        },
        data: {
          list: [
            {
              keyName: 'method',
              valueName: {
                renderType: 'copyText',
                value: {
                  text: 'post', copyText: 'post',
                },
              },
            },
            {
              keyName: 'name',
              valueName: {
                renderType: 'copyText',
                value: {
                  text: 'terminus', copyText: 'terminus',
                },
              },
            },
          ],
        },
      },
      addAppButton: {
        type: 'Button',
        operations: {
          click: { key: 'addApp', reload: false, command: { key: 'set', state: { visible: true }, target: 'addAppDrawer' } },
        },
        props: {
          text: '发布应用',
          type: 'primary',
        },
      },
      addAppDrawer: { type: 'Drawer', state: { visible: false }, props: { title: '发布应用', size: 'l' } },
      appConfigForm: {
        type: 'Form',
        state: {
          formData: undefined,
        },
        props: {
          visible: true,
          fields: formFields,
          readOnly: false, // 查看详情时，设置为true
        },
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
          cancel: {
            reload: false,
            key: 'cancel',
            command: {
              key: 'set',
              target: 'addAppDrawer',
              state: { visible: false },
            },
          },
        },
      },
    },
  },
};

export default applicationList;
