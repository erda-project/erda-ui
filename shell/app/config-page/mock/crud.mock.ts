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

// crud场景mock
export const enhanceMock = (payload: any, partial?: boolean) => {
  if (partial) {
    return partialMock;
  }
  const data = mock;
  if (payload.event?.operation === 'delete') {
    const curData = data.protocol.components.table1.props.data;
    data.protocol.components.table1.props.data = curData?.filter(
      (item: any) => item.id !== payload.event.operationData.meta.id,
    );
  }

  return data;
};

const getTableOp = (keys: any, data: any) => {
  const op = {
    edit: { text: '编辑', reload: false },
    delete: { text: '删除', confirm: '是否确认删除用户?', reload: true, meta: { id: data.id } },
    exit: { text: '退出', confirm: '是否确认退出?' },
    sq: { text: '授权', hasAuth: false, authTip: '您没权限操作' },
  };

  const opObj = {};
  keys.forEach((k: any) => {
    opObj[k] = op[k];
    if (k === 'edit') {
      opObj[k].command = { key: 'set', state: { visible: true, formData: data }, target: 'formModal1' };
    }
  });
  return {
    renderType: 'tableOperation',
    value: '',
    operations: opObj,
  };
};

export const mockData = {
  scenario: {
    scenarioKey: 'mock',
    scenarioType: 'mock',
  },
  protocol: {
    hierarchy: {
      root: 'page1',
      structure: {
        page1: ['head1', 'content1', 'formModal1'],
        head1: { left: 'filter1', right: 'operation1' },
        content1: ['table1'],
        operation1: ['addButton1', 'exportButton1'],
      },
    },
    components: {
      page1: { type: 'Container' },
      footer1: { type: 'xxxx' },
      head1: { type: 'LRContainer' },
      operation1: { type: 'RowContainer' },
      content1: { type: 'Container' },
      formModal1: {
        type: 'FormModal',
        props: {
          name: '用户',
          fields: [
            {
              key: 'name',
              label: '名称',
              component: 'input',
              required: true,
              componentProps: { placeholder: '请输入名称' },
            },
            {
              key: 'role',
              label: '角色',
              component: 'select',
              required: true,
              dataSource: {
                type: 'static',
                static: [
                  { label: '开发', value: 'DEV' },
                  { label: '测试', value: 'TEST' },
                  { label: '管理员', value: 'Owner' },
                ],
              },
              componentProps: {
                placeholder: '请选择角色',
                options: [
                  { label: '开发', value: 'DEV' },
                  { label: '测试', value: 'TEST' },
                  { label: '管理员', value: 'Owner' },
                ],
              },
            },
          ],
        },
        operations: {
          submit: { key: 'submit' },
        },
        state: {
          visible: false,
          formData: undefined,
        },
      },
      filter1: {
        type: 'ContractiveFilter',
        props: {
          delay: 1000,
          conditions: [
            {
              key: 'iterationIDs',
              label: '迭代',
              emptyText: '全部',
              fixed: true,
              selected: true,
              haveFilter: true,
              type: 'select' as const,
              placeholder: '选择迭代',
              options: [
                {
                  label: '迭代 1',
                  value: 1,
                  icon: '',
                },
                {
                  label: '迭代 2',
                  value: 2,
                  icon: '',
                },
                {
                  label: '迭代 3',
                  value: 3,
                  icon: '',
                },
              ],
            },
            {
              key: 'title',
              label: '标题',
              emptyText: '全部',
              fixed: true,
              selected: true,
              placeholder: '请输入标题',
              type: 'input' as const,
            },
            {
              key: 'state',
              label: '状态',
              emptyText: '全部',
              fixed: true,
              selected: true,
              type: 'select' as const,
              options: [
                {
                  label: '待处理',
                  value: 'OPEN',
                  icon: '',
                },
                {
                  label: '重新打开',
                  value: 'REOPEN',
                  icon: '',
                },
                {
                  label: '已解决',
                  value: 'RESOLVED',
                  icon: '',
                },
                {
                  label: '不修复',
                  value: 'WONTFIX',
                  icon: '',
                },
                {
                  label: '不修复，重复提交',
                  value: 'DUP',
                  icon: '',
                },
                {
                  label: '已关闭',
                  value: 'CLOSED',
                  icon: '',
                },
              ],
            },
            {
              key: 'label',
              label: '标签',
              emptyText: '全部',
              fixed: false,
              selected: false,
              haveFilter: true,
              type: 'select' as const,
              placeholder: '选择标签',
              options: [
                {
                  label: '客户需求',
                  value: 22,
                  icon: '',
                },
                {
                  label: '内部需求',
                  value: 33,
                  icon: '',
                },
              ],
            },
            {
              key: 'priority',
              label: '优先级',
              emptyText: '全部',
              fixed: false,
              selected: false,
              type: 'select' as const,
              placeholder: '选择优先级',
              options: [
                {
                  label: '紧急',
                  value: 'URGENT',
                  icon: '',
                },
                {
                  label: '高',
                  value: 'HIGH',
                  icon: '',
                },
                {
                  label: '中',
                  value: 'NORMAL',
                  icon: '',
                },
                {
                  label: '低',
                  value: 'LOW',
                  icon: '',
                },
              ],
            },
            {
              key: 'severity',
              label: '严重程度',
              emptyText: '全部',
              fixed: false,
              selected: false,
              type: 'select' as const,
              placeholder: '选择优先级',
              options: [
                {
                  label: '致命',
                  value: 'FATAL',
                  icon: '',
                },
                {
                  label: '严重',
                  value: 'SERIOUS',
                  icon: '',
                },
                {
                  label: '一般',
                  value: 'NORMAL',
                  icon: '',
                },
                {
                  label: '轻微',
                  value: 'SLIGHT',
                  icon: '',
                },
                {
                  label: '建议',
                  value: 'SUGGEST',
                  icon: '',
                },
              ],
            },
            {
              key: 'creator',
              label: '创建人',
              emptyText: '全部',
              fixed: false,
              selected: false,
              haveFilter: true,
              type: 'select' as const,
              options: [
                {
                  label: '张三',
                  value: 1,
                  icon: '',
                },
                {
                  label: '李四',
                  value: 2,
                  icon: '',
                },
              ],
            },
            {
              key: 'assignee',
              label: '处理人',
              emptyText: '全部',
              fixed: false,
              selected: false,
              haveFilter: true,
              type: 'select' as const,
              options: [
                {
                  label: '张三',
                  value: 1,
                  icon: '',
                },
                {
                  label: '李四',
                  value: 2,
                  icon: '',
                },
              ],
            },
            {
              key: 'owner',
              label: '责任人',
              emptyText: '全部',
              fixed: false,
              selected: false,
              haveFilter: true,
              type: 'select' as const,
              options: [
                {
                  label: '张三',
                  value: 1,
                  icon: '',
                },
                {
                  label: '李四',
                  value: 2,
                  icon: '',
                },
              ],
            },
            {
              key: 'bugStage',
              label: '引入源',
              emptyText: '全部',
              fixed: false,
              selected: false,
              type: 'select' as const,
              options: [
                {
                  label: '需求设计',
                  value: 'demandDesign',
                  icon: '',
                },
                {
                  label: '架构设计',
                  value: 'architectureDesign',
                  icon: '',
                },
                {
                  label: '代码研发',
                  value: 'codeDevelopment',
                  icon: '',
                },
              ],
            },
            {
              key: 'startCreatedAt,endCreatedAt',
              label: '创建日期',
              fixed: false,
              emptyText: '全部',
              selected: true,
              haveFilter: false,
              type: 'dateRange' as const,
            },
            {
              key: 'startFinishedAt,endFinishedAt',
              label: '截止日期',
              fixed: false,
              selected: false,
              haveFilter: false,
              type: 'dateRange' as const,
            },
          ],
        },
        state: {
          iterationIDs: [1, 2],
          title: 'test',
          assignee: [1],
          'startCreatedAt,endCreatedAt': [1609430400000, 1609862400000],
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
            partial: true,
          },
        },
      },
      addButton1: {
        type: 'Button',
        props: {
          text: '添加用户',
          type: 'primary',
        },
        operations: {
          click: {
            key: 'click-add',
            reload: false,
            command: { key: 'set', state: { visible: true }, target: 'formModal1' },
          },
        },
      },
      exportButton1: {
        type: 'Button',
        props: {
          text: '导出用户',
          ghost: true,
          type: 'primary',
        },
      },
      table1: {
        type: 'Table',
        props: {
          data: {
            list: [
              {
                id: 1,
                name: '张1',
                role: '开发',
                operations: getTableOp(['edit', 'delete', 'sq'], { id: 1, name: '张1', role: '开发' }),
              },
              {
                id: 2,
                name: '张2',
                role: '测试',
                operations: getTableOp(['edit', 'delete', 'sq'], { id: 2, name: '张2', role: '测试' }),
              },
              {
                id: 3,
                name: '张3(当前用户)',
                role: '开发',
                operations: getTableOp(['edit', 'exit', 'sq'], { id: 3, name: '张3', role: '开发' }),
              },
              {
                id: 4,
                name: '张4',
                role: '测试',
                operations: getTableOp(['edit', 'delete', 'sq'], { id: 4, name: '张4', role: '测试' }),
              },
              {
                id: 5,
                name: '张5',
                role: '测试',
                operations: getTableOp(['edit', 'delete', 'sq'], { id: 5, name: '张5', role: '测试' }),
              },
            ],
          },
          columns: [
            { title: '名称', dataIndex: 'name' },
            { title: '角色', dataIndex: 'role' },
            { title: '操作', dataIndex: 'operations' },
          ],
          total: 3,
          rowKey: 'id',
        },
      },
    },
  },
};

