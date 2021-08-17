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
        page: ['filter', 'logTable'],
      },
    },
    components: {
      page: { type: 'Container' },
      filter: {
        type: 'ContractiveFilter',
        operations: { filter: { key: 'filter', reload: true } },
        state: {
          conditions: [
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
              key: 'logLevel',
              label: '日志级别',
              type: 'select',
              fixed: true,
              options: [
                { label: 'L-1', value: 'L-1' },
                { label: 'L-2', value: 'L-2' },
              ],
            },
          ],
          values: { logLevel: undefined, namespace: undefined },
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
              lastUpdate: '2021-10-10 10:00:00',
              level: 'Normal',
              reason: 'CREAT',
              object: 'ingress/addon-nexus-docker-hosted-org-16',
              source: 'nginx-ingress-controller',
              info: 'ingress default/addon-nexus-docker-hosted-org-16',
              count: '100',
              name: 'addon-nexus-docker-hosted-org-16.111111111111',
              namespace: 'default',
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'lastUpdate', title: '最后更新时间', width: 160, sorter: true },
            { dataIndex: 'level', title: '事件级别', width: 100, sorter: true },
            { dataIndex: 'reason', title: '事件原因', width: 100 },
            { dataIndex: 'object', title: '对象', width: 150 },
            { dataIndex: 'source', title: '事件源', width: 120 },
            { dataIndex: 'info', title: '事件信息' },
            { dataIndex: 'count', title: '累计数量', width: 80 },
            { dataIndex: 'name', title: '事件名称', width: 120 },
            { dataIndex: 'namespace', title: '命名空间', width: 80 },
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
