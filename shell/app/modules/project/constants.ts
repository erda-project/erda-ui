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

// preCondition 和 desc stepAndResult不用从元数据读取
import i18n from 'i18n';

export const DEFAULT_FIELDS = [
  {
    uniqueName: 'title',
    showName: i18n.t('project:title'),
    fieldTypeCode: 'STRING',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: false,
    fieldRequired: true,
    contentRequired: true,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'preCondition',
    showName: i18n.t('project:preconditions'),
    fieldTypeCode: 'richText',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: false,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'stepAndResult',
    showName: i18n.t('project:steps and results'),
    fieldTypeCode: 'STRING',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: false,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'desc',
    showName: i18n.t('project:description'),
    fieldTypeCode: 'richText',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: false,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'priority',
    showName: i18n.t('project:priority'),
    fieldTypeCode: 'select',
    module: 'ISSUE',
    defaultValue: '2',
    optionsUrl: null,
    enumerable: true,
    multiple: false,
    fieldRequired: true,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'attachments',
    showName: i18n.t('project:attachment'),
    fieldTypeCode: 'attachment',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: true,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'labels',
    showName: i18n.t('project:label'),
    fieldTypeCode: 'label',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: true,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'module',
    showName: i18n.t('project:module'),
    fieldTypeCode: 'module',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: true,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
  {
    uniqueName: 'bugIds',
    showName: i18n.t('project:association defect'),
    fieldTypeCode: 'issue',
    module: 'ISSUE',
    defaultValue: null,
    optionsUrl: null,
    enumerable: false,
    multiple: true,
    fieldRequired: false,
    contentRequired: false,
    desc: null,
    icon: null,
    order: null,
  },
];
