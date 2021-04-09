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

// 获取迭代列表
export function getIterations(payload) {
  const { projectId, ...extra } = payload;
  return agent.get(`/api/project/${projectId}/iteration`)
    .query(extra)
    .then(response => response.body);
}

// 获取迭代下的事件
export function getIssues({ iterationId, ...rest }) {
  return agent.get(`/api/iteration/${iterationId}/issue`)
    .query(rest)
    .then(response => response.body);
}
// 发布迭代
export function iterationRelease({ iterationId, releaseLog, version }) {
  return agent.put(`/api/iteration/${iterationId}/release`)
    .send({ releaseLog, version })
    .then(response => response.body);
}

// 获取带规划的事件
export function getFreeIssues({ projectId, ...rest }) {
  return agent.post(`/api/project/${projectId}/unreleased-issue`)
    .send(rest)
    .then(response => response.body);
}

export function createIteration(iterationInfo, projectId) {
  return agent.post(`/api/project/${projectId}/iteration`)
    .send(iterationInfo)
    .then(response => response.body);
}

export function updateIteration(iterationId, iterationInfo) {
  return agent.put(`/api/iteration/${iterationId}`)
    .send(iterationInfo)
    .then(response => response.body);
}

export function delIteration(iterationId) {
  return agent.delete(`/api/iteration/${iterationId}`)
    .then(response => response.body);
}

export function addIssuesToIteration(iterationId, issueArr) {
  return agent.put(`/api/iteration/${iterationId}/issue`)
    .send(issueArr)
    .then(response => response.body);
}

export function topIteration(iterationId, toTop) {
  return agent.post('/api/iteration/top')
    .send({ toTop, id: iterationId })
    .then(response => response.body);
}
export function getIterationStatus() {
  return agent.get('/api/iteration/status')
    .then(response => response.body);
}