let partialMock = {
  scenario: {},
  protocol: {
    components: {
      filter1: {
        type: 'ContractiveFilter',
        props: {
          delay: 3000,
          conditions: [
            {
              key: 'issueType',
              label: '事项类型2',
              value: ['bug'], // 组件内决定是否总是使用后端的值覆盖
              emptyText: '全部',
              fixed: true,
              selected: true,
              haveFilter: false,
              type: 'select' as const,
              placeholder: '标题或描述',
              options: [
                {
                  label: '需求',
                  value: 'requirement',
                  icon: '',
                },
                {
                  label: '任务',
                  value: 'task',
                  icon: '',
                },
                {
                  label: '缺陷',
                  value: 'bug',
                  icon: '',
                },
              ],
            },
            {
              key: 'assignee',
              label: '处理人',
              value: [1],
              emptyText: '全部',
              fixed: false,
              selected: false,
              haveFilter: true,
              type: 'select' as const,
              // placeholder: "标题或描述",
              options: [
                {
                  label: '张三',
                  value: 1,
                  icon: '',
                },
                {
                  label: '李四',
                  value: 2,
                  icon: '',
                },
              ],
            },
            {
              key: 'title',
              label: '标题',
              emptyText: '全部',
              fixed: false,
              placeholder: '请输入标题',
              selected: false,
              type: 'input' as const,
            },
            {
              key: 'endAt',
              label: '截止日期',
              emptyText: '全部',
              fixed: false,
              value: {
                startDate: '2021-01-01',
                endDate: '2021-01-03',
              },
              selected: true,
              haveFilter: true,
              type: 'dateRange' as const,
            },
            {
              key: 'updateAt',
              label: '更新日期',
              fixed: false,
              value: {},
              emptyText: '全部',
              selected: false,
              haveFilter: true,
              type: 'dateRange' as const,
            },
          ],
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
            partial: true,
          },
        },
      },
      table1: {
        type: 'Table',
        props: {
          data: [
            {
              id: 1,
              name: '张1',
              role: '开发',
              operations: getTableOp(['edit', 'delete', 'sq'], { id: 1, name: '张1', role: '开发' }),
            },
            {
              id: 3,
              name: '张3(当前用户)',
              role: '开发',
              operations: getTableOp(['edit', 'exit', 'sq'], { id: 3, name: '张3', role: '开发' }),
            },
          ],
          columns: [
            { title: '名称', dataIndex: 'name' },
            { title: '角色', dataIndex: 'role' },
          ],
          total: 3,
          rowKey: 'id',
        },
      },
    },
  },
};
