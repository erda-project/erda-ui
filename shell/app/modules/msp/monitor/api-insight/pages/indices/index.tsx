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
import { TimeSelector } from 'common';
import Indices from './config/chartMap';
import routeInfoStore from 'app/common/stores/route';
import gatewayStore from 'msp/stores/gateway';
import { useMount } from 'react-use';

const APIIndices = () => {
  const { clusterName, gatewayInstance } = gatewayStore.useStore((s) => s.consumer);
  const { getConsumer } = gatewayStore.effects;
  const projectId = routeInfoStore.useStore((s) => s.params.projectId);
  const shouldLoad = !!(gatewayInstance && clusterName);
  const commonFilter = {
    filter_addon_name: gatewayInstance,
    filter_cluster_name: clusterName,
    projectId,
  };

  useMount(() => {
    getConsumer();
  });

  return (
    <div>
      <TimeSelector />
      <Indices.memory shouldLoad={shouldLoad} query={{ ...commonFilter }} />
      <Indices.cpu shouldLoad={shouldLoad} query={{ ...commonFilter }} />
      <Indices.disk shouldLoad={shouldLoad} query={{ ...commonFilter }} />
      <Indices.network shouldLoad={shouldLoad} query={{ ...commonFilter }} />
    </div>
  );
};

export default APIIndices;
