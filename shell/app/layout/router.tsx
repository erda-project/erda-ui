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

import React from 'react';
import i18n from 'core/i18n';
import { Redirect } from 'react-router-dom';

function getLayoutRouter(): RouteConfigItem[] {
  return [
    {
      path: 'noAuth',
      toMark: 'orgIndex',
      render: () => {
        return <Redirect to="" />;
      },
    },
    {
      path: 'inviteToOrg',
      toMark: 'orgIndex',
      breadcrumbName: i18n.t('layout:join organization'),
      getComp: (cb) => cb(import('layout/common/invite-to-org')),
      layout: {
        use: 'error',
        noWrapper: true,
      },
    },
  ];
}

export default getLayoutRouter;
