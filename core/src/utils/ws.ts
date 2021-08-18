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

/* eslint-disable no-console */
import SockJS from 'sockjs-client';

interface IHandlerMap {
  [k: string]: Array<(d: any) => void>;
}

const handlerMap: IHandlerMap = {};
let tryTimes = 1;
const tryLimit = 6;

export function connect(api: string) {
  if (!api) {
    throw new Error('ws api can not be empty');
  }
  let socket = new SockJS(api, null, { transports: 'websocket' });

  let timer: NodeJS.Timeout | null = null;
  const getTimer = () => {
    return setTimeout(() => {
      tryTimes += 1;
      if (tryTimes < tryLimit) {
        console.log(`try reconnecting ${tryTimes - 1} times`);
        socket = connect(api);
      }
    }, 10000 * tryTimes);
  };

  socket.onopen = () => {
    timer && clearTimeout(timer);
  };

  socket.onmessage = (e: any) => {
    const data = JSON.parse(e.data);
    console.log('receive message:', data);
    (handlerMap[data.type] || []).forEach((cb) => cb(data));
  };

  function reconnect() {
    if (this.connected) {
      console.log('disconnecting...');
      this.close();
    }
    timer = getTimer();
  }

  socket.onclose = reconnect;
  socket.onerror = reconnect;

  return socket;
}

export type WSHandler = (data: any) => void;
export const registerWSHandler = (type: string, handler: WSHandler) => {
  if (!handlerMap[type]) {
    handlerMap[type] = [];
  }
  handlerMap[type].push(handler);
};
