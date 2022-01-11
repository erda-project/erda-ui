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
    scenarioType: 'pipeline-manage',
    scenarioKey: 'pipeline-manage',
  },
  protocol: {
    hierarchy: {
      root: 'myPage',
      structure: {
        myPage: ['PageHeader', 'tabsTable'],
        PageHeader: {
          left: 'pipelineTabs',
          right: 'addPipelineBtn',
        },
        tabsTable: {
          slot: 'filterContainer',
          table: 'pipelineTable',
        },
        filterContainer: {
          left: 'inputFilter',
          right: 'customFilter',
        },
      },
    },
    components: {
      myPage: {
        type: 'Container',
        name: 'myPage',
      },
      PageHeader: {
        type: 'LRContainer',
        name: 'rightPageHeader',
      },
      pipelineTabs: {
        type: 'RadioTabs',
        data: {
          options: [
            {
              label: '我的流水线(3)',
              value: 'mine',
            },
            {
              label: '星标流水线(3)',
              value: 'star',
            },
            {
              label: '全部流水线(3)',
              value: 'all',
            },
          ],
        },
        operations: {
          onChange: {
            fillMeta: '',
            key: 'changeViewType',
            meta: {
              activeKey: '',
            },
            reload: true,
          },
        },
        state: {
          value: 'mine',
        },
      },
      addPipelineBtn: {
        type: 'Button',
        name: 'addPipelineBtn',
        props: {
          prefixIcon: 'add',
          text: '创建流水线',
          type: 'primary',
        },
      },
      tabsTable: {
        name: 'tabsTable',
        type: 'ComposeTable',
      },
      filterContainer: {
        type: 'LRContainer',
        name: 'filterContainer',
      },
      pipelineTable: {
        type: 'Table',
        name: 'pipelineTable',
        data: {
          list: [
            {
              name: 'test',
              status: {
                renderType: 'textWithBadge',
                value: '成功',
                status: 'success',
                showDot: false,
              },
              time: '10s',
              app: '这里是应用名称',
              branch: 'feature/Erda-docs',
              assignee: {
                renderType: 'userAvatar',
                value: '1',
              },
              startTime: '2021/09/09 11:09:34',
              operations: {
                operations: {
                  star: {
                    key: 'star',
                    meta: {
                      id: 'pipelineId',
                    },
                    reload: true,
                    successMsg: '标星成功',
                    text: '标星',
                    icon: 'star',
                  },
                  start: {
                    key: 'start',
                    meta: {
                      id: 'pipelineId',
                    },
                    reload: true,
                    text: '执行',
                    icon: 'play',
                  },
                  restart: {
                    key: 'restart',
                    meta: {
                      id: 'pipelineId',
                    },
                    reload: true,
                    text: '从失败处执行',
                    icon: 'shuaxin',
                  },
                  edit: {
                    key: 'edit',
                    meta: {
                      id: 'pipelineId',
                    },
                    reload: true,
                    text: '编辑',
                    icon: 'correction',
                  },
                  startTiming: {
                    key: 'startTiming',
                    meta: {
                      id: 'pipelineId',
                    },
                    reload: true,
                    text: '开始定时',
                    icon: 'shijian',
                  },
                  delete: {
                    command: {},
                    confirm: '确认删除？',
                    disabledTip: '权限不足',
                    key: 'delete',
                    meta: {
                      id: '24c9da6ceb444023999373a38e5227ed',
                    },
                    reload: true,
                    successMsg: '制品删除成功',
                    text: '删除',
                    icon: 'delete1',
                  },
                },
                renderType: 'tableOperation',
              },
              batchOperations: ['start'],
            },
          ],
        },
        props: {
          batchOperations: ['start'],
          selectable: true,
          columns: [
            {
              dataIndex: 'name',
              title: '流水线名称',
            },
            {
              dataIndex: 'status',
              title: '状态',
            },
            {
              dataIndex: 'time',
              title: '耗时',
            },
            {
              dataIndex: 'app',
              title: '应用',
            },
            {
              dataIndex: 'branch',
              title: '分支',
            },
            {
              dataIndex: 'assignee',
              title: '执行人',
            },
            {
              dataIndex: 'startTime',
              title: '开始时间',
              sorter: true,
            },
            {
              dataIndex: 'operations',
              title: '操作',
            },
          ],
          rowKey: 'id',
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
          start: {
            confirm: '',
            key: 'start',
            reload: true,
            text: '执行',
          },
        },
      },
      inputFilter: {
        name: 'inputFilter',
        type: 'ContractiveFilter',
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
        props: {
          delay: 1000,
        },
        state: {
          conditions: [
            {
              key: 'appName',
              placeholder: '搜索流水线名称',
              type: 'input',
            },
          ],
        },
      },
      customFilter: {
        data: {
          conditions: [
            {
              key: 'status',
              label: '状态',
              options: [
                {
                  label: '失败',
                  value: 1,
                },
                {
                  label: '成功',
                  value: 2,
                },
              ],
              placeholder: '请选择状态',
              type: 'select',
            },
            {
              key: 'applicationIds',
              label: '应用',
              options: [
                {
                  label: 'base-api-design',
                  value: 1149,
                },
              ],
              placeholder: '请选择应用',
              type: 'select',
            },
            {
              key: 'assignee',
              label: '执行者',
              options: [
                {
                  label: 'admin',
                  value: '1',
                },
                {
                  label: 'chenzhongrun',
                  value: '1000001',
                },
                {
                  label: '王迎春1',
                  value: '1000004',
                },
                {
                  label: 'erda 前端',
                  value: '1000175',
                },
                {
                  label: '陆秋燕',
                  value: '1000299',
                },
                {
                  label: '自动化测试执行',
                  value: '1000330',
                },
                {
                  label: 'zc',
                  value: '1000346',
                },
                {
                  label: 'ch',
                  value: '1000383',
                },
                {
                  label: '前程似锦',
                  value: '1001457',
                },
                {
                  label: 'lihui',
                  value: '1003074',
                },
              ],
              placeholder: '请选择执行者',
              type: 'select',
            },
            {
              key: 'startTime',
              label: '开始时间',
              type: 'dateRange',
            },
            {
              key: 'creatorIDs',
              label: '创建者',
              options: [
                {
                  label: 'admin',
                  value: '1',
                },
                {
                  label: 'chenzhongrun',
                  value: '1000001',
                },
                {
                  label: '王迎春1',
                  value: '1000004',
                },
                {
                  label: 'erda 前端',
                  value: '1000175',
                },
                {
                  label: '陆秋燕',
                  value: '1000299',
                },
                {
                  label: '自动化测试执行',
                  value: '1000330',
                },
                {
                  label: 'zc',
                  value: '1000346',
                },
                {
                  label: 'ch',
                  value: '1000383',
                },
                {
                  label: '前程似锦',
                  value: '1001457',
                },
                {
                  label: 'lihui',
                  value: '1003074',
                },
              ],
              placeholder: '请选择创建者',
              type: 'select',
            },
            {
              key: 'createdAtStartEnd',
              label: '创建日期',
              type: 'dateRange',
            },
          ],
          filterSet: [
            {
              id: 'all',
              isPreset: true,
              label: '全部打开',
            },
            {
              id: 'fae7f9fe-92d6-4001-827c-3a4bb79554db',
              label: 'test',
              values: {
                status: [1],
              },
            },
          ],
        },
        name: 'releaseFilter',
        state: {
          values: {},
        },
        type: 'ConfigurableFilter',
      },
    },
  },
};
