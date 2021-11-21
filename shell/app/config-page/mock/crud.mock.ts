export const mockData = {
  scenario: {
    scenarioKey: 'cmp-dashboard-pods',
    scenarioType: 'cmp-dashboard-pods',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        addPodContainer: ['addPodFilter', 'addPodFileEditor'],
        addPodDrawer: {
          content: 'addPodContainer',
        },
        filterContainer: ['filter'],
        page: ['topHead', 'filterContainer', 'charts', 'tabsTable', 'addPodDrawer'],
        charts: ['chartContainer'],
        chartContainer: ['podsTotal', 'podsCharts'],
        topHead: ['addPodButton'],
        tableContainer: ['tabsTable'],
        tabsTable: {
          slot: 'tabs',
          table: 'table',
        },
      },
    },
    components: {
      table: {
        type: 'Table',
        name: 'podsTable',
        props: {
          columns: [
            {
              dataIndex: 'name',
              sorter: true,
              title: '名称',
            },
            {
              dataIndex: 'status',
              sorter: true,
              title: '状态',
            },
            {
              dataIndex: 'ip',
              sorter: true,
              title: 'IP 地址',
            },
            {
              dataIndex: 'cpuLimits',
              sorter: true,
              title: 'CPU 限制值',
            },
            {
              dataIndex: 'cpuRequests',
              sorter: true,
              title: 'CPU 请求值',
            },
            {
              dataIndex: 'cpuPercent',
              sorter: true,
              title: 'CPU 水位',
            },
            {
              dataIndex: 'age',
              sorter: true,
              title: '存活',
            },
            {
              dataIndex: 'gotoWorkload',
              fixed: 'right',
              sorter: false,
              title: '操作',
            },
          ],
          pageSizeOptions: ['10', '20', '50', '100'],
          requestIgnore: ['data'],
          rowKey: 'id',
          sortDirections: ['descend', 'ascend'],
        },
        state: {
          activeKey: 'cpu',
          clusterName: 'erda-hongkong',
          countValues: {
            Running: 1,
          },
          pageNo: 1,
          pageSize: 20,
          podsTable__urlQuery: 'eyJwYWdlTm8iOjEsInBhZ2VTaXplIjoyMCwic29ydGVyRGF0YSI6e319',
          sorterData: {},
          total: 1,
          values: {
            namespace: ['default'],
            search: 'addon-elasticsearch-0',
          },
        },
        data: {
          list: [
            {
              CPULimitsNum: 2000,
              CPURequestsNum: 200,
              MemoryLimitsNum: 8589934592,
              MemoryRequestsNum: 858783744,
              age: '21d',
              cpuLimits: {
                renderType: 'multiple',
                direction: 'row',
                renders: [[{ icon: 'CPU', renderType: 'icon', size: 'small' }], [{ renderType: 'text', value: '2核' }]],
              },
              cpuPercent: {
                renderType: 'progress',
                status: 'success',
                tip: '0.405核/2核',
                value: '20.29',
              },
              cpuRequests: {
                renderType: 'multiple',
                direction: 'row',
                renders: [[{ icon: 'GPU', renderType: 'icon', size: 'small' }], [{ renderType: 'text', value: '2核' }]],
              },
              gotoWorkload: {
                operations: {
                  gotoPod: {
                    command: {
                      jumpOut: true,
                      key: 'goto',
                      state: {
                        params: {
                          workloadId: '-',
                        },
                        query: {
                          podId: 'default_addon-elasticsearch-0',
                        },
                      },
                      target: 'cmpClustersWorkloadDetail',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看工作负载',
                  },
                },
                renderType: 'tableOperation',
              },
              id: 'default_addon-elasticsearch-0',
              ip: '10.108.0.171',
              memoryLimits: '8G',
              memoryPercent: {
                renderType: 'progress',
                status: 'success',
                tip: '4.628G/8G',
                value: '57.85',
              },
              memoryRequests: '819M',
              name: {
                renderType: 'multiple',
                direction: 'row',
                renders: [
                  [{ icon: 'default_k8s_pod', renderType: 'icon' }],
                  [
                    {
                      operations: {
                        click: {
                          key: 'openPodDetail',
                          reload: false,
                        },
                      },
                      renderType: 'linkText',
                      value: 'addon-elasticsearch-0',
                    },
                    { renderType: 'subText', value: '命名空间：222222' },
                  ],
                ],
              },
              namespace: 'default',
              node: 'cn-hongkong.172.16.0.133',
              podName: 'addon-elasticsearch-0',
              ready: '1/1',
              status: {
                renderType: 'textWithBadge',
                // status: 'success',
                color: 'darkslateblue',
                value: '就绪',
              },
            },
          ],
        },
        operations: {
          changeSort: {
            key: 'changeSort',
            reload: true,
          },
        },
      },
      tabsTable: { type: 'ComposeTable' },
      tabs: {
        operations: {
          onChange: {
            key: 'changeTabs',
            reload: true,
          },
        },
        props: {
          buttonStyle: 'solid',
          options: [
            {
              key: 'cpu-analysis',
              text: 'CPU 分析',
            },
            {
              key: 'mem-analysis',
              text: '内存分析',
            },
          ],
          radioType: 'button',
          size: 'small',
        },
        state: {
          value: 'cpu-analysis',
        },
        type: 'Radio',
      },
      podsTotal: {
        type: 'TextBlock',
        data: {
          data: {
            main: '2342',
            desc: 'Pod 总数',
          },
        },
        props: {
          grayBg: true,
          fullHeight: true,
          align: 'center',
        },
      },
      podsCharts: {
        type: 'PieChart',
        props: {
          grayBg: true,
          chartStyle: { width: 32, height: 32, chartSetting: 'start' },
        },
        data: {
          group: [
            [
              {
                name: '运行中',
                value: 33.3,
                total: 100,
                color: 'red',
                info: [{ main: '987', sub: '23.1%', desc: '运行中' }],
              },
            ],
            [
              {
                name: '完成',
                value: 33.3,
                total: 100,
                color: 'orange',
                info: [{ main: '987', sub: '23.1%', desc: '完成' }],
              },
            ],
            [
              {
                name: '驱逐',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '驱逐' }],
              },
            ],
            [
              {
                name: '崩溃重启中',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '崩溃重启中' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误2',
                value: 0,
                total: 100,
                color: 'green',
                info: [{ main: '0', sub: '0%', desc: '错误2' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
            [
              {
                name: '错误',
                value: 33.3,
                total: 100,
                color: 'green',
                info: [{ main: '987', sub: '23.1%', desc: '错误' }],
              },
            ],
          ],
        },
      },
      chartContainer: {
        type: 'Grid',
        props: {
          span: [4, 20],
        },
      },
      charts: {
        type: 'Container',
        props: {
          whiteBg: true,
        },
      },
      topHead: {
        type: 'Container',
        props: {
          isTopHead: true,
        },
      },
      addPodButton: {
        type: 'Button',
        name: 'addPodButton',
        props: {
          text: '创建 Pod',
          type: 'primary',
          prefixIcon: 'add',
        },
        state: {},
        data: {},
        operations: {
          click: {
            key: 'addPod',
            reload: true,
          },
        },
      },
      addPodContainer: {
        type: 'Container',
        name: 'addPodContainer',
        props: {
          fullHeight: true,
        },
        state: {},
        data: {},
        operations: {},
      },
      addPodDrawer: {
        type: 'Drawer',
        name: 'addPodDrawer',
        props: null,
        state: {},
        data: {},
        operations: {},
      },
      addPodFileEditor: {
        type: 'FileEditor',
        name: 'addPodFileEditor',
        props: null,
        state: {},
        data: {},
        operations: {},
      },
      addPodFilter: {
        type: 'ContractiveFilter',
        name: 'addPodFilter',
        props: null,
        state: {},
        data: {},
        operations: {},
      },

      filter: {
        type: 'ContractiveFilter',
        name: 'filter',
        props: null,
        state: {
          clusterName: 'erda-hongkong',
          conditions: [
            {
              fixed: true,
              haveFilter: true,
              key: 'namespace',
              label: '命名空间',
              options: [
                {
                  children: [
                    {
                      label: 'default',
                      value: 'default',
                    },
                  ],
                  label: '默认',
                  value: 'default',
                },
              ],
              type: 'select',
            },
            {
              fixed: true,
              key: 'status',
              label: '状态',
              options: [
                {
                  label: '完成',
                  value: 'Completed',
                },
                {
                  label: '容器创建中',
                  value: 'ContainerCreating',
                },
                {
                  label: '崩溃重启中',
                  value: 'CrashLoopBackOff',
                },
                {
                  label: '错误',
                  value: 'Error',
                },
                {
                  label: '驱逐',
                  value: 'Evicted',
                },
                {
                  label: '镜像拉取失败重试中',
                  value: 'ImagePullBackOff',
                },
                {
                  label: '镜像拉取失败',
                  value: 'ErrImagePull',
                },
                {
                  label: '挂起',
                  value: 'Pending',
                },
                {
                  label: '运行中',
                  value: 'Running',
                },
                {
                  label: '终止',
                  value: 'Terminating',
                },
                {
                  label: '内存溢出被杀',
                  value: 'OOMKilled',
                },
                {
                  label: '其他',
                  value: 'others',
                },
              ],
              type: 'select',
            },
            {
              fixed: true,
              key: 'node',
              label: '节点',
              options: [
                {
                  label: 'cn-hongkong.172.16.0.126',
                  value: 'cn-hongkong.172.16.0.126',
                },
              ],
              type: 'select',
            },
            {
              fixed: true,
              key: 'search',
              label: 'search',
              placeholder: '搜索 Pod 名称或 IP',
              type: 'input',
            },
          ],
          filter__urlQuery: 'eyJuYW1lc3BhY2UiOlsiZGVmYXVsdCJdLCJzZWFyY2giOiJhZGRvbi1lbGFzdGljc2VhcmNoLTAifQ==',
          values: {
            namespace: ['default'],
            search: 'addon-elasticsearch-0',
          },
        },
        data: {},
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      filterContainer: {
        type: 'Container',
        name: 'filterContainer',
        props: {
          whiteBg: true,
        },
        state: {},
        data: {},
        operations: {},
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
      podDistribution: {
        type: 'LinearDistribution',
        name: 'podDistribution',
        props: {},
        state: {},
        data: {
          list: [
            {
              color: 'green',
              label: '运行中 1',
              tip: '运行中 1/1',
              value: 1,
            },
          ],
          total: 1,
        },
        operations: {},
      },
      podTitle: {
        type: 'Title',
        name: 'podTitle',
        props: {
          size: 'small',
          title: 'Pod 数量: 1',
        },
        state: {},
        data: {},
        operations: {},
      },

      tableContainer: {
        type: 'Container',
        name: 'tableContainer',
        props: {
          whiteBg: true,
        },
        state: {},
        data: {},
        operations: {},
      },
      tableTabs: {
        type: 'Tabs',
        name: 'tableTabs',
        props: {
          tabMenu: [
            {
              key: 'cpu',
              name: 'CPU 分析',
            },
            {
              key: 'mem',
              name: '内存分析',
            },
          ],
        },
        state: {
          activeKey: 'cpu',
        },
        data: {},
        operations: {
          onChange: {
            key: 'changeTab',
            reload: true,
          },
        },
      },
    },
  },
};
