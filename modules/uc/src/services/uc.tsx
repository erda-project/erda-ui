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

import { axios } from 'src/common';

const flowApiMap = {
  login: '/self-service/login/browser',
  registration: '/self-service/registration/browser',
  settings: '/self-service/settings/browser',
};

const initFlow = (type: keyof typeof flowApiMap): Promise<{ flow: string; csrf_token: string }> => {
  const flowApi = flowApiMap[type];
  return axios.get(flowApi).then((res: any) => {
    const flow = res?.data?.id;
    const nodes = res?.data?.ui?.nodes;
    const ctItem = nodes.find((item: any) => item.attributes.name === 'csrf_token');
    return { flow, csrf_token: ctItem?.attributes?.value };
  });
};

export const login = (payload: UC.ILoginPayload) => {
  const { identifier, password } = payload;
  return initFlow('login').then(({ flow, csrf_token }) => {
    return axios
      .post(`/self-service/login?flow=${flow}`, {
        method: 'password',
        csrf_token,
        password,
        password_identifier: identifier,
      })
      .then((res: any) => res.data);
  });
};

export const registration = (payload: UC.IRegistrationPayload) => {
  const { password, nick, ...rest } = payload;
  return initFlow('registration').then(({ flow, csrf_token }) => {
    return axios
      .post(`/self-service/registration?flow=${flow}`, {
        method: 'password',
        password,
        csrf_token,
        traits: {
          ...rest,
          name: { first: nick, last: nick },
        },
      })
      .then((res: any) => res.data);
  });
};

export const logout = () => {
  return axios.get('/self-service/logout/browser').then((res) => {
    const token = res?.data?.logout_url?.split('token=')?.[1];
    return axios.get(`/self-service/logout?token=${token}`).then((res: any) => res.data);
  });
};

export const whoAmI = () => {
  return axios.get('/sessions/whoami').then((res: any) => res.data);
};

export const updateUser = (payload: Omit<UC.IUser, 'id'>) => {
  const { nick, ...rest } = payload;
  return initFlow('settings').then(({ flow, csrf_token }) => {
    return axios
      .post(`/self-service/settings?flow=${flow}`, {
        method: 'profile',
        csrf_token,
        traits: {
          ...rest,
          name: { first: nick, last: nick },
        },
      })
      .then((res: any) => res.data);
  });
};

export const updatePassword = (payload: string) => {
  return initFlow('settings').then(({ flow, csrf_token }) => {
    return axios
      .post(`/self-service/settings?flow=${flow}`, {
        method: 'password',
        csrf_token,
        password: payload,
      })
      .then((res: any) => res.data);
  });
};
