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
  exportApi: {
    api: 'post@/api/apim/export',
  },
  exportRecord: {
    api: 'get@/api/apim/export',
  },
  downloadApi: {
    api: 'get@/api/api-assets/:assetID/versions/:versionID/export',
  },
};

interface IRecords {
  list: API_MARKET.ExportRecord[];
  total: number;
}

export const exportApi = apiCreator<(payload: API_MARKET.ExportApi) => API_MARKET.ExportRecord>(apis.exportApi);
export const exportRecord = apiCreator<(payload: API_MARKET.QueryExportRecord) => IRecords>(apis.exportRecord);
export const downloadApi = apiCreator<(payload: API_MARKET.DownloadApi) => void>(apis.downloadApi);
