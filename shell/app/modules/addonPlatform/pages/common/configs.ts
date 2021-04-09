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

export enum PlanName {
  basic = i18n.t('basic'),
  professional = i18n.t('professional'),
  ultimate = i18n.t('ultimate'),
}

export enum EnvName {
  DEV = i18n.t('develop'),
  TEST = i18n.t('test'),
  STAGING = i18n.t('staging'),
  PROD = i18n.t('prod'),
}

export enum CategoryName {
  custom = i18n.t('addonPlatform:custom'),
  database = i18n.t('addonPlatform:database'),
  distributed_cooperation = i18n.t('addonPlatform:distributed cooperation'),
  message = i18n.t('addonPlatform:message'),
  search = i18n.t('addonPlatform:search'),
  content_management = i18n.t('addonPlatform:content management'),
  security = i18n.t('addonPlatform:security'),
  content = i18n.t('addonPlatform:content'),
  new_retail = i18n.t('addonPlatform:new retail'),
  traffic_load = i18n.t('addonPlatform:traffic load'),
  'monitoring&logging' = i18n.t('addonPlatform:monitor & log'),
  image_processing = i18n.t('addonPlatform:image processing'),
  solution = i18n.t('addonPlatform:solution'),
  general_ability = i18n.t('addonPlatform:general ability'),
  srm = i18n.t('addonPlatform:srm'),
  sound_processing = i18n.t('addonPlatform:sound processing'),
}

export const CategoriesOrder = [
  i18n.t('addonPlatform:custom'),
  i18n.t('addonPlatform:database'),
  i18n.t('addonPlatform:distributed cooperation'),
  i18n.t('addonPlatform:message'),
  i18n.t('addonPlatform:search'),
  i18n.t('addonPlatform:content management'),
  i18n.t('addonPlatform:security'),
  i18n.t('addonPlatform:content'),
  i18n.t('addonPlatform:new retail'),
  i18n.t('addonPlatform:traffic load'),
  i18n.t('addonPlatform:monitor & log'),
  i18n.t('addonPlatform:image processing'),
  i18n.t('addonPlatform:solution'),
  i18n.t('addonPlatform:general ability'),
  i18n.t('addonPlatform:srm'),
  i18n.t('addonPlatform:sound processing'),
];
