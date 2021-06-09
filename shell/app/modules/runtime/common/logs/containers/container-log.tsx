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
import PureContainerLog from '../components/container-log';
import commonStore from 'common/stores/common';
import './container-log.scss';
import runtimeLogStore from 'runtime/stores/log';

export default (p: any) => {
  const logsMap = commonStore.useStore((s) => s.logsMap);
  const { clearLog } = commonStore.reducers;
  const dockerLogMap = runtimeLogStore.useStore((s) => s.dockerLogMap);
  const { pushSlideComp, popSlideComp } = commonStore.reducers;
  return <PureContainerLog logsMap={logsMap} clearLog={clearLog} dockerLogMap={dockerLogMap} pushSlideComp={pushSlideComp} popSlideComp={popSlideComp} {...p} />;
};
