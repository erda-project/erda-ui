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

/* eslint-disable no-caller */
/* eslint-disable no-restricted-properties */
module.exports = `
(function initFn() {
  function createXHR() {
    const { ActiveXObject } = window;
    if (typeof XMLHttpRequest !== 'undefined') {
      return new XMLHttpRequest();
    } else if (typeof ActiveXObject !== 'undefined') {
      if (typeof arguments.callee.activeXString !== 'string') {
        const versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp'];
        let i;
        let len;
        for (i = 0, len = versions.length; i < len; i++) {
          try {
            // eslint-disable-next-line no-new
            new ActiveXObject(versions[i]);
            arguments.callee.activeXString = versions[i];
            break;
          } catch (ex) { }
        }
      }
      return new ActiveXObject(arguments.callee.activeXString);
    } else {
      throw new Error('No XHR object available.');
    }
  }
  function getXHRIns(callback) {
    const xhr = createXHR();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let result = null;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          try {
            result = JSON.parse(xhr.responseText);
          } catch (err) {
            result = err;
          }
        }
        callback(result, xhr.status);
      }
    };
    return xhr;
  }
  function ajax(url, callback) {
    const xhr = getXHRIns(callback);
    xhr.open('get', url, true);
    xhr.setRequestHeader('Accept', 'application/vnd.dice+json;version=1.0');
    xhr.send();
  }
  ajax('/api/-/users/me', (result, status) => {
    if(status >= 500) {
      document.querySelector('.main-holder').innerText = "服务暂时不可用";
      return;
    }
    if (status === 401) {
      ajax('/api/-/openapi/login', (data) => {
        if (data && data.url) {
          window.localStorage.setItem('lastPath', window.location.href);
          window.location.href = data.url;
          console.log(data.url);
        }
      });
    } else {
      const userData = result && result.data || {};
      if (typeof window.userCb === 'function') {
        window.userCb(userData);
      } else {
        window._userData = userData;
      }
    }
  });

}());
`;
