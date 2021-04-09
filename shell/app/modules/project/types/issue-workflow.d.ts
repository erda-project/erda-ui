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

import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

declare namespace ISSUE_WORKFLOW {

  interface IStateRelation {
    stateID: number;
    stateName: string;
  }

  interface IIssueItem {
    issueType: ISSUE_TYPE;
    state: string[];
  }
  interface IIssueStateItem {
    issueType: ISSUE_TYPE;
    index:number;
    stateID: number;
    stateName: string;
    stateBelong: string;
    stateRelation: number[];
    relations?:any[]
  }

  interface ICreateStateQuery {
    stateName: string;
    stateBelong: string;
    projectID: number;
    issueType: ISSUE_TYPE;
  }

  interface IStateQuery {
    projectID: number;
    issueType: ISSUE_TYPE;
  }
  interface IUpdateQuery extends IStateQuery {
    data: IIssueStateItem[]
  }
}
