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

import { getMspBreadcrumb } from 'msp/config';

const AlarmRecord = () => ({
  path: 'alarm-record',
  breadcrumbName: getMspBreadcrumb('AlarmHistory'),
  routes: [
    {
      path: ':recordId',
      breadcrumbName: '{alarmRecordName}',
      layout: { noWrapper: true },
      getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alarm-record/pages/detail')),
    },
    {
      layout: { noWrapper: true },
      getComp: (cb: RouterGetComp) => cb(import('msp/alarm-manage/alarm-record/pages')),
    },
  ],
});

export default AlarmRecord;
