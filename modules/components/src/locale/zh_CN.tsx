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

import { Locale } from '../locale-provider';

/* eslint-disable no-template-curly-in-string */
const localeValues: Locale = {
  locale: 'zh-cn',
  FormModal: {
    newForm: '新建${label}',
    editForm: '编辑${label}',
  },
  Table: {
    emptyText: '该页暂无数据，是否前往',
    firstPage: '第一页',
    ascend: '升序',
    descend: '降序',
    cancelSort: '取消排序',
    batchOperation: '批量操作',
    selectedItemsText: '已选择 ${size} 项',
    operation: '操作',
  },
  Pagination: {
    goToPage: '前往页',
    totalText: '共 ${total} 条',
    pageSizeText: '${size} 条 / 页',
  },
};

export default localeValues;
