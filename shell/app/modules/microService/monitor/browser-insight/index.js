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

import { TimeSelector } from 'common';
import i18n, { isZh } from 'i18n';

const tabs = [
  { key: 'bi', name: i18n.t('microService:overview') },
  { key: 'bi/domain', name: i18n.t('microService:access domain') },
  { key: 'bi/page', name: i18n.t('microService:access page') },
  { key: 'bi/position', name: i18n.t('microService:positioning analytics') },
  // { key: 'exception', name: i18n.t('microService:access error') },
  { key: 'bi/ajax', name: i18n.t('microService:ajax interface') },
  { key: 'bi/script', name: i18n.t('microService:script error') },
  { key: 'bi/browser', name: i18n.t('microService:browser performance') },
  { key: 'bi/summary', name: i18n.t('microService:summary') },
];

if (isZh()) {
  tabs.push({ key: 'bi/geography', name: i18n.t('microService:geography') });
}


const getBIRouter = () => ({
  path: 'bi',
  // breadcrumbName: '浏览性能',
  tabs,
  routes: [
    {
      pageName: i18n.t('microService:browser insight'),
      getComp: (cb) => cb(import('browser-insight/pages/overview/overview')),
    },
    {
      path: 'page',
      // breadcrumbName: '访问页面',
      alwaysShowTabKey: 'bi/page',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/page/page')),
    },
    {
      path: 'domain',
      // breadcrumbName: '访问域名',
      alwaysShowTabKey: 'bi/domain',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/domain/domain')),
    },
    {
      path: 'ajax',
      // breadcrumbName: 'Ajax接口',
      alwaysShowTabKey: 'bi/ajax',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/ajax/ajax')),
    },
    {
      path: 'script',
      // breadcrumbName: '脚本错误',
      alwaysShowTabKey: 'bi/script',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/script/script')),
    },
    {
      path: 'browser',
      // breadcrumbName: '浏览器性能',
      alwaysShowTabKey: 'bi/browser',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/browser/browser')),
    },
    {
      path: 'exception',
      breadcrumbName: i18n.t('microService:access error'),
      alwaysShowTabKey: 'bi/exception',
      tabs,
      TabRightComp: TimeSelector,
      getComp: (cb) => cb(import('browser-insight/pages/exception/exception')),
    },
    {
      path: 'position',
      // breadcrumbName: '定位分析',
      tabs,
      alwaysShowTabKey: 'bi/position',
      routes: [
        {
          getComp: (cb) => cb(import('browser-insight/pages/position/position')),
        },
        {
          path: 'comparative',
          breadcrumbName: i18n.t('microService:comparative analytics'),
          getComp: (cb) => cb(import('browser-insight/pages/comparative/comparative')),
        },
      ],
    },
    {
      path: 'summary',
      // breadcrumbName: '摘要',
      alwaysShowTabKey: 'bi/summary',
      tabs,
      getComp: (cb) => cb(import('browser-insight/pages/summary/summary')),
    },
    ...(isZh
      ? [{
        path: 'geography',
        // breadcrumbName: '地理',
        alwaysShowTabKey: 'bi/geography',
        tabs,
        getComp: (cb) => cb(import('browser-insight/pages/geography-china/geography-china')),
      }]
      : []
    ),
  ],
});


export default getBIRouter;
