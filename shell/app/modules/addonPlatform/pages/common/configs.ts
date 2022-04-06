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

export const PLAN_NAME = {
  basic: i18n.t('basic'),
  professional: i18n.t('professional'),
  ultimate: i18n.t('ultimate'),
};

export const ENV_NAME = {
  DEV: i18n.t('develop'),
  TEST: i18n.t('test'),
  STAGING: i18n.t('staging'),
  PROD: i18n.t('prod'),
};

export const CATEGORY_NAME = {
  custom: i18n.t('dop:Custom'),
  database: i18n.t('dop:storage'),
  distributed_cooperation: i18n.t('dop:Distributed Collaboration'),
  message: i18n.t('Message'),
  search: i18n.t('dop:search'),
  content_management: i18n.t('dop:Content Management'),
  security: i18n.t('dop:security'),
  content: i18n.t('dop:content'),
  new_retail: i18n.t('dop:new retail'),
  traffic_load: i18n.t('dop:Traffic Load'),
  'monitoring&logging': i18n.t('dop:Monitoring & Log'),
  image_processing: i18n.t('dop:image processing'),
  solution: i18n.t('dop:solution'),
  general_ability: i18n.t('dop:General Ability'),
  srm: i18n.t('dop:srm'),
  sound_processing: i18n.t('dop:audio processing'),
};

export const CategoriesOrder = [
  i18n.t('dop:Custom'),
  i18n.t('dop:storage'),
  i18n.t('dop:Distributed Collaboration'),
  i18n.t('Message'),
  i18n.t('dop:search'),
  i18n.t('dop:Content Management'),
  i18n.t('dop:security'),
  i18n.t('dop:content'),
  i18n.t('dop:new retail'),
  i18n.t('dop:Traffic Load'),
  i18n.t('dop:Monitoring & Log'),
  i18n.t('dop:image processing'),
  i18n.t('dop:solution'),
  i18n.t('dop:General Ability'),
  i18n.t('dop:srm'),
  i18n.t('dop:audio processing'),
];
