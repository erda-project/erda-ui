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

declare namespace MARKET {
  interface Type {
    type: string;
    name: string;
    displayName: string;
  }

  interface Service {
    id: string;
    createdAt: string;
    updatedAt: string;
    orgID: number;
    orgName: string;
    creatorID: string;
    updaterID: string;
    type: string;
    typeName: string;
    name: string;
    displayName: string;
    summary: string;
    catalog: string;
    logoURL: string;
  }

  interface Service1 {
    id: string;
    name: string;
    orgName: string;
    type: string;
    typeName: string;
    version: string;
    displayName: string;
    summary: string;
    labels: string[];
    logoURL: string;
    presentation: {
      desc: string;
      homepageName: string;
      homepageURL: string;
      isDownloadable: boolean;
      downloadURL: string;
      readme: string;
      isOpenSourced: boolean;
      opensourceURL: string;
      contactName: string;
      contactURL: string;
      contactEmail: string;
    };
  }

  interface Detail {
    catalog: string;
    createdAt: string;
    creatorID: string;
    defaultVersionID: string;
    displayName: string;
    id: string;
    latestVersionID: string;
    level: string;
    name: string;
    orgID: number;
    orgName: string;
    type: string;
    updatedAt: string;
    updaterID: string;
    versions: Version[];
  }

  interface Version {
    contactEmail: string;
    contactName: string;
    contactURL: string;
    createdAt: string;
    creatorID: string;
    desc: string;
    downloadURL: string;
    homepageLogoURL: string;
    homepageName: string;
    homepageURL: string;
    id: string;
    isDownloadable: boolean;
    isOpenSourced: boolean;
    isValid: boolean;
    labels: string[];
    licenceName: string;
    licenceURL: string;
    logoURL: string;
    opensourceURL: string;
    readme: string;
    readmeLang: string;
    readmeLangName: string;
    ref: string;
    summary: string;
    updatedAt: string;
    updaterID: string;
    version: string;
  }

  interface ServiceReq {
    keyword?: string;
    type: string;
  }
}
