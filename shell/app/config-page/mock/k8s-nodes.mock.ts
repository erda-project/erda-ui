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

// TODO: will delete after api service is ready
export const mockData = {
  scenario: {
    scenarioKey: 'mock',
    scenarioType: 'mock',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['filter', 'charts', 'tableTabsContainer', 'addLabelModal'],
        charts: ['cpuChart', 'memChart', 'podChart'],
        tableTabsContainer: ['tableTabs'],
        tableTabs: {
          children: ['cpuTable', 'memTable', 'podTable'],
        },
      },
    },
    components: {
      page: { type: 'Container' },
      tableTabsContainer: { type: 'Container', props: { whiteBg: true } },
      charts: { type: 'RowContainer', props: { contentSetting: 'between', spaceSize: 'big' } },
      cpuChart: {
        type: 'Chart',
        props: {
          option: {
            color: ['#DE5757', '#F7A76B', '#6CB38B'],
            legend: {
              data: ['不可分配', '已分配', '剩余分配'],
            },
            grid: {
              // left: '3%',
              // right: '4%',
              bottom: 0,
              top: 0,
              containLabel: true,
            },
            series: [
              {
                type: 'pie',
                radius: '60%',
                data: [
                  { value: 10, name: '不可分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 20, name: '已分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 30, name: '剩余分配', label: { formatter: '{d}%\n{c}/60' } },
                ],
              },
            ],
          },
          style: { flex: 1 },
        },
      },
      memChart: {
        type: 'Chart',
        props: {
          option: {
            color: ['#DE5757', '#F7A76B', '#6CB38B'],
            legend: {
              data: ['不可分配', '已分配', '剩余分配'],
            },
            grid: {
              // left: '3%',
              // right: '4%',
              bottom: 0,
              top: 0,
              containLabel: true,
            },
            series: [
              {
                type: 'pie',
                radius: '60%',
                data: [
                  { value: 10, name: '不可分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 20, name: '已分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 30, name: '剩余分配', label: { formatter: '{d}%\n{c}/60' } },
                ],
              },
            ],
          },
          style: { flex: 1 },
        },
      },
      podChart: {
        type: 'Chart',
        props: {
          option: {
            color: ['#DE5757', '#F7A76B', '#6CB38B'],
            legend: {
              data: ['不可分配', '已分配', '剩余分配'],
            },
            grid: {
              // left: '3%',
              // right: '4%',
              bottom: 0,
              top: 0,
              containLabel: true,
            },
            series: [
              {
                type: 'pie',
                radius: '60%',
                data: [
                  { value: 10, name: '不可分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 20, name: '已分配', label: { formatter: '{d}%\n{c}/60' } },
                  { value: 30, name: '剩余分配', label: { formatter: '{d}%\n{c}/60' } },
                ],
              },
            ],
          },
          style: { flex: 1 },
        },
      },
      filter: {
        type: 'TiledFilter',
        operations: { filter: { key: 'filter', reload: true } },
        state: {
          values: { k1: 'TEST', k2: 'b', k3: ['a1', 'b'], k4: 'sss' },
        },
        props: {
          labelWidth: 40,
          fields: [
            {
              key: 'k1',
              label: '环境',
              type: 'select',
              options: [
                { label: '开发环境', value: 'DEV' },
                { label: '测试环境', value: 'TEST' },
                { label: '预发环境', value: 'STAGING' },
                { label: '生产环境', value: 'PROD' },
              ],
            },
            {
              key: 'k2',
              label: '服务',
              type: 'select',
              options: [
                { label: '有状态服务', value: 'a' },
                { label: '无状态服务', value: 'b' },
              ],
            },
            {
              key: 'k3',
              label: '构建',
              multiple: true,
              type: 'select',
              options: [
                { label: 'pack-job1', value: 'a1' },
                { label: 'pack-job2', value: 'b2' },
                { label: 'pack-job3', value: 'a3' },
                { label: 'pack-job4', value: 'b4' },
                { label: 'pack-job5', value: 'a5' },
                { label: 'pack-job6', value: 'b6' },
                { label: 'pack-job7', value: 'a7' },
                { label: 'pack-job8', value: 'b8' },
                { label: 'pack-job10', value: 'a9' },
                { label: 'pack-job11', value: 'b' },
              ],
            },
            { key: 'k4', type: 'input', placeholder: '请输入' },
          ],
        },
      },
      tableTabs: {
        type: 'Tabs',
        props: {
          tabMenu: [
            { key: 'cpu', name: 'cpu分析' },
            { key: 'mem', name: '内存分析' },
            { key: 'pod', name: 'Pod分析' },
          ],
        },
        state: { activeKey: 'cpu' },
        operations: {
          onChange: { key: 'changeTab', reload: true, fillMeta: 'activeKey', meta: {} },
        },
      },
      cpuTable: {
        type: 'Table',
        state: {
          selectedRowKeys: [],
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'textWithBadge', value: '正常', status: 'success' }, // success | processing | default | error | warning
              node: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      renderType: 'linkText',
                      value: '10.10.0.1',
                      operations: {
                        click: {
                          key: 'gotoNodeDetail',
                          command: {
                            key: 'goto',
                            state: { params: { nodeId: '1' } },
                            target: 'cmpClustersNodeDetail',
                            jumpOut: true,
                          },
                          text: 'node详情',
                          reload: false,
                        },
                      },
                      reload: false,
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      value: [
                        { label: 'a1=aaaa1', group: '测试分组1' },
                        { label: 'a2=aaaa2', group: '测试分组1' },
                        { label: 'a3=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a5=aaaa2', group: '测试分组1' },
                        { label: 'a6=aaaa2', group: '测试分组1' },
                        { label: 'a7=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a8=aaaa2', group: '测试分组1' },
                        { label: 'a9=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a10=aaaa2', group: '测试分组1' },
                        { label: 'a11=aaaa2', group: '测试分组1' },
                        { label: 'a12=aaaaaaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a13=aaaa2', group: '测试分组1' },
                        { label: 'b1=bbbb1', group: '特殊分组' },
                        { label: 'b2=bbbb2', group: '特殊分组' },
                        { label: 'c=cccccccccc', group: 'xxxx' },
                      ],
                      operations: {
                        add: {
                          key: 'addLabel',
                          reload: false,
                          command: {
                            key: 'set',
                            state: { visible: true, formData: { recordId: '1' } },
                            target: 'addLabelModal',
                          },
                        },
                        delete: {
                          key: 'deleteLabel',
                          reload: true,
                          fillMeta: 'abc',
                          meta: {
                            recordId: '1',
                            abc: { label: '' },
                          },
                        },
                      },
                    },
                  ],
                ],
              },
              ip: '196.128.100.100',
              role: 'lb',
              version: 'V1.0.2',
              cpuDistribute: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' }, // success normal error danger warning
              cpuUsed: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              cpuUsedRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  gotoPod: {
                    key: 'gotoPod',
                    command: {
                      key: 'goto',
                      state: { query: { nodeId: '1' } },
                      target: 'cmpClustersPods',
                      jumpOut: true,
                    },

                    text: '查看pod',
                    reload: false,
                  },
                },
              },
              batchOperations: ['delete', 'freeze'],
            },
            {
              id: '2',
              status: { renderType: 'textWithBadge', value: '正常', status: 'success' }, // success | processing | default | error | warning
              node: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      renderType: 'linkText',
                      value: '10.10.0.1',
                      operations: { click: { key: 'goto', target: 'orgRoot' } },
                      reload: false,
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      value: [
                        { label: 'a1=aaaa1', group: '测试分组1' },
                        { label: 'a2=aaaa2', group: '测试分组1' },
                        { label: 'a3=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a5=aaaa2', group: '测试分组1' },
                        { label: 'a6=aaaa2', group: '测试分组1' },
                        { label: 'a7=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a8=aaaa2', group: '测试分组1' },
                        { label: 'a9=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a10=aaaa2', group: '测试分组1' },
                        { label: 'a11=aaaa2', group: '测试分组1' },
                        { label: 'a12=aaaaaaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a13=aaaa2', group: '测试分组1' },
                        { label: 'b1=bbbb1', group: '特殊分组' },
                        { label: 'b2=bbbb2', group: '特殊分组' },
                        { label: 'c=cccccccccc', group: 'xxxx' },
                      ],
                      operations: {
                        add: {
                          key: 'addLabel',
                          reload: false,
                          command: {
                            key: 'set',
                            state: { visible: true, formData: { recordId: '1' } },
                            target: 'addLabelModal',
                          },
                        },
                        delete: {
                          key: 'deleteLabel',
                          reload: true,
                          fillMeta: 'abc',
                          meta: {
                            recordId: '1',
                            abc: { label: '' },
                          },
                        },
                      },
                    },
                  ],
                ],
              },
              ip: '196.128.100.100',
              role: 'lb',
              version: 'V1.0.2',
              cpuDistribute: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' }, // success normal error danger warning
              cpuUsed: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              cpuUsedRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  gotoPod: {
                    key: 'gotoPod',
                    command: { key: 'goto', target: 'dopRoot', jumpOut: true },
                    text: '查看pod',
                    reload: false,
                  },
                },
              },
              batchOperations: ['unfreeze', 'freeze'],
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          batchOperations: ['delete', 'freeze', 'unfreeze'],
          scroll: { x: 1200 },
          columns: [
            { dataIndex: 'status', title: '状态', sorter: true, width: 80, fixed: 'left' },
            { dataIndex: 'node', title: '节点', sorter: true },
            { dataIndex: 'ip', title: 'IP', width: 120 },
            { dataIndex: 'role', title: '角色', width: 120 },
            { dataIndex: 'version', title: '版本', width: 100 },
            { dataIndex: 'cpuDistribute', title: 'cpu分配率', width: 120 },
            { dataIndex: 'cpuUsed', title: 'cpu使用率', width: 120 },
            { dataIndex: 'cpuUsedRate', title: 'cpu分配使用率', width: 120 },
            { dataIndex: 'operate', title: '操作', width: 120, fixed: 'right' },
          ],
          selectable: true,
          rowKey: 'id',
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changeSort: {
            key: 'changeSort',
            reload: true,
          },
          delete: {
            key: 'delete',
            text: '删除',
            reload: true,
          },
          freeze: {
            key: 'freeze',
            text: '冻结',
            reload: true,
            showIndex: 1,
          },
          unfreeze: {
            key: 'unfreeze',
            text: '解冻',
            reload: true,
            showIndex: 3,
          },
        },
      },
      memTable: {
        type: 'Table',
        state: {
          selectedRowKeys: [],
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'textWithBadge', value: '正常', status: 'success' }, // success | processing | default | error | warning
              node: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      renderType: 'linkText',
                      value: '10.10.0.1',
                      operations: { click: { key: 'goto', target: 'orgRoot' } },
                      reload: false,
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      value: [
                        { label: 'a1=aaaa1', group: '测试分组1' },
                        { label: 'a2=aaaa2', group: '测试分组1' },
                        { label: 'a3=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a5=aaaa2', group: '测试分组1' },
                        { label: 'a6=aaaa2', group: '测试分组1' },
                        { label: 'a7=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a8=aaaa2', group: '测试分组1' },
                        { label: 'a9=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a10=aaaa2', group: '测试分组1' },
                        { label: 'a11=aaaa2', group: '测试分组1' },
                        { label: 'a12=aaaaaaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a13=aaaa2', group: '测试分组1' },
                        { label: 'b1=bbbb1', group: '特殊分组' },
                        { label: 'b2=bbbb2', group: '特殊分组' },
                        { label: 'c=cccccccccc', group: 'xxxx' },
                      ],
                      operations: {
                        add: {
                          key: 'addLabel',
                          reload: false,
                          command: {
                            key: 'set',
                            state: { visible: true, formData: { recordId: '1' } },
                            target: 'addLabelModal',
                          },
                        },
                        delete: {
                          key: 'deleteLabel',
                          reload: true,
                          fillMeta: 'abc',
                          meta: {
                            recordId: '1',
                            abc: { label: '' },
                          },
                        },
                      },
                    },
                  ],
                ],
              },
              ip: '196.128.100.100',
              role: 'lb',
              version: 'V1.0.2',
              memDistribute: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' }, // success normal error danger warning
              memUsed: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              memUsedRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', sorter: true, width: 100 },
            { dataIndex: 'node', title: '节点', sorter: true, width: 240 },
            { dataIndex: 'ip', title: 'IP', width: 120 },
            { dataIndex: 'role', title: '角色', width: 120 },
            { dataIndex: 'version', title: '版本', width: 100 },
            { dataIndex: 'memDistribute', title: '内存分配率', width: 120 },
            { dataIndex: 'memUsed', title: '内存使用率', width: 120 },
            { dataIndex: 'memUsedRate', title: '内存分配使用率', width: 120 },
          ],
          selectable: true,
          rowKey: 'id',
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changeSort: {
            key: 'changeSort',
            reload: true,
          },
        },
      },
      podTable: {
        type: 'Table',
        state: {
          selectedRowKeys: [],
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'textWithBadge', value: '正常', status: 'success' }, // success | processing | default | error | warning
              node: {
                renderType: 'multiple',
                renders: [
                  [
                    {
                      renderType: 'linkText',
                      value: '10.10.0.1',
                      operations: { click: { key: 'goto', target: 'orgRoot' } },
                      reload: false,
                    },
                  ],
                  [
                    {
                      renderType: 'tagsRow',
                      value: [
                        { label: 'a1=aaaa1', group: '测试分组1' },
                        { label: 'a2=aaaa2', group: '测试分组1' },
                        { label: 'a3=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a5=aaaa2', group: '测试分组1' },
                        { label: 'a6=aaaa2', group: '测试分组1' },
                        { label: 'a7=aaaaaaaa2', group: '测试分组1' },
                        { label: 'a8=aaaa2', group: '测试分组1' },
                        { label: 'a9=aaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a10=aaaa2', group: '测试分组1' },
                        { label: 'a11=aaaa2', group: '测试分组1' },
                        { label: 'a12=aaaaaaaaaaaaaaaa2', group: '测试分组1' },
                        { label: 'a13=aaaa2', group: '测试分组1' },
                        { label: 'b1=bbbb1', group: '特殊分组' },
                        { label: 'b2=bbbb2', group: '特殊分组' },
                        { label: 'c=cccccccccc', group: 'xxxx' },
                      ],
                      operations: {
                        add: {
                          key: 'addLabel',
                          reload: false,
                          command: {
                            key: 'set',
                            state: { visible: true, formData: { recordId: '1' } },
                            target: 'addLabelModal',
                          },
                        },
                        delete: {
                          key: 'deleteLabel',
                          reload: true,
                          fillMeta: 'abc',
                          meta: {
                            recordId: '1',
                            abc: { label: '' },
                          },
                        },
                      },
                    },
                  ],
                ],
              },
              ip: '196.128.100.100',
              role: 'lb',
              version: 'V1.0.2',
              podUsedRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', sorter: true, width: 100 },
            { dataIndex: 'node', title: '节点', sorter: true, width: 240 },
            { dataIndex: 'ip', title: 'IP', width: 120 },
            { dataIndex: 'role', title: '角色', width: 120 },
            { dataIndex: 'version', title: '版本', width: 100 },
            { dataIndex: 'podUsedRate', title: 'pod使用率', width: 120 },
          ],
          selectable: true,
          rowKey: 'id',
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changeSort: {
            key: 'changeSort',
            reload: true,
          },
        },
      },
      addLabelModal: {
        type: 'FormModal',
        props: {
          title: '添加标签',
          fields: [
            {
              label: '分组',
              component: 'select',
              required: true,
              key: 'labelGroup',
              componentProps: {
                options: [
                  { name: '分组1', value: 'g1' },
                  { name: '分组2', value: 'g2' },
                  { name: '自定义分组', value: 'custom' },
                ],
              },
            },
            {
              label: '标签',
              component: 'select',
              required: true,
              key: 'g1',
              componentProps: {
                options: [
                  { name: 'g1_1', value: 'g1_1' },
                  { name: 'g1_2', value: 'g1_2' },
                  { name: 'g1_3', value: 'g1_3' },
                ],
              },
              removeWhen: [[{ field: 'labelGroup', operator: '!=', value: 'g1' }]],
            },
            {
              label: '标签',
              component: 'select',
              required: true,
              key: 'label_g2',
              componentProps: {
                options: [
                  { name: 'g2_1', value: 'g2_1' },
                  { name: 'g2_2', value: 'g2_2' },
                  { name: 'g2_3', value: 'g2_3' },
                ],
              },
              removeWhen: [[{ field: 'labelGroup', operator: '!=', value: 'g2' }]],
            },
            {
              component: 'input',
              key: 'label_custom',
              label: '标签',
              required: true,
              rules: [
                {
                  msg: '格式：ss',
                  pattern: '/^[.a-z\\u4e00-\\u9fa5A-Z0-9_-\\s]*$/',
                },
              ],
              removeWhen: [[{ field: 'labelGroup', operator: '!=', value: 'custom' }]],
            },
          ],
        },
        state: {
          visible: false,
          formData: null,
        },
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
      },
    },
  },
};

export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'changeTab') {
  }

  console.log('------', payload);

  return data;
};
