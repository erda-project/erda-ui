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
import ManualTestCase from './manual-test';
// import AutoTest from './auto-test';
import AutoTest from 'project/pages/auto-test';

export enum TEST_TYPE {
  manual = 'manual',
  auto = 'auto',
}

const TestCompMap = {
  manual: ManualTestCase,
  auto: AutoTest,
};

const TestCase = () => {
  const testType = routeInfoStore.getState((s) => s.params.testType) || TEST_TYPE.manual;
  const Comp = TestCompMap[testType];

  return <Comp />;
};

export default TestCase;
