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
import routeInfoStore from 'common/stores/route';
import TestPlanDetail from 'project/pages/plan-detail';
import AutoTestPlanDetail from './auto-test-plan-detail';
import { TEST_TYPE } from '../test-manage/case';

const TestPlan = () => {
  const testType = routeInfoStore.getState((s) => s.params.testType) || TEST_TYPE.manual;
  return (
    testType === 'auto' ? <AutoTestPlanDetail /> : <TestPlanDetail />
  );
};

export default TestPlan;
