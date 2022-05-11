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
  locale: 'en',
  FormModal: {
    newForm: 'Create ${label}',
    editForm: 'Edit ${label}',
  },
  Table: {
    emptyText: 'This page has no data, whether go to',
    firstPage: 'Page one',
    ascend: 'ascend',
    descend: 'descend',
    cancelSort: 'Unsort',
    batchOperation: 'Batch Operation',
    selectedItemsText: 'Selected ${size} items',
    operation: 'operation',
  },
  Pagination: {
    goToPage: 'Go to',
    totalText: 'Totally ${total} items',
    pageSizeText: '${size} items / page',
  },
};

export default localeValues;
