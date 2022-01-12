// Copyright (c) 2022 Terminus, Inc.
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

const apis = {
  exportProjectTemplate: {
    api: '/api/orgs/:orgID/projects/:projectID/template/actions/export',
  },
  importProjectTemplate: {
    api: 'post@/api/orgs/:orgID/projects/:projectID/template/actions/import',
  },
  parseProjectTemplate: {
    api: 'api/projects/template/actions/parse',
  },
  importExportProjectRecord: {
    api: '/api/test-file-records',
  },
};
export const exportProjectTemplate = apiCreator<(p: { projectID: string; orgID: number }) => string>(
  apis.exportProjectTemplate,
);

export const importProjectTemplate = apiCreator<(p: { projectID: string; orgID: number; file: unknown }) => string>(
  apis.importProjectTemplate,
);

export const parseProjectTemplate = apiCreator<(p: { projectID: string; orgID: number; file: unknown }) => void>(
  apis.parseProjectTemplate,
);

export const importExportProjectRecord = apiCreator<
  (p: {
    projectName?: string;
    orgID: number;
    types: string[];
    pageSize?: number;
    pageNo?: number;
  }) => PROJECT_LIST.ProjectList
>(apis.importExportProjectRecord);
