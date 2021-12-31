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

interface ReleaseListQuery {
  projectId?: string;
  isStable: boolean;
  isFormal?: boolean;
  isProjectRelease: boolean;
  applicationId?: string | number;
  pageSize: number;
  pageNo: number;
  q?: string;
}

interface AddReleaseParams {
  applicationReleaseList: string[];
  isStable: boolean;
  isFormal: boolean;
  isProjectRelease: boolean;
  orgId: string;
  userId: string;
  version: string;
  markdown: string;
}

interface UpdateReleaseParams extends AddReleaseParams {
  releaseID: string;
}

interface checkVersionParams {
  orgID: number;
  isProjectRelease: boolean;
  projectID: number;
  version: string;
}

const apis = {
  getReleaseDetail: {
    api: 'get@/api/releases/:releaseID',
  },
  getAppList: {
    api: 'get@/api/applications',
  },
  getReleaseList: {
    api: 'get@/api/releases',
  },
  addRelease: {
    api: 'post@/api/releases',
  },
  updateRelease: {
    api: 'put@/api/releases/:releaseID',
  },
  formalRelease: {
    api: 'put@/api/releases/:releaseID/actions/formal',
  },
  checkVersion: {
    api: 'get@/api/releases/actions/check-version',
  },
};

export const getReleaseDetail = apiCreator<(payload: { releaseID?: string }) => RELEASE.ReleaseDetail>(
  apis.getReleaseDetail,
);

export const getAppList = apiCreator<(payload: { projectId: string; q?: string }) => { list: RELEASE.AppDetail[] }>(
  apis.getAppList,
);

export const getReleaseList = apiCreator<
  (payload: ReleaseListQuery) => { list: RELEASE.ReleaseDetail[]; total: number }
>(apis.getReleaseList);

export const addRelease = apiCreator<(payload: AddReleaseParams) => RAW_RESPONSE>(apis.addRelease);

export const updateRelease = apiCreator<(payload: UpdateReleaseParams) => RAW_RESPONSE>(apis.updateRelease);

export const formalRelease = apiCreator<(payload: { releaseID: string }) => RAW_RESPONSE>(apis.formalRelease);

export const checkVersion = apiCreator<(payload: checkVersionParams) => { isUnique: boolean }>(apis.checkVersion);
