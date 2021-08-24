import React from 'react';
import ReactDOM from 'react-dom';
import App from './router';
import { initI18n, history } from 'src/common';
import ucStore from 'src/store/uc';
import { parse } from 'query-string';
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
  ucStore
    .whoAmI()
    .then((res) => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/uc') && pathname !== '/uc/settings') {
        const query = parse(window.location.search);
        window.location.href = query?.redirectUrl || '/';
      }
      startApp();
    })
    .catch((e) => {
      if (e.response.status === 401) {
        history.replace('/uc/login');
        startApp();
      }
    });
};

initI18n.then(() => init());

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
