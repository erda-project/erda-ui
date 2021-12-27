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

declare namespace RELEASE {
  interface AppListQuery {
    projectId?: string;
    q?: string;
  }

  interface AppDetail {
    id: number;
    displayName: string;
  }

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

  interface ReleaseDetail {
    releaseId?: string;
    releaseID?: string;
    id?: string;
    applicationName: string;
    releaseName: string;
    userId: string;
    createdAt: string;
    labels: Labels;
    isFormal: boolean;
    markdown: string;
    images: string[];
    diceyml: string;
  }

  interface Labels {
    gitBranch: string;
    gitCommitId: string;
  }
}
