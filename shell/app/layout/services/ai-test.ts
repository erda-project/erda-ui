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

import agent from 'agent';
import { getGlobal } from 'core/global-space';

export interface getAddonListPayload {
  userId: string;
  projectID: number;
  projectName: string;
  requirements: IRequirement[];
  needAdjust?: boolean;
}

export interface IRequirement {
  issueID: number;
  prompt?: string;
  testCaseCreateReq?: {
    preCondition: string;
    stepAndResults: StepData[];
    desc: string;
  };
}

export interface StepData {
  result: string;
  step: string;
}

export interface Case {
  requirementID: number;
  testCaseCreateReq: {
    preCondition: string;
    stepAndResults: StepData[];
    desc: string;
  };
}

export interface IRow {
  id: number;
  title: string;
  content: string;
}

export const getAddonList = ({
  userId,
  projectID,
  projectName,
  requirements,
  needAdjust = true,
}: getAddonListPayload): RAW_RESPONSE<Case[]> => {
  const { currentOrg } = getGlobal('initData');

  const params = {
    functionName: 'create-test-case',
    functionParams: {
      testSetID: 0,
      requirements,
    },
    background: {
      userID: userId,
      orgID: currentOrg.id,
      orgName: currentOrg.name,
      projectID: projectID,
      projectName: projectName,
    },
    needAdjust,
  };
  console.log(params);
  return agent
    .post(`/api/ai-functions/create-test-case/actions/apply`)
    .send(params)
    .then((response: any) => response.body);
};
