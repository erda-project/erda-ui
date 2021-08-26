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
        page: ['header', 'podInfoTitle', 'podInfo', 'containerTitle', 'containerTable', 'eventTitle', 'eventTable'],
        header: ['podTitle', 'podStatus'],
      },
    },
    components: {
      page: { type: 'Container' },
      header: { type: 'RowContainer' },
      podStatus: {
        type: 'Text',
        props: { value: 'Active', styleConfig: { color: 'green' } },
      },
      podTitle: {
        type: 'Title',
        props: {
          title: 'Pod: pod-1.0.23.23',
        },
      },
      containerTitle: {
        type: 'Title',
        props: {
          title: '容器',
        },
      },
      eventTitle: {
        type: 'Title',
        props: {
          title: '相关事件',
        },
      },
      podInfoTitle: { type: 'Title', props: { title: 'Pod信息', size: 'small' } },
      podInfo: {
        type: 'Panel',
        data: {
          data: {
            namespace: 'abc',
            survive: '5天',
            ip: '192.168.222.222',
            workload: 'workload...',
            node: 'node...',
            containerRuntime: '',
            podNum: '10',
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
            { label: 'Pod IP', valueKey: 'ip' },
            {
              label: '工作负载',
              valueKey: 'workload',
              renderType: 'linkText',
              operations: {
                click: {
                  key: 'gotoWorkloadDetail',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'cmpClustersWorkloadDetail',
                    state: { params: { workloadId: '1' } },
                    jumpOut: true,
                  },
                },
              },
            },
            {
              label: '节点',
              valueKey: 'node',
              renderType: 'linkText',
              operations: {
                click: {
                  key: 'gotoNodeDetail',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'cmpClustersNodeDetail',
                    state: { params: { nodeId: '1' } },
                    jumpOut: true,
                  },
                },
              },
            },
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
      containerTable: {
        type: 'Table',
        data: {
          list: [
            {
              status: { renderType: 'text', value: 'Active', styleConfig: { color: 'green' } },
              ready: '是',
              name: 'nginx',
              images: { value: { text: 'nginx1.5.4' }, renderType: 'copyText' },
              rebootTime: '3',
              survive: '4天',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  log: {
                    key: 'gotoPod',
                    command: { key: 'goto', target: 'dopRoot', jumpOut: true },
                    text: '查看日志',
                    reload: false,
                  },
                  console: {
                    key: 'gotoPod',
                    command: { key: 'goto', target: 'dopRoot', jumpOut: true },
                    text: '控制台',
                    reload: false,
                  },
                },
              },
            },
          ],
        },
        props: {
          pagination: false,
          scroll: { x: 1000 },
          columns: [
            { dataIndex: 'status', title: '状态', width: 120 },
            { dataIndex: 'ready', title: '是否就绪', width: 120 },
            { dataIndex: 'name', title: '名称', width: 120 },
            { dataIndex: 'images', title: '镜像' },
            { dataIndex: 'rebootTime', title: '重启次数', width: 120 },
            { dataIndex: 'survive', title: '存活天数', width: 120 },
            { dataIndex: 'operate', title: '操作', width: 200, fixed: 'right' },
          ],
        },
      },
      eventTable: {
        type: 'Table',
        data: {
          list: [{ lastTrigger: '2020-10-10 22:22:22', type: 'Normal', reason: 'xx', info: 'dddd' }],
        },
        props: {
          pagination: false,
          columns: [
            { dataIndex: 'lastTrigger', title: '上次触发', width: 180 },
            { dataIndex: 'type', title: '类型', width: 120 },
            { dataIndex: 'reason', title: '原因' },
            { dataIndex: 'info', title: '信息' },
          ],
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
