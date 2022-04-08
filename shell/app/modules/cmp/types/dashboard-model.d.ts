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

declare namespace Custom_Dashboard {
  interface UpdateDashboardPayload {
    name?: string;
    desc?: string;
    viewConfig?: any;
  }

  interface GetDashboardPayload {
    scope: string;
    scopeId: string;
    pageNo?: number;
    pageSize?: number;
    title?: string;
    creator?: string[];
    startTime?: string;
    endTime?: string;
  }

  interface DashboardItem {
    id?: string;
    desc?: string;
    name: string;
    scope: string;
    scopeId?: string;
    viewConfig?: any;
    createdAt?: number;
    updatedAt?: number;
    version?: string;
    updateType?: string;
  }

  interface CommonParams {
    scope: string;
    scopeId: string;
  }

  interface ExportParams extends CommonParams {
    viewIds?: string[];
    creator?: string[];
    title?: string;
    startTime?: string;
    endTime?: string;
    targetScope?: string;
    targetScopeId?: string;
  }

  interface ImportParams {
    file: { file: string; scope: string; scopeId: string };
  }

  interface CustomLIstQuery {
    creator?: string[];
    createdAt?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
  }

  interface BasicInfo {
    name: string;
    id: string;
    desc: string;
  }

  interface FileData {
    size: number;
    status: string;
    originFileObj: object;
    response: ResponseFileData;
  }

  interface ResponseFileData {
    data: {
      applications: object[];
    };
    err: {
      msg: string;
    };
  }

  interface OperationDashboardRecord {
    histories: OperationHistory[];
    total: number;
  }

  interface OperationHistory {
    status: string;
    fileUuid: string;
    errorMessage: string;
    type: string;
    targetScopeId: string;
  }

  type IMspProjectEnv = WORKSPACE | 'DEFAULT';
  
  interface Relationship {
    workspace: IMspProjectEnv;
    tenantId: string;
    displayWorkspace: string;
  }
}
