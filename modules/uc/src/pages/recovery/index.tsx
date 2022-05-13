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
import { i18n, history, Container } from 'src/common';
import { SelfServiceRecoveryFlow, SubmitSelfServiceRecoveryFlowBody } from '@ory/kratos-client';

import { ory, handleFlowError, Flow } from 'src/ory';
import { parse } from 'query-string';

export default function Recovery() {
  const query = parse(window.location.search);

  // refres: means we want to refresh the session. This is needed, for example, when we want to update the password of a user.
  const { return_to: returnTo, flow: flowId, refresh } = query;
  const [flow, setFlow] = React.useState<SelfServiceRecoveryFlow>();

  React.useEffect(() => {
    if (flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSelfServiceRecoveryFlow(String(flowId))
        .then(({ data }) => {
          setFlow(data);
        })
        .catch(handleFlowError('recovery', setFlow));
      return;
    }
    ory
      .initializeSelfServiceRecoveryFlowForBrowsers()
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError('recovery', setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          setFlow(err.response?.data);
          return;
        }

        return Promise.reject(err);
      });
  }, [flowId, refresh, returnTo, flow]);

  const onSubmit = (values: SubmitSelfServiceRecoveryFlowBody) => {
    history.push(`/uc/recovery?flow=${flow?.id}`);
    return ory
      .submitSelfServiceRecoveryFlow(String(flow?.id), undefined, values)
      .then(({ data }) => {
        // Form submission was successful, show the message to the user!
        setFlow(data);
      })
      .then(() => {})
      .catch(handleFlowError('recovery', setFlow))
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the form validation had an error
            setFlow(err.response?.data);
            return;
        }

        throw err;
      });
  };

  const goToRegistration = () => {
    history.push('/uc/registration');
  };

  const goToLogin = () => {
    history.push('/uc/login');
  };
  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Recovery account')}
      </h2>
      <div className="mt-12">
        <Flow flow={flow} onSubmit={onSubmit} />

        <div className="mt-8 mb-2 pb-2 text-sm font-display font-semibold text-gray-700 text-center">
          {i18n.t('Already have an account?')}{' '}
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToLogin}>
            {i18n.t('Login')}
          </span>
        </div>
        <div className="mb-8 mt-2 text-sm font-display font-semibold text-gray-700 pb-2 text-center">
          {i18n.t('Do not have an account?')}{' '}
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToRegistration}>
            {i18n.t('Sign up')}
          </span>
        </div>
      </div>
    </Container>
  );
}
