export const enhanceMock = null;
export const mockData = {
  scenario: {
    scenarioKey: 'cmp-dashboard-nodes',
    scenarioType: 'cmp-dashboard-nodes',
  },
  protocol: {
    version: '',
    scenario: 'cmp-dashboard-nodes',
    state: {
      _error_: null,
      activeKey: 'mem-analysis',
      cpuChart: [
        {
          color: 'primary8',
          formatter: '21.526核',
          name: '已分配',
          value: 21.526,
        },
        {
          color: 'primary5',
          formatter: '58.474核',
          name: '剩余分配',
          value: 58.474,
        },
      ],
      memoryChart: [
        {
          color: 'primary8',
          formatter: '184.546GB',
          name: '已分配',
          value: 198155146496,
        },
        {
          color: 'primary5',
          formatter: '118.298GB',
          name: '剩余分配',
          value: 127022312192,
        },
        {
          color: 'primary2',
          formatter: '9.765GB',
          name: '不可分配',
          value: 10485760000,
        },
      ],
      podsChart: [
        {
          color: 'primary8',
          formatter: '318',
          name: '已分配',
          value: 318,
        },
        {
          color: 'primary5',
          formatter: '322',
          name: '剩余分配',
          value: 322,
        },
      ],
    },
    hierarchy: {
      root: 'page',
      structure: {
        charts: ['cpuChart', 'memChart', 'podChart'],
        chartsContainer: ['charts'],
        page: ['chartsContainer', 'tabs', 'tabsTable', 'addLabelModal', 'cleanData', 'batchOperationTipModal'],
        tabsTable: {
          slot: 'filter',
          table: 'table',
        },
      },
    },
    components: {
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
      charts: {
        type: 'Grid',
        name: 'charts',
        props: {
          gutter: 8,
        },
        state: {},
        data: {},
        operations: {},
      },
      chartsContainer: {
        type: 'Container',
        name: 'chartsContainer',
        props: {
          whiteBg: true,
        },
        state: {},
        data: {},
        operations: {},
      },
      cleanData: {
        type: 'Container',
        name: 'cleanData',
        props: null,
        state: {},
        data: {},
        operations: {},
      },
      cpuChart: {
        type: 'PieChart',
        name: 'cpuChart',
        props: null,
        state: {},
        data: {
          data: [
            {
              color: 'primary8',
              formatter: '21.526核',
              name: '已分配',
              value: 21.526,
            },
            {
              color: 'primary5',
              formatter: '58.474核',
              name: '剩余分配',
              value: 58.474,
            },
          ],
          label: 'CPU',
        },
        operations: {},
      },
      filter: {
        type: 'ContractiveFilter',
        name: 'filter',
        props: {
          delay: 1000,
        },
        state: {
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
                  label: 'integration',
                  value: 'dice/org-integration=true',
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
                      label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                      value: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                    },
                    {
                      children: null,
                      label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                      value: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                    },
                    {
                      children: null,
                      label: 'beta.kubernetes.io/arch=amd64',
                      value: 'beta.kubernetes.io/arch=amd64',
                    },
                    {
                      children: null,
                      label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                      value: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                    },
                    {
                      children: null,
                      label: 'beta.kubernetes.io/os=linux',
                      value: 'beta.kubernetes.io/os=linux',
                    },
                    {
                      children: null,
                      label: 'chenzhongrun-custom-label=true',
                      value: 'chenzhongrun-custom-label=true',
                    },
                    {
                      children: null,
                      label: 'cxcx=xcxc',
                      value: 'cxcx=xcxc',
                    },
                    {
                      children: null,
                      label: 'dice/alluxio=true',
                      value: 'dice/alluxio=true',
                    },
                    {
                      children: null,
                      label: 'dice/location-go-demo=true',
                      value: 'dice/location-go-demo=true',
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
                      label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                      value: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                    },
                    {
                      children: null,
                      label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                      value: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/arch=amd64',
                      value: 'kubernetes.io/arch=amd64',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.126',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.126',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.127',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.127',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.131',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.131',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.132',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.132',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.133',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.133',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.152',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.152',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.153',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.153',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.160',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.160',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.161',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.161',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.162',
                      value: 'kubernetes.io/hostname=cn-hongkong.172.16.0.162',
                    },
                    {
                      children: null,
                      label: 'kubernetes.io/os=linux',
                      value: 'kubernetes.io/os=linux',
                    },
                    {
                      children: null,
                      label: 'node-role.kubernetes.io/lb=',
                      value: 'node-role.kubernetes.io/lb=',
                    },
                    {
                      children: null,
                      label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                      value: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                    },
                    {
                      children: null,
                      label: 'platform=true',
                      value: 'platform=true',
                    },
                    {
                      children: null,
                      label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                      value: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                    },
                    {
                      children: null,
                      label: 'topology.kubernetes.io/region=cn-hongkong',
                      value: 'topology.kubernetes.io/region=cn-hongkong',
                    },
                    {
                      children: null,
                      label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                      value: 'topology.kubernetes.io/zone=cn-hongkong-b',
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
          filter__urlQuery: 'bnVsbA==',
          values: null,
        },
        data: {},
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      memChart: {
        type: 'PieChart',
        name: 'memChart',
        props: null,
        state: {},
        data: {
          data: [
            {
              color: 'primary8',
              formatter: '184.546GB',
              name: '已分配',
              value: 198155146496,
            },
            {
              color: 'primary5',
              formatter: '118.298GB',
              name: '剩余分配',
              value: 127022312192,
            },
            {
              color: 'primary2',
              formatter: '9.765GB',
              name: '不可分配',
              value: 10485760000,
            },
          ],
          label: '内存',
        },
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
      podChart: {
        type: 'PieChart',
        name: 'podChart',
        props: null,
        state: {},
        data: {
          data: [
            {
              color: 'primary8',
              formatter: '318',
              name: '已分配',
              value: 318,
            },
            {
              color: 'primary5',
              formatter: '322',
              name: '剩余分配',
              value: 322,
            },
          ],
          label: 'Pods',
        },
        operations: {},
      },
      table: {
        type: 'Table',
        name: 'table',
        props: {
          batchOperations: ['cordon', 'uncordon', 'drain'],
          columns: [
            {
              align: '',
              dataIndex: 'Node',
              // fixed: 'left',
              sorter: true,
              title: '节点',
              titleTip: '',
              width: 500,
            },
            {
              align: '',
              dataIndex: 'Status',
              sorter: true,
              title: '状态',
              titleTip: '',
            },
            // {
            //   align: 'right',
            //   dataIndex: 'Distribution',
            //   sorter: true,
            //   title: '分配率',
            //   titleTip: '',
            // },
            {
              align: 'right',
              dataIndex: 'Usage',
              sorter: true,
              title: '使用率',
              titleTip: '',
            },
            {
              align: '',
              dataIndex: 'DistributionRate',
              sorter: true,
              title: '分配额使用程度',
              titleTip: '已分配资源中使用的比例',
            },
            {
              align: '',
              dataIndex: 'IP',
              sorter: true,
              title: 'IP 地址',
              titleTip: '',
            },
            {
              align: '',
              dataIndex: 'Role',
              sorter: true,
              title: 'Role',
              titleTip: '',
            },
            {
              align: '',
              dataIndex: 'Version',
              sorter: true,
              title: '版本',
              titleTip: '',
            },
            {
              align: '',
              dataIndex: 'Operate',
              fixed: 'right',
              title: 'Pods 列表',
              titleTip: '',
            },
          ],
          isLoadMore: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',
          scroll: {
            x: 1200,
          },
          selectable: true,
          sortDirections: ['descend', 'ascend'],
        },
        state: {
          clusterName: 'erda-hongkong',
          sorterData: {},
          values: null,
        },
        data: {
          list: [
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '15.6G/30.3G',
                value: '51.5',
              },
              DistributionRate: {
                distributionValue: 0.7,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.126',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.126',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.126',
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
                            recordId: 'cn-hongkong.172.16.0.126',
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
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'chenzhongrun-custom-label=true',
                          name: 'chenzhongrun-custom-label=true',
                        },
                        {
                          group: '其他标签',
                          label: 'cxcx=xcxc',
                          name: 'cxcx=xcxc',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/lb=true',
                          name: 'dice/lb=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/nexus=true',
                          name: 'dice/nexus=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.126',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.126',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node-role.kubernetes.io/lb=',
                          name: 'node-role.kubernetes.io/lb=',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'platform=true',
                          name: 'platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjEyNiJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'lb',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '10.8G/30.3G',
                value: '35.8',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.126',
              nodeId: 'cn-hongkong.172.16.0.126',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '18.7G/30.3G',
                value: '61.8',
              },
              DistributionRate: {
                distributionValue: 0.49,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.127',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.127',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.127',
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
                            recordId: 'cn-hongkong.172.16.0.127',
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
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/lb=true',
                          name: 'dice/lb=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.127',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.127',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node-role.kubernetes.io/lb=',
                          name: 'node-role.kubernetes.io/lb=',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjEyNyJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'lb',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '9.3G/30.3G',
                value: '30.6',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.127',
              nodeId: 'cn-hongkong.172.16.0.127',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '14.3G/30.3G',
                value: '47.3',
              },
              DistributionRate: {
                distributionValue: 0.87,
                renderType: 'text',
                value: '高',
              },
              IP: '172.16.0.131',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.131',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.131',
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
                            recordId: 'cn-hongkong.172.16.0.131',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/alluxio=true',
                          name: 'dice/alluxio=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.131',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.131',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/location-cluster-service=true',
                          name: 'dice/location-cluster-service=true',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjEzMSJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '12.4G/30.3G',
                value: '41.0',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.131',
              nodeId: 'cn-hongkong.172.16.0.131',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '16.5G/30.3G',
                value: '54.6',
              },
              DistributionRate: {
                distributionValue: 0.67,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.132',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.132',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.132',
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
                            recordId: 'cn-hongkong.172.16.0.132',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/alluxio=true',
                          name: 'dice/alluxio=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.132',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.132',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/location-cluster-service=true',
                          name: 'dice/location-cluster-service=true',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjEzMiJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '11.1G/30.3G',
                value: '36.8',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.132',
              nodeId: 'cn-hongkong.172.16.0.132',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '13.0G/30.3G',
                value: '42.8',
              },
              DistributionRate: {
                distributionValue: 0.9,
                renderType: 'text',
                value: '高',
              },
              IP: '172.16.0.133',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.133',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.133',
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
                            recordId: 'cn-hongkong.172.16.0.133',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/alluxio=true',
                          name: 'dice/alluxio=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.133',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.133',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/location-cluster-service=true',
                          name: 'dice/location-cluster-service=true',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjEzMyJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '11.6G/30.3G',
                value: '38.4',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.133',
              nodeId: 'cn-hongkong.172.16.0.133',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '22.6G/30.3G',
                value: '74.5',
              },
              DistributionRate: {
                distributionValue: 0.38,
                renderType: 'text',
                value: '低',
              },
              IP: '172.16.0.152',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.152',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.152',
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
                            recordId: 'cn-hongkong.172.16.0.152',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
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
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.152',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.152',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjE1MiJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '8.5G/30.3G',
                value: '28.1',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.152',
              nodeId: 'cn-hongkong.172.16.0.152',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '20.4G/30.3G',
                value: '67.4',
              },
              DistributionRate: {
                distributionValue: 1.04,
                renderType: 'text',
                value: '高',
              },
              IP: '172.16.0.153',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.153',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.153',
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
                            recordId: 'cn-hongkong.172.16.0.153',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
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
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.153',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.153',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjE1MyJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '21.2G/30.3G',
                value: '70.0',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.153',
              nodeId: 'cn-hongkong.172.16.0.153',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '16.6G/30.3G',
                value: '54.7',
              },
              DistributionRate: {
                distributionValue: 0.67,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.160',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.160',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.160',
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
                            recordId: 'cn-hongkong.172.16.0.160',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
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
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.160',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.160',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjE2MCJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '11.1G/30.3G',
                value: '36.8',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.160',
              nodeId: 'cn-hongkong.172.16.0.160',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '14.9G/30.3G',
                value: '49.3',
              },
              DistributionRate: {
                distributionValue: 0.57,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.161',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.161',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.161',
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
                            recordId: 'cn-hongkong.172.16.0.161',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
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
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-terminus=true',
                          name: 'dice/org-terminus=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.161',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.161',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjE2MSJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '8.5G/30.3G',
                value: '28.0',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.161',
              nodeId: 'cn-hongkong.172.16.0.161',
            },
            {
              Distribution: {
                renderType: 'progress',
                status: 'success',
                tip: '20.6G/30.3G',
                value: '68.1',
              },
              DistributionRate: {
                distributionValue: 0.6,
                renderType: 'text',
                value: '中',
              },
              IP: '172.16.0.162',
              Node: {
                direction: 'row',
                renderType: 'multiple',
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
                      value: 'cn-hongkong.172.16.0.162',
                    },
                    {
                      operations: {
                        add: {
                          command: {
                            key: 'set',
                            state: {
                              formData: {
                                recordId: 'cn-hongkong.172.16.0.162',
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
                            recordId: 'cn-hongkong.172.16.0.162',
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
                          label: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                          name: 'ack.aliyun.com=cf80a6af61a234ded801820f28659c188',
                        },
                        {
                          group: '其他标签',
                          label: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                          name: 'alibabacloud.com/nodepool-id=npb18b10560a294df0a67cd5bf78a674c7',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/arch=amd64',
                          name: 'beta.kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'beta.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'beta.kubernetes.io/os=linux',
                          name: 'beta.kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/location-go-demo=true',
                          name: 'dice/location-go-demo=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-erda=true',
                          name: 'dice/org-erda=true',
                        },
                        {
                          group: '其他标签',
                          label: 'dice/org-integration=true',
                          name: 'dice/org-integration=true',
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
                          label: 'dice/platform=true',
                          name: 'dice/platform=true',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                          name: 'failure-domain.beta.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                          name: 'failure-domain.beta.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/arch=amd64',
                          name: 'kubernetes.io/arch=amd64',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/hostname=cn-hongkong.172.16.0.162',
                          name: 'kubernetes.io/hostname=cn-hongkong.172.16.0.162',
                        },
                        {
                          group: '其他标签',
                          label: 'kubernetes.io/os=linux',
                          name: 'kubernetes.io/os=linux',
                        },
                        {
                          group: '其他标签',
                          label: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                          name: 'node.kubernetes.io/instance-type=ecs.g5ne.2xlarge',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                          name: 'topology.diskplugin.csi.alibabacloud.com/zone=cn-hongkong-b',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/region=cn-hongkong',
                          name: 'topology.kubernetes.io/region=cn-hongkong',
                        },
                        {
                          group: '其他标签',
                          label: 'topology.kubernetes.io/zone=cn-hongkong-b',
                          name: 'topology.kubernetes.io/zone=cn-hongkong-b',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/location-cluster-service=true',
                          name: 'dice/location-cluster-service=true',
                        },
                        {
                          group: '服务标签',
                          label: 'dice/stateful-service=true',
                          name: 'dice/stateful-service=true',
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
                          filter__urlQuery: 'eyJub2RlIjpbImNuLWhvbmdrb25nLjE3Mi4xNi4wLjE2MiJdfQ==',
                        },
                      },
                      target: 'cmpClustersPods',
                    },
                    confirm: '',
                    key: 'gotoPod',
                    reload: false,
                    text: '查看pods',
                  },
                },
                renderType: 'tableOperation',
              },
              Role: {
                renderType: 'tagsRow',
                size: 'normal',
                value: {
                  label: 'worker',
                },
              },
              Status: {
                renderType: 'textWithBadge',
                status: 'success',
                value: '就绪',
              },
              Usage: {
                renderType: 'progress',
                status: 'success',
                tip: '12.4G/30.3G',
                value: '40.9',
              },
              Version: 'v1.18.8-aliyun.1',
              batchOperations: ['cordon'],
              id: 'cn-hongkong.172.16.0.162',
              nodeId: 'cn-hongkong.172.16.0.162',
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
      tabs: {
        type: 'Radio',
        name: 'tabs',
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
          size: 'small',
        },
        state: {
          tableTabs__urlQuery: 'Im1lbS1hbmFseXNpcyI=',
          value: 'mem-analysis',
        },
        data: {},
        operations: {
          onChange: {
            fillMeta: '',
            key: 'changeViewType',
            meta: {
              activeKey: '',
            },
            reload: true,
          },
        },
      },
      tabsTable: {
        type: 'ComposeTable',
        name: 'tabsTable',
        props: null,
        state: {},
        data: {},
        operations: {},
      },
    },
    rendering: {
      __DefaultRendering__: [
        {
          name: 'page',
          state: null,
        },
        {
          name: 'tabsTable',
          state: null,
        },
        {
          name: 'filter',
          state: null,
        },
        {
          name: 'tabs',
          state: null,
        },
        {
          name: 'batchOperationTipModal',
          state: null,
        },
        {
          name: 'table',
          state: [
            {
              name: 'values',
              value: '{{ filter.values }}',
            },
            {
              name: 'clusterName',
              value: '{{ __InParams__.clusterName }}',
            },
          ],
        },
        {
          name: 'chartsContainer',
          state: null,
        },
        {
          name: 'charts',
          state: null,
        },
        {
          name: 'cpuChart',
          state: null,
        },
        {
          name: 'memChart',
          state: null,
        },
        {
          name: 'podChart',
          state: null,
        },
        {
          name: 'addLabelModal',
          state: null,
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
      addLabelModal: [
        {
          name: 'filter',
          state: null,
        },
        {
          name: 'tabsTable',
          state: null,
        },
        {
          name: 'tabs',
          state: null,
        },
        {
          name: 'table',
          state: [
            {
              name: 'values',
              value: '{{ filter.values }}',
            },
            {
              name: 'clusterName',
              value: '{{ __InParams__.clusterName }}',
            },
          ],
        },
        {
          name: 'batchOperationTipModal',
          state: null,
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
      batchOperationTipModal: [
        {
          name: 'tabsTable',
          state: null,
        },
        {
          name: 'tabs',
          state: null,
        },
        {
          name: 'table',
          state: [
            {
              name: 'values',
              value: '{{ filter.values }}',
            },
            {
              name: 'clusterName',
              value: '{{ __InParams__.clusterName }}',
            },
          ],
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
      filter: [
        {
          name: 'tabs',
          state: null,
        },
        {
          name: 'table',
          state: [
            {
              name: 'values',
              value: '{{ filter.values }}',
            },
            {
              name: 'clusterName',
              value: '{{ __InParams__.clusterName }}',
            },
          ],
        },
        {
          name: 'charts',
          state: null,
        },
        {
          name: 'cpuChart',
          state: null,
        },
        {
          name: 'memChart',
          state: null,
        },
        {
          name: 'podChart',
          state: null,
        },
        {
          name: 'batchOperationTipModal',
          state: null,
        },
        {
          name: 'addLabelModal',
          state: null,
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
      table: [
        {
          name: 'batchOperationTipModal',
          state: null,
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
      tabsTable: [
        {
          name: 'filter',
          state: null,
        },
        {
          name: 'tabs',
          state: null,
        },
        {
          name: 'table',
          state: [
            {
              name: 'values',
              value: '{{ filter.values }}',
            },
            {
              name: 'clusterName',
              value: '{{ __InParams__.clusterName }}',
            },
          ],
        },
        {
          name: 'addLabelModal',
          state: null,
        },
        {
          name: 'batchOperationTipModal',
          state: null,
        },
        {
          name: 'cleanData',
          state: null,
        },
      ],
    },
    options: {
      syncIntervalSecond: 0,
    },
  },
};
