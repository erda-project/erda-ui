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

declare namespace UC {
  interface ILoginPayload {
    identifier: string;
    password: string;
  }

  interface IRegistrationPayload {
    email: string;
    password: string;
    nickname: string;
    username: string;
    // phone: string;
  }

  interface IUser {
    id: string;
    email: string;
    nickname: string;
    username: string;
  }

  interface IErrorMsg {
    id: number;
    text: string;
  }
  interface IKratosData {
    id: string;
    ui: {
      messages: IErrorMsg[];
      nodes: IKratosDataNode[];
    };
  }

  interface IKratosDataNode {
    attributes: IKratosAttributes;
    messages: IErrorMsg[];
  }

  interface IKratosAttributes {
    name: string;
    type: string;
    value: string;
  }

  interface IKratosRes {
    data: IKratosData;
  }

  interface IWhoAmIData {
    identity: {
      id: string;
      traits: IRegistrationPayload;
    };
  }

  interface IWhoAmIRes {
    data: IWhoAmIData;
  }

  interface IUpdateUserPayload extends IRegistrationPayload {
    id: string;
  }
}

interface AxiosError<T = any> {
  // config: AxiosRequestConfig;
  code?: string;
  request?: any;
  response?: AxiosResponse<T>;
  isAxiosError: boolean;
  toJSON: () => object;
}
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  // config: AxiosRequestConfig;
  request?: any;
}

interface Obj<T = any> {
  [k: string]: T;
}
