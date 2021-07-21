import React from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import Login from '~/pages/login';
import Setting from '~/pages/setting';
import Registration from '~/pages/registration';
import history from '~/common/history';

const NotFound = () => {
  return <h1>404</h1>;
};

export default function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/uc/setting" component={Setting} />
        <Route exact path="/uc/login" component={Login} />
        <Route exact path="/uc/registration" component={Registration} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}
