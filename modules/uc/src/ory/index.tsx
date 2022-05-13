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
import { Configuration, V0alpha2Api } from '@ory/kratos-client';
import { handleFlowError } from './errors';
import Flow from './flow';
import { history } from 'src/common';

const ory = new V0alpha2Api(
  new Configuration({
    basePath: '/api/uc',
  }),
);

// Returns a function which will log the user out
function CreateLogoutHandler(deps?: React.DependencyList) {
  const [logoutToken, setLogoutToken] = React.useState<string>('');

  React.useEffect(() => {
    ory
      .createSelfServiceLogoutFlowUrlForBrowsers()
      .then(({ data }) => {
        setLogoutToken(data.logout_token);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 401:
            // do nothing, the user is not logged in
            return;
        }

        // Something else happened!
        return Promise.reject(err);
      });
  }, [deps]);

  return () => {
    if (logoutToken) {
      ory
        .submitSelfServiceLogoutFlow(logoutToken)
        .then(() => history.push('/login'))
        .then(() => window.location.reload());
    }
  };
}

export { ory, handleFlowError, Flow, CreateLogoutHandler };
