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
        page: [
          'issueTypeContainer',
          'filter',
          'overview',
          'chart1',
          'chart2',
          'chartGroup1',
          'chartGroup2',
          'chart4',
          'chart5',
        ],
        overview: ['overview1', 'overview2', 'overview3', 'overview4'],
        chart1: { filter: 'chart1Filter' },
        issueTypeContainer: ['issueType', 'issueTip'],
        chartGroup1: ['chart1_1', 'chart1_2', 'chart1_3'],
        chartGroup2: ['chart2_1', 'chart2_2'],
      },
    },
    components: {
      page: { type: 'Container' },
      overview: {
        type: 'RowContainer',
        props: { border: true, whiteBg: true, spaceSize: 'huge' },
      },
      overview1: {
        type: 'Text',
        operations: {
          filter123: {
            key: 'filter123',
            reload: true,
          },
        },
        props: {
          renderType: 'linkText',
          value: {
            text: [
              '缺陷总数:',
              {
                text: 123,
                operationKey: 'filter123',
                styleConfig: { fontSize: 18, bold: true },
              },
            ],
          },
        },
      },
      overview2: {
        type: 'Text',
        operations: {
          filter123: {
            key: 'filter123',
            reload: true,
          },
        },
        props: {
          renderType: 'linkText',
          value: {
            text: [
              '缺陷总数:',
              {
                text: 123,
                operationKey: 'filter123',
                styleConfig: { fontSize: 18, bold: true },
              },
            ],
          },
        },
      },
      overview3: {
        type: 'Text',
        operations: {
          filter123: {
            key: 'filter123',
            reload: true,
          },
        },
        props: {
          renderType: 'linkText',
          value: {
            text: [
              '已延期:',
              {
                text: 123,
                operationKey: 'filter123',
                styleConfig: { fontSize: 18, bold: true },
              },
            ],
          },
        },
      },
      overview4: {
        type: 'Text',
        operations: {
          filter123: {
            key: 'filter123',
            reload: true,
          },
        },
        props: {
          renderType: 'linkText',
          value: {
            text: [
              '未指定日期:',
              {
                text: 123,
                operationKey: 'filter123',
                styleConfig: { fontSize: 18, bold: true },
              },
            ],
          },
        },
      },
      issueTypeContainer: { type: 'RowContainer' },
      issueTip: { type: 'Text', props: { value: '提示：以下数据统计于2021-9-23' } },
      filter: {
        name: 'filter',
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
              key: 'iteration',
              label: '迭代',
              options: [
                { label: '1.3', value: '1.3' },
                { label: '1.2', value: '1.2' },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              key: 'member',
              label: '成员',
              options: [
                { label: '张龙', value: '1' },
                { label: '赵虎', value: '2' },
                { label: '王朝', value: '1' },
                { label: '马汉', value: '2' },
              ],
              type: 'select',
            },
          ],
          values: {},
        },
        type: 'ContractiveFilter',
      },
      issueType: {
        type: 'Radio',
        operations: {
          onChange: {
            key: 'changeType',
            reload: true,
          },
        },
        props: {
          buttonStyle: 'solid',
          options: [
            { key: 'total', text: '概览' },
            { key: 'requirement', text: '需求' },
            { key: 'task', text: '任务' },
            { key: 'bug', text: '缺陷' },
          ],
          radioType: 'button',
        },
        state: {
          value: 'total',
        },
      },
      chartGroup1: {
        type: 'Grid',
      },
      chartGroup2: {
        type: 'Grid',
      },
      chart1Filter: {
        name: 'filter',
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
              key: 'type',
              label: '类型',
              options: [
                { label: '优先级', value: '1' },
                { label: '严重程度', value: '2' },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              key: 'value',
              label: '具体值',
              options: [
                { label: '高', value: '1' },
                { label: '中', value: '2' },
                { label: '低', value: '3' },
              ],
              type: 'select',
            },
          ],
          values: {},
        },
        type: 'ContractiveFilter',
      },
      chart1: {
        type: 'Chart',
        props: {
          title: '缺陷新增、关闭、未关闭数走势',
          withFilter: true,
          chartType: 'line',
          option: {
            xAxis: {
              data: ['9/1', '9/2', '9/3', '9/4', '9/5', '9/6', '9/7'],
            },
            series: [
              {
                name: '张三',
                data: [820, 932, 901, 934, 1290, 1330, 1320],
              },
              {
                name: '李四',
                data: [320, 432, 201, 534, 1090, 330, 320],
              },
            ],
          },
        },
        state: {
          conditions: [
            {
              emptyText: '全部',
              fixed: true,
              key: 'iteration',
              label: '迭代',
              options: [
                { label: '1.3', value: '1.3' },
                { label: '1.2', value: '1.2' },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              key: 'member',
              label: '成员',
              options: [
                { label: '张龙', value: '1' },
                { label: '赵虎', value: '2' },
                { label: '王朝', value: '1' },
                { label: '马汉', value: '2' },
              ],
              type: 'select',
            },
          ],
          values: {},
        },
      },
      chart2: {
        type: 'Chart',
        props: {
          title: '迭代缺陷分布',
          chartType: 'bar',
          option: {
            color: ['green', 'blue', 'orange', 'red'],
            legend: {
              data: ['低', '中', '高', '紧急'],
            },
            xAxis: {
              data: ['v1.3', 'v1.2', 'v1.1', 'v1.0', 'v0.9', 'v0.8'],
            },
            series: [
              {
                name: '低',
                stack: 'total',
                label: {
                  formatter: '{a}:{c}',
                },
                data: [1, 2, 3, 4, 5, 6],
              },
              {
                name: '中',
                stack: 'total',
                label: {
                  formatter: '{a}:{c}',
                },
                data: [1, 1, 1, 1, 1, 1],
              },
              {
                name: '高',
                stack: 'total',
                label: {
                  formatter: '{a}:{c}',
                },
                data: [4, 6, null, 6, 6, 6],
              },
              {
                name: '紧急',
                stack: 'total',
                label: {
                  formatter: '{a}:{c}',
                },
                data: [2, 2, 3, 2, 3, 3],
              },
            ],
          },
        },
      },
      chart1_1: {
        type: 'Chart',
        props: {
          chartType: 'pie',
          title: '按缺陷状态',
          option: {
            color: ['green', 'orange', 'blue'],
            // legend: {
            //   data: ['已解决', '未解决', '进行中'],
            // },
            series: [
              {
                name: '缺陷状态',
                data: [
                  { value: 12, name: '已解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 8, name: '未解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 12, name: '进行中', label: { formatter: '{b}\n{d}%({c})' } },
                ],
              },
            ],
          },
        },
      },
      chart1_2: {
        type: 'Chart',
        props: {
          chartType: 'pie',
          title: '按缺陷状态',
          option: {
            color: ['green', 'orange', 'blue'],
            // legend: {
            //   data: ['已解决', '未解决', '进行中'],
            // },
            series: [
              {
                name: '缺陷状态',
                data: [
                  { value: 12, name: '已解决', label: { formatter: '{b}\n{d}%{c}' } },
                  { value: 8, name: '未解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 12, name: '进行中', label: { formatter: '{b}\n{d}%({c})' } },
                ],
              },
            ],
          },
        },
      },
      chart1_3: {
        type: 'Chart',
        props: {
          chartType: 'pie',
          title: '按缺陷状态',
          option: {
            color: ['green', 'orange', 'blue'],
            // legend: {
            //   data: ['已解决', '未解决', '进行中'],
            // },
            series: [
              {
                name: '缺陷状态',
                data: [
                  { value: 12, name: '已解决', label: { formatter: '{b}\n{d}%{c}' } },
                  { value: 8, name: '未解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 12, name: '进行中', label: { formatter: '{b}\n{d}%({c})' } },
                ],
              },
            ],
          },
        },
      },
      chart2_1: {
        type: 'Chart',
        props: {
          chartType: 'pie',
          title: '按缺陷状态',
          option: {
            color: ['green', 'orange', 'blue'],
            // legend: {
            //   data: ['已解决', '未解决', '进行中'],
            // },
            series: [
              {
                name: '缺陷状态',
                data: [
                  { value: 12, name: '已解决', label: { formatter: '{b}\n{d}%{c}' } },
                  { value: 8, name: '未解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 12, name: '进行中', label: { formatter: '{b}\n{d}%({c})' } },
                ],
              },
            ],
          },
        },
      },
      chart2_2: {
        type: 'Chart',
        props: {
          chartType: 'pie',
          title: '按缺陷状态',
          option: {
            color: ['green', 'orange', 'blue'],
            // legend: {
            //   data: ['已解决', '未解决', '进行中'],
            // },
            series: [
              {
                name: '缺陷状态',
                data: [
                  { value: 12, name: '已解决', label: { formatter: '{b}\n{d}%{c}' } },
                  { value: 8, name: '未解决', label: { formatter: '{b}\n{d}%({c})' } },
                  { value: 12, name: '进行中', label: { formatter: '{b}\n{d}%({c})' } },
                ],
              },
            ],
          },
        },
      },
      chart4: {
        type: 'Chart',
        props: {
          title: '按标签分布',
          chartType: 'bar',
          option: {
            // legend: {
            //   data: ['低', '中', '高', '紧急'],
            // },
            yAxis: {
              type: 'category',
              data: ['标签1', '标签2', '标签3', '标签4', '标签5', '标签6'],
            },
            xAxis: {
              type: 'value',
            },
            series: [{ barWidth: '50%', data: [97, 197, 256, 109, 189, 200], label: { show: true } }],
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
