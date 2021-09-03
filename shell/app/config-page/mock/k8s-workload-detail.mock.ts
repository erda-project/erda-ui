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
        page: ['header', 'workloadInfoTitle', 'workloadInfo', 'workloadTableTitle', 'workloadTable'],
        header: ['workloadTitle', 'workloadStatus'],
      },
    },
    components: {
      page: { type: 'Container' },
      header: { type: 'RowContainer' },
      workloadStatus: {
        type: 'Text',
        props: { value: 'Active', styleConfig: { color: 'green' } },
      },
      workloadTitle: {
        type: 'Title',
        props: {
          title: 'Deployment: nginx-1.0.23.23',
        },
      },

      workloadTableTitle: { type: 'Title', props: { title: 'Pods', size: 'small' } },
      workloadInfoTitle: { type: 'Title', props: { title: '负载信息', size: 'small' } },
      workloadInfo: {
        type: 'Panel',
        data: {
          data: {
            namespace: 'abc',
            survive: '5天',
            images: 'sssaasssdddddddddddddddddddddddddddddddddddddddddddd',
            tag: [
              { label: 'a1=aaaa1', group: '测试分组1' },
              { label: 'a2=aaaa2', group: '测试分组1' },
              { label: 'a3=aaaaaaaa2', group: '测试分组1' },
              { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
            ],
            desc: [
              { label: 'a1=aaaa1', group: '测试分组1' },
              { label: 'a2=aaaa2', group: '测试分组1' },
              { label: 'a3=aaaaaaaa2', group: '测试分组1' },
              { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
            ],
          },
        },
        props: {
          columnNum: 4,
          fields: [
            { label: '命名空间', valueKey: 'namespace' },
            { label: '存活时间', valueKey: 'survive' },
            { label: '镜像', valueKey: 'images', renderType: 'copyText' },
            {
              label: '标签',
              valueKey: 'tag',
              renderType: 'tagsRow',
              spaceNum: 2,
            },
            { label: '注释', valueKey: 'desc', spaceNum: 2, renderType: 'tagsRow' },
          ],
        },
      },
      workloadTable: {
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
    },
  },
};

export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'changeTab') {
  }

  console.log('------', payload);

  return data;
};
