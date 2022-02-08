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

import cloudServiceStore from './stores/cloud-service';
import dashboardStore from './stores/dashboard';
import machineStore from './stores/machine';
import purchaseStore from './stores/purchase';
import servicesStore from './stores/services';

const entry = (registerModule) => {
  return registerModule({
    key: 'dcos',
    stores: [cloudServiceStore, dashboardStore, machineStore, purchaseStore, servicesStore],
  });
};

export default entry;
