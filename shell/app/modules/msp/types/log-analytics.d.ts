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
  interface QueryAggregation {
    addon: string;
    start: number;
    end: number;
    clusterName: string;
    query: string;
    aggFields?: string[];
  }

  interface IAggregationBuckets {
    count: number;
    key: string;
  }

  interface IAggregation {
    aggFields: {
      [k: string]: {
        buckets: IAggregationBuckets[];
      };
    };
    total: number;
  }

  type IField = {
    display: boolean;
    fieldName: string;
    supportAggregation: boolean;
    group: number;
  };

  interface QuerySearch {
    addon: string;
    start: number;
    end: number;
    clusterName: string;
    query?: string;
    sort: any[];
    pageNo: number;
    pageSize: number;
    highlight: boolean;
  }

  interface LogItem {
    highlight: {
      [key: string]: string[];
    };
    source: {
      _id: string;
      id: string;
      offset: number;
      content: string;
      stream: string;
      tags: {
        [key: string]: string;
      };
      timestamp: number;
    };
  }

  interface SearchResult {
    total: number;
    data: LogItem[];
  }

  interface QueryStatistic {
    addon: string;
    start: number;
    end: number;
    clusterName: string;
    query?: string;
  }
}
