export const enhanceMock = (data: any, payload: any) => {
  return data;
};
const currentDate = new Date();

const task = [
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: 'R1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
    id: '1',
    type: 'requirement',
    user: '张三',
    status: '进行中', // id? text?
    children: [
      {
        id: '1-1',
        name: 'T1-1测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        type: 'task',
        user: '张三',
        status: '已完成',
        children: [
          {
            id: '1-1-1',
            name: 'T1-1-1测试测试测试测试测试测试测试测试测试测试测试',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
            type: 'task',
            user: '张三',
            status: '已完成',
          },
        ],
      },
      {
        id: '1-2',
        name: 'T1-2测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '1-3',
        name: 'T1-3测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '1-4',
        name: 'T1-4测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '1-5',
        name: 'T1-5测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
    ],
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
    name: 'R2-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
    id: '2',
    type: 'requirement',
    user: '张三',
    status: '进行中', // id? text?
    children: [
      {
        id: '2-1',
        name: 'T2-1测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        type: 'task',
        user: '张三',
        status: '已完成',
      },
      {
        id: '2-2',
        name: 'T2-2测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '2-3',
        name: 'T2-3测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '2-4',
        name: 'T2-4测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '2-5',
        name: 'T2-5测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
    ],
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: 'R3-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
    id: '3',
    type: 'requirement',
    user: '张三',
    status: '进行中', // id? text?
    children: [
      {
        id: '3-1',
        name: 'T3-1测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        type: 'task',
        user: '张三',
        status: '已完成',
      },
      {
        id: '3-2',
        name: 'T3-2测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '3-3',
        name: 'T3-3测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '3-4',
        name: 'T3-4测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
      {
        id: '3-5',
        name: 'T3-5测试测试测试测试测试测试测试测试测试测试测试',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
        type: 'task',
        user: '张三',
        status: '待处理',
      },
    ],
    isLeaf: true,
  },
];

export const mockData = {
  scenario: {
    scenarioType: 'issue-gantt',
    scenarioKey: 'issue-gantt',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['filter', 'gantt'],
      },
    },
    components: {
      page: { type: 'Container' },
      gantt: {
        type: 'Gantt',
        data: {
          list: task,
        },
        operations: {
          update: {
            key: 'xx',
            reload: true,
          },
          expandNode: {
            key: 'expandNode',
            reload: true,
            fillMate: 'nodeId',
            meta: { nodeId: 'xxx' },
          },
        },
      },
      filter: {
        type: 'ContractiveFilter',
        name: 'filter',
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
                { label: '1.1', value: '1.1' },
                { label: '1.2', value: '1.2' },
              ],
              type: 'select',
            },
            {
              emptyText: '全部',
              fixed: true,
              haveFilter: true,
              key: 'user',
              label: '成员',
              options: [
                { label: '张三', value: '1' },
                { label: '李四', value: '1' },
              ],
              type: 'select',
            },
            {
              fixed: true,
              key: 'q',
              placeholder: '根据名称过滤',
              type: 'input',
            },
          ],
          values: {
            spaceName: '4',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
    },
  },
};
