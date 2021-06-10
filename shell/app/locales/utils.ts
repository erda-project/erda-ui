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

import i18n from 'i18n';
import { map, keys } from 'lodash';

const addonNameMap = {
  应用监控: i18n.t('application:appMonitor'),
  配置中心: i18n.t('application:configCenter'),
  搜索中心: i18n.t('application:searchCenter'),
  对象存储: i18n.t('application:objectStorage'),
  日志分析: i18n.t('application:logAnalysis'),
  API网关: i18n.t('application:apiGateway'),
  服务网格: i18n.t('application:serviceMesh'),
  注册中心: i18n.t('application:registerCenter'),
  通知中心: i18n.t('application:noticeCenter'),
};

export const monthMap = {
  '1月': i18n.t('January'),
  '2月': i18n.t('February'),
  '3月': i18n.t('March'),
  '4月': i18n.t('April'),
  '5月': i18n.t('May'),
  '6月': i18n.t('June'),
  '7月': i18n.t('July'),
  '8月': i18n.t('August'),
  '9月': i18n.t('September'),
  '10月': i18n.t('October'),
  '11月': i18n.t('November'),
  '12月': i18n.t('December'),
};

export const alarmTypeMap = {
  机器告警: i18n.t('dcos:machine alarm'),
  系统组件告警: i18n.t('dcos:system component alarm'),
};

export const getTranslateAddonList = (addonList: ADDON.Instance[], key: string) =>
  map(addonList, (item) => {
    const currentItem = { ...item };
    if (keys(addonNameMap).includes(item[key])) {
      currentItem[key] = addonNameMap[item[key]];
    }
    return currentItem;
  });

export const getTranslateAddonName = (name: string) => (keys(addonNameMap).includes(name) ? addonNameMap[name] : name);
