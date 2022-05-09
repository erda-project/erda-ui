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
    name: string;
    displayName: string;
  }

  interface Service {
    id: string;
    name: string;
    orgName: string;
    type: string;
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

  interface ServiceReq extends IPagingReq {
    keyword?: string;
    type?: string;
  }
}
