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
  interface AppDetail {
    id: number;
    displayName: string;
  }

  interface ReleaseDetail {
    modes: { default: { applicationReleaseList: Array<{ releaseID: string }> } };
    releaseId?: string;
    applicationId?: string;
    releaseID?: string;
    applicationName: string;
    releaseName: string;
    version: string;
    userId: string;
    createdAt: string;
    labels: Labels;
    isFormal: boolean;
    changelog: string;
    images: string[];
    diceyml: string;
    isProjectRelease?: boolean;
    addons?: Addon[];
    addonYaml?: string;
    id?: string;
    pId?: string;
  }

  interface Addon extends IAddon {
    logoURL: string;
    displayName: string;
  }

  interface ApplicationDetail {
    id: number;
    displayName: string;
  }

  interface Labels {
    gitBranch: string;
    gitCommitId: string;
  }
}
