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
import routeInfoStore from 'app/common/stores/route';
import DiceConfigPage from 'app/config-page';
import { get, cloneDeep, set } from 'lodash';
import i18n from 'i18n';

import { Drawer } from 'app/nusi';
import { BuildLog } from 'application/pages/build-detail/build-log';
import InfoPreview from 'config-page/components/info-preview/info-preview';
import { getPreviewData } from 'project/pages/auto-test/scenes';
import { useUpdate } from 'common';

const AutoTestPlanDetail = () => {
  const { projectId, testPlanId } = routeInfoStore.useStore((s) => s.params);
  const [{ logVisible, logProps, resultVis, previewData }, updater, update] = useUpdate({
    logVisible: false,
    logProps: {},
    resultVis: false,
    previewData: {} as CP_INFO_PREVIEW.Props,
  });
  const inParams = {
    projectId: +projectId,
    testPlanId: +testPlanId,
  };

  const hideLog = () => {
    update({
      logVisible: false,
      logProps: {},
    });
  };

  const closeResult = () => {
    update({
      resultVis: false,
      previewData: {} as CP_INFO_PREVIEW.Props,
    });
  };

  return (
    <>
      <DiceConfigPage
        scenarioType="auto-test-plan-detail"
        scenarioKey="auto-test-plan-detail"
        inParams={inParams}
        // 提供给后端测试，可在路由上带上useMock来查看mock的数据，以便后端检查，对接完成后删除
        useMock={location.search.includes('useMock') ? useMock : undefined}
        customProps={{
          executeTaskTable: {
            operations: {
              checkLog: (d: any) => {
                const { logId, pipelineId: pId, nodeId: nId } = get(d, 'meta') || {};
                if (logId) {
                  update({
                    logVisible: true,
                    logProps: {
                      logId,
                      title: i18n.t('microService:log details'),
                      customFetchAPIPrefix: `/api/apitests/pipeline/${pId}/task/${nId}/logs`,
                      pipelineID: pId,
                      taskID: nId,
                      downloadAPI: '/api/apitests/logs/actions/download',
                    },
                  });
                }
              },
              checkDetail: (d: any) => {
                if (d) {
                  update({
                    resultVis: true,
                    previewData: getPreviewData(d),
                  });
                }
              },
            },
          },
        }}
      />
      <BuildLog visible={logVisible} hideLog={hideLog} {...logProps} />
      <Drawer width={1000} visible={resultVis} onClose={closeResult}>
        <InfoPreview {...previewData} />
      </Drawer>
    </>
  );
};
export default AutoTestPlanDetail;

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockFileTree(payload));
    }, 500);
  });
};

