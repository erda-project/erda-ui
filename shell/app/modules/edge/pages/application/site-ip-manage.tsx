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
import { useUpdate } from 'common';
import { MonitorDrawer } from '../components/monitor-drawer';

const appSiteIpManage = () => {
  const [{ monitorVisible, chosenSite }, updater, update] = useUpdate({
    monitorVisible: false,
    chosenSite: {} as MACHINE_MANAGE.IMonitorInfo,
  });

  const { id, siteName } = routeInfoStore.useStore((s) => s.params);
  const { appName } = routeInfoStore.useStore((s) => s.query);
  const inParams = {
    id: +id,
    appName,
    siteName,
  };

  return (
    <div>
      <DiceConfigPage
        showLoading
        scenarioKey="edge-app-site-ip"
        scenarioType="edge-app-site-ip"
        inParams={inParams}
        useMock={location.search.includes('useMock') ? useMock : undefined}
        customProps={{
          siteIpList: {
            operations: {
              viewMonitor: (site: { meta: MACHINE_MANAGE.IMonitorInfo }) => {
                update({
                  monitorVisible: true,
                  chosenSite: site.meta,
                });
              },
              viewLog: (site: { meta: MACHINE_MANAGE.IMonitorInfo }) => {
                update({
                  monitorVisible: true,
                  chosenSite: site.meta,
                });
              },
              viewTerminal: (site: { meta: MACHINE_MANAGE.IMonitorInfo }) => {
                update({
                  monitorVisible: true,
                  chosenSite: site.meta,
                });
              },
            },
          },
        }}
      />
      <MonitorDrawer data={chosenSite} visible={monitorVisible} onClose={() => updater.monitorVisible(false)} />
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
    scenarioKey: 'edge-app-site-ip',
    scenarioType: 'edge-app-site-ip',
  },
  protocol: {
    hierarchy: {
      root: 'siteIpManage',
      structure: {
        siteIpManage: ['head', 'siteIpList'],
        head: { left: 'appSiteBreadcrumb', right: 'statusViewGroup' },
      },
    },
    components: {
      siteIpManage: { type: 'Container' },
      head: { type: 'LRContainer' },
      siteIpList: {
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
          rowKey: 'id',
          columns: [
            { title: '实例IP', dataIndex: 'ip', width: 150 },
            { title: '主机地址', dataIndex: 'address', width: 150 },
            { title: '状态', dataIndex: 'status', width: 150 },
            { title: '创建时间', dataIndex: 'createdAt', width: 150 },
            { title: '操作', dataIndex: 'operate', width: 150 },
          ],
        },
        data: {
          list: [
            {
              id: 1,
              ip: '10.0.0.1',
              address: '100.0.0.1',
              status: { renderType: 'textWithBadge', value: '运行中', status: 'success' },
              createdAt: '2021-03-02 10:09:12',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  viewTerminal: {
                    key: 'viewTerminal',
                    text: '控制台',
                    reload: false,
                    meta: {
                      clusterName: 'terminus-dev',
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '84720f31ba57775c86d96db1745c0673d8464925f5b3c0cf8a656805005ac511',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      type: 'terminal',
                    },
                  },
                  viewMonitor: {
                    key: 'viewMonitor',
                    text: '容器监控',
                    reload: false,
                    meta: {
                      api: '/api/orgCenter/metrics', // 接口地址写死
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      type: 'monitor',
                      extraQuery: { filter_cluster_name: 'terminus-dev' },
                    },
                  },
                  viewLog: {
                    key: 'viewLog',
                    text: '日志',
                    reload: false,
                    meta: {
                      fetchApi: '/api/orgCenter/logs', // 接口地址写死
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      extraQuery: { clusterName: 'terminus-dev' },
                      sourceType: 'container',
                      type: 'log',
                    },
                  },
                },
              },
            },
            {
              id: 2,
              ip: '10.0.0.134',
              address: '100.0.0.1',
              status: { renderType: 'textWithBadge', value: '已停止', status: 'error' },
              createdAt: '2021-03-02 10:09:12',
              operate: {
                renderType: 'tableOperation',
                operations: {
                  viewTerminal: {
                    key: 'viewTerminal',
                    text: '控制台',
                    reload: false,
                    meta: {
                      clusterName: 'terminus-dev',
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '84720f31ba57775c86d96db1745c0673d8464925f5b3c0cf8a656805005ac511',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      type: 'terminal',
                    },
                  },
                  viewMonitor: {
                    key: 'viewMonitor',
                    text: '容器监控',
                    reload: false,
                    meta: {
                      api: '/api/orgCenter/metrics', // 接口地址写死
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      type: 'monitor',
                      extraQuery: { filter_cluster_name: 'terminus-dev' },
                    },
                  },
                  viewLog: {
                    key: 'viewLog',
                    text: '日志',
                    reload: false,
                    meta: {
                      fetchApi: '/api/orgCenter/logs', // 接口地址写死
                      instance: {
                        id: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        containerId: '5274ac8494a254deee53b7a57a70e41d60b2b5b9903f821b86e5c962a4869ef9',
                        clusterName: 'terminus-dev',
                        hostIP: '10.0.6.199',
                      },
                      extraQuery: { clusterName: 'terminus-dev' },
                      sourceType: 'container',
                      type: 'log',
                    },
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
            { text: '全部', status: 'default', key: 'total' },
            { text: '运行中', status: 'success', key: 'success' },
            { text: '已停止', status: 'error', key: 'error' },
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
          list: [
            { key: 'appName', item: '站点列表' },
            { key: 'siteName', item: 'beijing-001' },
          ],
        },
        operations: {
          click: {
            key: 'selectItem',
            reload: false,
            fillMeta: 'key',
            command: {
              key: 'goto',
              target: 'edgeAppSiteManage',
              jumpOut: false,
              state: { params: { id: 1 }, query: { appName: 'test_edge' } },
            },
          },
        },
      },
    },
  },
};

export default appSiteIpManage;
