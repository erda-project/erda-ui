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

declare namespace PROJECT_DEPLOY {
  interface DeployOrder {
    id: string;
    name: string;
    releaseId: string;
    type: string;
    applicationStatus: string;
    status: OrderStatus;
    operator: string;
    createdAt: string;
    releaseVersion?: string;
  }

  type OrderStatus = 'WAITDEPLOY';

  interface DeployOrderReq {
    pageNo: number;
    pageSize: number;
    isProjectRelease?: boolean;
    projectID: string;
    workspace: string;
    q?: string;
  }

  type DeployOrderRes = IPagingResp<DeployOrder>;

  interface DeployActionCancelReq {
    deployOrderId: string;
    data?: {
      force?: boolean;
    };
  }

  interface DeployActionDeployReq {
    deployOrderId: string;
    data?: {
      workspace?: boolean;
    };
  }

  interface DeployDetailReq {
    deploymentOrderId: string;
  }

  interface IAppParams {
    key: string;
    value: string;
    encrypt: boolean;
    type: string;
    comment: string;
  }
  interface DeployDetailApp {
    id: string;
    deploymentId: string;
    name: string;
    params: IAppParams[];
    releaseVersion: string;
    releaseId: string;
    branch: string;
    commitId: string;
    diceYaml: string;
    status: string;
  }
  interface DeployDetail {
    id: string;
    name: string;
    releaseId: string;
    type: string;
    status: string;
    operator: string;
    startAt: string;
    releaseVersion: string;
    applicationsInfo: DeployDetailApp[];
  }

  interface ReleaseReq {
    isProjectRelease?: boolean;
    isStable?: boolean;
    applicationId?: string;
    projectId?: string;
    q?: string;
    pageSize: number;
    pageNo: number;
  }

  interface Release {
    applicationId: number;
    applicationName: string;
    clusterName: string;
    createdAt: string;
    crossCluster: boolean;
    diceyml: string;
    isFormal: boolean;
    isProjectRelease: boolean;
    isStable: boolean;
    labels: {
      gitBranch: string;
      gitCommitId: string;
      gitCommitMessage: string;
      gitRepo: string;
    };
    orgId: number;
    projectId: number;
    projectName: string;
    reference: number;
    releaseId: string;
    releaseName: string;
    resources: Array<{
      meta: Obj;
      name: string;
      type: string;
      url: string;
    }>;
    serviceImages: string;
    updatedAt: string;
    userId: string;
    version: string;
  }

  interface ReleaseRenderDetailReq {
    releaseID: string;
    workspace: string;
  }

  interface ReleaseRenderDetail {
    id: string;
    name: string;
    releaseVersion: string;
    releaseUpdateAt: string;
    applicationsInfo: IApplicationsInfo[];
  }
  interface IApplicationsInfo {
    id: string;
    name: string;
    params: IAppParams[];
  }
}
