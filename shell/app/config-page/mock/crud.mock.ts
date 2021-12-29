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
          cards2: [
            {
              // 普通项目
              id: 1, // 项目ID
              imgURL: '', // 项目的logo，若无返回空字符串就行
              title: 'abc', // 项目名称
              // labels: [{ label: '默认' }],
              titleState: [{ text: '默认', color: '#1890FF' }],
              star: true,
              textMeta: [
                {
                  mainText: '12',
                  subText: '已过期',
                  operations: {
                    clickGoto: {
                      disabled: true,
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue', // 固定值
                        params: { projectId: '2' }, // 项目ID
                        query: {
                          issueFilter__urlQuery:
                            'eyJzdGF0ZXMiOlszNDcsMzQ4LDM0OSw1NzQ0LDM1MSwzNTIsMzU3LDM1OCwzNTksMzYwLDM2MV0sImZpbmlzaGVkQXRTdGFydEVuZCI6W251bGwsMTY0MDE4ODc5OTk5OV19', // 当前项目id
                          // {"states":[所有状态排除已完成、已关闭],"finishedAtStartEnd":[null,昨天结束时间戳}]} 如：{"states":[347,348,349,5744,351,352,357,358,359,360,361],"finishedAtStartEnd":[null,1640188799999]} 需要加密
                        },
                      },
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '本日到期',
                  operations: {
                    clickGoto: {
                      confirm: 'xx',
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue', // 固定值
                        params: { projectId: '2' }, // 项目ID
                        query: {
                          issueFilter__urlQuery:
                            'eyJzdGF0ZXMiOlsyMTI4NSwyMTI4NiwyMTI4NywyMTI4OSwyMTI5MCwyMTI5NSwyMTI5NiwyMTI5NywyMTI5OCwyMTI5OSwyMTMwMF0sImZpbmlzaGVkQXRTdGFydEVuZCI6WzE2NDAxODg4MDAwMDAsMTY0MDI3NTE5OTk5OV19', // 当前项目id
                          // {"states":[所有状态排除已完成、已关闭],"finishedAtStartEnd":[今天开始时间戳,今天结束时间戳}]} 如：{"states":[21285,21286,21287,21289,21290,21295,21296,21297,21298,21299,21300],"finishedAtStartEnd":[1640188800000,1640275199999]} 需要加密
                        },
                      },
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'xiangmuguanli',
                  tip: '项目管理',
                  operations: {
                    clickGoto: {
                      disabled: true,
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'yingyongkaifa',
                  tip: '应用开发',
                  operations: {
                    clickGoto: {
                      confirm: 'xxa',
                      serverData: {
                        jumpOut: false,
                        target: 'projectApps',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'ceshiguanli',
                  tip: '测试管理',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectTestDashboard',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'fuwuguance',
                  tip: '服务观测',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'xiangmushezhi',
                  tip: '项目设置',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectSetting',
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
                  tip: '取消收藏',
                  disabled: true,
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个卡片的操作
                  serverData: {
                    jumpOut: false,
                    target: 'project',
                    params: { projectId: '22' },
                    query: {},
                  },
                },
              },
            },
            {
              // 监控项目
              id: 2,
              imgURL: '', // 同上
              title: 'demo project', // 同上
              titleState: [{ text: '默认', status: 'error' }],
              star: true,
              textMeta: [
                {
                  mainText: '12',
                  subText: '服务数',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList', // 服务总览 - 服务列表
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: '最近一天告警',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'microServiceAlarmRecord',
                        query: {},
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                      },
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'fuwuliebiao',
                  tip: '服务列表',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'fuwujiankong',
                  tip: '服务监控',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspMonitorServiceAnalyze',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'lianluzhuizong',
                  tip: '链路追踪',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'microTrace',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'rizhifenxi',
                  tip: '日志分析',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspLogAnalyze',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', addonId: '' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  tip: '取消收藏',
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  serverData: {
                    jumpOut: false,
                    target: 'mspServiceList',
                    params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                    query: {},
                  },
                },
              },
            },
            {
              // 普通应用
              id: 3,
              imgURL: '', // 应用logo
              title: 'demo app', // 应用名称
              titleState: [{ text: '默认', status: 'error' }],
              star: true,
              textMeta: [
                {
                  mainText: '12',
                  subText: 'MR数',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appOpenMr',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: 'Runtime数',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'daimacangku',
                  tip: '代码仓库',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'repo',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'liushuixian',
                  tip: '流水线',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'pipelineRoot',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'Apisheji',
                  tip: 'API设计',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appApiDesign',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'bushuzhongxin',
                  tip: '部署中心',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  tip: '取消收藏',
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: false,
                    target: 'app',
                    params: { projectId: '22', appId: '' },
                    query: {},
                  },
                },
              },
            },
            {
              // 普通应用
              id: 3,
              imgURL: '', // 应用logo
              title: 'demo app', // 应用名称
              titleState: [{ text: '默认', status: 'error' }],
              star: true,
              textMeta: [
                {
                  mainText: '12',
                  subText: 'MR数',
                  operations: {
                    // 点击跳转
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appOpenMr',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  mainText: '12',
                  subText: 'Runtime数',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              iconOperations: [
                {
                  icon: 'daimacangku',
                  tip: '代码仓库',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'repo',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'liushuixian',
                  tip: '流水线',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'pipelineRoot',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'Apisheji',
                  tip: 'API设计',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appApiDesign',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  icon: 'bushuzhongxin',
                  tip: '部署中心',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              operations: {
                // 点击start的操作
                star: {
                  tip: '取消收藏',
                  clientData: {
                    // clientData是点击后有前端放在event.operationData里，后端不需要给
                    dataRef: {}, // 当前这条数据回传
                  },
                },
                clickGoto: {
                  // 点击单个看板的操作
                  serverData: {
                    jumpOut: false,
                    target: 'app',
                    params: { projectId: '22', appId: '' },
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
              // 普通项目
              id: '1', // 唯一id, eg: appid
              logoURL: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              star: true, // 当前是否已收藏
              titleState: [
                {
                  status: 'success',
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
                  tip: '',
                  operations: {
                    clickGoto: {
                      disabled: true,
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue', // 固定值
                        params: { projectId: '2' }, // 项目ID
                        query: {
                          issueFilter__urlQuery:
                            'eyJzdGF0ZXMiOlszNDcsMzQ4LDM0OSw1NzQ0LDM1MSwzNTIsMzU3LDM1OCwzNTksMzYwLDM2MV0sImZpbmlzaGVkQXRTdGFydEVuZCI6W251bGwsMTY0MDE4ODc5OTk5OV19', // 当前项目id
                          // {"states":[所有状态排除已完成、已关闭],"finishedAtStartEnd":[null,昨天结束时间戳}]} 如：{"states":[347,348,349,5744,351,352,357,358,359,360,361],"finishedAtStartEnd":[null,1640188799999]} 需要加密
                        },
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
                        jumpOut: false,
                        target: 'projectAllIssue', // 固定值
                        params: { projectId: '2' }, // 项目ID
                        query: {
                          issueFilter__urlQuery:
                            'eyJzdGF0ZXMiOlsyMTI4NSwyMTI4NiwyMTI4NywyMTI4OSwyMTI5MCwyMTI5NSwyMTI5NiwyMTI5NywyMTI5OCwyMTI5OSwyMTMwMF0sImZpbmlzaGVkQXRTdGFydEVuZCI6WzE2NDAxODg4MDAwMDAsMTY0MDI3NTE5OTk5OV19', // 当前项目id
                          // {"states":[所有状态排除已完成、已关闭],"finishedAtStartEnd":[今天开始时间戳,今天结束时间戳}]} 如：{"states":[21285,21286,21287,21289,21290,21295,21296,21297,21298,21299,21300],"finishedAtStartEnd":[1640188800000,1640275199999]} 需要加密
                        },
                      },
                    },
                  },
                },
                {
                  key: '待完成事项',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue', // 固定值
                        params: { projectId: '2' }, // 项目ID
                        query: {
                          issueFilter__urlQuery:
                            'eyJzdGF0ZXMiOlsyMTI4NSwyMTI4NiwyMTI4NywyMTI4OSwyMTI5MCwyMTI5NSwyMTI5NiwyMTI5NywyMTI5OCwyMTI5OSwyMTMwMF0sImZpbmlzaGVkQXRTdGFydEVuZCI6WzE2NDAxODg4MDAwMDAsMTY0MDI3NTE5OTk5OV19', // 当前项目id
                          // {"states":[所有状态排除已完成、已关闭]} 如：{"states":[21285,21286,21287,21289,21290,21295,21296,21297,21298,21299,21300]} 需要加密
                        },
                      },
                    },
                  },
                },
                {
                  key: '服务数',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList', // 服务总览 - 服务列表
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  key: '最近一天告警',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'microServiceAlarmRecord',
                        query: {},
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
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
                  disabled: true,
                  tip: '收藏此项目',
                },
                clickGoto: {
                  serverData: {
                    params: {
                      projectId: 1,
                    },
                    query: {},
                    target: 'projectAllIssue',
                    jumpOut: false, // 新开页面打开
                  },
                },
              },
              columnsInfo: {
                hoverIcons: [
                  {
                    icon: 'xiangmuguanli',
                    tip: '项目管理',
                    operations: {
                      clickGoto: {
                        disabled: true,
                        serverData: {
                          jumpOut: false,
                          target: 'projectAllIssue',
                          params: { projectId: '22' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'yingyongkaifa',
                    tip: '应用开发',
                    operations: {
                      clickGoto: {
                        confirm: 'xxx',
                        serverData: {
                          jumpOut: false,
                          target: 'projectApps',
                          params: { projectId: '22' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'ceshiguanli',
                    tip: '测试管理',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'projectTestDashboard',
                          params: { projectId: '22' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'fuwuguance',
                    tip: '服务观测',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'mspServiceList',
                          params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'xiangmushezhi',
                    tip: '项目设置',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'projectSetting',
                          params: { projectId: '22' },
                          query: {},
                        },
                      },
                    },
                  },
                ],
              },
              moreOperations: [
                {
                  id: 'x',
                  text: '项目管理',
                  icon: 'xiangmuguanli',
                  operations: {
                    clickGoto: {
                      disabled: true,
                      serverData: {
                        jumpOut: false,
                        target: 'projectAllIssue',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: 'x',
                  icon: 'yingyongkaifa',
                  text: '应用开发',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectApps',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'ceshiguanli',
                  text: '测试管理',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectTestDashboard',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: 'x',
                  icon: 'fuwuguance',
                  text: '服务观测',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'xiangmushezhi',
                  text: '项目设置',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'projectSetting',
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
              ],
            },
            {
              // 监控项目
              id: '1', // 唯一id, eg: appid
              logoURL: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              star: false, // 当前是否已收藏
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
                  key: '服务数',
                  value: '2',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList', // 服务总览 - 服务列表
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  key: '最近一天告警',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'microServiceAlarmRecord',
                        query: {},
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                      },
                    },
                  },
                },
              ],
              columnsInfo: {
                hoverIcons: [
                  {
                    icon: 'fuwuliebiao',
                    tip: '服务列表',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'mspServiceList',
                          params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'fuwujiankong',
                    tip: '服务监控',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'mspMonitorServiceAnalyze',
                          params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'lianluzhuizong',
                    tip: '链路追踪',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'microTrace',
                          params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'rizhifenxi',
                    tip: '日志分析',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'mspLogAnalyze',
                          params: { projectId: '22', env: 'PROD', tenantGroup: '', addonId: '' },
                          query: {},
                        },
                      },
                    },
                  },
                ],
              },
              operations: {
                star: {
                  clientData: {
                    dataRef: {}, // 这个数据对象，前端提供
                  },
                  disabled: false,
                  confirm: '收藏此项目',
                },
                clickGoto: {
                  serverData: {
                    params: {
                      projectId: 1,
                    },
                    query: {},
                    target: 'projectAllIssue',
                    jumpOut: false, // 新开页面打开
                  },
                },
              },
              moreOperations: [
                {
                  id: '2',
                  icon: 'fuwuliebiao',
                  text: '服务列表',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspServiceList',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'fuwujiankong',
                  text: '服务监控',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspMonitorServiceAnalyze',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'lianluzhuizong',
                  text: '链路追踪',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'microTrace',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', terminusKey: '' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'rizhifenxi',
                  text: '日志分析',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'mspLogAnalyze',
                        params: { projectId: '22', env: 'PROD', tenantGroup: '', addonId: '' },
                        query: {},
                      },
                    },
                  },
                },
              ],
            },
            {
              // 应用
              id: '1', // 唯一id, eg: appid
              logoURL: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
              title: '项目 A',
              star: false, // 当前是否已收藏
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
                  key: '项目',
                  value: '中海油',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'project', // 服务总览 - 服务列表
                        params: { projectId: '22' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  key: 'MR数',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appOpenMr',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  key: 'Runtime数',
                  value: '22',
                  icon: '', // 如果配了 icon，优先展示 iocn 代替 key
                  tip: '',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
              columnsInfo: {
                hoverIcons: [
                  {
                    icon: 'daimacangku',
                    tip: '代码仓库',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'repo',
                          params: { projectId: '22', appId: '2' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'liushuixian',
                    tip: '流水线',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'pipelineRoot',
                          params: { projectId: '22', appId: '2' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'Apisheji',
                    tip: 'API设计',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'appApiDesign',
                          params: { projectId: '22', appId: '2' },
                          query: {},
                        },
                      },
                    },
                  },
                  {
                    icon: 'bushuzhongxin',
                    tip: '部署中心',
                    operations: {
                      clickGoto: {
                        serverData: {
                          jumpOut: false,
                          target: 'deploy',
                          params: { projectId: '23', appId: '2' },
                          query: {},
                        },
                      },
                    },
                  },
                ],
              },
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
                    jumpOut: false, // 新开页面打开
                  },
                },
              },
              moreOperations: [
                {
                  id: '2',
                  icon: 'daimacangku',
                  text: '代码仓库',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'repo',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'liushuixian',
                  text: '流水线',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'pipelineRoot',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'Apisheji',
                  text: 'API设计',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'appApiDesign',
                        params: { projectId: '22', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
                {
                  id: '2',
                  icon: 'bushuzhongxin',
                  text: '部署中心',
                  operations: {
                    clickGoto: {
                      serverData: {
                        jumpOut: false,
                        target: 'deploy',
                        params: { projectId: '23', appId: '2' },
                        query: {},
                      },
                    },
                  },
                },
              ],
            },
          ],
          operations: {
            changePage: {
              // 这个需要返回
              clientData: { pageSize: 10, pageNo: 2 }, //触发后，前端返回的数据
            },
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
              // icon: 'tongzhi',
              title: '消息：测试数据',
              titleSummary: '24',
              mainState: { text: '', status: 'error' },
              columnsInfo: {
                // users: ['1'],
                // state: { status: 'error', text: '已完成' },
                text: [{ tip: '2020-12-22', text: '6分钟' }],
              },
              operations: {
                click: {
                  clientData: { dataRef: { id: 1 } },
                },
                clickGoto: {
                  serverData: {
                    jumpOut: true,
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
