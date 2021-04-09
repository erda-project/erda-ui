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

import { MonitorMetaDataScope, MonitorMetaDataMode, createMonitorMetaDataStore } from 'app/modules/dataCenter/stores/_common-monitor-metadata';
import userStore from 'app/user/stores';

const { orgName } = userStore.getState(s => s.loginUser);
const analysisMonitorMetadata = createMonitorMetaDataStore(MonitorMetaDataScope.ORG, MonitorMetaDataMode.ANALYSIS, orgName);

export default analysisMonitorMetadata;
