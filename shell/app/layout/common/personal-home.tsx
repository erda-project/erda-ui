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
import './org-home.scss';

export const PersonalHome = () => {

  return (
    <DiceConfigPage
      scenarioType='org-list-my'
      scenarioKey='org-list-my'
      useMock={location.search.includes('useMock') ? useMock : undefined}
    // useMock={useMock}
    />
  );
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'org-list-my',
    scenarioType: 'org-list-my', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: { left: 'siderbar', right: 'myPage' },
        myPage: ['title', 'filter', 'emptyContainer', 'projectItem'],
        emptyContainer: ['emptyText'],
        projectItem: ['projectTitle', 'card'],
        card: ['issueTitle', 'issueSummary', 'cardTable', 'moreIssueLink'],
        siderbar: ['orgIcon', 'orgSwitch', 'myJoinedSummary', 'myProject', 'myApplication'],
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
      page: { type: 'SplitPage' },
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
      siderbar: {
        type: 'Container',
        props: {
          fullHeight: true,
          whiteBg: true,
        }
      },
      myPage: { type: 'Container' },
      createButton: { type: 'Button', props: { text: '3创建组织', disabled: true, disabledTip: '敬请期待' } },
      list: {
        type: 'List',
        state: {
          pageNo: 1,
          pageSize: 20,
          total: 100,
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
        },
        operations: {
          changePageNo: {
            key: 'changePageNo',
            reload: true,
            fillMeta: 'pageNo',
          },
          changePageSize: {
            key: 'changePageSize',
            reload: true,
            fillMeta: 'pageSize',
          },
        },
        data: {
          list: [
            {
              id: '1',
              title: '测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1',
              description: '测试测试测试测试',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              extraInfos: [
                { icon: 'earth', text: '公开组织' }, // icon：earth公开/lock2私有
                { icon: 'renyuan', text: '已加入' },

              ],
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
                toManage: {
                  key: 'toManage',
                  text: '管理',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'dataCenterSetting', // 当前组织的管理界面
                  },
                },
                exist: {
                  key: 'exist',
                  text: '退出',
                  reload: true,
                  confirm: '是否确定退出？',
                  meta: { id: '1' },
                },
              },
            },
            {
              id: '2',
              title: '测试2',
              titleSuffixIcon: 'help',
              description: '测试测试',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              extraInfos: [
                { icon: 'earth', text: '私有组织' }, //  // icon：earth公开/lock2私有
              ],
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
                toManage: {
                  key: 'toManage',
                  text: '管理',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'https://xxx.io/orgCenter/setting/detail', // 非当前组织的管理界面
                  },
                },
                exist: {
                  key: 'exist',
                  text: '退出',
                  reload: true,
                  confirm: '是否确定退出？',
                  meta: { id: '1' },
                },
              },
            },
          ],
        },
      },
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
        }
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
            text: '查看剩余112条事件',
          },
        }
      },
      myJoinedSummary: {
        type: 'Table',
        props: {
          rowKey: 'key',
          columns: [
            { title: '', dataIndex: 'catagory' },
            { title: '', dataIndex: 'number' },
          ],
          showHeader: false,
          pagination: false,
        },
        data: {
          list: [
            {
              id: 1,
              catagory: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '参与项目数：' },
              number: 8,
            },
            {
              id: 2,
              catagory: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '参与应用数：' },
              number: 12,
            },
            {
              id: 3,
              catagory: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '未完成事项数：' },
              number: 120,
            },
            {
              id: 4,
              catagory: { renderType: 'textWithIcon', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '其他事件数：' },
              number: 86,
            },
          ],
        },
      },
      filter: {
        type: 'ContractiveFilter',
        props: {
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
              placeholder: '搜索',
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
    },
  },
};

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mock);
    }, 500);
  });
};
