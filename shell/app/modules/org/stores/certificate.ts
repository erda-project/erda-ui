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

import { createCRUDStore } from 'common';
import { getCertificateList, addCertificate, deleteCertificate, updateCertificate, getCertificateDetail } from '../services/certificate';

const services = {
  get: getCertificateList,
  add: addCertificate,
  update: updateCertificate,
  delete: deleteCertificate,
};

const certificate = createCRUDStore<Certificate.Detail>({
  name: 'orgCertificate',
  services,
  effects: {
    getDetail({ call }, payload: {id: string}) {
      return call(getCertificateDetail, payload);
    },
  },
});

export default certificate;
