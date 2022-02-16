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
  importExportFileRecord: {
    api: '/api/test-file-records',
  },
};
export const exportProjectTemplate = apiCreator<(p: { projectID: number; orgID: number }) => string>(
  apis.exportProjectTemplate,
);

export const importProjectTemplate = apiCreator<(p: { projectID: number; orgID: number; file: unknown }) => string>(
  apis.importProjectTemplate,
);

export const parseProjectTemplate = apiCreator<(p: { projectID: number; orgID: number; file: unknown }) => void>(
  apis.parseProjectTemplate,
);

export const importExportFileRecord = apiCreator<
  (p: {
    projectId?: string;
    projectName?: string;
    orgID?: number;
    types: string[];
    pageSize?: number;
    pageNo?: number;
  }) => IMPORT_EXPORT_FILE_LIST.FileList
>(apis.importExportFileRecord);
