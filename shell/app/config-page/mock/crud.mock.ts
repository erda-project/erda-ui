export const mockData = {
  scenario: {
    scenarioKey: 'cmp-dashboard-nodes',
    scenarioType: 'cmp-dashboard-nodes',
  },
  protocol: {
    version: '',
    scenario: 'cmp-dashboard-nodes',

    hierarchy: {
      root: 'page',
      structure: {
        charts: ['cpu1Chart', 'cpu2Chart', 'cpu1Chart'],
        page: ['chartsContainer'],
        chartsContainer: ['charts'],
      },
    },
    components: {
      chartsContainer: {
        type: 'Container',
        props: {
          whiteBg: true,
        },
      },
      charts: {
        type: 'Grid',
      },
      cpu1Chart: {
        type: 'PieChart',
        data: {
          data: [
            { name: '剩余分配', value: 23, formatter: '23.33G', color: 'green' },

            { name: '已分配', value: 12.43, formatter: '23.33G', color: 'orange' },

            { name: '不可分配', value: 12.43, formatter: '32.2G', color: 'red' },
          ],
        },
      },
      cpu2Chart: {
        type: 'PieChart',
        data: {
          data: [
            { name: '剩余分配', value: 23, formatter: '23.33G', color: 'green' },

            { name: '已分配', value: 12.43, formatter: '23.33G', color: 'orange' },

            { name: '不可分配', value: 12.43, formatter: '32.2G', color: 'red' },
          ],
        },
      },
      page: {
        type: 'Container',
        name: 'page',
        props: {
          spaceSize: 'middle',
        },
        state: {},
        data: {},
        operations: {},
      },
    },
  },
};
