import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import queryString from 'query-string';
import axios from 'axios';
import ucStore from '~/store/uc';
import { setGlobal } from '~/global';
import App from './router';
import './index.css';
// import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory();
setGlobal('history', history);

const startApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('login-root')
  );
}

const query = queryString.parse(window.location.search);
if (!query.flow) {
  axios
    .get('/4433/sessions/whoami')
    .then(res => {// have login
      if (window.location.pathname === '/login') {
        history.replace('/');
      }
      ucStore.setProfile(res.data);
      startApp(res);
    })
    .catch((e) => {
      if (e.response.status === 401) {
        window.location.href = `${window.location.origin}/4433/self-service/login/browser`
      } else {
        console.log('e:', e);
      }
    })
} else {
  if (window.location.pathname !== '/login') {
    history.replace('/login');
  }
  startApp();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
