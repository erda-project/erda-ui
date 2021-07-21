import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import queryString from 'query-string';
import ucStore from '~/store/uc';
import history from '~/common/history';
import App from './router';
import { initI18n } from '~/common/i18n';
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
  const query = queryString.parse(window.location.search);
  if (!(pathname.startsWith('/uc/login') || pathname.startsWith('/uc/registration'))) {
    axios
      .get('/api/user/me', { params: query })
      .then((res) => {
        // if (window.location.pathname.startsWith('/uc/login')) {
        //   history.replace('/uc/settings');
        // }
        ucStore.setProfile(res?.data?.data);
        startApp();
      })
      .catch((e) => {
        if (e.response.status === 401) {
          history.replace(`/uc/login${window.location.search}`);
          startApp();
        } else {
          console.log('e:', e);
        }
      });
  } else {
    startApp();
  }
};

initI18n.then(() => init());

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
