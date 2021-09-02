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
    scenarioKey: 'xx',
    scenarioType: 'xx',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['filter', 'podTitle', 'podDistribution', 'tableTabs'],
        tableTabs: ['cpuTable', 'memTable'],
      },
    },
    components: {
      page: { type: 'Container' },
      podTitle: {
        type: 'Title',
        props: { title: 'Pod总数: 9982', size: 'small' },
      },
      podDistribution: {
        type: 'LinearDistribution',
        data: {
          list: [
            { value: 10, label: 'Running  10', color: 'green', tip: '10/100' },
            { value: 20, label: 'a  20', color: 'red', tip: '20/100' },
          ],
          total: 100,
        },
      },
      filter: {
        type: 'ContractiveFilter',
        operations: {
          filter: { key: 'filter', reload: true },
          saveFilter: { key: 'saveMyFilter', reload: true, fillMeta: 'myFilter', meta: {} },
        },
        state: {
          conditions: [
            { key: 'q', label: '标题', placeholder: '输入pod名称或IP', type: 'input', fixed: true },
            {
              key: 'myFilter',
              label: '我的筛选',
              type: 'select',
              haveFilter: true,
              split: true,
              customProps: { mode: 'single' },
              fixed: true,
              quickAdd: {
                operationKey: 'saveFilter',
                show: true,
              },
              options: [
                { label: '我处理的缺陷、需求、任务', value: 'p1' },
                { label: '不是我处理的缺陷、需求、任务', value: 'p2' },
              ],
            },
            {
              key: 'namespace',
              label: '命名空间',
              type: 'select',
              fixed: true,
              options: [
                {
                  label: '项目',
                  value: 'x',
                  children: [
                    { label: 'p1', value: 'p1' },
                    { label: 'p2', value: 'p2' },
                    { label: 'p3', value: 'p3' },
                  ],
                },
                {
                  label: '扩展组件',
                  value: 'x',
                  children: [
                    { label: 'k1', value: 'k1' },
                    { label: 'k2', value: 'k2' },
                    { label: 'k3', value: 'k3' },
                  ],
                },
              ],
            },
            {
              key: 'status',
              label: '状态',
              type: 'select',
              fixed: true,
              options: [
                { label: 'A-1', value: 'a-1' },
                { label: 'A-2', value: 'a-2' },
              ],
            },
            {
              key: 'node',
              label: '节点',
              type: 'select',
              fixed: true,
              options: [
                { label: 'node1', value: 'node1' },
                { label: 'node2', value: 'node2' },
              ],
            },
          ],
          values: { q: undefined, namespace: undefined, status: undefined },
        },
      },
      tableTabs: {
        type: 'Tabs',
        props: {
          tabMenu: [
            { key: 'cpu', name: 'cpu分析' },
            { key: 'mem', name: '内存分析' },
          ],
        },
        operations: {
          onChange: {
            key: 'changeTab',
            reload: true,
          },
        },
        state: {
          activeKey: 'cpu',
        },
      },
      cpuTable: {
        type: 'Table',
        state: {
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'text', value: '正常', styleConfig: { color: 'green' } },
              name: {
                renderType: 'linkText',
                value: 'apache-zookeeper-0',
                operations: {
                  click: {
                    key: 'gotoPodDetail',
                    command: {
                      key: 'goto',
                      state: { params: { podId: '1' } },
                      target: 'cmpClustersPodDetail',
                      jumpOut: true,
                    },
                    reload: false,
                  },
                },
              },
              namespace: 'addon-apache-zookeeper--a1219eb3120c240dbb6c5c5f5ce69275d',
              ip: '192.168.100.100',
              cpuUsed: '100m',
              cpuPercent: {
                renderType: 'progress',
                value: '50.1',
                tip: '1/2',
                status: 'success', // success normal error danger warning
              },
              cpuLimit: '10000m',
              ready: '1/1',
            },
            {
              id: '1',
              status: { renderType: 'text', value: 'xxx', styleConfig: { color: 'red' } },
              name: {
                renderType: 'linkText',
                value: 'apache-zookeeper-1',
                operations: {
                  click: {
                    command: {
                      key: 'goto',
                      target: 'dopRoot',
                      jumpOut: true,
                    },
                    reload: false,
                  },
                },
              },
              ip: '192.168.100.100',
              namespace: 'addon-apache-zookeeper--a1219eb3120c240dbb6c5c5f5ce69275d',
              cpuUsed: '100m',
              cpuPercent: {
                renderType: 'progress',
                value: '60',
                tip: '30/100',
                status: 'warning', // success normal error danger warning
              },
              cpuLimit: '10000m',
              ready: '1/1',
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', width: 120, sorter: true },
            { dataIndex: 'name', title: '名称', width: 180, sorter: true },
            { dataIndex: 'namespace', title: '命名空间' },
            { dataIndex: 'ip', title: 'IP', width: 120 },
            { dataIndex: 'cpuUsed', title: 'cpu分配量', width: 120 },
            { dataIndex: 'cpuLimit', title: 'cpu限制量', width: 120 },
            { dataIndex: 'cpuPercent', title: 'cpu水位', width: 120 },
            { dataIndex: 'ready', title: 'Ready', width: 80 },
          ],
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
      memTable: {
        type: 'Table',
        state: {
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'text', value: '正常', styleConfig: { color: 'green' } },
              name: {
                renderType: 'linkText',
                value: 'apache-zookeeper-0',
                operations: {
                  click: {
                    command: {
                      key: 'goto',
                      target: 'dopRoot',
                      jumpOut: true,
                    },
                    reload: false,
                  },
                },
              },
              namespace: 'addon-apache-zookeeper--a1219eb3120c240dbb6c5c5f5ce69275d',
              ip: '192.168.100.100',
              memUsed: '100m',
              memPercent: {
                renderType: 'progress',
                value: '50.1',
                tip: '1/2',
                status: 'success', // success normal error danger warning
              },
              memLimit: '10000m',
              ready: '1/1',
            },
            {
              id: '1',
              status: { renderType: 'text', value: 'xxx', styleConfig: { color: 'red' } },
              name: {
                renderType: 'linkText',
                value: 'apache-zookeeper-1',
                operations: {
                  click: {
                    command: {
                      key: 'goto',
                      target: 'dopRoot',
                      jumpOut: true,
                    },
                    reload: false,
                  },
                },
              },
              ip: '192.168.100.100',
              namespace: 'addon-apache-zookeeper--a1219eb3120c240dbb6c5c5f5ce69275d',
              memUsed: '100m',
              memPercent: {
                renderType: 'progress',
                value: '60',
                tip: '30/100',
                status: 'warning', // success normal error danger warning
              },
              memLimit: '10000m',
              ready: '1/1',
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', width: 120, sorter: true },
            { dataIndex: 'name', title: '名称', width: 180, sorter: true },
            { dataIndex: 'namespace', title: '命名空间' },
            { dataIndex: 'ip', title: 'IP', width: 120 },
            { dataIndex: 'memUsed', title: '内存分配量', width: 120 },
            { dataIndex: 'memLimit', title: '内存限制量', width: 120 },
            { dataIndex: 'memPercent', title: '内存水位', width: 120 },
            { dataIndex: 'ready', title: 'Ready', width: 80 },
          ],
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
    },
  },
};

export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'changeTab') {
  }

  console.log('------', payload);

  return data;
};
