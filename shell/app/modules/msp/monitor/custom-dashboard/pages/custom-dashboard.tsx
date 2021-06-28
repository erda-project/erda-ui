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
import routeInfoStore from 'app/common/stores/route';
import { CustomDashboardScope } from 'app/modules/dataCenter/stores/_common-custom-dashboard';
import CustomDashboard from 'app/modules/dataCenter/common/custom-dashboard/custom-dashboard';

export default () => {
  const { terminusKey } = routeInfoStore.useStore((s) => s.params);
  return <CustomDashboard scope={CustomDashboardScope.MICRO_SERVICE} scopeId={terminusKey} />;
};
