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
        page: ['header', 'statusTitle', 'statusBadge', 'infoTitle', 'infoDetail', 'infoMapTable', 'addLabelModal'],
        header: ['nodeTitle', 'nodeStatus'],
      },
    },
    components: {
      page: { type: 'Container' },
      header: { type: 'RowContainer' },
      nodeStatus: {
        type: 'Badge',
        props: { text: '正常', status: 'success' },
      },
      nodeTitle: {
        type: 'Title',
        props: {
          title: 'Node: node-1.0.23.23',
        },
      },
      statusTitle: { type: 'Title', props: { title: '节点状态', size: 'small' } },
      statusBadge: {
        type: 'Badge',
        data: {
          list: [
            { text: 'PID Pressure', status: 'success', withBg: true },
            { text: 'Disk Pressure', status: 'success', withBg: true },
            { text: 'Memory Pressure', status: 'error', withBg: true, tip: 'xxxssssas' },
            { text: 'Kubelet', status: 'success', withBg: true },
          ],
        },
      },
      infoTitle: { type: 'Title', props: { title: '节点信息', size: 'small' } },
      infoDetail: {
        type: 'Panel',
        data: {
          data: {
            createCost: '6小时',
            nodeIp: '192.168.222.222',
            version: 'v1.0',
            os: 'Linux',
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
            { label: '节点创建时长', valueKey: 'createCost' },
            { label: '节点IP', valueKey: 'nodeIp' },
            { label: '版本', valueKey: 'version' },
            { label: 'OS', valueKey: 'os' },
            { label: 'container runtime ', valueKey: 'containerRuntime' },
            { label: 'Pod数', valueKey: 'podNum' },
            {
              label: '标签',
              valueKey: 'tag',
              renderType: 'tagsRow',
              spaceNum: 2,
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
                  fillMeta: 'deleteData',
                  meta: {
                    recordId: '1',
                    deleteData: { label: '' },
                  },
                },
              },
            },
            { label: '注释', valueKey: 'desc', spaceNum: 2, renderType: 'tagsRow' },
          ],
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
      infoMapTable: {
        type: 'Table',
        data: {
          list: [
            { label: { value: '架构', renderType: 'text', styleConfig: { fontWeight: 'bold' } }, value: 'amd64' },

            {
              label: { value: 'Boot ID', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: '容器运行时版本', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: '镜像', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'Kernel版本', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'Kubectl Proxy版本', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'Kubectl版本', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'Machine ID', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'Operating System', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },

            {
              label: { value: 'System UUID', renderType: 'text', styleConfig: { fontWeight: 'bold' } },
              value: 'xxxx-xxx-xxxxxx-xxx-x-x-x-x-xxxxxx',
            },
          ],
        },
        props: {
          bordered: true,
          showHeader: false,
          pagination: false,
          columns: [
            { dataIndex: 'label', title: '', width: 200 },
            { dataIndex: 'value', title: '' },
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
