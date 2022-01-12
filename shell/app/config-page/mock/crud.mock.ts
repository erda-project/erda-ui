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

export const enhanceMock = (data: any, payload: any) => {
  console.log('------', payload);
  if (payload?.event?.operation === 'ssa') {
    return data;
  }

  return data;
};
const currentDate = new Date();
const getDate = (day: number) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime();

const makeData = (num: number) => {
  return new Array(num).fill('').map((_, idx) => ({
    key: `1-${idx + 1}`,
    title: `T1-${idx + 1}测试测试测试测试测试测试测试测试测试测试测试`,
    start: getDate(1),
    end: getDate(5),
    isLeaf: true,
    extra: {
      type: 'task',
      user: '张三',
      status: { text: '进行中', status: 'processing' },
    },
  }));
};

export const mockData = {
  scenario: {
    scenarioKey: 'x',
    scenarioType: 'x',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['list'],
        list: { filter: 'filterContainer' },
        filterContainer: {
          left: 'inputFilter',
          right: 'advanceFilter',
        },
      },
    },
    components: {
      page: { type: 'Container' },
      filterContainer: { type: 'LRContainer' },
      advanceFilter: {
        type: 'ConfigurableFilter',
        data: {
          operations: {
            filter: {},
          },
          conditions: [
            {
              key: 'status',
              label: '状态',
              placeholder: '选择状态',
              type: 'select',
              options: [
                { label: '1', value: '1' },
                { label: '2', value: '2' },
              ],
            },
            {
              key: 'app',
              label: '应用',
              placeholder: '选择应用',
              type: 'select',
              options: [
                { label: '1', value: '1' },
                { label: '2', value: '2' },
              ],
            },
            {
              key: 'deployName',
              label: '部署单名称',
              placeholder: '选择部署单名称',
              type: 'select',
              options: [
                { label: '1', value: '1' },
                { label: '2', value: '2' },
              ],
            },
            {
              key: 'deployTime',
              label: '部署时间',
              placeholder: '选择部署时间',
              type: 'dateRange',
            },
          ],
        },
      },
      inputFilter: {
        type: 'ContractiveFilter',
        operations: {
          filter: { key: 'filter', reload: true },
        },
        state: {
          conditions: [
            {
              key: 'title',
              placeholder: '按关键字搜索',
              type: 'input',
            },
          ],
          values: {},
        },
      },
      list: {
        type: 'List',
        version: '2',
        data: {
          operations: {
            changePage: {},
            batchRowsHandle: {
              serverData: {
                options: [
                  { allowedRowIDs: ['1'], icon: 'chongxinqidong', id: '1', text: '重启' }, // allowedRowIDs = null 或不传这个key，表示所有都可选，allowedRowIDs=[]表示当前没有可选择，此处应该可以不传
                  { allowedRowIDs: ['1', '2'], icon: 'remove', id: '2', text: '删除', confirm: 'sss' },
                ],
              },
              clientData: {
                dataRef: {}, // 当前选择的操作对象  { allowedRowIDs: ['1', '2'], icon: 'chongxinqidong', id: '1', text: '重启' },
                selectedOptionsID: '1', // 当前选择的批量操作 id
                selectedRowIDs: ['1', '3'], // 选择的行id
              },
            },
          },
          pageNo: 1,
          pageSize: 10,
          total: 1,
          list: [
            {
              id: '1',
              title: 'erda/develop',
              mainState: { status: 'error' },
              titleState: [
                // 可能存在多个状态
                {
                  status: 'processing',
                  text: '研发',
                },
                {
                  status: 'success',
                  text: '部署中',
                  suffixIcon: 'right',
                  operations: {
                    click: {
                      skipRender: true,
                      serverData: {
                        logId: '313',
                        appId: '87',
                      },
                    },
                  },
                },
              ],
              kvInfos: [
                {
                  key: '应用',
                  value: 'erda',
                },
                {
                  key: '部署单',
                  value: '212323',
                  status: 'success', // red / blue
                  tip: 'xxx',
                },
                {
                  key: '部署人',
                  value: '张三',
                },
                {
                  key: '运行时间',
                  value: '23天',
                },
                {
                  key: '最近部署',
                  value: '2021/09/09 23:23:23',
                },
              ],
              moreOperations: [
                {
                  id: 3,
                  icon: 'shuaxin',
                  key: 'update',
                  text: '更新',
                  operations: {
                    click: {
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
                {
                  id: 2,
                  icon: 'chongxinqidong',
                  key: 'restart',
                  text: '重启',
                  operations: {
                    click: {
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
                {
                  id: 1,
                  icon: 'remove',
                  key: 'delete',
                  text: '删除',
                  operations: {
                    click: {
                      confirm: '确认删除？',
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
              ],
              operations: {
                clickGoto: {
                  serverData: {
                    target: 'runtimeDetailRoot',
                    params: { projectId: '1', appId: '2', runtimeId: '2' },
                  },
                },
              },
            },
            {
              id: '2',
              title: 'erda/develop',
              selectable: true,
              titleState: [
                // 可能存在多个状态
                {
                  status: 'processing',
                  text: '研发',
                },
                {
                  status: 'success',
                  text: '部署',
                },
              ],
              kvInfos: [
                {
                  key: '应用',
                  value: 'erda',
                },
                {
                  key: '部署单',
                  value: '212323',
                  status: 'success', // red / blue
                  tip: 'xxx',
                },
                {
                  key: '部署人',
                  value: '张三',
                },
                {
                  key: '运行时间',
                  value: '23天',
                },
                {
                  key: '最近部署',
                  value: '2021/09/09 23:23:23',
                },
              ],
              moreOperations: [
                {
                  id: 3,
                  icon: 'shuaxin',
                  key: 'update',
                  text: '更新',
                  operations: {
                    click: {
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
                {
                  id: 2,
                  icon: 'chongxinqidong',
                  key: 'restart',
                  text: '重启',
                  operations: {
                    click: {
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
                {
                  id: 1,
                  icon: 'remove',
                  key: 'delete',
                  text: '删除',
                  operations: {
                    click: {
                      confirm: '确认删除？',
                      clientData: {
                        selectedRowID: '1',
                        dataRef: { id: 1, icon: 'remove', key: 'delete', text: '删除' },
                      },
                    },
                  },
                },
              ],
              operations: {
                clickGoto: {
                  serverData: {
                    target: 'runtimeDetailRoot',
                    params: { projectId: '1', appId: '2', runtimeId: '2' },
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
};
