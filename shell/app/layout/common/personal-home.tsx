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

import * as React from 'react';
import DiceConfigPage from 'config-page/index';
import { cloneDeep } from 'lodash'
import { Card } from 'nusi';
import i18n from 'i18n';
import erda_png from 'app/images/Erda.png';
import './personal-home.scss';

export const PersonalHome = () => {

  return (
    <div className='home-page'>
      <div className='home-page-left'>
        <DiceConfigPage
          scenarioType='home-page-left'
          scenarioKey='home-page-left'
          useMock={location.search.includes('useMock') ? useMockLeft : undefined}
        />
      </div>
      <div className='home-page-right'>
        <DiceConfigPage
          scenarioType='home-page-right'
          scenarioKey='home-page-right'
          useMock={location.search.includes('useMock') ? useMockRight : undefined}
        />
      </div>
    </div>
  )
};

const mockLeft: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'home-page-left',
    scenarioType: 'home-page-left', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['siderbar'],
        emptyContainer: ['emptyText'],
        siderbar: ['orgIcon', 'orgSwitch', 'myProject', 'myApplication'],
        myProject: ['myProjectTitle', 'myProjectFilter', 'myProjectList', 'moreProject', 'emptyProject'],
        myApplication: ['myApplicationTitle', 'myApplicationFilter', 'myApplicationList', 'moreApplication', 'emptyProject'],
      },
    },
    components: {
      emptyContainer: { type: 'RowContainer', props: { contentSetting: 'center' } },
      emptyText: {
        type: 'Text',
        operations: {
          toPublicApp: {
            key: 'toPublicOrg',
            reload: false,
            command: {
              key: 'changeScenario',
              scenarioType: 'org-list-all',
              scenarioKey: 'org-list-all',
            },
          },
        },
        props: {
          visible: false,
          renderType: 'linkText',
          styleConfig: { fontSize: 16, lineHeight: 24 },
          value: {
            text: [
              '您还未加入任何组织，可以选择',
              { text: '公开组织', operationKey: 'toPublicOrg', styleConfig: { bold: true } },
              '开启您的Erda之旅',
            ],
          },
        },
      },
      page: { type: 'Container' },
      siderbar: {
        type: 'Container',
        props: {
          whiteBg: true,
        }
      },
      emptyProject: {
        type: 'EmptyHolder',
        props: {
          tip: '暂无数据，请先加入组织~',
          visible: true,
          relative: true,
        }
      },
      myProject: {
        type: 'Container',
      },
      myProjectTitle: {
        type: 'Title',
        props: {
          title: '项目',
          level: 1,
        }
      },
      myProjectFilter: {
        type: 'ContractiveFilter',
        props: {
          visible: true,
          delay: 1000,
        },
        state: {
          conditions: [
            {
              key: 'title',
              label: '标题',
              emptyText: '全部',
              fixed: true,
              showIndex: 2,
              placeholder: '搜索项目',
              type: 'input' as const,
            },
          ],
          values: {
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      myProjectList: {
        type: 'List',
        props: {
          visible: false,
        },
        data: {
          list: [],
          // list: [
          //   {
          //     id: '1',
          //     title: '测试1测试1测试1测试1',
          //     description: '测试测试测试测试',
          //     prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',

          //     operations: {
          //       click: {
          //         key: 'click',
          //         show: false,
          //         reload: false,
          //         command: {
          //           key: 'goto',
          //           target: 'workBenchRoot', // 当前组织下的target
          //         },
          //       },
          //     },
          //   {
          //     id: '2',
          //     title: '测试2',
          //     titleSuffixIcon: 'help',
          //     description: '测试测试',
          //     prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',

          //     operations: {
          //       click: {
          //         key: 'click',
          //         show: false,
          //         reload: false,
          //         command: {
          //           key: 'goto',
          //           target: 'https://xxx.io/workBench/projects', // 非当前组织下的target
          //         },
          //       },

          //     },
          //   },
          // ],
        },
      },
      moreProject: {
        type: 'Text',
        props: {
          renderType: 'linkText',
          visible: false,
          value: {
            text: '更多',
          },
        }
      },
      myApplication: {
        type: 'Container',
      },
      myApplicationTitle: {
        type: 'Title',
        props: {
          title: '应用',
          level: 1,
        }
      },
      myApplicationFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 1000,
          visible: true,
        },
        state: {
          conditions: [
            {
              key: 'title',
              label: '标题',
              emptyText: '全部',
              fixed: true,
              showIndex: 2,
              placeholder: '搜索应用',
              type: 'input' as const,
            },
          ],
          values: {
          },
        },
        operations: {
          filter: {
            key: 'filter',
            reload: true,
          },
        },
      },
      myApplicationList: {
        type: 'List',
        props: {
          visible: false,
        },
        data: {
          list: [
            {
              id: '1',
              title: '测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1',
              description: '测试测试测试测试',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',

              operations: {
                click: {
                  key: 'click',
                  show: false,
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'workBenchRoot', // 当前组织下的target
                  },
                },

              },
            },
            {
              id: '2',
              title: '测试2',
              titleSuffixIcon: 'help',
              description: '测试测试',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              operations: {
                click: {
                  key: 'click',
                  show: false,
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'https://xxx.io/workBench/projects', // 非当前组织下的target
                  },
                },
              },
            },
          ],
        },
      },
      moreApplication: {
        type: 'Text',
        props: {
          renderType: 'linkText',
          value: {
            text: '更多',
          },
        }
      },
    },
  },
};

