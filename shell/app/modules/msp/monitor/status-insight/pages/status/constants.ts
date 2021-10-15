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

export default {
  HTTP_METHOD_LIST: ['GET', 'POST', 'PUT', 'HEAD'],
  TIME_LIMITS: [15, 30, 60, 300],
  RETRY_TIMES: [1, 2, 4, 8],
  OPERATOR_LIST: [
    { key: '=', name: '等于' },
    { key: '>', name: '大于' },
    { key: '>=', name: '大于等于' },
    { key: '<', name: '小于' },
    { key: '<=', name: '小于等于' },
  ],
  CONTAIN_LIST: [
    { key: 'contains', name: '包含' },
    { key: 'not_contains', name: '不包含' },
  ],
  MAX_BODY_LENGTH: 10000,
};
