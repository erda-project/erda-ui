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
import { SelfServiceLoginFlow, SubmitSelfServiceLoginFlowBody } from '@ory/kratos-client';
import { getCookies } from 'src/common/utils';
import { ory, handleFlowError, Flow } from 'src/ory';
import { parse } from 'query-string';

export default function Login() {
  const query = parse(window.location.search);

  // refres: means we want to refresh the session. This is needed, for example, when we want to update the password of a user.
  const { flow: flowId, refresh } = query;
  const [flow, setFlow] = React.useState<SelfServiceLoginFlow>();
  const [url, setUrl] = React.useState(getCookies('redirectUrl'));

  React.useEffect(() => {
    if (flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSelfServiceLoginFlow(String(flowId))
        .then(({ data }) => {
          setFlow(data);
        })
        .catch(handleFlowError('login', setFlow));
      return;
    }
    // Otherwise we initialize it
    ory
      .initializeSelfServiceLoginFlowForBrowsers(Boolean(refresh), undefined)
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError('login', setFlow));
  }, [flowId, refresh, flow]);

  const onSubmit = (values: SubmitSelfServiceLoginFlowBody) => {
    history.push(`/uc/login?flow=${flow?.id}`);
    return (
      ory
        .submitSelfServiceLoginFlow(String(flow?.id), undefined, values)
        // We logged in successfully! Let's bring the user home.
        .then((res) => {
          const userId = res?.data?.session?.identity?.id;
          const localRedirectUrl = window.localStorage.getItem(`${userId}-lastPath`);
          const redirectUrl = (url as string) || localRedirectUrl;

          if (localRedirectUrl) {
            window.localStorage.removeItem(`${userId}-lastPath`);
          }
          if (redirectUrl) {
            window.location.href = decodeURIComponent(redirectUrl);
          } else {
            history.push('/uc/settings');
          }
        })
        .then(() => {})
        .catch(handleFlowError('login', setFlow))
        .catch((err: AxiosError) => {
          // If the previous handler did not catch the error it's most likely a form validation error
          if (err.response?.status === 400) {
            // Yup, it is!
            setFlow(err.response?.data);
            return;
          }

          return Promise.reject(err);
        })
    );
  };

  const goToRegistration = () => {
    history.push('/uc/registration');
  };

  const goToRecover = () => {
    history.push('/uc/recovery');
  };

  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Welcome to Erda')}
      </h2>
      <div className="mt-12">
        <Flow flow={flow} onSubmit={onSubmit} ignorRegKeys={['password']} />

        <div className="mt-8 mb-2 text-sm font-display font-semibold text-gray-700 pb-2 text-center">
          {i18n.t('Do not have an account?')}{' '}
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToRegistration}>
            {i18n.t('Sign up')}
          </span>
        </div>
        <div className="mt-2 mb-6 text-sm font-display font-semibold text-gray-700 pb-2 text-center">
          {i18n.t('Forgot password?')}{' '}
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={goToRecover}>
            {i18n.t('Recovery account')}
          </span>
        </div>
      </div>
    </Container>
  );
}
