export const enhanceMock = (data: any, payload: any) => {
  return data;
};
const currentDate = new Date();
const getDate = (day: number) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime();

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
          expandList: {
            0: [
              {
                start: getDate(1),
                end: getDate(15),
                title: 'R1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R1',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                start: getDate(10),
                end: getDate(10),
                title: 'R2-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R2',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
              {
                start: getDate(10),
                end: getDate(10),
                title: 'R3-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
                key: 'R3',
                isLeaf: false,
                extra: {
                  type: 'requirement',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
            ],
            R1: [
              {
                id: '1-1',
                name: 'T1-1测试测试测试测试测试测试测试测试测试测试测试',
                start: getDate(1),
                end: getDate(5),
                isLeaf: true,
                extra: {
                  type: 'task',
                  user: '张三',
                  status: { text: '进行中', status: 'processing' },
                },
              },
            ],
          },
        },
        operations: {
          update: {
            key: 'update',
            reload: true,
            fillMeta: 'nodes',
            meta: {
              // 前端修改的数据放在meta.nodes里，update后，后端data.updateList返回相关修改
              nodes: [{ key: 'R1-1', start: 100, end: 1000 }],
            },
          },
          expandNode: {
            key: 'expandNode',
            reload: true,
            fillMate: 'keys',
            meta: { keys: ['xxx'] },
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
