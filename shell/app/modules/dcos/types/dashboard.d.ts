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

declare namespace ORG_DASHBOARD {
  interface IFilterType {
    key: string,
    name: string,
    values: string[],
    unit?: string,
    prefix?: string,
  }

  interface IGroupInfo {
    name: string | null,
    metric: {
      machines: number,
      abnormalMachines: number,
      cpuUsage: number,
      cpuRequest: number,
      cpuLimit: number,
      cpuOrigin: number,
      cpuTotal: number,
      cpuAllocatable: number,
      memUsage: number,
      memRequest: number,
      memLimit: number,
      memOrigin: number,
      memTotal: number,
      memAllocatable: number,
      diskUsage: number,
      diskTotal: number,
    },
    machines: ORG_MACHINE.IMachine[] | null,
    groups: IGroupInfo[] | null,
    clusterStatus: number,
  }

  interface IInstance {
    clusterName: string
    hostIP: string
    containerId: string
    instanceType: string
    instanceId: string
    image: string
    count: null
    orgId: string
    orgName: string
    projectId: string
    projectName: string
    applicationId: string
    applicationName: string
    workspace: string
    runtimeId: string
    runtimeName: string
    serviceId: null
    serviceName: string
    jobId: string
    cpuUsage: number
    cpuRequest: number
    cpuLimit: number
    cpuOrigin: number
    memUsage: number
    memRequest: number
    memLimit: number
    memOrigin: number
    diskUsage: number
    diskLimit: number
    status: string
    unhealthy: number
  }

  interface INodeLabel {
    label: string
    name: string
    desc: string
    isPrefix: boolean
    group: string;
    groupName: string;
    groupLevel: number;
  }

  interface IFilterQuery {
    key: string
    values: string[]
  }

  interface IGroupInfoQuery {
    orgName: string
    clusters: Array<{ clusterName: string, hostIPs?: string[] }>
    filters: IFilterQuery[]
    groups: string[]
  }

  interface IInstanceListQuery {
    instanceType: string
    orgName?: string
    clusters: Array<{ clusterName: string, hostIPs?: string[] }>
    filters?: IFilterQuery[]
    start?: string
  }

  interface IMachineQuery {
    org_name: string;
    hosts: string[];
  }

  interface IMachineStatus {
    host_ip: string;
    status_level: string;
    abnormal_msg: string;
  }
}
