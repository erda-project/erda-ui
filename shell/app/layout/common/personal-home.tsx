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
import './personal-home.scss';
import { set } from 'lodash';

export const PersonalHome = () => {

  return (
    <div className='home-page'>
      <div className='home-page-sidebar'>
        <DiceConfigPage
          scenarioType='home-page-sidebar'
          scenarioKey='home-page-sidebar'
          useMock={location.search.includes('useMock') ? useMockLeft : undefined}
        />
      </div>
      <div className='home-page-content'>
        <DiceConfigPage
          scenarioType='home-page-content'
          scenarioKey='home-page-content'
          useMock={location.search.includes('useMock') ? useMockRight : undefined}
        />
      </div>
    </div>
  )
};

const mockSidebar: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'home-page-sidebar',
    scenarioType: 'home-page-sidebar', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['sidebar'],
        sidebar: ['myOrganization', 'myProject', 'myApplication'],
        myOrganization: ['orgImage', 'orgSwitch', 'brief', 'emptyOrganization'],
        emptyOrganization: ['emptyImage', 'emptyOrgText'],
        myProject: ['myProjectTitle', 'myProjectFilter', 'myProjectList', 'moreProject', 'emptyProject'],
        myApplication: ['myApplicationTitle', 'myApplicationFilter', 'myApplicationList', 'moreApplication', 'emptyProject'],
      },
    },
    components: {
      page: { type: 'Container' },
      sidebar: {
        type: 'Container',
        props: {
          whiteBg: true,
        }
      },
      myOrganization: {
        type: 'Container',
      },
      emptyOrganization: {
        type: 'Container',
      },
      emptyImage: {
        type: 'EmptyHolder',
        props: {
          tip: '',
          visible: true,
          relative: true,
        }
      },
      emptyOrgText: {
        type: 'Text',
        props: {
          visible: true,
          renderType: 'linkText',
          styleConfig: { fontSize: 16, lineHeight: 24 },
          value: {
            text: [
              '您尚未加入任何组织，点击',
              { text: '+', operationKey: 'xxx', styleConfig: { bold: true } },
              '创建', '您也可以点击', { text: '@', operationKey: 'xxx', styleConfig: { bold: true } }, '浏览公开组织',
            ],
          },
        },
      },
      orgImage: {
        type: 'Image',
        props: {
          src: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3355464299,584008140&fm=26&gp=0.jpg',
          visible: true,
          styleNames: {
            large: true,
          }
        },
      },
      orgSwitch: {
        type: 'DropdownSelect',
        props: {
          menuList:
            [
              { name: '组织B', key: 'organizeB' },
              { name: '组织A', key: 'organizeA' },
            ],
          buttonText: '组织A',
          jumpToOtherPage: ['浏览公开组织'],
        },
      },
      brief: {
        type: 'Table',
        props: {
          rowKey: 'key',
          columns: [
            { title: '', dataIndex: 'category' },
            { title: '', dataIndex: 'number' },
          ],
          showHeader: false,
          pagination: false,
          styleNames: {
            'without-border': true,
            'justify-align': true,
            'light-card': true,
          },
        },
        data: {
          list: [
            {
              id: 1,
              category: { renderType: 'textWithIcon', prefixIcon: 'project-icon', value: '参与项目数：', colorClassName: 'color-primary' },
              number: 5,
            },
            {
              id: 1,
              category: { renderType: 'textWithIcon', prefixIcon: 'app-icon', value: '参与应用数：', colorClassName: 'color-primary' },
              number: 45,
            },
          ],
        },
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
          visible: true,
        },
        data: {
          list: [
            {
              id: '1',
              title: '测试1测试1测试1测试1',
              description: '',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
            {
              id: '2',
              title: '测试2',
              description: '',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
            },
          ],
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
          visible: true,
        },
        data: {
          list: [
            {
              id: '1',
              title: '测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1',
              description: '',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
            },
            {
              id: '2',
              title: '测试2',
              description: '',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
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

const mockContent: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'home-page-content',
    scenarioType: 'home-page-content', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['content'],
        content: ['title', 'emptyOrgTip', 'emptyProjectTip', 'tableGroup'],
      },
    },
    components: {
      page: { type: 'Container' },
      title: {
        type: 'Title',
        props: {
          title: '事件',
          level: 1,
          titleStyles: { fontSize: '24px' },
          subtitle: '您未完成的事项 560 条',
        }
      },
      emptyOrgTip: {
        type: 'Card',
        props: {
          cardType: 'card',
          visible: true,
          data: {
            _infoData: {
              id: '1',
              titleIcon: 'ISSUE_ICON.issue.REQUIREMENT',
              title: '你已经是 组织A 的新成员',
              type: '',
              subContent: '以下是。。。。',
            }
          },
        },
      },
      emptyProjectTip: {
        type: 'Card',
        visible: true,
        props: {
          cardType: 'card',
          data: {
            _infoData: {
              id: '1',
              titleIcon: 'ISSUE_ICON.issue.REQUIREMENT',
              title: '你已经是 组织A 的成员',
              type: '',
              subContent: '以下是。。。。',
            }
          },
        },
      },
      content: { type: 'Container' },
    },
  },
};

const useMockLeft = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSidebar);
    }, 500);
  });
};

