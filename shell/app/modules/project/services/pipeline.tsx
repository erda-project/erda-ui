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

interface AppDetail {
  ID: string;
  runningNum: number;
  failedNum: number;
  totalNum: number;
  displayName: string;
  projectName?: string;
}

const apis = {
  getAppList: {
    api: 'get@/api/project-pipeline/actions/get-my-apps',
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
  getPipelineList: {
    api: 'get@/api/project-pipeline/actions/get-pipeline-yml-list',
  },
  checkName: {
    api: 'get@/api/project-pipeline/actions/name-pre-check',
  },
  checkSource: {
    api: 'get@/api/project-pipeline/actions/source-pre-check',
  },
};

export const getAppList = apiCreator<(payload: { projectID: string; name?: string }) => AppDetail[]>(apis.getAppList);

export const getFileTree = apiCreator<
  (payload: {
    pinode: string;
    scope: string;
    scopeID: string;
  }) => Array<{ inode: string; name: string; pinode: string; type: string }>
>(apis.getFileTree);

export const getFileDetail = apiCreator<
  (payload: { id: string; scope: string; scopeID: string }) => Array<{ inode: string; name: string }>
>(apis.getFileDetail);

export const createPipeline = apiCreator<(payload: CreatePipelineParams) => RAW_RESPONSE>(apis.createPipeline);

export const getPipelineList = apiCreator<
  (payload: { appID: string; branch: string }) => { result: Array<{ ymlPath: string; ymlName: string }> }
>(apis.getPipelineList);

export const checkName = apiCreator<
  (payload: { projectID: number; name: string }) => { pass: boolean; message: string }
>(apis.checkName);

export const checkSource = apiCreator<
  (payload: { appID: string; sourceType: string; ref: string; fileName: string }) => { pass: boolean; message: string }
>(apis.checkSource);
