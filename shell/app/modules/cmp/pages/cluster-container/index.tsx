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

import * as React from 'react';
import routeInfoStore from 'core/stores/route';
import { EmptyHolder } from 'common';
import { EMPTY_CLUSTER } from 'cmp/pages/cluster-manage/config';
import i18n from 'i18n';

export const ClusterContainer = ({ children }: { children: React.ReactNode }) => {
  const { clusterName } = routeInfoStore.useStore((s) => s.params);
  if (EMPTY_CLUSTER === clusterName) {
    return <EmptyHolder tip={i18n.t('cmp:no cluster available')} />;
  }
  return <div key={clusterName}>{children}</div>;
};
