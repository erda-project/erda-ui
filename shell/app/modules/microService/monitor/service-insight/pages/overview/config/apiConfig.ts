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

import { groupHandler } from 'common/utils/chart-utils';

export const ApiMap = {
  throughput: {
    fetchApi: 'ai_overview_cpm/histogram',
    query: {
      group: "(doc.containsKey('name')&&doc['name'].value.startsWith('application_')?doc['name'].value.substring(12):'')",
      sumCpm: 'elapsed_count',
    },
    dataHandler: groupHandler('sumCpm.elapsed_count'),
  },
  responseTime: {
    fetchApi: 'ai_overview_rt/histogram',
    query: {
      group: "(doc.containsKey('name')&&doc['name'].value.startsWith('application_')?doc['name'].value.substring(12):'')",
      avg: 'elapsed_mean',
    },
    dataHandler: groupHandler('avg.elapsed_mean'),
  },
  httpState: {
    fetchApi: 'ai_web_error_req/histogram',
    query: { group: 'http_status_code', sum: 'elapsed_count' },
    dataHandler: groupHandler('sum.elapsed_count'),
  },
};
