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

import layoutStore from './stores/layout';
import breadcrumbStore from './stores/breadcrumb';
import messageStore from './stores/message';
import zh from './locales/zh.json';
import en from './locales/en.json';
import '../styles/util.scss';

import PageContainer from 'layout/pages/page-container/page-container';
import { NotFound } from 'layout/common/error-page';

export default (registerModule) => {
  return registerModule({
    key: 'layout',
    stores: [
      layoutStore,
      breadcrumbStore,
      messageStore,
    ],
    // locales: {
    //   zh,
    //   en,
    // },
    Root: PageContainer,
    NotFound,
  });
};
