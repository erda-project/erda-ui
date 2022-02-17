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

import alarmRecordRouter from 'msp/alarm-manage/alarm-record';
import i18n from 'i18n';
import AlarmRouter from 'msp/alarm-manage/alarm-strategy';
import { getMspBreadcrumb } from 'msp/config';
import { EventDetailTitle } from 'msp/alarm-manage/alert-list/events/detail';
import { NotificationTitle } from 'msp/alarm-manage/alert-list/notification/detail';

const alarmConfigTab = [
  {
    key: 'strategy',
    name: i18n.t('alarm strategy'),
  },
  {
    key: 'rule',
    name: i18n.t('rule management'),
  },
  {
    key: 'notify-group',
    name: i18n.t('notification group management'),
  },
];

const alarmListTabs = [
  {
    key: 'events',
    name: i18n.t('msp:events'),
  },
  {
    key: 'notification',
    name: i18n.t('notification'),
  },
];

const alarmManageRouters = [
  alarmRecordRouter(),
  {
    path: 'alarm-overview',
    breadcrumbName: getMspBreadcrumb('AlertOverview'),
    layout: { noWrapper: true },
    getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/overview')),
  },
  {
    path: 'config',
    breadcrumbName: getMspBreadcrumb('AlertConfig'),
    tabs: alarmConfigTab,
    alwaysShowTabKey: 'strategy',
    routes: [
      ...AlarmRouter(),
      {
        path: 'strategy',
        tabs: alarmConfigTab,
        routes: AlarmRouter(),
      },
      {
        path: 'rule',
        tabs: alarmConfigTab,
        routes: [
          {
            path: ':dashboardId',
            breadcrumbName: '{dashboardName}',
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/query-analysis/custom-dashboard/pages/custom-dashboard')),
          },
          {
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alarm-strategy/pages/custom-alarm')),
          },
        ],
      },
      {
        path: 'notify-group',
        tabs: alarmConfigTab,
        layout: { noWrapper: true },
        getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/notify-group')),
      },
    ],
  },
  {
    path: 'list',
    breadcrumbName: getMspBreadcrumb('AlertList'),
    tabs: alarmListTabs,
    alwaysShowTabKey: 'events',
    routes: [
      {
        getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alert-list/events')),
      },
      {
        path: 'events',
        tabs: alarmListTabs,
        alwaysShowTabKey: 'events',
        routes: [
          {
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alert-list/events')),
          },
          {
            path: ':eventId',
            breadcrumbName: getMspBreadcrumb('AlertList'),
            pageNameInfo: EventDetailTitle,
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alert-list/events/detail')),
          },
        ],
      },
      {
        path: 'notification',
        tabs: alarmListTabs,
        alwaysShowTabKey: 'notification',
        routes: [
          {
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alert-list/notification')),
          },
          {
            path: ':notificationId',
            breadcrumbName: getMspBreadcrumb('AlertList'),
            pageNameInfo: NotificationTitle,
            layout: { noWrapper: true },
            getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alert-list/notification/detail')),
          },
        ],
      },
    ],
  },
  {
    path: 'integration',
    breadcrumbName: getMspBreadcrumb('AlertTegrate'),
  },
];

const getAlarmManageRouter = () => {
  return {
    path: ':terminusKey',
    routes: alarmManageRouters,
  };
};

export default getAlarmManageRouter;
