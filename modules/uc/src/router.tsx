import React from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import Login from 'src/pages/login';
import Setting from 'src/pages/setting';
import Registration from 'src/pages/registration';
import { history } from 'src/common';

const NotFound = () => {
  return <h1>page not found</h1>;
};

export default function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/uc/settings" component={Setting} />
        <Route exact path="/uc/login" component={Login} />
        <Route exact path="/uc/registration" component={Registration} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  );
}
