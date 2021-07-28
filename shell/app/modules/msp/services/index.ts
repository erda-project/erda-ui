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

export const getMspProjectList = (): Promise<{ success: boolean; data: MS_INDEX.IMspProject[] }> => {
  return agent.get('/api/msp/tenant/projects').then((response: any) => response.body);
};

export const getMspProjectDetail = (payload: { projectId: string }): MS_INDEX.IMspProject => {
  return agent
    .get('/api/msp/tenant/project')
    .query(payload)
    .then((response: any) => response.body);
};

export const createTenantProject = (
  payload: MS_INDEX.ICreateProject,
): Promise<{ success: boolean; data: MS_INDEX.IMspProject }> => {
  return agent
    .post('/api/msp/tenant/project')
    .send(payload)
    .then((response: any) => response.body);
};

export const getMspMenuList = ({
  tenantGroup,
  tenantId,
}: {
  tenantGroup: string;
  tenantId?: string;
}): MS_INDEX.IMspMenu[] => {
  return agent
    .get(`/api/micro-service/menu/tenantGroup/${tenantGroup}`)
    .query({ tenantId })
    .then((response: any) => response.body);
};
