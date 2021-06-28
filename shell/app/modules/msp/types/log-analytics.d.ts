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

declare namespace LOG_ANALYTICS {
  interface SearchQuery {
    [k: string]: any;
    clusterName: string;
    start: number;
    end: number;
    query?: string;
    size: number;
    version: string;
    'tags.dice_application_name'?: string;
    'tags.dice_service_name'?: string;
  }

  interface LogItem {
    timestamp: number;
    offset: number;
    content: string;
    tags: Obj;
  }

  interface SearchResult {
    total: number;
    data: LogItem[];
  }

  interface StatisticResult extends IChartResult {
    title: string;
    total: number;
    interval: number;
  }
}
