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

import { cloneDeep } from 'lodash';

export const enhanceMock = (data: any, payload: any) => {
  console.log('------', payload);
  if (payload?.event?.operation === 'update') {
    const _data = cloneDeep(data);
    _data.protocol.components.gantt.data = {
      updateList: [
        // {
        //   start: getDate(1),
        //   end: getDate(10),
        //   title: 'R1-测试数据测试数据测试数据测试数据测试数据测试数据测试数据',
        //   key: 'R1',
        //   isLeaf: false,
        //   extra: {
        //     type: 'requirement',
        //     user: '张三',
        //     status: { text: '进行中', status: 'processing' },
        //   },
        // },
        {
          key: payload.event.operationData.meta.nodes.key,
          title: `T${payload.event.operationData.meta.nodes.key}测试测试测试测试测试测试测试测试测试测试测试`,
          start: payload.event.operationData.meta.nodes.start,
          end: payload.event.operationData.meta.nodes.end,
          isLeaf: true,
          extra: {
            type: 'task',
            user: '张三',
            status: { text: '进行中', status: 'processing' },
          },
        },
      ],
      expandList: null,
    };
    return _data;
  }
  if (payload.event?.operation === 'expandNode') {
    const _data = cloneDeep(data);
    _data.protocol.components.gantt.data = {
      expandList: {
        R2: [
          {
            id: '2-1',
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
    };
    return _data;
  }
  return data;
};
const currentDate = new Date();
const getDate = (day: number) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime();

const makeData = (num: number) => {
  return new Array(num).fill('').map((_, idx) => ({
    key: `1-${idx + 1}`,
    title: `T1-${idx + 1}测试测试测试测试测试测试测试测试测试测试测试`,
    start: getDate(1),
    end: getDate(5),
    isLeaf: true,
    extra: {
      type: 'task',
      user: '张三',
      status: { text: '进行中', status: 'processing' },
    },
  }));
};

export const mockData = {
  scenario: {
    scenarioType: 'personal-workbench',
    scenarioKey: 'personal-workbench',
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: {
          left: 'leftContent',
          right: 'userProfile',
        },
        leftContent: ['head', 'workTabs', 'workContainer', 'messageTabs', 'messageList'],
        workContainer: ['workCards', 'workList'],
        workList: {
          filter: ['workListFilter'],
        },
      },
    },
    components: {
      page: {
        type: 'LRContainer',
      },
      leftContent: {
        type: 'Container',
      },
      userProfile: {
        type: 'Custom',
      },
      head: {
        type: 'Custom',
      },
      workTabs: {
        type: 'RadioTabs',
        data: {
          options: [
            {
              value: 'project',
              label: '项目(10)',
            },
            {
              value: 'app',
              label: '应用(2)',
            },
          ],
        },
        state: { value: 'project' },
        operations: {
          onChange: {
            clientData: { value: 'app' },
          },
        },
      },
      workContainer: {
        type: 'Container',
      },
      workCards: {
        type: 'Card',
        data: {
          title: '星标项目',
          titleSummary: '4',
          cards: [
            {
              id: 1,
              icon: 'bug', // 可能为图标，优先展示img
              title: '项目项目项目项目项目项目项目项目',
              labels: [{ label: '默认' }],
              star: false,
              textMeta: [
                {
                  mainText: '12',
                  subText: '已过期',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '今日截止',
                  operations: {
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'mail',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'bug',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: true,
                    target: 'xx',
                    params: { projectId: '22' },
                    query: {},
                  },
                },
              },
            },
            {
              id: 2,
              img: 'xx', // 可能为图片
              icon: 'xx', // 可能为图标，优先展示img
              title: '项目',
              labels: [{ label: '默认' }],
              star: false,
              textMeta: [
                {
                  mainText: '12',
                  subText: '已过期',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '今日截止',
                  operations: {
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: true,
                    target: 'xx',
                    params: { projectId: '22' },
                    query: {},
                  },
                },
              },
            },
            {
              id: 3,
              img: 'xx', // 可能为图片
              icon: 'xx', // 可能为图标，优先展示img
              title: '项目',
              labels: [{ label: '默认' }],
              star: false,
              textMeta: [
                {
                  mainText: '12',
                  subText: '已过期',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '今日截止',
                  operations: {
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: true,
                    target: 'xx',
                    params: { projectId: '22' },
                    query: {},
                  },
                },
              },
            },
            {
              id: 44,
              img: 'xx', // 可能为图片
              icon: 'xx', // 可能为图标，优先展示img
              title: '项目',
              labels: [{ label: '默认' }],
              star: false,
              textMeta: [
                {
                  mainText: '12',
                  subText: '已过期',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '今日截止',
                  operations: {
                    clickGoto: {
                      jumpOut: true,
                      target: 'xx', // 此处target/query/params，到时候统一整理给
                      query: {},
                      params: {},
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'xx',
                  tip: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: true,
                    target: 'xx',
                    params: { projectId: '22' },
                    query: {},
                  },
                },
              },
            },
          ],
        },
      },
      workList: {
        type: 'List',
        version: '2',
        data: {
          pageNo: 1,
          pageSize: 10,
          total: 10,
          title: '项目列表',
          summary: '12',
          list: [
            {
              id: '1', // 唯一id, eg: appid
              logo: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              star: true, // 当前是否已收藏
              labels: [
                {
                  label: '研发项目',
                },
              ],
              // description: '这是项目 A 的描述',
              backgroundImg: '//背景水印图片的 url 地址',
              metaInfos: [
                {
                  label: '已过期',
                  value: '2',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '提示信息',
                  operations: {
                    clickGotoExpired: {
                      serverData: {
                        params: {
                          projectId: 1,
                        },
                        query: {
                          issueFilter__urlQuery: '',
                        },
                        target: 'projectAllIssue',
                        jumpOut: true, // 新开页面打开
                      },
                    },
                  },
                },
                {
                  label: '本日到期',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGotoTodayExpired: {
                      serverData: {
                        params: {
                          projectId: 1,
                        },
                        query: {
                          issueFilter__urlQuery: '',
                        },
                        target: 'projectAllIssue',
                        jumpOut: true, // 新开页面打开
                      },
                    },
                  },
                },
              ],
              operations: {
                star: {
                  clientData: {
                    dataRef: {}, // 这个数据对象，前端提供
                  },
                  skipRender: true, // 是否触发后端渲染，为 true 时页面立刻响应，不等后端返回
                  disabled: false,
                  tip: '收藏此项目',
                },
                click: {
                  serverData: {
                    params: {
                      projectId: 1,
                    },
                    query: {},
                    target: 'projectAllIssue',
                    jumpOut: true, // 新开页面打开
                  },
                },
              },
              moreOperations: {
                operations: {
                  gotoIssues: {
                    text: '项目管理',
                    serverData: {
                      params: {
                        projectId: 1,
                      },
                      target: 'projectAllIssue',
                      jumpOut: true, // 新开页面打开
                    },
                  },
                  gotoProjectApps: {
                    text: '应用开发',
                    serverData: {
                      params: {
                        projectId: 1,
                      },
                      target: 'projectApps',
                      jumpOut: true, // 新开页面打开
                    },
                  },
                  gotoProjectTestDashboard: {
                    text: '测试管理',
                    serverData: {
                      params: {
                        projectId: 1,
                      },
                      target: 'projectTestDashboard',
                      jumpOut: true, // 新开页面打开
                    },
                  },
                  gotoMspServiceProjectRoot: {
                    text: '服务观测',
                    serverData: {
                      params: {
                        projectId: 1,
                      },
                      target: 'mspServiceProjectRoot',
                      jumpOut: true, // 新开页面打开
                    },
                  },
                  gotoProjectSetting: {
                    text: '项目设置',
                    serverData: {
                      params: {
                        projectId: 1,
                      },
                      target: 'projectSetting',
                      jumpOut: true, // 新开页面打开
                    },
                  },
                },
                operationsOrder: [
                  'gotoIssues',
                  'gotoProjectApps',
                  'gotoProjectTestDashboard',
                  'gotoMspServiceProjectRoot',
                  'gotoProjectSetting',
                ], // 操作排列顺序
              },
            },
          ],
        },
      },
      workListFilter: {
        type: 'ContractiveFilter',
        name: 'filter',
        state: {
          conditions: [
            {
              fixed: true,
              key: 'projectName',
              placeholder: '搜索项目名称',
              type: 'input',
            },
          ],
          values: {
            projectName: '',
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      messageTabs: {
        type: 'RadioTabs',
        data: {
          options: [
            {
              value: 'project',
              label: '未读消息(22)',
            },
          ],
        },
        state: { value: 'project' },
        operations: {
          onChange: {
            clientData: { value: 'app' },
          },
        },
      },
      messageList: {
        type: 'List',
        version: '2',
        data: {
          pageNo: 1,
          pageSize: 10,
          total: 10,
          list: [
            {
              id: '1', // 唯一id, eg: appid
              logo: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              labels: [
                {
                  color: 'green',
                  // status: 'success',
                  label: '研发项目',
                },
              ],
              description: '这是的描述',
            },
          ],
        },
      },
    },
  },
};
