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

export const mockData = {
  scenario: {
    scenarioKey: 'xx',
    scenarioType: 'xx',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['filter', 'workloadTitle', 'workloadChartContainer', 'workloadChart', 'logTable'],
      },
    },
    components: {
      page: { type: 'Container' },
      workloadTitle: {
        type: 'Title',
        props: { title: '工作负载总数: 9982', size: 'small' },
      },
      filter: {
        type: 'ContractiveFilter',
        operations: { filter: { key: 'filter', reload: true } },
        state: {
          conditions: [
            { key: 'q', label: '标题', placeholder: '请输入名称', type: 'input', fixed: true },
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
                { label: 'a', value: 'a' },
                { label: 'b', value: 'b' },
              ],
            },
            {
              key: 'type',
              label: '类型',
              type: 'select',
              fixed: true,
              options: [
                { label: 'a', value: 'a' },
                { label: 'b', value: 'b' },
              ],
            },
          ],
          values: { logLevel: undefined, namespace: undefined },
        },
      },
      workloadChart: {
        type: 'Chart',
        props: {
          option: {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '2%',
              containLabel: true,
            },
            color: ['#6CB38B', '#DE5757'],
            legend: {
              data: ['Active', 'Error'],
            },
            xAxis: {
              type: 'value',
            },
            yAxis: {
              type: 'category',
              data: ['CronJobs', 'Jobs', 'DaemonSets', 'StatefulSets', 'Deployments'],
            },
            series: [
              {
                name: 'Active',
                type: 'bar',
                stack: '总量',
                barWidth: '50%',
                label: {
                  show: true,
                  position: 'insideRight',
                },
                data: [75, 590, 400, 244, 68],
              },
              {
                name: 'Error',
                type: 'bar',
                stack: '总量',
                barWidth: '50%',
                label: {
                  show: true,
                  position: 'insideRight',
                },
                data: [76, 410, 100, 468, 14],
              },
            ],
          },
        },
      },
      logTable: {
        type: 'Table',
        state: {
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: 1,
              status: { renderType: 'text', value: 'Active', styleConfig: { color: 'green' } },
              name: {
                renderType: 'linkText',
                value: 'xxx',
                operations: {
                  click: {
                    command: {
                      key: 'goto',
                      target: 'cmpClustersWorkloadDetail', // 跳转目标待定,
                      state: { params: { workloadId: '1' } },
                      jumpOut: true,
                    },
                    reload: false,
                  },
                },
              },
              namespace: 'addon-apache-zookeeper--a1219eb3120c240dbb6c5c5f5ce69275d',
              type: 'StatefulSet',
              survivalTime: '14天',
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', width: 120, sorter: true },
            { dataIndex: 'name', title: '名称', width: 180, sorter: true },
            { dataIndex: 'namespace', title: '命名空间' },
            { dataIndex: 'type', title: '类型', width: 120 },
            { dataIndex: 'survivalTime', title: '存活时间', width: 100 },
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
