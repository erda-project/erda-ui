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

import { Terminal } from 'xterm';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';

Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

export { Terminal };

export interface ITerminal extends Terminal {
  __socket: WebSocket;
  socket: WebSocket;
  __sendData: (val: string) => void;
  __getMessage: (o: Obj) => void;
  attach: (ws: WebSocket) => void;
  _onResize: () => void;
  fit: () => void;
}

// function proxyInput(term: ITerminal) {
//   const { __sendData } = term;
//   term.off('data', __sendData);
//   term.__sendData = (data) => {
//     __sendData(`${Input}${btoa(data || '')}`);
//   };
//   term.on('data', term.__sendData);
// }

function proxyOutput(term: ITerminal, socket: WebSocket) {
  const { __getMessage } = term;
  socket.removeEventListener('message', __getMessage);
  term.__getMessage = (ev) => {
    let { data } = ev;

    data = data && atob(data);
    __getMessage({ data });
  };
  socket.addEventListener('message', term.__getMessage);
}

function runTerminal(term: ITerminal, socket: WebSocket) {
  term.attach(socket);
  proxyOutput(term, socket);
  term.fit();
}

interface IWSParams {
  url: string;
  initData?: Obj;
}
export function createTerm(container: HTMLDivElement, params: IWSParams) {
  const term = new Terminal({
    cursorBlink: true,
    cursorStyle: 'block',
    theme: {
      background: '#48515f',
      foreground: '#bbb',
    },
  }) as unknown as ITerminal;

  term.open(container, true);

  const socket = new WebSocket(params.url, 'base64.binary.k8s.io'); // sub protocol for k8s
  socket.onopen = () => runTerminal(term, socket);

  socket.onclose = () => {
    term.writeln('\x1b[1;35mconnect is close......');
  };
  socket.onerror = () => {
    term.writeln('\x1b[1;35merror......');
  };

  return term;
}

export function destroyTerm(term: ITerminal) {
  if (term.socket) {
    term.socket.close();
  }
  term.destroy();
}
