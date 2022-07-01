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

import agent from 'agent';
import { apiCreator } from 'core/service';

const apis = {
  createScaledRules: {
    api: 'post@/api/runtimes/autoscaler/hpa',
  },
  updateScaledRules: {
    api: 'put@/api/runtimes/autoscaler/hpa',
  },
  getScaledRules: {
    api: 'get@/api/runtimes/autoscaler/hpa',
  },
  applyCancelRules: {
    api: 'post@/api/runtimes/autoscaler/hpa-rules-action',
  },
};

interface CreateScaledRulesParams {
  runtimeId: number;
  services: {
    serviceName: string;
    scaledConfig: RUNTIME.ScaledConfig;
  }[];
}

interface UpdateScaledRulesParams {
  runtimeId: number;
  rules: {
    ruleId: string;
    scaledConfig: RUNTIME.ScaledConfig;
  }[];
}

interface ScaledRulesResp {
  runtimeId: number;
  rules: {
    ruleId: string;
    scaledConfig: RUNTIME.ScaledConfig;
  }[];
}

interface ApplyCancelActionParams {
  runtimeId: number;
  actions: {
    ruleId: string;
    action: 'apply' | 'cancel';
  }[];
}

export const createScaledRules = apiCreator<(p: CreateScaledRulesParams) => void>(apis.createScaledRules);

export const updateScaledRules = apiCreator<(p: UpdateScaledRulesParams) => void>(apis.updateScaledRules);

export const getScaledRules = apiCreator<(p: { runtimeId: number; services: string }) => ScaledRulesResp>(
  apis.getScaledRules,
);

export const applyCancelRules = apiCreator<(p: ApplyCancelActionParams) => void>(apis.applyCancelRules);

export const getRuntimeDetail = ({ runtimeId }: { runtimeId: number | string }): RUNTIME.Detail => {
  return agent.get(`/api/runtimes/${runtimeId}`).then((response: any) => response.body);
};

export const rollbackRuntime = ({ runtimeId, deploymentId }: RUNTIME.RollbackBody) => {
  return agent
    .post(`/api/runtimes/${runtimeId}/actions/rollback`)
    .send({ deploymentId })
    .then((response: any) => response.body);
};

export const redeployRuntime = (runtimeId: number | string) => {
  return agent.post(`/api/runtimes/${runtimeId}/actions/redeploy`).then((response: any) => response.body);
};

export const deleteRuntime = (runtimeId: number | string) => {
  return agent.delete(`/api/runtimes/${runtimeId}`).then((response: any) => response.body);
};

export const getRuntimeAddons = (query: RUNTIME.AddonQuery): ADDON.Instance[] => {
  return agent
    .get('/api/addons')
    .query({ type: 'runtime', ...query })
    .then((response: any) => response.body);
};

export const getDeploymentList = (params: RUNTIME.DeployListQuery): IPagingResp<RUNTIME.DeployRecord> => {
  return agent
    .get('/api/deployments')
    .query(params)
    .then((response: any) => response.body);
};

export const cancelDeployment = (data: RUNTIME.CancelDeployBody) => {
  // TODO: 后端没有用到deploymentId
  return agent
    .post('/api/deployments/1/actions/cancel')
    .send(data)
    .then((response: any) => response.body);
};
