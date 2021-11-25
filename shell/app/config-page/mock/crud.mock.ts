export const enhanceMock = (data: any, payload: any) => {
  return data;
};
const currentDate = new Date();

const task = [
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: 'Some Project',
    id: 'ProjectSample',
    progress: 0,
    type: 'project',
    barBackgroundColor: 'red',
    barStyle: {
      barTopHeight: 4,
    },
    hideChildren: false,
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2, 12, 28),
    name: 'Idea',
    id: 'Task 0',
    progress: 0,
    type: 'task',
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
    name: 'Research',
    id: 'Task 1',
    progress: 0,
    // dependencies: ['Task 0'],
    type: 'task',
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
    name: 'Discussion with team',
    id: 'Task 2',
    progress: 0,
    // dependencies: ['Task 1'],
    type: 'task',
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
    name: 'Developing',
    id: 'Task 3',
    progress: 0,
    // dependencies: ['Task 2'],
    type: 'task',
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
    name: 'Review',
    id: 'Task 4',
    type: 'task',
    progress: 0,
    // dependencies: ['Task 2'],
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: 'Release',
    id: 'Task 6',
    progress: currentDate.getMonth(),
    type: 'milestone',
    // dependencies: ['Task 4'],
    project: 'ProjectSample',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: 'Party Time',
    id: 'Task 9',
    progress: 0,
    isDisabled: true,
    type: 'task',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: 'Party Time',
    id: 'Task 92',
    progress: 0,
    isDisabled: true,
    type: 'task',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: '922',
    id: '9',
    progress: 0,
    type: 'project',
    hideChildren: false,
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: '10',
    id: '10',
    progress: 0,
    type: 'project',
    hideChildren: false,
    project: '9',
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: '10-1',
    id: '10-1',
    progress: 0,
    type: 'milestone',
    project: '10',
    hideChildren: false,
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: '10-1-1',
    id: '10-1-1',
    progress: 0,
    isDisabled: true,
    type: 'task',
    project: '10',
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
