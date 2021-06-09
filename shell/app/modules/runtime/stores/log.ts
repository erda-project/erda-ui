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

import { createFlatStore } from 'app/cube';
import i18n from 'i18n';
import runtimeStore from './runtime';
import { getDeploymentStatus, getDockerLog } from '../services/log';
import { getClusterDetail } from 'dcos/services/cluster';


interface State {
  deploymentStatus: RUNTIME_LOG.DeployStatus;
  dockerLogMap: {};
  slideLogComps: JSX.Element[];
}

const initState: State = {
  deploymentStatus: {} as RUNTIME_LOG.DeployStatus,
  dockerLogMap: {},
  slideLogComps: [],
};

const runtimeLog = createFlatStore({
  name: 'runtimeLog',
  state: initState,
  subscriptions: ({ registerWSHandler }: IStoreSubs) => {
    registerWSHandler('R_DEPLOY_STATUS_UPDATE', ({ payload }) => {
      const [runtimeDetail] = runtimeStore.getState((s) => [s.runtimeDetail]);
      if (payload.runtimeId === runtimeDetail.id) {
        runtimeLog.changeStep(payload.phase);
      }
    });
  },
  effects: {
    async getDeploymentStatus({ call, update }, deployId: string) {
      const deploymentStatus = await call(getDeploymentStatus, deployId);
      update({ deploymentStatus });
    },
    async getDockerLog({ call, getParams }, payload: Omit<Merge<RUNTIME_LOG.DockerLogQuery, { logKey: string; clusterName?: string }>, 'colonySoldier'>) {
      const { logKey, host, targetId, clusterName } = payload;
      const runtimeDetail = runtimeStore.getState((s) => s.runtimeDetail);

      const params = getParams(); // TODO: 这里在哪里复用有clusterName？
      const clusterDetail = await call(getClusterDetail, {
        clusterId: runtimeDetail.clusterId,
        clusterName: clusterName || params.clusterName,
      });
      let dockerLog = '';
      if (!host) {
        dockerLog = i18n.t("runtime:the current container has no host, can't get the container log");
      } else if (clusterDetail.urls) {
        dockerLog = await call(getDockerLog, {
          targetId,
          host,
          colonySoldier: clusterDetail.urls.colonySoldier,
        });
      }
      runtimeLog.queryLogSuccess({ dockerLog, logKey });
    },
  },
  reducers: {
    queryLogSuccess(state, { logKey, dockerLog }: { logKey: string; dockerLog: string }) {
      const { dockerLogMap } = state;
      state.dockerLogMap = {
        ...dockerLogMap,
        [logKey]: { content: dockerLog || '', loading: false },
      };
    },
    changeStep(state, step: string) {
      state.deploymentStatus.phase = step;
    },
    clearDockerLog(state, logKey: string) {
      state.dockerLogMap[logKey] = {};
    },
    pushSlideComp(state, payload: JSX.Element) {
      state.slideLogComps.push(payload);
    },
    popSlideComp(state) {
      state.slideLogComps.splice(-1);
    },
  },
});

export default runtimeLog;
