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
  if (payload?.event?.operation === 'ssa') {
    return data;
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
          right: 'rightContent',
        },
        leftContent: ['head', 'workTabs', 'workContainer', 'messageTabs', 'messageContainer'],
        workContainer: ['workCards', 'workList'],
        messageContainer: ['messageList'],
        rightContent: ['userProfile'],
        workList: {
          filter: ['workListFilter'],
        },
      },
    },
    components: {
      rightContent: {
        type: 'Container',
      },
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
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        query: {},
                        params: {},
                      },
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '今日截止',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: true,
                        target: 'xx', // 此处target/query/params，到时候统一整理给
                        query: {},
                        params: {},
                      },
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
          total: 12,
          title: '项目列表',
          titleSummary: '12',
          list: [
            {
              id: '1', // 唯一id, eg: appid
              logoURL: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              star: true, // 当前是否已收藏
              titleState: [
                {
                  status: '',
                  text: '研发项目',
                },
              ],
              // description: '这是项目 A 的描述',
              backgroundImg: '//背景水印图片的 url 地址',
              kvInfos: [
                {
                  key: '已过期',
                  value: '2',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '提示信息',
                  operations: {
                    clickGoto: {
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
                  key: '本日到期',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
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
                  disabled: false,
                  tip: '收藏此项目',
                },
                clickGoto: {
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
              moreOperations: [
                {
                  id: 'x',
                  text: '项目管理',
                  icon: 'xx',
                  operations: {
                    clickGoto: {
                      serverData: {
                        params: {
                          projectId: 1,
                        },
                        target: 'projectAllIssue',
                        jumpOut: true, // 新开页面打开
                      },
                    },
                  },
                },
              ],
            },
          ],
          operations: {
            changePage: {},
          },
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
      messageContainer: {
        type: 'Container',
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
              icon: 'zhong',
              title: '项目 A',
              titleSummary: '24',
              mainState: { text: '', status: 'error' },
              columnsInfo: {
                users: ['1'],
                state: { status: 'error', text: '已完成' },
                text: [{ tip: '2020-12-22', text: '6分钟' }],
              },
              operations: {
                click: {
                  clientData: { dataRef: { id: 1 } },
                },
                clickGoto: {
                  serverData: {
                    target: 'https://erda.cloud/erda/dop/projects/387/issues/all?id=224941&type=TASK',
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
};