const getMockFileTree = (payload: any) => {
  const data = cloneDeep(mock);

  if (get(payload, 'event.operation') === 'onSelectOption') {
    if (get(payload, 'event.operationData.meta.selectOption').length === 1) {
      set(data, 'protocol.components.inParamsForm.props.temp[2].render.options[0].children', [
        { label: '场景A', value: 'cjA', isLeaf: false },
        { label: '场景B', value: 'cjB', isLeaf: false },
      ]);
    } else if (get(payload, 'event.operationData.meta.selectOption').length === 2) {
      set(data, 'protocol.components.inParamsForm.props.temp[2].render.options[0].children', [
        {
          label: '场景A',
          value: 'cjA',
          isLeaf: false,
          children: [
            { label: '入参A-1', value: '$.场景A.入参A-1' },
            { label: '入参A-2', value: '$.场景A.入参A-2' },
          ],
        },
        {
          label: '场景B',
          value: 'cjB',
          children: [
            { label: '入参B-1', value: '$.场景B.入参B-1' },
            { label: '入参B-2', value: '$.场景B.入参B-2' },
          ],
        },
      ]);
    }
  }
  // 此处mock操作后的结果
  return data;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'test-plane-detail',
    scenarioType: 'test-plane-detail',
  },
  inParams: {
    projectId: 1,
    testPlanId: 1,
  },
  protocol: {
    hierarchy: {
      root: 'fileDetail',
      structure: {
        fileDetail: { children: ['fileConfig', 'fileExecute'], tabBarExtraContent: 'tabExecuteButton' },
        fileConfig: ['fileInfoHead', 'fileInfo', 'stagesTitle', 'stages', 'stagesOperations'],
        fileExecute: [
          'executeHead',
          'executeInfo',
          'executeTaskTitle',
          'executeTaskBreadcrumb',
          'executeTaskTable',
          'resultDrawer',
        ],
        fileInfoHead: { left: 'fileInfoTitle', right: 'fileHistory' },
        fileHistory: { children: 'fileHistoryButton', content: 'fileHistoryTable' },
        stagesOperations: ['addTestButton', 'addTestDrawer'],
        addTestDrawer: { content: ['testCaseSelect', 'testCaseInParams'] },
        executeHead: { left: 'executeInfoTitle', right: ['refreshButton', 'cancelExecuteButton', 'executeHistory'] },
        resultDrawer: { content: 'resultPreview' },
        executeHistory: { children: 'executeHistoryButton', content: 'executeHistoryPop' },
        executeHistoryPop: ['executeHistoryRefresh', 'executeHistoryTable'],
      },
    },
    components: {
      fileConfig: { type: 'Container' },
      fileExecute: { type: 'Container' },
      fileInfoHead: { type: 'LRContainer' },
      executeHead: { type: 'LRContainer' },
      executeInfoTitle: { type: 'Title', props: { title: '执行详情', level: 2 } },
      fileInfoTitle: { type: 'Title', props: { title: '详情', level: 2 } },
      fileHistory: { type: 'Popover', props: { placement: 'bottomRight', title: '修改历史' } },
      fileHistoryButton: { type: 'Button', props: { text: '修改历史' } },
      stagesTitle: { type: 'Title', props: { title: '场景步骤', level: 2, tips: '组之间是串行执行，组内是并行执行' } },
      stagesOperations: { type: 'RowContainer' },
      addTestButton: {
        type: 'Button',
        props: { text: '+ 测试场景' },
        operations: {
          click: { key: 'addTestCase', reload: true },
        },
      },
      resultDrawer: { type: 'Drawer', state: { visible: false }, props: { size: 'xl' } },
      addTestDrawer: { type: 'Drawer', state: { visible: false }, props: { title: '添加测试场景' } },
      refreshButton: {
        type: 'Button',
        props: { text: '刷新', prefixIcon: 'shuaxin' },
        operations: { click: { key: 'refresh', reload: true } },
      },
      cancelExecuteButton: {
        type: 'Button',
        props: { text: '取消执行' },
        operations: { click: { key: 'cancelExecute', reload: true } },
      },
      executeHistory: { type: 'Popover', props: { placement: 'bottomRight', title: '执行历史' } },
      executeHistoryButton: { type: 'Button', props: { text: '执行历史' } },
      executeHistoryPop: { type: 'Container' },
      executeHistoryRefresh: {
        type: 'Button',
        props: { text: '返回最新记录', type: 'text', prefixIcon: 'shuaxin', style: { width: 140 } },
        operations: {
          click: {
            key: 'toNewRecord',
            reload: true,
          },
        },
      },

      executeTaskTitle: { type: 'Title', props: { title: '执行步骤', level: 2 } },
      executeTaskTable: {
        type: 'Table',
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
        },
        state: {
          pageNo: 1,
          total: 1,
          pageSize: 15,
        },
        data: {
          list: [
            {
              id: 1,
              name: '超级管理员登录',
              type: '接口',
              path: '/api/get/1',
              // taskId: 'xxxx', // 用于日志查询
              status: { renderType: 'textWithBadge', status: 'success' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  checkDetail: {
                    key: 'checkDetail',
                    text: '查看结果',
                    reload: true,
                  },
                  checkLog: {
                    key: 'checkLog',
                    text: '日志',
                    reload: false,
                    meta: { logId: 1, pipelineId: 1, nodeId: 1 }, // 用于日志查询
                  },
                },
              },
            },
          ],
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: '步骤名称', dataIndex: 'name' },
            { title: '步骤类型', dataIndex: 'type' },
            { title: '接口路径', dataIndex: 'path' },
            { title: '状态', dataIndex: 'status' },
            { title: '操作', dataIndex: 'operate' },
          ],
        },
      },
      executeTaskBreadcrumb: {
        type: 'Breadcrumb',
        data: {
          list: [
            { key: 'cjA', item: '场景A' },
            { key: 'cjA-1', item: '引用场景A-1' },
            { key: 'cjA-1-1', item: '引用场景A-1-1' },
          ],
        },
        operations: {
          click: {
            key: 'selectItem',
            reload: true,
            fillMeta: 'key',
            meta: { key: '' },
          },
        },
      },
      testCaseInParams: {
        type: 'Form',
        state: {
          formData: undefined,
        },
        props: {
          title: '节点入参',
          visible: false,
          fields: [
            {
              label: '入参A',
              component: 'input',
              required: true,
              key: 'a',
            },
            {
              label: '入参B',
              component: 'input',
              required: true,
              key: 'b',
            },
          ],
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
              target: 'configSheetDrawer',
              state: { visible: false },
            },
          },
        },
      },
      testCaseSelect: {
        type: 'TreeSelect',
        data: {
          treeData: [
            {
              key: 'g0',
              id: 'g0',
              pId: '0',
              title: 'g0',
              value: 'v-g0',
              isLeaf: false,
              selectable: false,
              disabled: true,
            },
            {
              key: 'g1',
              id: 'g1',
              pId: '0',
              title: 'g1',
              value: 'v-g1',
              isLeaf: false,
              selectable: false,
              disabled: true,
            },
            {
              key: 'g2',
              id: 'g2',
              pId: '0',
              title: 'g2',
              value: 'v-g2',
              isLeaf: false,
              selectable: false,
              disabled: true,
            },
          ],
        },
        state: { value: undefined },
        props: {
          placeholder: '请选择',
          title: '请选择配置单',
        },
        operations: {
          onSearch: {
            key: 'search',
            reload: true,
            fillMeta: 'searchKey',
            meta: { searchKey: '' },
          },
          onChange: {
            key: 'onChange',
            reload: true,
            fillMeta: 'value',
            meta: { value: '' },
          },
          onLoadData: {
            key: 'onLoadData',
            reload: true,
            fillMeta: 'pId',
            meta: { pId: '' },
          },
        },
      },
      fileDetail: {
        type: 'Tabs',
        props: {
          visible: true,
          tabMenu: [
            { key: 'config', name: '配置信息' },
            { key: 'execute', name: '执行明细' },
          ],
        },
        state: {
          activeKey: 'config',
        },
        operations: {
          onChange: {
            key: 'changeActiveKey',
            reload: true,
          },
        },
      },
      tabExecuteButton: {
        type: 'Button',
        props: {
          text: '执行',
          type: 'primary',
          menu: [
            {
              text: '开发环境',
              key: 'dev',
              operations: {
                click: { key: 'execute', reload: true, meta: { env: 'dev' } },
              },
            },
            {
              text: '测试环境',
              key: 'test',
              operations: {
                click: { key: 'execute', reload: true, meta: { env: 'test' } },
              },
            },
          ],
        },
      },
      fileHistoryTable: {
        type: 'Table',
        data: {
          list: [
            { id: 1, version: '#1', updator: '张三', updateAt: '2021-1-1' },
            { id: 2, version: '#2', updator: '张三', updateAt: '2021-1-1' },
          ],
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: '版本', dataIndex: 'version' },
            { title: '更新人', dataIndex: 'updator' },
            { title: '更新时间', dataIndex: 'updateAt' },
          ],
        },
      },
      fileInfo: {
        type: 'Panel',
        props: {
          fields: [
            {
              label: '名称',
              valueKey: 'name',
            },
            {
              label: '描述',
              valueKey: 'desc',
            },
            {
              label: '创建人',
              valueKey: 'creator',
            },
            {
              label: '创建时间',
              valueKey: 'createAt',
            },
            {
              label: '更新人',
              valueKey: 'editor',
            },
            {
              label: '更新时间',
              valueKey: 'updateAt',
            },
          ],
        },
        data: {
          data: {
            name: '22',
            desc: 'sddssdsda',
            creator: 'dice',
            createAt: 'aaa',
            editor: 'aaa',
            updateAt: 'aaa',
          },
        },
      },
      stages: {
        type: 'SortGroup',
        state: {
          dragParams: {
            dragKey: 1, // 拖拽的接点 id
            dragGroupId: 1,
            dropKey: 2, // 放置到节点 id
            dropGroupId: 2,
            position: 1, // 放置节点的上: -1, 下: 1
          },
        },
        operations: {
          moveItem: {
            key: 'moveItem',
            reload: true,
          },
          moveGroup: {
            key: 'moveGroup',
            reload: true,
          },
          clickItem: {
            key: 'clickItem',
            reload: true,
            fillMeta: 'data',
            meta: { data: '' },
          },
        },
        data: {
          type: 'sort-item',
          value: [
            {
              id: 1,
              groupId: 1, // 即stageId
              title: '1',
              operations: {
                add: {
                  icon: 'add',
                  key: 'addParallelAPI',
                  hoverTip: '添加并行接口',
                  disabled: false,
                  disabledTip: '',
                  reload: true,
                  hoverShow: true,
                  meta: { id: 1 },
                  // command: [
                  //   { key: 'set', state: { visible: true }, target: '滑窗1' },
                  //   { key: 'set', state: { formData: { clickId: 1, position: 1 } }, target: '表单1' },
                  // ],
                },
                split: {
                  icon: 'split',
                  key: 'standalone',
                  hoverTip: '改为串行',
                  disabled: false,
                  reload: true,
                  disabledTip: '',
                  meta: { id: 1 },
                },
                delete: {
                  icon: 'shanchu',
                  key: 'deleteAPI',
                  disabled: false,
                  reload: true,
                  disabledTip: '',
                  meta: { id: 1 },
                },
              },
            },
            {
              id: 2,
              groupId: 1,
              title: '2',
              operations: {
                add: {
                  icon: 'add',
                  key: 'addParallelAPI',
                  hoverTip: '添加并行接口',
                  disabled: false,
                  disabledTip: '',
                  reload: true,
                  hoverShow: true,
                  meta: { id: 1 },
                },
                delete: {
                  icon: 'shanchu',
                  key: 'deleteAPI',
                  disabled: false,
                  reload: true,
                  disabledTip: '',
                  meta: { id: 2 },
                },
              },
            },
            {
              id: 3,
              groupId: 2,
              title: '3',
              operations: {},
            },
            {
              id: 4,
              groupId: 2,
              title: '4',
              operations: {},
            },
            {
              id: 5,
              groupId: 3,
              title: '5',
              operations: {},
            },
          ],
        },
      },
      executeHistoryTable: {
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
            reload: true,
            fillMeta: 'rowData',
            meta: { rowData: '' },
          },
        },
        data: {
          list: [
            {
              id: 1,
              version: '#1',
              pipelineId: '1111',
              status: {
                renderType: 'textWithBadge',
                value: '失败',
                status: 'error', // 未开始: default, 进行中: processing, 成功: success, 失败: error
              },
              executeTime: '2021-1-1',
            },
            {
              id: 2,
              version: '#2',
              pipelineId: '22222',
              status: {
                renderType: 'textWithBadge',
                value: '成功',
                status: 'success', // 未开始: default, 进行中: processing, 成功: success, 失败: error
              },
              executeTime: '2021-1-1',
            },
          ],
        },
        props: {
          rowKey: 'id',
          columns: [
            { title: '版本', dataIndex: 'version' },
            { title: 'ID', dataIndex: 'pipelineId' },
            { title: '状态', dataIndex: 'status' },
            { title: '触发事件', dataIndex: 'executeTime' },
          ],
        },
      },
      executeInfo: {
        type: 'Panel',
        props: {
          fields: [
            {
              label: '名称',
              valueKey: 'name',
            },
            {
              label: '描述',
              valueKey: 'desc',
            },
            {
              label: '创建人',
              valueKey: 'creator',
            },
            {
              label: '创建时间',
              valueKey: 'createAt',
            },
            {
              label: '更新人',
              valueKey: 'editor',
            },
            {
              label: '更新时间',
              valueKey: 'updateAt',
            },
            {
              label: '接口总数',
              valueKey: 'passNum',
            },
            {
              label: '用例数',
              valueKey: 'totalNum',
            },
            {
              label: '接口执行率',
              valueKey: 'executeRate',
            },
            {
              label: '接口通过率',
              valueKey: 'passRate',
            },
          ],
        },
        data: {
          data: {
            name: '22',
            desc: 'sddssdsda',
            creator: 'dice',
            createAt: 'aaa',
            editor: 'aaa',
            updateAt: 'aaa',
            passNum: 10,
            totalNum: 100,
            executeRate: 50,
            passRate: '20%',
          },
        },
      },
      resultPreview: {
        type: 'InfoPreview',
        data: {
          info: {
            title: '创建用户',
            desc: '这里是描述信息',
            apiInfo: { method: 'POST', path: '/api/xxxx' },
            header: [{ name: 'Accept', desc: '接受类型', required: '是', defaultValue: 'JSON' }],
            urlParams: [{ name: 'a', type: 'string', desc: 'a', required: '是', defaultValue: '123' }],
            body: [
              {
                name: 'info',
                type: 'Object',
                desc: 'info',
                required: '是',
                defaultValue: '-',
                children: [
                  {
                    name: 'menu',
                    type: 'Array',
                    desc: 'menu',
                    required: '否',
                    defaultValue: '-',
                    children: [
                      { name: 'menuName', type: 'string', desc: 'menu1', required: '否', defaultValue: '-' },
                      { name: 'menuType', type: 'string', desc: 'menu1', required: '否', defaultValue: '-' },
                    ],
                  },
                ],
              },
            ],
            example: {
              info: {
                menu1: [{ menuName: 'xxx', menuType: 'xxx' }],
                menu2: [{ menuName: 'xxx', menuType: 'xxx' }],
                menu3: [{ menuName: 'xxx', menuType: 'xxx' }],
                menu4: [{ menuName: 'xxx', menuType: 'xxx' }],
              },
            },
          },
        },
        props: {
          render: [
            { type: 'Title', dataIndex: 'title' },
            { type: 'Desc', dataIndex: 'desc' },
            { type: 'BlockTitle', props: { title: '请求信息' } },
            { type: 'API', dataIndex: 'apiInfo' },
            {
              type: 'Table',
              dataIndex: 'header',
              props: {
                title: '请求头',
                columns: [
                  { title: '名称', dataIndex: 'name' },
                  { title: '描述', dataIndex: 'desc' },
                  { title: '必需', dataIndex: 'required' },
                  { title: '默认值', dataIndex: 'defaultValue' },
                ],
              },
            },
            {
              type: 'Table',
              dataIndex: 'urlParams',
              props: {
                title: 'URL参数',
                columns: [
                  { title: '名称', dataIndex: 'name' },
                  { title: '类型', dataIndex: 'type' },
                  { title: '描述', dataIndex: 'desc' },
                  { title: '必需', dataIndex: 'required' },
                  { title: '默认值', dataIndex: 'defaultValue' },
                ],
              },
            },
            {
              type: 'Table',
              dataIndex: 'body',
              props: {
                title: '请求体',
                columns: [
                  { title: '名称', dataIndex: 'name' },
                  { title: '类型', dataIndex: 'type' },
                  { title: '描述', dataIndex: 'desc' },
                  { title: '必需', dataIndex: 'required' },
                  { title: '默认值', dataIndex: 'defaultValue' },
                ],
              },
            },
            {
              type: 'FileEditor',
              dataIndex: 'example',
              props: {
                title: '展示样例',
              },
            },
            { type: 'BlockTitle', props: { title: '响应信息' } },
            { type: 'Title', props: { title: '响应头: 无', level: 2 } },
          ],
        },
      },
    },
  },
};
