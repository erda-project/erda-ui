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
    scenarioKey: 'mock',
    scenarioType: 'mock',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['filter', 'tab', 'addLabelModal'],
        tab: {
          children: ['cpuTable', 'memTable'],
          tabBarExtraContent: ['freezeButton', 'unfreezeButton'],
        },
      },
    },
    components: {
      page: { type: 'Container' },
      freezeButton: {
        type: 'Button',
        props: {
          text: '冻结',
          type: 'primary',
          tooltip: '只有worker节点可以冻结',
        },
        operations: {
          click: {
            key: 'freeze',
            reload: true,
          },
        },
      },
      unfreezeButton: {
        type: 'Button',
        props: {
          text: '解冻',
          type: 'primary',
        },
        operations: {
          click: {
            key: 'unfreeze',
            reload: true,
          },
        },
      },
      filter: {
        type: 'ContractiveFilter',
        operations: { filter: { key: 'filter', reload: true } },
        state: {
          conditions: [
            { key: 'q', label: '标题', placeholder: '请输入关键字查询', type: 'input', fixed: true },
            {
              key: 'member',
              label: '创建人',
              type: 'memberSelector',
              customProps: { mode: 'multiple', scopeId: 2, scopeType: 'project', pageSize: 2 },
            },
            {
              key: 'labels',
              label: '标签',
              type: 'select',
              // fixed: true,
              options: [
                { label: '标签1', value: 'l1' },
                {
                  label: '标签组A',
                  value: 'a',
                  children: [
                    { label: 'A-1', value: 'a-1' },
                    { label: 'A-2', value: 'a-2' },
                    { label: 'A-3', value: 'a-3' },
                    { label: 'A-4', value: 'a-4' },
                    { label: 'A-5', value: 'a-5' },
                  ],
                },
                { label: '标签2', value: 'l2' },
                {
                  label: '标签组B',
                  value: 'B',
                  children: [
                    { label: 'B-1', value: 'b-1' },
                    { label: 'B-2', value: 'b-2' },
                    { label: 'B-3', value: 'b-3' },
                    { label: 'B-4', value: 'b-4' },
                  ],
                },
              ],
            },
          ],
          values: { q: undefined, labels: undefined },
        },
      },
      tab: {
        type: 'Tabs',
        props: {
          tabMenu: [
            { key: 'cpu', name: 'cpu分析' },
            { key: 'mem', name: '内存分析' },
          ],
        },
        state: { activeKey: 'cpu' },
        operations: {
          onChange: { key: 'changeTab', reload: true, fillMeta: 'activeKey', meta: {} },
        },
      },
      cpuTable: {
        type: 'Table',
        state: {
          selectedRowKeys: [],
          pageNo: 1,
          pageSize: 10,
          total: 3,
        },
        data: {
          list: [
            {
              id: '1',
              status: { renderType: 'textWithBadge', value: '正常', status: 'success' }, // success | processing | default | error | warning
              node: {
                renderType: 'linkText',
                value: '10.10.0.1',
                operations: { click: { key: 'goto', target: 'orgRoot' } },
                reload: false,
              },
              role: 'lb',
              version: '1.0.2',
              distribution: { renderType: 'bgProgress', value: { text: '1/2', percent: 50 } },
              labels: {
                renderType: 'tagsRow',
                value: [
                  { label: 'a1=aaaa1', group: '测试分组1' },
                  { label: 'a2=aaaa2', group: '测试分组1' },
                  { label: 'a3=aaaaaaaa2', group: '测试分组1' },
                  { label: 'a4=aaaaaaaaaaaa2', group: '测试分组1' },
                  { label: 'a5=aaaa2', group: '测试分组1' },
                  { label: 'a6=aaaa2', group: '测试分组1' },
                  { label: 'a7=aaaaaaaa2', group: '测试分组1' },
                  { label: 'a8=aaaa2', group: '测试分组1' },
                  { label: 'a9=aaaaaaaaaaaa2', group: '测试分组1' },
                  { label: 'a10=aaaa2', group: '测试分组1' },
                  { label: 'a11=aaaa2', group: '测试分组1' },
                  { label: 'a12=aaaaaaaaaaaaaaaa2', group: '测试分组1' },
                  { label: 'a13=aaaa2', group: '测试分组1' },
                  { label: 'b1=bbbb1', group: '特殊分组' },
                  { label: 'b2=bbbb2', group: '特殊分组' },
                  { label: 'c=cccccccccc', group: 'xxxx' },
                ],
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
                    fillMeta: 'abc',
                    meta: {
                      recordId: '1',
                      abc: { label: '' },
                    },
                  },
                },
              },
            },
            {
              id: '2',
              status: { renderType: 'textWithBadge', value: '解冻中', status: 'processing' }, // success | processing | default | error | warning
              node: {
                renderType: 'linkText',
                value: '10.10.0.1',
                operations: { click: { key: 'goto', target: 'orgRoot' } },
                reload: false,
              },
              role: 'lb',
              version: '1.0.2',
              distribution: { renderType: 'bgProgress', value: { text: '1/2', percent: 20 } },
            },
            {
              id: '3',
              status: { renderType: 'textWithBadge', value: '解冻中', status: 'processing' }, // success | processing | default | error | warning
              node: {
                renderType: 'linkText',
                value: '10.10.0.44',
                operations: { click: { key: 'goto', target: 'orgRoot' } },
                reload: false,
              },
              role: 'lb',
              version: '1.0.2',
              distribution: { renderType: 'bgProgress', value: { text: '1/2', percent: 20 } },
            },
          ],
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          columns: [
            { dataIndex: 'status', title: '状态', sorter: true },
            { dataIndex: 'node', title: '节点', sorter: true },
            { dataIndex: 'role', title: '角色' },
            { dataIndex: 'version', title: '版本' },
            { dataIndex: 'distribution', title: 'cpu分配率' },
            { dataIndex: 'use', title: 'cpu使用率' },
            { dataIndex: 'distributionRate', title: 'cpu分配使用率' },
            { dataIndex: 'labels', title: '标签' },
          ],
          bordered: true,
          selectable: true,
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
        // 等activeKey=mem的时候返回对应的数据
        type: 'Table',
        state: {
          // selectedRowKeys: [],
        },
        data: {},
        props: {
          visible: false,
        },
      },
      addLabelModal: {
        type: 'FormModal',
        props: {
          title: '添加标签',
          fields: [
            {
              component: 'select',
              key: 'labelGroup',
              label: '分组',
              required: true,
              componentProps: {
                options: [
                  {
                    name: '分组1',
                    value: 'g1',
                  },
                  {
                    name: '分组2',
                    value: 'g2',
                  },
                ],
              },
            },
            {
              component: 'input',
              key: 'name',
              label: '标签',
              required: true,
              rules: [
                {
                  msg: '格式：ss',
                  pattern: '/^[.a-z\\u4e00-\\u9fa5A-Z0-9_-\\s]*$/',
                },
              ],
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
    },
  },
};

export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'changeTab') {
  }

  console.log('------', payload);

  return data;
};
