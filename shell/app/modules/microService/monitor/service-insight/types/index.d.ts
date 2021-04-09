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

declare namespace MONITOR_SI {

  interface IMenuQuery {
    terminus_key: string;
    runtime_name: string;
    application_id: string;
    service_name: string;
  }
  interface IMenu {
    key: string;
    value: string;
  }

  interface IBaseInfoQuery {
    runtime_name: string;
    terminus_key: string;
    application_id: string;
  }

  interface IBaseInfo {
    terminusKey: string;
    projectId: string;
    projectName: string;
    applicationId: string;
    applicationName: string;
    workspace: string;
    runtimeId: string;
    serviceName: string;
    runtimeName: string;
  }

  interface IChartQuery {
    fetchApi: string;
    latestTimestamp: string;
    sort: string | string[];
    group: string;
    start: number;
    end: number;
    filter_terminus_key: string;
    filter_service_name: string;
    filter_runtime_name: string;
    filter_application_id: string;
  }

  interface ITableDataQuery {
    [pro: string]: any;
    start: number;
    end: number;
    filter_trace_sampled: boolean;
    group: string;
    sort: string | string[];
    max: string;
    min: string;
    limit: number;
  }
  interface ITableData {
    [pro: string]: any
    name: string;
    time: string;
    min: number;
    max: number;
    count: number;
  }

}
