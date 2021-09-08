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

export const downloadCsvUrl = '/api/msp/credential/access-keys/download';

const apis = {
  getAcquisitionAndLang: {
    api: 'get@/api/msp/apm/instrumentation-library',
  },
  getInfo: {
    api: 'get@/api/msp/apm/instrumentation-library/config-docs',
  },
  getAllKey: {
    api: 'post@/api/msp/credential/access-keys/records',
  },
  createAccessKey: {
    api: 'post@/api/msp/credential/access-keys',
  },
  getDetailKey: {
    api: 'get@/api/msp/credential/access-keys/:id',
  },
  deleteDetailKey: {
    api: 'delete@/api/msp/credential/access-keys/:id',
  },
};
export const getAcquisitionAndLang = apiCreator<() => CONFIGURATION.IStrategy[]>(apis.getAcquisitionAndLang);
export const getInfo = apiCreator<(payload: CONFIGURATION.IDocs) => CONFIGURATION.IDocData>(apis.getInfo);
export const getDetailKey = apiCreator<(payload: CONFIGURATION.IDelAndFindKey) => CONFIGURATION.IAllKeyData>(
  apis.getDetailKey,
);
export const deleteDetailKey = apiCreator<(payload: CONFIGURATION.IDelAndFindKey) => void>(apis.deleteDetailKey);
export const getAllKey = apiCreator<(payload: CONFIGURATION.IAllKey) => CONFIGURATION.IKeyList>(apis.getAllKey);
export const createAccessKey = apiCreator<(payload: CONFIGURATION.ICreateKey) => CONFIGURATION.IAllKeyData>(
  apis.createAccessKey,
);
