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

import agent from 'agent';
import { encode } from 'js-base64';
import { getGlobal } from 'core/global-space';
import { erdaEnv } from 'common/constants';

interface IGetSessionsParams {
  userId: string;
  name: string;
  phone: string;
  email: string;
}

interface ISessions {
  list: Array<Session>;
}

interface Session {
  id: string;
  name: string;
}

interface AddSessionsParams {
  userId: string;
  userName: string;
  phone: string;
  email: string;
  name: string;
  topic: string;
  contextLength: number;
  temperature: number;
}

interface GetLogsPayload {
  userId: string;
  name: string;
  phone: string;
  email: string;
  id: number;
}

interface Log {
  prompt: string;
  completion: string;
}

interface ResetSessionPayload {
  userId: string;
  name: string;
  phone: string;
  email: string;
  id: number;
}

const AI_BACKEND_URL = erdaEnv.AI_BACKEND_URL;

export const getSessions = (params: IGetSessionsParams): RAW_RESPONSE<ISessions> => {
  const { userId, name, phone, email } = params;
  const { currentOrg } = getGlobal('initData');
  const { hostname } = location;
  const req = agent.get(`${AI_BACKEND_URL}/api/ai-proxy/sessions`);
  req.set('X-Ai-Proxy-User-Id', encode(userId));
  req.set('X-Ai-Proxy-Username', encode(name));
  req.set('X-Ai-Proxy-Phone', encode(phone));
  req.set('X-Ai-Proxy-Email', encode(email));
  req.set('X-Ai-Proxy-Source', hostname);
  req.set('X-Ai-Proxy-Org-Id', encode(`${currentOrg.id}`));
  return req.then((response: any) => response.body);
};

export const addSessions = (params: AddSessionsParams) => {
  const { userId, userName, phone, email, name, topic, contextLength, temperature } = params;
  const { currentOrg } = getGlobal('initData');
  const { hostname } = location;
  const req = agent.post(`${AI_BACKEND_URL}/api/ai-proxy/sessions`);
  req.set('X-Ai-Proxy-User-Id', encode(userId));
  req.set('X-Ai-Proxy-Username', encode(userName));
  req.set('X-Ai-Proxy-Phone', encode(phone));
  req.set('X-Ai-Proxy-Email', encode(email));
  req.set('X-Ai-Proxy-Source', hostname);
  req.set('X-Ai-Proxy-Org-Id', encode(`${currentOrg.id}`));
  return req
    .send({
      userId,
      name,
      topic,
      contextLength,
      isArchived: false,
      source: hostname,
      resettAt: new Date(),
      model: 'gpt-35-turbo-16k',
      temperature,
    })
    .then((response: any) => response.body);
};

export const getLogs = (params: GetLogsPayload): RAW_RESPONSE<{ list: Log[] }> => {
  const { userId, name, phone, email, id } = params;
  const { currentOrg } = getGlobal('initData');
  const { hostname } = location;
  const req = agent.get(`${AI_BACKEND_URL}/api/ai-proxy/sessions/${id}/chat-logs`);
  req.set('X-Ai-Proxy-User-Id', encode(userId));
  req.set('X-Ai-Proxy-Username', encode(name));
  req.set('X-Ai-Proxy-Phone', encode(phone));
  req.set('X-Ai-Proxy-Email', encode(email));
  req.set('X-Ai-Proxy-Source', hostname);
  req.set('X-Ai-Proxy-Org-Id', encode(`${currentOrg.id}`));
  return req.then((response: any) => response.body);
};

export const resetSession = (params: ResetSessionPayload) => {
  const { userId, name, phone, email, id } = params;
  const { currentOrg } = getGlobal('initData');
  const { hostname } = location;
  const req = agent.patch(`${AI_BACKEND_URL}/api/ai-proxy/sessions/${id}/actions/reset`);
  req.set('X-Ai-Proxy-User-Id', encode(userId));
  req.set('X-Ai-Proxy-Username', encode(name));
  req.set('X-Ai-Proxy-Phone', encode(phone));
  req.set('X-Ai-Proxy-Email', encode(email));
  req.set('X-Ai-Proxy-Source', hostname);
  req.set('X-Ai-Proxy-Org-Id', encode(`${currentOrg.id}`));
  return req.then((response: any) => response.body);
};

