import React from 'react';
import Login from '~/pages/login/login';
import { Route, Switch, Router } from 'react-router-dom';
import { getGlobal } from '~/global';
import Settings from '~/pages/settings/settings';

const NotFound = () => {
  return <h1>404</h1>
}

export default function App() {
  return (
    <Router history={getGlobal('history')}>
      <Switch>
        {/* <Route exact path="/" component={Home} /> */}
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/login" component={Login} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
};
