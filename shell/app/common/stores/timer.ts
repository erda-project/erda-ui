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

import { createFlatStore } from 'app/cube';

interface IState {
  '5s': number,
  '10s': number,
  '1min': number,
}

const initState: IState = {
  '5s': 0,
  '10s': 0,
  '1min': 0,
};

export const timerStore = createFlatStore({
  name: 'timer',
  state: initState,
  subscriptions() {
    setInterval(() => {
      timerStore.updateTime();
    }, 5000);
  },
  reducers: {
    updateTime(state) {
      state['5s'] += 1;
      if (state['5s'] % 2 === 0) {
        state['10s'] += 1;
      }
      if (state['5s'] % 12 === 0) {
        state['1min'] += 1;
      }
    },
  },
});

export default timerStore;

export const useRefresh = (duration: keyof IState) => timerStore.useStore(s => s[duration]);
