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

import { apiCreator } from 'core/service';

interface CreatePipelineParams {
  projectID: number;
  name: string;
  appID: string;
  sourceType: string;
  ref: string;
  path: string;
  fileName: string;
}

interface OneClickCreatePipelineParams {
  projectID: string;
  appID: string;
  sourceType: string;
  ref: string;
  pipelineYmls: string[];
}

interface AppDetail {
  ID: string;
  runningNum: number;
  failedNum: number;
  totalNum: number;
  displayName: string;
  projectName?: string;
}

interface Category {
  key: string;
  category: string;
  rules: string[];
  runningNum: number;
  failedNum: number;
  totalNum: number;
}

interface Guide {
  id: string;
  appID: number;
  branch: string;
  appName: string;
  timeCreated: string;
  content: string;
}

const apis = {
  getAppList: {
    api: 'get@/api/project-pipeline/actions/get-my-apps',
  },
  getPipelineTypesList: {
    api: 'get@/api/project-pipeline/actions/list-category',
  },
  getFileTree: {
    api: 'get@/api/project-pipeline/filetree',
  },
  getFileDetail: {
    api: 'get@/api/project-pipeline/filetree/:id',
  },
  createPipeline: {
    api: 'post@/api/project-pipeline',
  },
  oneClickCreatePipeline: {
    api: 'post@/api/project-pipeline/actions/one-click-create',
  },
  getPipelineList: {
    api: 'get@/api/project-pipeline/actions/get-pipeline-yml-list',
  },
  checkName: {
    api: 'get@/api/project-pipeline/actions/name-pre-check',
  },
  checkSource: {
    api: 'get@/api/project-pipeline/actions/source-pre-check',
  },
  getAllBranch: {
    api: 'get@/api/cicds/actions/app-all-valid-branch-workspaces',
  },
  editPipelineName: {
    api: 'put@/api/project-pipeline/definitions/:id',
  },
  getGuidesList: {
    api: 'get@/api/guide',
  },
  cancelGuide: {
    api: 'post@/api/guide/:id/actions/cancel',
  },
  runPipeline: {
    api: 'post@/api/project-pipeline/definitions/:pipelineDefinitionID/actions/run',
  },
  rerunPipeline: {
    api: 'post@/api/project-pipeline/definitions/:pipelineDefinitionID/actions/rerun',
  },
  rerunFailedPipeline: {
    api: 'post@/api/project-pipeline/definitions/:pipelineDefinitionID/actions/rerun-failed',
  },
  cancelPipeline: {
    api: 'post@/api/project-pipeline/definitions/:pipelineDefinitionID/actions/cancel',
  },
};

export const runPipeline = apiCreator<
  (payload: { pipelineDefinitionID: string; projectID: number; runPrams?: Obj<string | number> }) => {
    pipeline: { id: string };
  }
>(apis.runPipeline);

export const rerunPipeline = apiCreator<
  (payload: { pipelineDefinitionID: string; projectID: number }) => { pipeline: { id: string } }
>(apis.rerunPipeline);

export const rerunFailedPipeline = apiCreator<
  (payload: { pipelineDefinitionID: string; projectID: number }) => { pipeline: { id: string } }
>(apis.rerunFailedPipeline);

export const cancelPipeline = apiCreator<(payload: { pipelineDefinitionID: string; projectID: number }) => void>(
  apis.cancelPipeline,
);

export const getAppList = apiCreator<(payload: { projectID: string; name?: string }) => AppDetail[]>(apis.getAppList);

export const getPipelineTypesList = apiCreator<
  (payload: { projectID: string; appID?: string; name?: string }) => Category[]
>(apis.getPipelineTypesList);

export const getFileTree = apiCreator<
  (payload: {
    pinode: string;
    scope: string;
    scopeID: string;
    pipelineCategoryKey: string;
  }) => Array<{ inode: string; name: string; pinode: string; type: string }>
>(apis.getFileTree);

export const getFileDetail = apiCreator<
  (payload: { id: string; scope: string; scopeID: string }) => Array<{ inode: string; name: string }>
>(apis.getFileDetail);

export const createPipeline = apiCreator<(payload: CreatePipelineParams) => RAW_RESPONSE>(apis.createPipeline);

export const oneClickCreatePipeline = apiCreator<(payload: OneClickCreatePipelineParams) => { errMsg: string }>(
  apis.oneClickCreatePipeline,
);

export const getPipelineList = apiCreator<
  (payload: { appID: string; branch: string }) => { result: Array<{ ymlPath: string; ymlName: string }> }
>(apis.getPipelineList);

export const checkName = apiCreator<
  (payload: { projectID: number; name: string }) => { pass: boolean; message: string }
>(apis.checkName);

export const checkSource = apiCreator<
  (payload: { appID: string; sourceType: string; ref: string; fileName: string }) => { pass: boolean; message: string }
>(apis.checkSource);

export const getAllBranch = apiCreator<(payload: { appID: number }) => RAW_RESPONSE<Array<{ name: string }>>>(
  apis.getAllBranch,
);

export const editPipelineName = apiCreator<(payload: { id: string; name: string; projectID: number }) => RAW_RESPONSE>(
  apis.editPipelineName,
);

export const getGuidesList = apiCreator<(payload: { kind: string; projectID: string; appID?: string }) => Guide[]>(
  apis.getGuidesList,
);

export const cancelGuide = apiCreator<(payload: { id: string }) => RAW_RESPONSE>(apis.cancelGuide);
