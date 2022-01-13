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

export const ConfigTabs = {
  text: { key: 'text', text: i18n.t('common:text type') },
  other: { key: 'other', text: i18n.t('common:other type') },
};

export const ConfigTypeMap = {
  kv: { key: 'kv', text: i18n.t('value'), type: i18n.t('common:text type') },
  'dice-file': { key: 'dice-file', text: i18n.t('file'), type: i18n.t('common:file type') },
};

export const deployOrderStatusMap = {
  WAITDEPLOY: { text: i18n.t('runtime:waiting for deployment'), status: 'default', op: 'start' },
  DEPLOYING: { text: i18n.t('running'), status: 'processing', op: 'cancel' },
  OK: { text: i18n.t('succeed'), status: 'success', op: '' },
  FAILED: { text: i18n.t('failed'), status: 'error', op: 'restart' },
  CANCELED: { text: i18n.t('canceled'), status: 'warning', op: 'restart' },
};
