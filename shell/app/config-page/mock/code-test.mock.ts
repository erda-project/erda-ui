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

const mock = [
  {
    value: [50, 22],
    name: 'project1',
    parent: 'xaslksa',
    children: [
      {
        value: [15, 21, 222],
        name: 'app-1',
        parent: 'xaslksa',
      },
      {
        value: [25, 232],
        name: 'app-2',
        parent: 'xaslksa',
        children: [
          {
            value: [30, 23],
            name: 'app-2-1',
            parent: 'xaslksa',
          },
        ],
      },
      {
        value: [65, 2322],
        name: 'app-3',
        parent: 'xaslksa',
        children: [
          {
            value: [40, 23],
            name: 'app-3-1',
            parent: 'xaslksa',
          },
          {
            value: [89, 21],
            name: 'app-3-2',
            parent: 'xaslksa',
          },
        ],
      },
      {
        value: [35, 211],
        name: 'app-4',
        parent: 'xaslksa',
      },
      {
        value: [85, 2121],
        name: 'app-5',
        parent: 'xaslksa',
      },
    ],
  },
  {
    value: [40, 234],
    name: 'project2',
    parent: 'xaslksa',
    children: [
      {
        value: [15, 9],
        name: 'app-22',
        parent: 'xaslksa',
      },
    ],
  },
];