export const SSE: any = function (url: string, options: Obj) {
  this.INITIALIZING = -1;
  this.CONNECTING = 0;
  this.OPEN = 1;
  this.CLOSED = 2;

  this.url = url;

  options = options || {};
  this.headers = options.headers || {};
  this.payload = options.payload !== undefined ? options.payload : '';
  this.method = options.method || (this.payload && 'POST') || 'GET';
  this.withCredentials = !!options.withCredentials;

  this.FIELD_SEPARATOR = ':';
  this.listeners = {};

  this.xhr = null;
  this.readyState = this.INITIALIZING;
  this.progress = 0;
  this.chunk = '';

  this.addEventListener = function (type, listener) {
    if (this.listeners[type] === undefined) {
      this.listeners[type] = [];
    }

    if (this.listeners[type].indexOf(listener) === -1) {
      this.listeners[type].push(listener);
    }
  };

  this.removeEventListener = function (type, listener) {
    if (this.listeners[type] === undefined) {
      return;
    }

    var filtered = [];
    this.listeners[type].forEach(function (element) {
      if (element !== listener) {
        filtered.push(element);
      }
    });
    if (filtered.length === 0) {
      delete this.listeners[type];
    } else {
      this.listeners[type] = filtered;
    }
  };

  this.dispatchEvent = function (e) {
    if (!e) {
      return true;
    }

    e.source = this;

    var onHandler = 'on' + e.type;
    if (this.hasOwnProperty(onHandler)) {
      this[onHandler].call(this, e);
      if (e.defaultPrevented) {
        return false;
      }
    }

    if (this.listeners[e.type]) {
      return this.listeners[e.type].every(function (callback) {
        callback(e);
        return !e.defaultPrevented;
      });
    }

    return true;
  };

  this._setReadyState = function (state) {
    var event = new CustomEvent('readystatechange');
    event.readyState = state;
    this.readyState = state;
    this.dispatchEvent(event);
  };

  this._onStreamFailure = function (e) {
    var event = new CustomEvent('error');
    event.data = e.currentTarget.response;
    this.dispatchEvent(event);
    this.close();
  };

  this._onStreamAbort = function (e) {
    this.dispatchEvent(new CustomEvent('abort'));
    this.close();
  };

  this._onStreamProgress = function (e) {
    if (!this.xhr) {
      return;
    }

    if (this.xhr.status !== 200) {
      this._onStreamFailure(e);
      return;
    }

    if (this.readyState == this.CONNECTING) {
      this.dispatchEvent(new CustomEvent('open'));
      this._setReadyState(this.OPEN);
    }

    var data = this.xhr.responseText.substring(this.progress);
    this.progress += data.length;
    data.split(/(\r\n|\r|\n){2}/g).forEach(
      function (part) {
        if (part.trim().length === 0) {
          this.dispatchEvent(this._parseEventChunk(this.chunk.trim()));
          this.chunk = '';
        } else {
          this.chunk += part;
        }
      }.bind(this),
    );
  };

  this._onStreamLoaded = function (e) {
    this._onStreamProgress(e);

    // Parse the last chunk.
    this.dispatchEvent(this._parseEventChunk(this.chunk));
    this.chunk = '';
  };

  /**
   * Parse a received SSE event chunk into a constructed event object.
   */
  this._parseEventChunk = function (chunk) {
    if (!chunk || chunk.length === 0) {
      return null;
    }

    var e = { id: null, retry: null, data: '', event: 'message' };
    chunk.split(/\n|\r\n|\r/).forEach(
      function (line) {
        line = line.trimRight();
        var index = line.indexOf(this.FIELD_SEPARATOR);
        if (index <= 0) {
          // Line was either empty, or started with a separator and is a comment.
          // Either way, ignore.
          return;
        }

        var field = line.substring(0, index);
        if (!(field in e)) {
          return;
        }

        var value = line.substring(index + 1).trimLeft();
        if (field === 'data') {
          e[field] += value;
        } else {
          e[field] = value;
        }
      }.bind(this),
    );

    var event = new CustomEvent(e.event);
    event.data = e.data;
    event.id = e.id;
    return event;
  };

  this._checkStreamClosed = function () {
    if (!this.xhr) {
      return;
    }

    if (this.xhr.readyState === XMLHttpRequest.DONE) {
      this._setReadyState(this.CLOSED);
    }
  };

  this.stream = function () {
    this._setReadyState(this.CONNECTING);

    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener('progress', this._onStreamProgress.bind(this));
    this.xhr.addEventListener('load', this._onStreamLoaded.bind(this));
    this.xhr.addEventListener('readystatechange', this._checkStreamClosed.bind(this));
    this.xhr.addEventListener('error', this._onStreamFailure.bind(this));
    this.xhr.addEventListener('abort', this._onStreamAbort.bind(this));
    this.xhr.open(this.method, this.url);
    for (var header in this.headers) {
      this.xhr.setRequestHeader(header, this.headers[header]);
    }
    this.xhr.withCredentials = this.withCredentials;
    this.xhr.send(this.payload);
  };

  this.close = function () {
    if (this.readyState === this.CLOSED) {
      return;
    }

    this.xhr.abort();
    this.xhr = null;
    this._setReadyState(this.CLOSED);
  };
};
