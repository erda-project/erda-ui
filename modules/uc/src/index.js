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

import React from 'react';
import ReactDOM from 'react-dom';
import App from './router';
import { initI18n, history } from 'src/common';
import { ory } from 'src/ory';
import { getCookies } from 'src/common/utils';
import './index.css';

const startApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('login-root'),
  );
};

const init = () => {
  const pathname = window.location.pathname;
  ory
    .toSession()
    .then(({ data }) => {
      if (pathname.startsWith('/uc') && pathname !== '/uc/settings') {
        const redirectUrl = getCookies('erda_uc_redirecturl');
        window.location.href = encodeURIComponent(redirectUrl) || '/uc/settings';
      }
      startApp();
    })
    .catch((e) => {
      if (e.response?.status === 401) {
        if (!['/uc/registration'].includes(pathname)) {
          history.replace('/uc/login');
        }
        startApp();
      }
    });
};

initI18n.then(() => init());

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
