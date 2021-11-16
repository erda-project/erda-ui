export const mockData = {
  scenario: {
    scenarioKey: 'cmp-dashboard-nodes',
    scenarioType: 'cmp-dashboard-nodes',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        charts: ['cpuChart', 'memChart', 'podChart'],
        chartsContainer: ['charts'],
        filterContainer: ['nodeFilter'],
        page: [
          'filterContainer',
          'chartsContainer',
          'tableTabsContainer',
          'addLabelModal',
          'cleanData',
          'batchOperationTipModal',
        ],
        tabsTable: {
          slot: 'tabs',
          table: 'table',
        },
        tableTabsContainer: ['tabsTable'],
      },
    },
    components: {
      tabsTable: { type: 'ComposeTable' },
      chartsContainer: {
        type: 'Container',
        props: {
          whiteBg: true,
        },
      },
      filterContainer: {
        type: 'Container',
        props: {
          whiteBg: true,
        },
      },
      charts: {
        type: 'Grid',
        props: {
          gutter: 8,
        },
      },
      cpuChart: {
        type: 'PieChart',
        data: {
          label: 'CPU',
          data: [
            { name: '已分配', value: 3.28, formatter: '{v} Core', color: 'orange' },
            { name: '剩余分配', value: 4.72, formatter: '{v} Core', color: 'green' },
          ],
        },
      },
      memChart: {
        type: 'PieChart',
        data: {
          label: 'RAM',
          data: [
            { name: '已分配', value: 28.939, formatter: '{v} G', color: 'orange' },
            { name: '剩余分配', value: 1.63, formatter: '{v} G', color: 'green' },
            { name: '不可分配', value: 1.63, formatter: '{v} G', color: 'red' },
          ],
        },
      },
      podChart: {
        type: 'PieChart',
        data: {
          label: 'Pods',
          data: [
            { name: '已分配', value: 37, formatter: '{v} Core', color: 'orange' },
            { name: '剩余分配', value: 73, formatter: '{v} Core', color: 'green' },
          ],
        },
      },
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
            {
              key: 'pod-analysis',
              text: 'Pod 分析',
            },
          ],
          radioType: 'button',
          size: 'middle',
        },
        state: {
          value: 'cpu-analysis',
        },
        type: 'Radio',
      },
      table: {
        type: 'Table',
        name: 'cpuTable',
        props: {
          batchOperations: ['cordon', 'uncordon', 'drain'],
          columns: [
            {
              dataIndex: 'Node',
              sorter: true,
              title: '节点',
              titleTip: '',
            },
            {
              dataIndex: 'Status',
              fixed: 'left',
              sorter: true,
              title: '状态',
              titleTip: '',
            },
            {
              dataIndex: 'Distribution',
              sorter: true,
              title: '分配率',
              titleTip: '',
            },
            {
              dataIndex: 'Usage',
              sorter: true,
              title: '使用率',
              titleTip: '',
            },
            {
              dataIndex: 'UnusedRate',
              sorter: true,
              title: '闲置率',
              titleTip: '已分配资源中未使用的比例',
            },
            {
              dataIndex: 'IP',
              sorter: true,
              title: 'IP 地址',
              titleTip: '',
            },
            {
              dataIndex: 'Role',
              sorter: true,
              title: 'Role',
              titleTip: '',
            },
            {
              dataIndex: 'Version',
              sorter: true,
              title: '版本',
              titleTip: '',
            },
            {
              dataIndex: 'Operate',
              fixed: 'right',
              title: 'Pods 列表',
              titleTip: '',
            },
          ],
          isLoadMore: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',

          selectable: true,
          sortDirections: ['descend', 'ascend'],
          visible: true,
        },
        state: {
          clusterName: 'terminus-dev',
          sorterData: {},
          values: {
            Q: '221',
          },
        },
        data: {
          list: [
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '3.280/8.000',
                value: '41.0',
              },
              IP: '10.0.6.221',
              Node: {
                renderType: 'multiple',
                icon: 'default_k8s_node',
                direction: 'row',
                renders: [
                  [
                    {
                      icon: 'default_k8s_node',
                      renderType: 'icon',
                    },
                  ],
                  [
                    {
                      operations: {
                        click: {
                          confirm: '',
                          key: 'gotoNodeDetail',
                          reload: false,
                          text: '节点详情',
                        },
                      },
                      reload: false,
                      renderType: 'linkText',
                      value: 'node-010000006221',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'node-010000006221',
                              },
                              params: {},
                              visible: true,
                            },
                            target: 'addLabelModal',
                          },
                          confirm: '',
                          key: 'addLabel',
                          reload: false,
                        },
                        delete: {
                          confirm: '',
                          fillMeta: 'dlabel',
                          key: 'deleteLabel',
                          meta: {
                            dlabel: {},
                            recordId: 'node-010000006221',
                          },
                          reload: true,
                        },
                      },
                      renderType: 'tagsRow',
                      value: [
                        {
                          group: '任务标签',
                          label: 'dice/bigdata-job=true',
                          name: 'dice/bigdata-job=true',
                        },
                        {
                          group: '任务标签',
                          label: 'dice/job=true',
                          name: 'dice/job=true',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-sfwn-org=true',
                          name: 'dice/org-sfwn-org=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-terminus=true',
                          name: 'dice/org-terminus=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/pack-job=true',
                          name: 'dice/pack-job=true',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=node-010000006221',
                          name: 'kubernetes.io/hostname=node-010000006221',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'test=qaaa',
                          name: 'test=qaaa',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hangzhou-k',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hangzhou-k',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/location-cluster-service=true',
                          name: 'dice/location-cluster-service=true',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateless-service=true',
                          name: 'dice/stateless-service=true',
                        },
                        {
                          group: '环境标签',
                          label: 'dice/workspace-dev=true',
                          name: 'dice/workspace-dev=true',
                        },
                        {
                          group: '环境标签',
                          label: 'dice/workspace-prod=true',
                          name: 'dice/workspace-prod=true',
                        },
                        {
                          group: '环境标签',
                          label: 'dice/workspace-staging=true',
                          name: 'dice/workspace-staging=true',
                        },
                        {
                          group: '环境标签',
                          label: 'dice/workspace-test=true',
                          name: 'dice/workspace-test=true',
                        },
                      ],
                    },
                  ],
                ],
              },
              Operate: {
                operations: {
                  gotoPod: {
                    command: {
                      jumpOut: true,
                      key: 'goto',
                      state: {
                        formData: {},
                        params: {},
                        query: {
                          filter__urlQuery: 'eyJub2RlIjpbIm5vZGUtMDEwMDAwMDA2MjIxIl19',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: 'worker',
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              UnusedRate: {
                renderType: 'progress',
                status: 'success',
                tip: '2.192/3.280',
                value: '66.8',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '1.088/8.000',
                value: '13.6',
              },
              Version: 'v1.18.18',
              batchOperations: ['cordon', 'drain'],
              id: 'node-010000006221/10.0.6.221',
              nodeId: 'node-010000006221',
            },
          ],
        },
        operations: {
          changeSort: {
            confirm: '',
            key: 'changeSort',
            reload: true,
          },
          cordon: {
            confirm: '',
            key: 'cordon',
            reload: true,
            text: '冻结',
          },
          drain: {
            confirm: '',
            key: 'drain',
            reload: true,
            text: '驱散',
          },
          uncordon: {
            confirm: '',
            key: 'uncordon',
            reload: true,
            text: '解冻',
          },
        },
      },
      addLabelModal: {
        type: 'FormModal',
        name: 'addLabelModal',
        props: {
          fields: [
            {
              component: 'select',
              componentProps: {
                options: [
                  {
                    name: '环境标签',
                    value: 'environment',
                  },
                  {
                    name: '服务标签',
                    value: 'service',
                  },
                  {
                    name: '任务标签',
                    value: 'job',
                  },
                  {
                    name: '其他标签',
                    value: 'other',
                  },
                  {
                    name: '自定义标签',
                    value: 'custom',
                  },
                ],
              },
              key: 'labelGroup',
              label: '分类',
              required: true,
              rules: {},
            },
            {
              component: 'select',
              componentProps: {
                options: [
                  {
                    name: '开发环境',
                    value: 'dice/workspace-dev=true',
                  },
                  {
                    name: '测试环境',
                    value: 'dice/workspace-test=true',
                  },
                  {
                    name: '预发环境',
                    value: 'dice/workspace-staging=true',
                  },
                  {
                    name: '生产环境',
                    value: 'dice/workspace-prod=true',
                  },
                ],
              },
              key: 'environment',
              label: '标签',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'environment',
                  },
                ],
              ],
              required: true,
              rules: {},
            },
            {
              component: 'select',
              componentProps: {
                options: [
                  {
                    name: '有状态服务',
                    value: 'dice/stateful-service=true',
                  },
                  {
                    name: '无状态服务',
                    value: 'dice/stateless-service=true',
                  },
                  {
                    name: '集群级服务',
                    value: 'dice/location-cluster-service=true',
                  },
                ],
              },
              key: 'service',
              label: '标签',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'service',
                  },
                ],
              ],
              required: true,
              rules: {},
            },
            {
              component: 'select',
              componentProps: {
                options: [
                  {
                    name: 'CICD任务',
                    value: 'dice/job=true',
                  },
                  {
                    name: '大数据任务',
                    value: 'dice/bigdata-job=true',
                  },
                ],
              },
              key: 'job',
              label: '标签',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'job',
                  },
                ],
              ],
              required: true,
              rules: {},
            },
            {
              component: 'select',
              componentProps: {
                options: [
                  {
                    name: '负载均衡',
                    value: 'dice/lb=true',
                  },
                  {
                    name: '平台组件',
                    value: 'dice/platform=true',
                  },
                ],
              },
              key: 'other',
              label: '标签',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'other',
                  },
                ],
              ],
              required: true,
              rules: {},
            },
            {
              component: 'input',
              componentProps: {},
              key: 'label_custom_key',
              label: '标签',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'custom',
                  },
                ],
              ],
              required: true,
              rules: {
                pattern: "pattern: '/^[.a-z\\u4e00-\\u9fa5A-Z0-9_-\\s]*$/'",
              },
            },
            {
              component: 'input',
              componentProps: {},
              key: 'label_custom_value',
              label: '标签值',
              removeWhen: [
                [
                  {
                    field: 'labelGroup',
                    operator: '!=',
                    value: 'custom',
                  },
                ],
              ],
              required: true,
              rules: {
                pattern: '/^[.a-z\\u4e00-\\u9fa5A-Z0-9_-\\s]*$/',
              },
            },
          ],
          title: '添加标签',
        },
        state: {
          visible: false,
        },
        data: {},
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
      },
      batchOperationTipModal: {
        type: 'Modal',
        name: 'batchOperationTipModal',
        props: {
          content: '',
          status: '',
          title: '',
        },
        state: {
          selectedRowKeys: null,
          visible: false,
        },
        data: {},
        operations: {
          onOk: {
            key: 'batchSubmit',
            meta: {
              type: '',
            },
            reload: true,
            successMsg: '状态修改成功',
          },
        },
      },
      cleanData: {
        type: 'Container',
        name: 'cleanData',
        props: null,
        state: {},
        data: {},
        operations: {},
      },
      nodeFilter: {
        type: 'ContractiveFilter',
        name: 'nodeFilter',
        props: {
          delay: 1000,
        },
        state: {
          changedKey: 'Q',
          clusterName: '',
          conditions: [
            {
              emptyText: '未选择',
              fixed: true,
              haveFilter: true,
              key: 'state',
              label: '筛选节点标签',
              options: [
                {
                  children: null,
                  label: 'erda',
                  value: 'dice/org-erda=true',
                },
                {
                  children: null,
                  label: 'sfwn-org',
                  value: 'dice/org-sfwn-org=true',
                },
                {
                  children: null,
                  label: 'terminus',
                  value: 'dice/org-terminus=true',
                },
                {
                  children: [
                    {
                      children: null,
                      label: '开发环境(dice/workspace-dev=true)',
                      value: 'dice/workspace-dev=true',
                    },
                    {
                      children: null,
                      label: '测试环境(dice/workspace-test=true)',
                      value: 'dice/workspace-test=true',
                    },
                    {
                      children: null,
                      label: '预发环境(dice/workspace-staging=true)',
                      value: 'dice/workspace-staging=true',
                    },
                    {
                      children: null,
                      label: '生产环境(dice/workspace-prod=true)',
                      value: 'dice/workspace-prod=true',
                    },
                  ],
                  label: '环境标签',
                  value: 'env',
                },
                {
                  children: [
                    {
                      children: null,
                      label: '有状态服务(dice/stateful-service=true)',
                      value: 'dice/stateful-service=true',
                    },
                    {
                      children: null,
                      label: '无状态服务(dice/stateless-service=true)',
                      value: 'dice/stateless-service=true',
                    },
                    {
                      children: null,
                      label: '集群级服务(dice/location-cluster-service=true)',
                      value: 'dice/location-cluster-service=true',
                    },
                  ],
                  label: '服务标签',
                  value: 'service',
                },
                {
                  children: [
                    {
                      children: null,
                      label: 'CICD任务(dice/job=true)',
                      value: 'dice/job=true',
                    },
                    {
                      children: null,
                      label: '大数据任务(dice/bigdata-job=true)',
                      value: 'dice/bigdata-job=true',
                    },
                  ],
                  label: '任务标签',
                  value: 'job-label',
                },
                {
                  children: [
                    {
                      children: null,
                      label: '负载均衡(dice/lb=true)',
                      value: 'dice/lb=true',
                    },
                    {
                      children: null,
                      label: '平台组件(dice/platform=true)',
                      value: 'dice/platform=true',
                    },
                    {
                      children: null,
                      label: 'alpha.service-controller.kubernetes.io/exclude-balancer=true',
                      value: 'alpha.service-controller.kubernetes.io/exclude-balancer=true',
                    },
                    {
                      children: null,
                      label: 'beta.kubernetes.io/arch=amd64',
                      value: 'beta.kubernetes.io/arch=amd64',
                    },
                    {
                      children: null,
                      label: 'beta.kubernetes.io/os=linux',
                      value: 'beta.kubernetes.io/os=linux',
                    },
                    {
                      children: null,
                      label: 'dice/alluxio-worker=true',
                      value: 'dice/alluxio-worker=true',
                    },
                    {
                      children: null,
                      label: 'dice/alluxio=true',
                      value: 'dice/alluxio=true',
                    },
                    {
                      children: null,
                      label: 'dice/cassandra=true',
                      value: 'dice/cassandra=true',
                    },
                    {
                      children: null,
                      label: 'dice/es=true',
                      value: 'dice/es=true',
                    },
                    {
                      children: null,
                      label: 'dice/fdp-addons=true',
                      value: 'dice/fdp-addons=true',
                    },
                    {
                      children: null,
                      label: 'dice/gittar=true',
                      value: 'dice/gittar=true',
                    },
                    {
                      children: null,
                      label: 'dice/hugegraph=true',
                      value: 'dice/hugegraph=true',
                    },
                    {
                      children: null,
                      label: 'dice/kafka=true',
                      value: 'dice/kafka=true',
                    },
                    {
                      children: null,
                      label: 'dice/location-go-demo=true',
                      value: 'dice/location-go-demo=true',
                    },
                    {
                      children: null,
                      label: 'dice/master=true',
                      value: 'dice/master=true',
                    },
                    {
                      children: null,
                      label: 'dice/nexus=true',
                      value: 'dice/nexus=true',
                    },
                    {
                      children: null,
                      label: 'dice/pack-job=true',
                      value: 'dice/pack-job=true',
                    },
                    {
                      children: null,
                      label: 'failure-domain.beta.kubernetes.io/region=cn-hangzhou',
                      value: 'failure-domain.beta.kubernetes.io/region=cn-hangzhou',
                    },
                    {
                      children: null,
                      label: 'failure-domain.beta.kubernetes.io/zone=cn-hangzhou-k',
                      value: 'failure-domain.beta.kubernetes.io/zone=cn-hangzhou-k',
                    },
                    {
                      children: null,
                      label: 'io/exclude-node=true',
                      value: 'io/exclude-node=true',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/arch=amd64',
                      value: 'kubernetes.io/arch=amd64',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006216',
                      value: 'kubernetes.io/hostname=node-010000006216',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006217',
                      value: 'kubernetes.io/hostname=node-010000006217',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006218',
                      value: 'kubernetes.io/hostname=node-010000006218',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006219',
                      value: 'kubernetes.io/hostname=node-010000006219',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006220',
                      value: 'kubernetes.io/hostname=node-010000006220',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=node-010000006221',
                      value: 'kubernetes.io/hostname=node-010000006221',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=virtual-kubelet-cn-hangzhou-k',
                      value: 'kubernetes.io/hostname=virtual-kubelet-cn-hangzhou-k',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/os=linux',
                      value: 'kubernetes.io/os=linux',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/role=agent',
                      value: 'kubernetes.io/role=agent',
                    },
                    {
                      children: null,
                      label: 'node-role.kubernetes.io/lb=',
                      value: 'node-role.kubernetes.io/lb=',
                    },
                    {
                      children: null,
                      label: 'node-role.kubernetes.io/master=',
                      value: 'node-role.kubernetes.io/master=',
                    },
                    {
                      children: null,
                      label: 'service.beta.kubernetes.io/exclude-node=true',
                      value: 'service.beta.kubernetes.io/exclude-node=true',
                    },
                    {
                      children: null,
                      label: 'test=qaaa',
                      value: 'test=qaaa',
                    },
                    {
                      children: null,
                      label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hangzhou-k',
                      value: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hangzhou-k',
                    },
                    {
                      children: null,
                      label: 'type=virtual-kubelet',
                      value: 'type=virtual-kubelet',
                    },
                  ],
                  label: '其他标签',
                  value: 'other-label',
                },
              ],
              placeholder: '',
              type: 'select',
            },
            {
              emptyText: '',
              fixed: true,
              haveFilter: false,
              key: 'Q',
              label: '标签',
              options: null,
              placeholder: '请输入节点名称或IP',
              type: 'input',
            },
          ],
          values: {
            Q: '221',
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
      tableTabsContainer: {
        type: 'Container',
        name: 'tableTabsContainer',
        props: {
          whiteBg: true,
        },
        state: {},
        data: {},
        operations: {},
      },
    },
  },
};
