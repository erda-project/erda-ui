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
import { useUpdate } from 'common';
import { get } from 'lodash';
import ApplyUnblockModal, { IMetaData } from 'workBench/pages/projects/apply-unblock-modal';

export const ProjectList = () => {
  const [state, updater, update] = useUpdate({
    visible: false,
    metaData: {} as IMetaData,
  });
  const reloadRef = React.useRef(null as any);

  const closeModal = () => {
    update({
      visible: false,
      metaData: {} as IMetaData,
    });
  };

  const reloadProjectsList = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  const handleShowApplyModal = ({ name, id }: PROJECT.Detail) => {
    update({
      visible: true,
      metaData: {
        projectId: id,
        projectName: name,
      },
    });
  };
  return (
    <>
      <DiceConfigPage
        scenarioType='project-list-my'
        ref={reloadRef}
        scenarioKey='project-list-my'
        useMock={useMock}
        customProps={{
          list: {
            applyDeploy: (op:CP_COMMON.Operation, data:any) => {
              const pId = get(op, 'meta.projectId') || data?.projectId;
              const pName = get(op, 'meta.projectName') || data?.projectName;
              if (pId && pName) {
                handleShowApplyModal({ name: pName, id: pId } as PROJECT.Detail);
              }
            },
          },
        }}
      />
      <ApplyUnblockModal
        visible={state.visible}
        metaData={state.metaData as IMetaData}
        onCancel={closeModal}
        afterSubmit={reloadProjectsList}
      />
    </>
  );
};


const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'project-list-my', // 后端定义
    scenarioType: 'project-list-my', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: { children: ['myPage'] },
        myPage: ['alert', 'filter', 'list'],
      },
    },
    components: {
      alert: {
        type: 'Alert',
        props: {
          visible: true,
          message: '企业处于封网期间，生产环境禁止部署！',
          type: 'error',
        },
      },
      page: {
        type: 'Tabs',
        props: {
          tabMenu: [
            {
              key: 'my',
              name: '我的项目',
              operations: {
                click: {
                  reload: false,
                  key: 'myProject',
                  command: {
                    key: 'changeScenario',
                    scenarioType: 'project-list-my', // 后端定义
                    scenarioKey: 'project-list-my', // 后端定义

                  },
                },
              },
            },
            {
              key: 'all',
              name: '公开项目',
              operations: {
                click: {
                  reload: false,
                  key: 'allProject',
                  command: {
                    key: 'changeScenario',
                    scenarioType: 'project-list-all',
                    scenarioKey: 'project-list-all',
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
              projectId: '1',
              prefixImg: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              extraInfos: [
                { icon: 'help', text: '公开项目' }, // 这个icon待定
                { icon: 'yy-4', text: '32', tooltip: '应用数' },
                { icon: 'renyuan', text: '已加入' },
                { icon: 'sj', text: '5个月前', tooltip: '2020-09-28 21:35:10' },
                { icon: 'lock1', text: '解封处理中，请稍等', type: 'warning' }, // blockStatus=unblocking的时候展示

              ],
              operations: {
                click: {
                  key: 'click',
                  show: false,
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'project', // 去该项目的首页（应用列表）
                  },
                },
                applyDeploy: {
                  // blockStatus = 'unblocked' | 'unblocking' | 'blocked'时候显示
                  key: 'applyDeploy',
                  reload: false,
                  text: '申请部署',
                  meta: {
                    projectId: 1,
                    projectName: 'xxx',
                  },

                },
                toManage: {
                  key: 'toManage',
                  text: '管理',
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'projectSetting', // 去该项目的设置
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
                { icon: 'help', text: '私有项目' }, // 这个icon待定
                { icon: 'yy-4', text: '32', tooltip: '应用数' },
                { icon: 'sj', text: '5个月前', tooltip: '2020-09-28 21:35:10' },
                { icon: 'lock1', text: '已解封', type: 'success' }, // blockStatus = unblocked的时候展示
              ],
              operations: {
                click: {
                  key: 'click',
                  show: false,
                  reload: false,
                  command: {
                    key: 'goto',
                    target: 'project', // 去该项目的首页（应用列表）
                  },
                },
                applyDeploy: {
                  // blockStatus = 'unblocked' | 'unblocking' | 'blocked'时候显示
                  key: 'applyDeploy',
                  reload: false,
                  disabled: true, // canUnblock = false的时候disable = true，反之为false
                  text: '申请部署',
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


const useMock = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mock);
    }, 500);
  });
};