const mockRight: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'home-page-right',
    scenarioType: 'home-page-right', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['myPage'],
        myPage: ['title', 'filter', 'emptyContainer', 'projectItem'],
        emptyContainer: ['emptyText'],
        projectItem: ['projectTitle', 'card'],
        card: ['issueTitle', 'issueSummary', 'cardTable', 'moreIssueLink'],
      },
    },
    components: {
      emptyContainer: { type: 'RowContainer', props: { contentSetting: 'center' } },
      emptyText: {
        type: 'Text',
        operations: {
          toPublicApp: {
            key: 'toPublicOrg',
            reload: false,
            command: {
              key: 'changeScenario',
              scenarioType: 'org-list-all',
              scenarioKey: 'org-list-all',
            },
          },
        },
        props: {
          visible: false,
          renderType: 'linkText',
          styleConfig: { fontSize: 16, lineHeight: 24 },
          value: {
            text: [
              '您还未加入任何组织，可以选择',
              { text: '公开组织', operationKey: 'toPublicOrg', styleConfig: { bold: true } },
              '开启您的Erda之旅',
            ],
          },
        },
      },
      page: { type: 'Container' },
      title: { type: 'Title', props: { title: '事件', level: 1, titleStyles: { fontSize: '24px' }, showSubtitle: true, subtitle: '您未完成的事项 560 条' } },
      projectItem: {
        type: 'Container',
      },
      projectTitle: {
        type: 'Title',
        props: {
          prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
          title: 'Erda',
          level: 2,
        },
      },
      myPage: { type: 'Container' },
      card: {
        type: 'Container',
        props: {
          whiteBg: true,
        },
      },
      issueTitle: {
        type: 'Title',
        props: {
          title: '您未完成的事项',
          level: 3,
        },
      },
      issueSummary: {
        type: 'Text',
        props: {
          value: "当前您还有 120 个事项待完成，其中 已过期: 40，本日到期: 40，7日内到期: 36，30日内到期: 44",
        },
      },
      cardTable: {
        type: 'Table',
        props: {
          rowKey: 'key',
          columns: [
            { title: '', dataIndex: 'name' },
            { title: '', dataIndex: 'planFinishedAt' },
          ],
          showHeader: false,
          pagination: false,
        },
        data: {
          list: [
            {
              id: 1,
              name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '运行速度没得说，完全不卡，打游戏体验极佳' },
              planFinishedAt: '2021-03-02 10:09:12',
            },
            {
              id: 2,
              name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '运行速度没得说，完全不卡，打游戏体验极佳' },
              planFinishedAt: '2021-03-02 10:09:12',
            },
            {
              id: 3,
              name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '运行速度没得说，完全不卡，打游戏体验极佳' },
              planFinishedAt: '2021-03-02 10:09:12',
            },
            {
              id: 4,
              name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '运行速度没得说，完全不卡，打游戏体验极佳' },
              planFinishedAt: '2021-03-02 10:09:12',
            },
            {
              id: 5,
              name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '运行速度没得说，完全不卡，打游戏体验极佳' },
              planFinishedAt: '2021-03-02 10:09:12',
            },
          ],
        },
      },
      moreIssueLink: {
        type: 'Text',
        props: {
          renderType: 'linkText',
          value: {
            text: [{ text: "查看剩余112条事件 >>", operationKey: "toSpecificProject" }]
          },
        },
        operations: {
          toSpecificProject: {
            command: {
              key: "goto",
              target: "https://local-shell.terminus-org.dev.terminus.io:8081/orgHome",
            },
            key: "click",
            reload: false,
            show: false,
          },
        },
      },
    },
  },
};

const useMockLeft = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLeft);
    }, 500);
  });
};

const useMockRight = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRight);
    }, 500);
  });
};



// const data = {
//   pageEvent: {
//     redirectUrl: '',
//   },
//   structure: {
//     root: 'page',
//     page: ['form'],
//   },
//   components: {
//     form: {
//       data: {
//         operations: {
//           click: {
//             key: 'toxx',
//             reload: false,
//             command: {
//               key: 'goto',
//               target: 'all',
//               state: {
//                 query: {id:type,}
//               }
//             }
//           }
//         }
//       },
//       operations: {
//         submit: {
//           key: "ss",
//           reload: true,

//         }
//       }
//     }

//   }
// }