const tableGroup = {
  type: 'TableGroup',
  props: {
    visible: true,
    type: 'TableGroup',
  },
  operations: {
    changePageNo: {
      key: 'changePageNo',
      reload: true,
      fillMeta: 'pageNo'
    },
  },
  data: {
    list: [
      {
        projectTitle: {
          prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
          title: 'Erda',
          level: 2,
        },
        issueTitle: {
          title: '您未完成的事项666',
          level: 3,
          titleStyles: {
            'marginTop': 8,
          }
        },
        issueBrief: {
          value: "当前您还有 120 个事项待完成，其中 已过期: 40，本日到期: 40，7日内到期: 36，30日内到期: 44",
        },
        issueTable: {
          props: {
            rowKey: 'key',
            columns: [
              { title: '', dataIndex: 'name' },
              { title: '', dataIndex: 'planFinishedAt' },
            ],
            showHeader: false,
            pagination: false,
            styleNames: {
              'without-border': true,
              'justify-align': true,
              'mt8': true,
            },
          },
          data: {
            list: [
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '222运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '150',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '150',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
            ],
          },
          operations: {
            clickRow: {
              key: 'clickRow',
              reload: false,
              command: {
                key: 'goto',
                target: 'specificIssue',
                jumpOut: true,
              },
            },
          },
        },
        moreIssueLink: {
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
                target: "issueAll",
                jumpOut: true,
                state: {
                  query: {
                    issueFilter__urlQuery: "eyJzdGF0ZUJlbG9uZ3MiOlsiT1BFTiIsIldPUktJTkciLCJXT05URklYIiwiUkVPUEVOIiwiUkVTT0xWRUQiXX0=",
                    issueTable__urlQuery: "eyJwYWdlTm8iOjF9",
                    issueViewGroup__urlQuery: "eyJ2YWx1ZSI6ImthbmJhbiIsImNoaWxkcmVuVmFsdWUiOnsia2FuYmFuIjoiZGVhZGxpbmUifX0=",
                  },
                  params: {
                    projectId: '13',
                  },
                },
                visible: false,
              },
              key: "click",
              reload: false,
              show: false,
            },
          },

        },
      },
      {
        projectTitle: {
          prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
          title: 'Erda',
          level: 2,
        },
        issueTitle: {
          title: '您未完成的事项',
          level: 3,
        },
        issueBrief: {
          value: "当前您还有 120 个事项待完成，其中 已过期: 40，本日到期: 40，7日内到期: 36，30日内到期: 44",
        },
        issueTable: {
          props: {
            rowKey: 'key',
            columns: [
              { title: '', dataIndex: 'name' },
              { title: '', dataIndex: 'planFinishedAt' },
            ],
            showHeader: false,
            pagination: false,
            styleNames: {
              'without-border': true,
              'justify-align': true,
              'mt8': true,
            },
          },
          data: {
            list: [
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '222运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '150',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '150',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
              {
                id: '153',
                projectId: '13',
                type: 'requirement',
                name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳' },
                planFinishedAt: '2022-03-02 10:09:12',
              },
            ],
          },
          operations: {
            clickRow: {
              key: 'clickRow',
              reload: false,
              command: {
                key: 'goto',
                target: 'specificIssue',
                jumpOut: true,
              },
            },
          },
        },
        moreIssueLink: {
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
                target: "issueAll",
                jumpOut: true,
                state: {
                  query: {
                    issueFilter__urlQuery: "eyJzdGF0ZUJlbG9uZ3MiOlsiT1BFTiIsIldPUktJTkciLCJXT05URklYIiwiUkVPUEVOIiwiUkVTT0xWRUQiXX0=",
                    issueTable__urlQuery: "eyJwYWdlTm8iOjF9",
                    issueViewGroup__urlQuery: "eyJ2YWx1ZSI6ImthbmJhbiIsImNoaWxkcmVuVmFsdWUiOnsia2FuYmFuIjoiZGVhZGxpbmUifX0=",
                  },
                  params: {
                    projectId: '13',
                  },
                },
                visible: false,
              },
              key: "click",
              reload: false,
              show: false,
            },
          },
        },
      }
    ],
  },
  state: {
    pageNo: 1,
    pageSize: 1,
    total: 5,
    list: []
  }
}
set(mockContent, 'protocol.components.tableGroup', tableGroup)

const useMockRight = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockContent);
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