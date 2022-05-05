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
