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
import CmpStrategyForm from 'app/modules/cmp/common/alarm-strategy/strategy-form';
import orgStore from 'app/org-home/stores/org';

const StrategyForm = () => {
  const currentOrg = orgStore.getState((s) => s.currentOrg);
  return <CmpStrategyForm scopeType="org" scopeId={String(currentOrg.id)} />;
};

export default StrategyForm;