export const mockData = {
  scenario: {
    scenarioKey: 'xx',
    scenarioType: 'xx',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['title', 'tip', 'buttonGroup', 'codeCoverChart', 'treeMapChart'],
        buttonGroup: ['startButton', 'endButton', 'executeHistory'],
        executeHistory: { children: 'executeHistoryButton', content: 'executeHistoryContent' },
        executeHistoryContent: ['executeHistoryFilter', 'executeHistoryTable'],
        codeCoverChart: { extraContent: 'timeSelector' },
        treeMapChart: { extraContent: 'downloadButton' },
      },
    },
    components: {
      page: { type: 'Container', props: { spaceSize: 'middle' } },
      title: { type: 'Title', props: { title: '代码覆盖率统计计划' } },
      buttonGroup: { type: 'RowContainer', props: { contentSetting: 'end' } },
      timeSelector: {
        type: 'DatePicker',
        props: {
          allowClear: false,
          type: 'dateRange',
          size: 'small',
          borderTime: true,
          ranges: {
            一周内: [1633591430244, 1633764230244],
            一月内: [1633363200000, 1634399999999],
          },
        },
        operations: {
          onChange: {
            key: 'changeTime',
            reload: true,
          },
        },
        state: {
          value: [null, null], // 默认一周内？
        },
      },
      codeCoverChart: {
        type: 'Chart',
        props: {
          title: '项目代码覆盖率趋势',
          chartType: 'line',
          option: {
            xAxis: {
              data: ['9/1', '9/2', '9/3', '9/4', '9/5', '9/6', '9/7'],
            },
            yAxis: {
              axisLabel: {
                formatter: '{value}%',
              },
            },
            series: [
              {
                name: '张三',
                data: [
                  { value: 10.2, symbolSize: 24, symbol: 'pin' },
                  { value: 30.2 },
                  { value: 20.2 },
                  { value: 44.2 },
                  { value: 64.2 },
                  { value: 74.2 },
                  50,
                ],
                areaStyle: {
                  opacity: 0.1,
                },
              },
            ],
          },
        },
        operations: {
          click: {
            key: 'selectChartItem',
            reload: true,
            fillMeta: 'data',
            meta: { data: {} },
          },
        },
      },
      startButton: {
        type: 'Button',
        props: {
          text: '开始',
          type: 'primary',
        },
        operations: {
          click: {
            key: 'start',
            disabled: true,
            disabledTip: 'xxxx',
            reload: true,
          },
        },
      },
      endButton: {
        type: 'Button',
        props: {
          text: '结束',
          type: 'primary',
        },
        operations: {
          click: {
            key: 'start',
            disabled: true,
            disabledTip: 'xxxx',
            reload: true,
          },
        },
      },
      executeHistory: {
        type: 'Popover',
        props: {
          placement: 'leftBottom',
          size: 'xl',
          title: '项目代码覆盖率统计执行记录',
          trigger: 'click',
        },
      },
      executeHistoryButton: {
        type: 'Button',
        props: {
          text: '执行记录',
          type: 'primary',
        },
      },
      executeHistoryContent: { type: 'Container' },
      executeHistoryTable: {
        data: {
          list: [
            {
              id: 1,
              status: { renderType: 'textWithBadge', value: '进行中', status: 'processing' },
              starter: '张三',
              reason:
                '我圣诞快乐SDK类似的 圣诞快乐圣诞快乐施蒂利克单身快乐收到了肯定是看电视德生科技的数据库都是的数据库都是跨境电商跨境电商的数据库都是的数据库都是',
              startTime: '2021-10-10',
              ender: '李四',
              endTime: '2021-10-10',
              coverRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              operate: {
                operations: {
                  download: {
                    command: {
                      jumpOut: true,
                      key: 'goto',
                      target: '/api/erda/download',
                    },
                    key: 'download',
                    reload: false,
                    text: '下载报告',
                  },
                },
                renderType: 'tableOperation',
              },
            },
            {
              id: 2,
              status: { renderType: 'textWithBadge', value: '已结束', status: 'success' },
              starter: '张三',

              startTime: '2021-10-10',
              ender: '李四',
              endTime: '2021-10-10',
              coverRate: { renderType: 'progress', value: '50.1', tip: '1/2', status: 'success' },
              operate: {
                operations: {
                  download: {
                    command: {
                      jumpOut: true,
                      key: 'goto',
                      target: '/api/erda/download', // 此处为后端下载接口连接
                    },
                    disabled: true,
                    disabledTip: 'xxx',
                    key: 'download',
                    reload: false,
                    text: '下载报告',
                  },
                },
                renderType: 'tableOperation',
              },
            },
          ],
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          scroll: { x: 1000 },
          columns: [
            {
              dataIndex: 'status',
              title: '状态',
              width: 80,
            },
            {
              dataIndex: 'coverRate',
              title: '当前行覆盖率',
              width: 120,
            },
            {
              dataIndex: 'reason',
              title: '原因',
            },
            {
              dataIndex: 'starter',
              title: '统计开始者',
              width: 100,
            },
            {
              dataIndex: 'startTime',
              title: '开始时间',
              width: 140,
            },
            {
              dataIndex: 'ender',
              title: '统计结束者',
              width: 100,
            },
            {
              dataIndex: 'endTime',
              title: '统计结束时间',
              width: 140,
            },

            {
              dataIndex: 'operate',
              fixed: 'right',
              title: '操作',
              width: 100,
            },
          ],
          rowKey: 'id',
        },
        state: {
          pageNo: 1,
          pageSize: 15,
          total: 2,
        },
        type: 'Table',
      },
      executeHistoryFilter: {
        name: 'filterxxxx',
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
              emptyText: '全部',
              fixed: true,
              haveFilter: true,
              key: 'starter',
              label: '统计开始者',
              options: [
                {
                  label: '张三',
                  value: 680,
                },
                {
                  label: '李四',
                  value: 541,
                },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              haveFilter: true,
              key: 'ender',
              label: '统计结束者',
              options: [
                {
                  label: '张三',
                  value: 680,
                },
                {
                  label: '李四',
                  value: 541,
                },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              key: 'startTime',
              fixed: true,
              label: '开始时间',
              type: 'dateRange',
            },
            {
              emptyText: '全部',
              key: 'endTime',
              fixed: true,
              label: '结束时间',
              type: 'dateRange',
            },
          ],
          values: {},
        },
        type: 'ContractiveFilter',
      },
      tip: {
        type: 'Alert',
        props: {
          type: 'warning',
          showIcon: false,
          message:
            '说明：代码覆盖统计计划是指开启统计和结束统计周期的管理，计划开始后会完全重新统计，在结束之前会持续统计，结束后会生成统计记录和报告',
        },
      },
      downloadButton: {
        type: 'Button',
        operations: {
          click: {
            key: 'downloadReport',
            reload: false,
            command: {
              jumpOut: true,
              key: 'goto',
              target: '/api/erda/download', // 下载链接
            },
          },
        },
        props: {
          text: '下载报告',
          type: 'link',
          size: 'small',
        },
      },
      treeMapChart: {
        type: 'Chart',
        props: {
          title: '2021-10-10 报告详情1',
          style: { height: 600 },
          chartType: 'treemap',
          option: {
            tooltip: {
              show: true,
              formatter: '{@parent}: {@[1]} <br /> {@abc}: {@[2]}',
            },
            series: [
              {
                name: 'sss',
                type: 'treemap',
                roam: 'move',
                leafDepth: 2,
                colorMappingBy: 'value',
                data: mock,
                color: ['#800000', '#F7A76B', '#F7C36B', '#6CB38B', '#8FBC8F'],
                levels: [
                  {
                    colorSaturation: [0.3, 0.6],
                    itemStyle: {
                      borderColor: '#555',
                      borderWidth: 4,
                      gapWidth: 4,
                    },
                  },
                  {
                    colorSaturation: [0.3, 0.6],
                    itemStyle: {
                      borderColorSaturation: 0.7,
                      gapWidth: 2,
                      borderWidth: 2,
                    },
                  },
                  {
                    colorSaturation: [0.3, 0.5],
                    itemStyle: {
                      borderColorSaturation: 0.6,
                      gapWidth: 1,
                    },
                  },
                  {
                    colorSaturation: [0.3, 0.5],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
};

export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'selectItem') {
    // const reData = cloneDeep(data);
    // if (payload.event.operationData.meta.data.data.name === '222') {
    //   return reData;
    // }
  }

  console.log('------', payload);

  return data;
};
