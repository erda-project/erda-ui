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

import MockDate from 'mockdate';
import moment from 'moment';
import { act } from 'react-dom/test-utils';

interface IMockDate {
  moment: moment.Moment;
  timestamp: {
    current: number;
    startOfDay: number;
    endOfDay: number;
  };
}

export function setMockDate(dateString = '2021-04-25T02:40:04.668Z'): IMockDate {
  MockDate.set(dateString);
  const current = moment();
  const data = {
    moment: current.clone(),
    timestamp: {
      current: current.clone().valueOf(),
      startOfDay: current.clone().startOf('day').valueOf(),
      endOfDay: current.clone().endOf('day').valueOf(),
    },
  };
  Object.defineProperty(data, 'moment', {
    get() {
      return current.clone();
    },
  });
  return data;
}

export function resetMockDate() {
  MockDate.reset();
}

const globalTimeout = global.setTimeout;

export const sleep = async (timeout = 0) => {
  await act(async () => {
    await new Promise((resolve) => globalTimeout(resolve, timeout));
  });
};

export const flushPromises = () => new Promise(process.nextTick);
