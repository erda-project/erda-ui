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
import { Container, i18n, history } from 'src/common';
import { SelfServiceSettingsFlow, SubmitSelfServiceSettingsFlowBody } from '@ory/kratos-client';
import { Alert } from 'src/ory/node';
import { ory, handleFlowError, Flow, CreateLogoutHandler } from 'src/ory';
import { parse } from 'query-string';
import { UiText } from '@ory/kratos-client';

const Setting = () => {
  const [flow, setFlow] = React.useState<SelfServiceSettingsFlow>();
  const query = parse(window.location.search);
  const { flow: flowId } = query;
  const [messageMap, setMessageMap] = React.useState<Obj<undefined | Array<UiText>>>({
    profile: undefined,
    password: undefined,
    global: undefined,
  });

  const onLogout = CreateLogoutHandler();

  React.useEffect(() => {
    if (flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSelfServiceSettingsFlow(String(flowId))
        .then(({ data }) => {
          setFlow(data);
          setMessageMap((prev) => ({ ...prev, global: data?.ui?.messages }));
        })
        .catch(handleFlowError('settings', setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .initializeSelfServiceSettingsFlowForBrowsers()
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError('settings', setFlow));
  }, [flowId, flow]);

  const onSubmit = (type: string) => (values: SubmitSelfServiceSettingsFlowBody) => {
    history.push(`/uc/settings?flow=${flow?.id}`);
    return ory
      .submitSelfServiceSettingsFlow(String(flow?.id), undefined, values)
      .then(({ data }) => {
        // The settings have been saved and the flow was updated. Let's show it to the user!
        setFlow(data);
        setMessageMap((prev) => ({ ...prev, [type]: data?.ui?.messages }));
      })
      .catch(handleFlowError('settings', setFlow))
      .catch(async (err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          setFlow(err.response?.data);

          setMessageMap((prev) => ({ ...prev, [type]: err.response?.data?.ui?.messages }));
          return;
        }

        return Promise.reject(err);
      });
  };
  const curUser = flow?.identity?.traits;
  return (
    <Container>
      <h2 className="text-center text-4xl text-indigo-800 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
        {i18n.t('Hello {name}', { name: curUser?.nickname || curUser?.username || curUser?.email })}
      </h2>
      <div className="mt-12">
        <Alert messages={messageMap.global} />
        <div className="border-b border-gray-300 pb-12">
          <span className="text-indigo-800 font-bold">{i18n.t('Profile setting')}</span>
          <Alert messages={messageMap.profile} />
          <Flow only="profile" flow={flow} hideGlobalMessages onSubmit={onSubmit('profile')} />
        </div>

        <div className="pt-12">
          <span className="text-indigo-800 font-bold">{i18n.t('Password setting')}</span>
          <Alert messages={messageMap.password} />
          <Flow only="password" flow={flow} hideGlobalMessages onSubmit={onSubmit('password')} />
        </div>

        <div className="my-8 text-sm font-display font-semibold text-gray-700 text-center">
          <span className="cursor-pointer text-indigo-600 hover:text-indigo-800" onClick={onLogout}>
            {i18n.t('Logout')}
          </span>
        </div>
      </div>
    </Container>
  );
};

export default Setting;
