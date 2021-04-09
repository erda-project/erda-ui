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

declare namespace MS_MONITOR {

  interface ICreateChartProps{
    moduleName:string;
    chartName:string;
    dataHandler?:Function;
  }

  interface ITraceCountQuery {
    cardinality: string
    align: boolean
    start?: number
    end?: number
    filter_terminus_key: string
    'filter_fields.applications_ids_distinct'?: number;
    'filter_fields.services_distinct'?: string;
    field_gt_errors_sum?: number
    field_eq_errors_sum?: number
    points?: number
  }

  interface ITraceSummaryQuery {
    start: number
    end: number
    limit: number
    'tag.error': boolean | undefined
    'tag.fields.applications_ids_distinct': number
    'tag.fields.services_distinct': string
  }

  interface ITraceSummary {
    elapsed: number
    start_time: number
    labels: Array<{
      key: string
      count: string
    }>
    operation_name: string
    trace_id: string
  }
}
