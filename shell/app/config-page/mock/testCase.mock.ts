export const enhanceMock = (data, payload) => {
  if (payload.event?.operation === 'changeTab') {
  }

  console.log('------', payload);

  return data;
};

export const mockData = {
  scenario: {
    scenarioType: 'auto-test-space-list',
    scenarioKey: 'auto-test-space-list',
  },
  protocol: {
    version: '0.2',
    scenario: 'auto-test-space-list',
    state: {
      _error_: '',
    },
    hierarchy: {
      version: '',
      root: 'spaceManage',
      structure: {
        spaceManage: ['head', 'spaceList', 'topHead', 'spaceFormModal', 'recordDrawer'],
        topHead: ['spaceAddButton'],
        head: ['importButton', 'recordButton'],
        recordDrawer: { content: 'recordContent' },
        recordContent: ['refreshButton', 'recordTable'],
      },
    },
    components: {
      head: {
        type: 'RowContainer',
      },
      importButton: {
        type: 'Button',
        props: {
          text: '导入',
          type: 'primary',
          ghost: true,
        },
        operations: {
          click: { reload: false },
        },
      },
      recordButton: {
        type: 'Button',
        props: {
          text: '导入导出记录',
          type: 'primary',
          ghost: true,
        },
        operations: {
          click: {
            key: 'openRecord',
            reload: false,
            command: {
              key: 'set',
              target: 'recordDrawer',
              state: { visible: true },
            },
          },
        },
      },
      recordContent: {
        type: 'Container',
      },
      refreshButton: {
        type: 'Button',
        props: {
          visible: false,
        },
        operations: {
          autoRefresh: {
            key: 'autoRefresh',
            reload: true,
            showLoading: false,
          },
        },
      },
      recordDrawer: {
        type: 'Drawer',
        props: {
          title: '导入导出记录表',
          size: 'xl',
        },
        state: { visible: false },
      },
      recordTable: {
        type: 'Table',
        props: {
          columns: [
            { dataIndex: 'id', title: 'ID' },
            { dataIndex: 'type', title: '类型' },
            { dataIndex: 'operator', title: '操作人' },
            { dataIndex: 'time', title: '时间' },
            { dataIndex: 'desc', title: '描述' },
            { dataIndex: 'status', title: '状态' },
            { dataIndex: 'result', title: '结果' },
          ],
        },
        data: {
          list: [
            {
              id: '11',
              type: '导入',
              operator: 'dice',
              time: '2021-02-02 11:33:00',
              desc: '测试测试',
              status: {
                renderType: 'textWithBadge',
                value: '成功',
                status: 'success',
              },
              result: {
                renderType: 'downloadUrl',
                url: 'sss',
                value: '下载文件',
              },
            },
          ],
        },
      },
      spaceAddButton: {
        type: 'Button',
        name: 'spaceAddButton',
        props: {
          text: '新建空间',
          type: 'primary',
          operations: null,
        },
        operations: {
          click: {
            reload: false,
            key: 'addSpace',
            command: {
              key: 'set',
              state: {
                formData: null,
                visible: true,
              },
              target: 'spaceFormModal',
            },
          },
        },
      },
      spaceFormModal: {
        type: 'FormModal',
        name: 'spaceFormModal',
        props: {
          fields: [
            {
              component: 'input',
              componentProps: {
                maxLength: 50,
              },
              key: 'name',
              label: '空间名',
              required: true,
              rules: [
                {
                  msg: '可输入中文、英文、数字、中划线或下划线',
                  pattern: '/^[.a-z\\u4e00-\\u9fa5A-Z0-9_-\\s]*$/',
                },
              ],
            },
            {
              component: 'textarea',
              componentProps: {
                maxLength: 1000,
              },
              key: 'desc',
              label: '描述',
              required: false,
            },
          ],
          name: '',
          title: '',
          visible: false,
        },
        state: {
          formData: null,
          reload: false,
          visible: false,
        },
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
        },
      },
      spaceList: {
        type: 'Table',
        name: 'spaceList',
        props: {
          className: '',
          columns: [
            {
              data: null,
              dataIndex: 'name',
              title: '空间名',
              titleRenderType: '',
              titleTip: null,
            },
            {
              data: null,
              dataIndex: 'desc',
              title: '描述',
              titleRenderType: '',
              titleTip: null,
            },
            {
              data: null,
              dataIndex: 'status',
              title: '状态',
              titleRenderType: '',
              titleTip: null,
            },
            {
              data: null,
              dataIndex: 'operate',
              title: '操作',
              titleRenderType: '',
              titleTip: null,
              width: 150,
            },
          ],
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'id',
          rowSelection: null,
          title: '',
          visible: true,
        },
        data: {
          list: [
            {
              desc: '',
              id: 21,
              name: 'i',
              operate: {
                operations: {
                  'a-edit': {
                    command: {
                      key: 'set',
                      state: {
                        formData: {
                          desc: '',
                          id: 21,
                          name: 'i',
                        },
                        reload: false,
                        visible: true,
                      },
                      target: 'spaceFormModal',
                    },
                    disabled: false,
                    key: 'edit',
                    reload: false,
                    text: '编辑',
                  },
                  copy: {
                    confirm: '是否确认复制',
                    disabled: false,
                    key: 'copy',
                    meta: {
                      id: 21,
                    },
                    reload: true,
                    text: '复制',
                  },
                  export: {
                    key: 'export',
                    meta: { id: 21 },
                    disabled: false,
                    disabledTip: '',
                    reload: true,
                    text: '导出',
                    successMsg: '导出任务已创建，请在记录中查看进度',
                  },
                  delete: {
                    confirm: '是否确认删除',
                    disabled: true,
                    disabledTip: '无法删除',
                    key: 'delete',
                    meta: {
                      id: 21,
                    },
                    reload: true,
                    text: '删除',
                  },
                },
                renderType: 'tableOperation',
                value: '',
              },
              status: {
                renderType: 'textWithBadge',
              },
            },
          ],
        },
        state: {
          pageNo: 1,
          pageSize: 10,
          total: 0,
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
          },
          changePageSize: {
            key: 'changePageSize',
            reload: true,
          },
          clickRow: {
            key: 'clickRow',
            reload: false,
            command: {
              key: 'goto',
              state: {},
              target: 'project_test_spaceDetail_scenes',
              jumpOut: false,
            },
          },
        },
      },
      spaceManage: {
        type: 'Container',
        name: 'spaceManage',
      },
      topHead: {
        type: 'RowContainer',
        name: 'topHead',
        props: {
          isTopHead: true,
        },
      },
    },
    rendering: {
      spaceFormModal: [
        {
          name: 'spaceList',
          state: [],
        },
      ],
    },
  },
};
