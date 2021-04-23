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
import routeInfoStore from 'app/common/stores/route';
import './personal-home.scss';

const PersonalHome = () => {
  const orgName = routeInfoStore.useStore(s => s.params.orgName);

  const inParams = { orgName };

  return (
    <div className='home-page'>
      <div className='home-page-sidebar'>
        <DiceConfigPage
          scenarioType='home-page-sidebar'
          scenarioKey='home-page-sidebar'
          key={orgName}
          useMock={location.search.includes('useMock') ? useMockLeft : undefined}
          inParams={inParams}
        />
      </div>
      <div className='home-page-content'>
        <DiceConfigPage
          scenarioType='home-page-content'
          scenarioKey='home-page-content'
          key={orgName}
          useMock={location.search.includes('useMock') ? useMockRight : undefined}
          inParams={inParams}
        />
      </div>
    </div>
  )
};

export default PersonalHome;

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
        sidebar: ['myOrganization', 'myInfo'],
        myInfo: ['myProject', 'myApplication'],
        myOrganization: ['orgImage', 'orgSwitch', 'joinedBrief', 'emptyOrganization'],
        emptyOrganization: ['emptyOrgText'],
        myProject: ['myProjectTitle', 'myProjectFilter', 'myProjectList', 'emptyProject'],
        emptyProject: ['projectTipWithoutOrg', 'projectTipWithOrg'],
        projectTipWithOrg: ['createProjectLink', 'createProjectTip'],
        myApplication: ['myApplicationTitle', 'myApplicationFilter', 'myApplicationList', 'emptyApplication'],
      },
    },
    components: {
      page: {
        type: 'Container',
        props: {
          visible: true,
          whiteBg: true,
          fullHeight: true,
        },
      },
      sidebar: {
        type: 'Container',
        props: {
          whiteBg: true,
          fullHeight: true,
          className: 'pa16',
        }
      },
      myOrganization: {
        type: 'Container',
        props: {
          visible: true,
          spaceSize: 'big',
        }
      },
      emptyOrganization: {
        type: 'Container',
        props: {
          visible: true,
        },
      },
      emptyOrgText: {
        type: 'TextGroup',
        props: {
          visible: true,
          align: 'center',
          value: [
            {
              props: {
                renderType: 'text',
                visible: true,
                value: '未加入任何组织',
              },
            },
            {
              props: {
                renderType: 'linkText',
                visible: true,
                value: {
                  text: [{ text: '了解如何受邀加入到组织', operationKey: "toJoinOrgDoc" }]
                },
              },
            },
            {
              props: {
                renderType: 'linkText',
                visible: true,
                value: {
                  text: [{ text: '浏览公开组织信息', operationKey: 'toPublicOrgPage' }]
                },
              },
            },
          ],

        },
        operations: {
          toJoinOrgDoc: {
            command: {
              key: "goto",
              target: "https://docs.erda.cloud/",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
          toPublicOrgPage: {
            command: {
              key: "goto",
              target: "orgList",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
        },
      },
      orgImage: {
        type: 'Image',
        props: {
          src: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3355464299,584008140&fm=26&gp=0.jpg',
          visible: true,
          size: 'normal',
        },
      },
      orgSwitch: {
        type: 'DropdownSelect',
        props: {
          visible: true,
          options:
            [
              {
                label: '组织B',
                value: 'organizeB',
                prefixImgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQY0vUTJwftJ8WqXoLiLeB--2MJkpZLpYOA&usqp=CAU',
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'orgRoot',
                      jumpOut: false,
                      state: {
                        params: {
                          orgName: 'organizeA',
                        },
                      }
                    },
                  },
                },
              },
              {
                label: '组织A',
                value: 'organizeA',
                prefixImgSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI1EaartvKCwGgDS7FTpu71EyFs1wCl1MsFQ&usqp=CAU',
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'orgRoot',
                      jumpOut: false,
                      state: {
                        params: {
                          orgName: 'organizeA',
                        },
                      },
                    },
                  },
                },
              },
            ],
          quickSelect: [
            {
              value: 'orgList',
              label: '浏览公开组织',
              operations: {
                click: {
                  key: 'click',
                  show: false,
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'orgList',
                    jumpOut: false,
                  },
                },
              },
            }
          ],
        },
        state: {
          value: 'organizeA',
        }
      },
      joinedBrief: {
        type: 'Table',
        props: {
          visible: true,
          rowKey: 'key',
          columns: [
            { title: '', dataIndex: 'category' },
            { title: '', dataIndex: 'number', width: 42 },
          ],
          showHeader: false,
          pagination: false,
          styleNames: {
            'no-border': true,
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
        // type: 'EmptyHolder',
        // props: {
        //   tip: '暂无数据，请先加入组织~',
        //   visible: true,
        //   relative: true,
        // }
        type: 'Container',
        props: {
          visible: true,
        },
      },
      projectTipWithoutOrg: {
        type: 'Text',
        props: {
          visible: true,
          renderType: 'linkText',
          value: {
            text: ['请先加入组织或者', { text: '了解更多内容', operationKey: "toJoinOrgDoc" }]
          }
        },
        operations: {
          toJoinOrgDoc: {
            command: {
              key: "goto",
              target: "https://docs.erda.cloud/",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
        }
      },
      projectTipWithOrg: {
        type: 'Container',
        props: {
          visible: true,
        },
      },
      createProjectLink: {
        type: 'Text',
        props: {
          visible: true,
          renderType: 'linkText',
          value: {
            text: [{ text: '创建', operationKey: "createProject" }]
          }
        },
        operations: {
          createProject: {
            command: {
              key: "goto",
              target: "createProject",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
        }
      },
      createProjectTip: {
        type: 'Text',
        props: {
          visible: true,
          renderType: 'linkText',
          value: {
            text: [{ text: '如何创建项目', operationKey: "createProjectDoc" }, ' 或 ', { text: '通过公开组织浏览公开项目信息', operationKey: "toPublicOrgPage" }]
          }
        },
        operations: {
          createProjectDoc: {
            command: {
              key: "goto",
              target: "https://docs.erda.cloud/",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
          toPublicOrgPage: {
            command: {
              key: "goto",
              target: "orgList",
              jumpOut: true,
              visible: false,
            },
            key: "click",
            reload: false,
            show: false,
          },
        }
      },
      myInfo: {
        type: 'Container',
        props: {
          visible: true,
          fullHeight: true,
          scrollAuto: true,
        },
      },
      myProject: {
        type: 'Container',
        props: {
          visible: true,
        },
      },
      myProjectTitle: {
        type: 'Title',
        props: {
          visible: true,
          title: '项目',
          level: 1,
          noMarginBottom: true,
        }
      },
      myProjectFilter: {
        type: 'ContractiveFilter',
        props: {
          visible: true,
          delay: 1000,
          fullWidth: true,
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
                type: 'input',
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
            useLoadMore: true,
          },
          data: {
            list: [
              {
                id: '1',
                porjectId: '13',
                title: '测试1测试1测试1测试1',
                titleSize: 'fz16',
                prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                prefixImgSize: 'middle',
                prefixImgCircle: true,
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'projectAllIssue',
                      state: {
                        params: {
                          projectId: '13',
                        },
                      }
                    },
                  },
                },
              },
              {
                id: '2',
                porjectId: '13',
                title: '测试2',
                titleSize: 'fz16',
                prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                prefixImgSize: 'middle',
                prefixImgCircle: true,
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'projectAllIssue',
                      state: {
                        params: {
                          projectId: '13',
                        },
                      }
                    },
                  },
                },
              },
            ],
          },
          operations: {
            changePageNo: {
              key: 'changePageNo',
              reload: true,
              fillMeta: 'pageNo'
            },
          },
          state: {
            pageNo: 1,
            pageSize: 5,
            total: 5,
          },
        },
        myApplication: {
          type: 'Container',
          props: {
            visible: true,
          },
        },
        myApplicationTitle: {
          type: 'Title',
          props: {
            visible: true,
            title: '应用',
            level: 1,
            noMarginBottom: true,
          }
        },
        myApplicationFilter: {
          type: 'ContractiveFilter',
          props: {
            delay: 1000,
            visible: true,
            fullWidth: true,
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
                type: 'input',
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
            useLoadMore: true,
          },
          data: {
            list: [
              {
                id: '1',
                title: '测试1测试1测试1测试1',
                titleSize: 'fz16',
                prefixImgSize: 'middle',
                prefixImgCircle: true,
                prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'app',
                      state: {
                        params: {
                          projectId: '9',
                          appId: '8',
                        },
                      }
                    },
                  },
                },
              },
              {
                id: '2',
                title: '测试2',
                titleSize: 'fz16',
                prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                prefixImgSize: 'middle',
                prefixImgCircle: true,
                operations: {
                  click: {
                    key: 'click',
                    show: false,
                    reload: false,
                    command: {
                      key: 'goto',
                      target: 'app',
                      state: {
                        params: {
                          projectId: '9',
                          appId: '8',
                        },
                      }
                    },
                  },
                },
              },
            ],
          },
          operations: {
            changePageNo: {
              key: 'changePageNo',
              reload: true,
              fillMeta: 'pageNo'
            },
          },
          state: {
            pageNo: 1,
            pageSize: 5,
            total: 5,
          },
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
          content: ['title', 'emptyOrgTip', 'emptyProjectTip', 'emptyProjectIssue', 'tableGroup'],
          emptyOrgTip: { left: 'erdaLogo', right: 'emptyOrgText' },
          emptyOrgText: ['emptyOrgTitle', 'emptyOrgContent'],
          emptyProjectTip: { left: 'orgLogo', right: 'emptyProjectText' },
          emptyProjectText: ['emptyProjectTitle', 'emptyProjectContent'],
        },
      },
      components: {
        page: { type: 'Container' },
        title: {
          type: 'Title',
          props: {
            visible: true,
            title: '事件',
            level: 1,
            subtitle: '你未完成的事项 560 条',
          }
        },
        emptyOrgTip: {
          type: 'LRContainer',
          props: {
            visible: true,
            whiteBg: true,
            startAlign: true,
          },
          contentSetting: 'start',
        },
        erdaLogo: {
          type: 'Image',
          props: {
            src: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3355464299,584008140&fm=26&gp=0.jpg',
            visible: true,
            isCircle: true,
            size: 'small',
          },
        },
        emptyOrgText: {
          type: 'Container',
          props: {
            visible: true,
          },
        },
        emptyOrgTitle: {
          type: 'Title',
          props: {
            visible: true,
            title: '你已经是 Erda Cloud 组织的成员',
            level: 2,
          },
        },
        emptyOrgContent: {
          type: 'TextGroup',
          props: {
            visible: true,
            value: [
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '以下是作为平台新成员的一些快速入门知识：',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 浏览公开组织',
                  styleConfig: {
                    bold: true,
                  },
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '通过左上角的浏览公开组织信息，选择公开组织可以直接进入浏览该组织公开项目的信息可（包含项目管理、应用运行信息等）',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 加入组织',
                  styleConfig: {
                    bold: true,
                  }
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '组织当前都是受邀机制，需要线下联系企业所有者进行邀请加入',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '当你已经加入到任何组织后，此框将不再显示',
                  textStyleName: {
                    'fz12': true,
                    'color-text-desc': true,
                  },
                },
                gapSize: 'normal',
              },
            ]
          },
          operations: {
            toSpecificProject: {
              command: {
                key: "goto",
                target: "projectAllIssue",
                jumpOut: true,
                state: {
                  query: {
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
        emptyProjectTip: {
          type: 'LRContainer',
          props: {
            visible: true,
            whiteBg: true,
            startAlign: true,
          },
          contentSetting: 'start',
        },
        orgLogo: {
          type: 'Image',
          props: {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdzJaQZp56En9t1-6SYmZYtY8Y9pdpDoFscQ&usqp=CAU',
            visible: true,
            isCircle: true,
            size: 'small',
          },
        },
        emptyProjectText: {
          type: 'Container',
          props: {
            visible: true,
          }
        },
        emptyProjectTitle: {
          type: 'Title',
          props: {
            visible: true,
            title: '你已经是 XXX 组织的成员',
            level: 2,
          },
        },
        emptyProjectContent: {
          type: 'TextGroup',
          props: {
            visible: true,
            value: [
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '以下是作为组织新成员的一些快速入门知识：',
                },
                gapSize: 'normal',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 切换组织',
                  styleConfig: {
                    bold: true
                  },
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '使用此屏幕上左上角的组织切换，快速进行组织之间切换',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 公开组织浏览',
                  styleConfig: {
                    bold: true
                  },
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '可以通过切换组织下拉菜单中选择公开组织进行浏览',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 加入项目',
                  styleConfig: {
                    bold: true
                  },
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '当前都是受邀机制，需要线下联系项目管理员进行邀请加入',
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '* 该组织内公开项目浏览',
                  styleConfig: {
                    bold: true
                  },
                },
                gapSize: 'small',
              },
              {
                props: {
                  renderType: 'linkText',
                  visible: true,
                  value: {
                    text: ['点击左上角菜单',
                      {
                        icon: 'appstore',
                        iconStyleName: 'primary-icon',
                      }, '选择 DevOps平台进入，选择我的项目可以查看该组织下公开项目的信息']
                  },
                },
                gapSize: 'large',
              },
              {
                props: {
                  renderType: 'text',
                  visible: true,
                  value: '当你已经加入到任何项目后，此框将不再显示',
                  textStyleName: {
                    'fz12': true,
                    'color-text-desc': true,
                  },
                },
                gapSize: 'normal',
              },
            ]
          },
        },
        emptyProjectIssue: {
          type: 'EmptyHolder',
          props: {
            tip: '已加入的项目中，无待完成事项',
            visible: true,
            relative: true,
          }
        },
        content: {
          type: 'Container',
          props: {
            visible: true,
          },
        },
        tableGroup: {
          type: 'TableGroup',
          props: {
            visible: true,
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
                title: {
                  prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                  title: 'Erda',
                  level: 2,
                },
                subtitle: {
                  title: '你未完成的事项',
                  level: 3,
                },
                description: {
                  renderType: 'linkText',
                  visible: true,
                  value: {
                    text: ['当前你还有', {
                      text: ' 120 ', styleConfig: {
                        bold: true
                      },
                    }, '个事项待完成，已过期:', {
                        text: ' 40 ', styleConfig: {
                          bold: true
                        },
                      }, '，本日到期:', {
                        text: ' 40 ', styleConfig: {
                          bold: true
                        },
                      }, '，7日内到期:', {
                        text: ' 36 ', styleConfig: {
                          bold: true
                        },
                      }, '，30日内到期:', {
                        text: ' 44 ', styleConfig: {
                          bold: true
                        },
                      }]
                  },
                  textStyleName: { 'color-text-desc': true },
                },
                table: {
                  props: {
                    rowKey: 'key',
                    columns: [
                      { title: '', dataIndex: 'name', width: 600 },
                      { title: '', dataIndex: 'planFinishedAt' },
                    ],
                    showHeader: false,
                    pagination: false,
                    styleNames: {
                      'no-border': true,
                    },
                  },
                  data: {
                    list: [
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '222运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '150',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '150',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                    ],
                  },
                  operations: {
                    clickRow: {
                      key: 'clickRow',
                      reload: false,
                      command: {
                        key: 'goto',
                        target: 'projectIssueDetail',
                        jumpOut: true,
                      },
                    },
                  },
                },
                extraInfo: {
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
                        target: "projectAllIssue",
                        jumpOut: true,
                        state: {
                          query: {
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
                title: {
                  prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                  title: 'Erda',
                  level: 2,
                },
                subtitle: {
                  title: '你未完成的事项',
                  level: 3,
                },
                description: {
                  renderType: 'linkText',
                  visible: true,
                  value: {
                    text: ['当前你还有', {
                      text: ' 120 ', styleConfig: {
                        bold: true
                      },
                    }, '个事项待完成，已过期:', {
                        text: ' 40 ', styleConfig: {
                          bold: true
                        },
                      }, '，本日到期:', {
                        text: ' 40 ', styleConfig: {
                          bold: true
                        },
                      }, '，7日内到期:', {
                        text: ' 36 ', styleConfig: {
                          bold: true
                        },
                      }, '，30日内到期:', {
                        text: ' 44 ', styleConfig: {
                          bold: true
                        },
                      }]
                  },
                  textStyleName: { 'color-text-desc': true },
                },
                table: {
                  props: {
                    rowKey: 'key',
                    columns: [
                      { title: '', dataIndex: 'name', width: 600 },
                      { title: '', dataIndex: 'planFinishedAt' },
                    ],
                    showHeader: false,
                    pagination: false,
                    styleNames: {
                      'no-border': true,
                    },
                  },
                  data: {
                    list: [
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '222运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '150',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '150',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                      {
                        id: '153',
                        projectId: '13',
                        type: 'requirement',
                        name: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111运行速度没得说，完全不卡，打游戏体验极佳', hoverActive: 'hover-active' },
                        planFinishedAt: '2022-03-02',
                      },
                    ],
                  },
                  operations: {
                    clickRow: {
                      key: 'clickRow',
                      reload: false,
                      command: {
                        key: 'goto',
                        target: 'projectIssueDetail',
                        jumpOut: true,
                      },
                    },
                  },
                },
                extraInfo: {
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
                        target: "projectAllIssue",
                        jumpOut: true,
                        state: {
                          query: {
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
            ],
          },
          state: {
            pageNo: 1,
            pageSize: 1,
            total: 5,
          }
        }
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


  const useMockRight = (payload: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockContent);
      }, 500);
    });
  };
