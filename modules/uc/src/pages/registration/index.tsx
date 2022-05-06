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
import { Container, history, i18n } from 'src/common';
import { SelfServiceRegistrationFlow, SubmitSelfServiceRegistrationFlowBody } from '@ory/kratos-client';

import { ory, handleFlowError, Flow } from 'src/ory';
import { parse } from 'query-string';

const Registration = () => {
  const [flow, setFlow] = React.useState<SelfServiceRegistrationFlow>();
  const query = parse(window.location.search);
  const { flow: flowId, return_to: returnTo } = query;

  React.useEffect(() => {
    if (flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSelfServiceRegistrationFlow(String(flowId))
        .then(({ data }) => {
          // We received the flow - let's use its data and render the form!
          setFlow(data);
        })
        .catch(handleFlowError('registration', setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .initializeSelfServiceRegistrationFlowForBrowsers(returnTo ? String(returnTo) : undefined)
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError('registration', setFlow));
  }, [flowId, returnTo, flow]);

  const onSubmit = (values: SubmitSelfServiceRegistrationFlowBody) => {
    history.push(`/uc/registration?flow=${flow?.id}`);
    return ory
      .submitSelfServiceRegistrationFlow(String(flow?.id), values)
      .then(({ data }) => {
        // If we ended up here, it means we are successfully signed up!
        //
        // You can do cool stuff here, like having access to the identity which just signed up:
        console.log('This is the user session: ', data, data.identity);

        // For now however we just want to redirect home!
        return history.push(flow?.return_to || '/uc/login');
      })
      .catch(handleFlowError('registration', setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          setFlow(err.response?.data);
          return;
        }

        return Promise.reject(err);
      });
  };

  const goToLogin = () => {
    history.push('/uc/login');
  };

  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Sign up')}
      </h2>
      <div className="mt-12">
        <Flow flow={flow} onSubmit={onSubmit} hideNode={['avatar']} />

        <div className="my-12 text-sm font-display font-semibold text-gray-700 text-center">
          {i18n.t('Already have an account?')}{' '}
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToLogin}>
            {i18n.t('Login')}
          </span>
        </div>
      </div>
    </Container>
  );
};

export default Registration;
