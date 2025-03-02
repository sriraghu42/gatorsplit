import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from '../utils/privateRoute';

import Homepage from '../views/Homepage';
import Registerpage from '../views/Registerpage';
import Loginpage from '../views/Loginpage';
import DashboardPage from '../views/Dashboard';
import Groups from '../views/groups/groups';

const Routes = () => {
  return (
    <Switch>
      <Route component={Loginpage} path="/login" />
      <Route component={Registerpage} path="/register" exact />
      <Route component={Homepage} path="/" exact />
      <PrivateRoute component={DashboardPage} path="/dashboard" exact />
      <PrivateRoute component={Groups} path="/groups/:groupId?" exact />
    </Switch>
  );
};

export default Routes;
