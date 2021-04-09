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

export const getDeploymentStatus = (id: string): RUNTIME_LOG.DeployStatus => {
  return agent.get(`/api/deployments/${id}/status`)
    .then((response: any) => response.body);
};

export const getDockerLog = ({ colonySoldier, host, targetId }: RUNTIME_LOG.DockerLogQuery): string => {
  return agent.post(`/api/command?url=${colonySoldier}`)
    .send({
      name: 'docker logs',
      args: {
        host, // 容器所在宿主机
        port: 2375,
        container: targetId, // 容器ID
        since: '', // 查看日志开始时间戳
        tail: '', // 查看日志最后多少行
      },
    })
    .then((response: any) => response.text);
};
