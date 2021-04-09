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

import routers from './index';
import domainStore from './stores/domain';
import logStore from './stores/log';
import serviceStore from './stores/service';
import runtimeStore from './stores/runtime';


export default (registerModule) => {
  return registerModule({
    key: 'runtime',
    stores: [
      domainStore,
      logStore,
      serviceStore,
      runtimeStore
    ],
    routers
  });
};
