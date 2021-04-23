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

declare namespace TOPOLOGY_SERVICE_ANALYZE {
  interface ProcessDashboardId {
    dashboardId: 'process_analysis_java' | 'process_analysis_nodejs';
  }

  interface CommonQuery {
    terminusKey: string;
    serviceName: string;
    serviceId: string;
  }

  interface TimestampQuery {
    start: number;
    end: number;
  }

  interface TranslationSlowResp {
    cols: Array<{ index: string; title: string; }>;
    data: Array<Record<string, any>>;
  }

  interface InstanceId {
    instanceId: string;
    status: boolean;
  }
}
