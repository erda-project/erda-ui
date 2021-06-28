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
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import { cloneDeep } from 'app/external/custom-lodash';

const appSiteManage = () => {
  const { id } = routeInfoStore.useStore((s) => s.params);
  const { appName } = routeInfoStore.useStore((s) => s.query);
  const inParams = {
    id: +id,
    appName,
  };

  return (
    <div>
      <DiceConfigPage showLoading scenarioKey="edge-app-site" scenarioType="edge-app-site" inParams={inParams} />
    </div>
  );
};

export default appSiteManage;
