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

import React from 'react';
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'common/stores/route';
import { cloneDeep } from 'app/external/custom-lodash';

const appSiteManage = () => {
  const { id } = routeInfoStore.useStore((s) => s.params);
  const { appName } = routeInfoStore.useStore((s) => s.query);
  const inParams = {
    id: +id,
    appName,
  };

  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="edge-app-site"
        scenarioType="edge-app-site"
        inParams={inParams}
        useMock={location.search.includes('useMock') ? useMock : undefined}
      />
    </div>
  );
};

const useMock = (payload: Record<string, any>) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMock(payload));
    }, 100);
  });

const getMock = (payload?: Record<string, any>) => {
  // console.clear();
  // console.log('request', payload);
  const temp = cloneDeep(mock);
  return temp;
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'edge-app-site',
    scenarioType: 'edge-app-site',
  },
  protocol: {
    hierarchy: {
      root: 'siteManage',
      structure: {
        siteManage: ['head', 'appSiteManage'],
        head: { left: 'appSiteBreadcrumb', right: 'siteFilterGroup' },
        siteFilterGroup: ['siteNameFilter', 'statusViewGroup'],
      },
    },
    components: {
      siteManage: { type: 'Container' },
      head: { type: 'LRContainer' },
      appSiteManage: {
        type: 'Table',
        state: {
          total: 20,
          pageSize: 10,
          pageNo: 1,
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
        },
        props: {
          pageSizeOptions: ['10', '20', '50', '100'],
          rowKey: 'siteName',
          columns: [
            { title: '站点名称', dataIndex: 'siteName', width: 150 },
            { title: '部署状态', dataIndex: 'deployStatus', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              siteName: {
                renderType: 'linkText',
                value: 'beijing-001',
                operations: {
                  click: {
                    reload: false,
                    key: 'gotoSiteManage',
                    command: {
                      key: 'goto',
                      target: 'edgeAppSiteIpManage',
                      jumpOut: false,
                      state: { params: { id: 1, siteName: 'beijing-001' }, query: { appName: 'test' } },
                    },
                  },
                },
              },
              deployStatus: { renderType: 'textWithBadge', value: '成功', status: 'success' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  restart: {
                    key: 'restart',
                    text: '重启',
                    confirm: '是否重启',
                    reload: true,
                    meta: { id: 1 },
                    disabled: false,
                    disabledTip: '无法重启',
                  },
                  offline: {
                    key: 'offline',
                    text: '下线',
                    confirm: '是否确认下线',
                    reload: true,
                    meta: { id: 1 },
                    disabled: false,
                    disabledTip: '无法下线',
                  },
                },
              },
            },
            {
              siteName: {
                renderType: 'linkText',
                value: 'hangzhou',
                operations: {
                  click: {
                    reload: false,
                    key: 'gotoSiteManage',
                    command: {
                      key: 'goto',
                      target: 'edgeAppSiteIpManage',
                      jumpOut: false,
                      state: { params: { id: 1, siteName: 'beijing-001' }, query: { appName: 'test' } },
                    },
                  },
                },
              },
              deployStatus: { renderType: 'textWithBadge', value: '部署中', status: 'processing' },
              operate: {
                renderType: 'tableOperation',
                operations: {
                  restart: {
                    key: 'restart',
                    text: '重启',
                    confirm: '是否重启',
                    reload: true,
                    meta: { id: 1 },
                    disabled: false,
                    disabledTip: '无法重启',
                  },
                  offline: {
                    key: 'offline',
                    text: '下线',
                    confirm: '是否确认下线',
                    reload: true,
                    meta: { id: 1 },
                    disabled: false,
                    disabledTip: '无法下线',
                  },
                },
              },
            },
          ],
        },
      },
      statusViewGroup: {
        type: 'Radio',
        props: {
          radioType: 'button',
          buttonStyle: 'outline',
          size: 'small',
          options: [
            { text: '全部(2)', status: 'default', key: 'total' },
            { text: '成功(1)', status: 'success', key: 'success' },
            { text: '部署中(1)', status: 'processing', key: 'processing' },
            { text: '失败(0)', status: 'error', key: 'error' },
          ],
        },
        operations: {
          onChange: {
            key: 'changeViewType',
            reload: true,
          },
        },
        state: {
          value: 'total',
        },
      },
      appSiteBreadcrumb: {
        type: 'Breadcrumb',
        data: {
          list: [{ key: 'appName', item: '站点列表' }],
        },
        operations: {
          click: {
            key: 'selectItem',
            reload: true,
            fillMeta: 'key',
            meta: { key: '' },
          },
        },
      },
      siteFilterGroup: { type: 'RowContainer' },
      siteNameFilter: {
        type: 'ContractiveFilter',
        props: {
          delay: 1000,
        },
        state: {
          conditions: [
            {
              key: 'siteName',
              label: '名称',
              placeholder: '按名称模糊搜索',
              type: 'input' as const,
            },
          ],
          values: {
            siteName: '',
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

export default appSiteManage;
