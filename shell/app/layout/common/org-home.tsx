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
import { Card } from 'nusi';
import i18n from 'i18n';
import erda_png from 'app/images/Erda.png';
import './org-home.scss';

export const OrgHome = () => {
  return (
    <Card className='full-height ma12 auto-overflow'>
      <div className='org-home-info mb20'>
        <div className='info-img'>
          <img src={erda_png} />
        </div>
        <div className='info-text mt20'>
          <span className='desc fz16 bold'>{i18n.t('org:org-intro')}</span>
        </div>
      </div>
      <div className='org-home-list'>
        <DiceConfigPage
          scenarioType='org-list-my'
          scenarioKey='org-list-my'
          useMock={location.search.includes('useMock') ? useMock : undefined}
          customProps={{
            list: {
              exist: (_op:any, data: Obj) => {
                // 如果退出当前企业，reload界面
              },
            },
          }}
        />
      </div>
    </Card>
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
        page: { children: ['myPage'], tabBarExtraContent: ['createButton'] },
        myPage: ['filter', 'list'],

      },
    },
    components: {
      page: {
        type: 'Tabs',
        props: {
          tabMenu: [
            {
              key: 'my',
              name: '我的组织',
              operations: {
                click: {
                  reload: false,
                  key: 'myOrg',
                  command: {
                    key: 'changeScenario',
                    scenarioType: 'org-list-my',
                    scenarioKey: 'org-list-my',

                  },
                },
              },
            },
            {
              key: 'all',
              name: '我的组织',
              operations: {
                click: {
                  reload: false,
                  key: 'allOrg',
                  command: {
                    key: 'changeScenario',
                    scenarioType: 'a-list-all',
                    scenarioKey: 'org-list-all',

                  },
                },
              },
            },

          ],
        },
        state: {
          activeKey: 'my',
        },
      },
      myPage: { type: 'Container' },
      createButton: { type: 'Button', props: { text: '创建组织', disabled: true, disabledTip: '敬请期待' } },
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
                { icon: 'help', text: '公开组织' },
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
                { icon: 'help', text: '私有组织' },
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
