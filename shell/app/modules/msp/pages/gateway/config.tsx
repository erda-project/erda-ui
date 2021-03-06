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
import moment from 'moment';
import { Tooltip } from 'app/nusi';
import { Copy } from 'common';
import i18n from 'i18n';

enum REGISTER_TYPE {
  auto = i18n.t('msp:automatic registration'),
  manual = i18n.t('msp:manual registration'),
}
export enum AuthType {
  keyAuth = 'key-auth',
  oauth2 = 'oauth2',
  signAuth = 'sign-auth',
  hmacAuth = 'hmac-auth',
  aliCloudApp = 'aliyun-app',
}

export const apiCols = [
  {
    title: 'API',
    key: 'path',
    width: '36%',
    render: ({ path }: any) => (
      <Tooltip title={path}>
        <div className="nowrap">{path}</div>
      </Tooltip>
    ),
  },
  {
    title: i18n.t('msp:http method'),
    dataIndex: 'method',
    key: 'method',
    width: '12%',
    render: (method: string) => method || i18n.t('msp:all methods'),
  },
  {
    title: i18n.t('msp:description'),
    dataIndex: 'description',
    key: 'description',
    width: '10%',
  },
  {
    title: i18n.t('msp:registration type'),
    dataIndex: 'registerType',
    key: 'registerType',
    width: '9%',
    render: (registerType: string) => REGISTER_TYPE[registerType],
  },
  // {
  //   title: i18n.t('msp:network type'),
  //   dataIndex: 'outerNetEnable',
  //   key: 'outerNetEnable',
  //   width: 90,
  //   render: (outerNetEnable: boolean) => (outerNetEnable ? i18n.t('msp:external network') : i18n.t('msp:internal network')),
  // },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    width: '18%',
    render: (createAt: number) => moment(createAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const policyCols = [
  {
    title: i18n.t('msp:policy name'),
    dataIndex: 'displayName',
    key: 'displayName',
    width: 200,
  },
  {
    title: i18n.t('msp:request limit'),
    dataIndex: 'config',
    key: 'config',
    width: 200,
    render: (value: any) => {
      return Object.keys(value)
        .reduce((all, k) => `${all} / ${value[k]}${k}`, '')
        .slice(2);
    },
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    render: (value: number) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const errorSummaryCols = [
  {
    title: i18n.t('msp:status code'),
    dataIndex: 'status_code',
    key: 'status_code',
    width: 100,
  },
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 100,
  },
  {
    title: i18n.t('msp:proportion'),
    dataIndex: 'percentage',
    key: 'percentage',
    width: 100,
  },
];

export const HTTP_PREFIX = 'http://';
export const HTTPS_PREFIX = 'https://';
export const HTTP_METHODS = [
  {
    name: 'GET',
    value: 'GET',
  },
  {
    name: 'HEAD',
    value: 'HEAD',
  },
  {
    name: 'POST',
    value: 'POST',
  },
  {
    name: 'PUT',
    value: 'PUT',
  },
  {
    name: 'DELETE',
    value: 'DELETE',
  },
  {
    name: 'CONNECT',
    value: 'CONNECT',
  },
  {
    name: 'OPTIONS',
    value: 'OPTIONS',
  },
  {
    name: 'TRACE',
    value: 'TRACE',
  },
  {
    name: 'PATCH',
    value: 'PATCH',
  },
];
export const SORT_FIELDS = [
  {
    name: i18n.t('msp:API path'),
    value: 'apiPath',
  },
  {
    name: i18n.t('create time'),
    value: 'createAt',
  },
];
export const SORT_TYPES = [
  {
    name: i18n.t('msp:ascending order'),
    value: 'asc',
  },
  {
    name: i18n.t('msp:descending order'),
    value: 'desc',
  },
];

export const SORT_MAP = {
  'apiPath-asc': i18n.t('msp:api path ascending'),
  'apiPath-desc': i18n.t('msp:api path descending'),
  'createAt-asc': i18n.t('create time ascending'),
  'createAt-desc': i18n.t('create time descending'),
};

export const AUTH_TYPE_MAP = {
  [AuthType.keyAuth]: i18n.t('msp:key authentication'),
  [AuthType.oauth2]: i18n.t('msp:oauth2 authentication'),
  [AuthType.hmacAuth]: i18n.t('msp:parameter hmac authentication'),
  [AuthType.signAuth]: i18n.t('msp:parameter signature authentication'),
  [AuthType.aliCloudApp]: i18n.t('msp:Alibaba Cloud API authentication'),
};

export const ACL_TYPE_MAP = {
  off: i18n.t('msp:authentication passed'),
  on: i18n.t('msp:authentication passed and authorized'),
};

export const ACL_TYPE_MAP_WITH_BLANK = {
  off: i18n.t('msp:authentication passed'),
  on: i18n.t('msp:authentication passed and authorized'),
  '': i18n.t('msp:no'),
};

export const ORIGIN_MAP = {
  dice: i18n.t('msp:Erda service'),
  custom: i18n.t('msp:customize'),
};

export const PACKAGE_DETAIL_COLS = [
  {
    title: i18n.t('msp:method'),
    dataIndex: 'method',
    key: 'method',
    width: '8%',
    render: (method: string) => method || i18n.t('msp:all methods'),
  },
  // {
  //   title: i18n.t('msp:source'),
  //   dataIndex: 'origin',
  //   key: 'origin',
  //   width: 80,
  //   render: (text: string) => ORIGIN_MAP[text],
  // },
  {
    title: i18n.t('msp:application'),
    dataIndex: 'diceApp',
    key: 'diceApp',
    width: '10%',
  },
  {
    title: i18n.t('msp:owned service'),
    dataIndex: 'diceService',
    key: 'diceService',
    width: '10%',
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    width: 180,
    render: (createAt: number) => moment(createAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const KEY_AUTH_COLS = [
  {
    title: 'App Key',
    width: 400,
    dataIndex: 'key',
    render: (key: string) => (
      <Tooltip title={key}>
        <Copy className="for-copy" data-clipboard-tip=" App Key ">
          {key}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'created_at',
    render: (createdAt: number) => (createdAt ? moment(createdAt).format('YYYY-MM-DD HH:mm:ss') : '--'),
  },
];

export const OAUTH_COLS = [
  {
    title: 'APP Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Client ID',
    dataIndex: 'client_id',
    render: (clientId: string) => (
      <Tooltip title={clientId}>
        <Copy className="for-copy" data-clipboard-tip=" Client ID ">
          {clientId}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: 'Client Secret',
    dataIndex: 'client_secret',
    render: (clientSecret: string) => (
      <Tooltip title={clientSecret}>
        <Copy className="for-copy" data-clipboard-tip=" Client Secret ">
          {clientSecret}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: i18n.t('msp:redirect address'),
    dataIndex: 'redirect_uri',
    render: (redirectUris: string) => {
      const redirectUri = redirectUris[0];
      return (
        <Tooltip title={redirectUri}>
          <Copy className="for-copy" data-clipboard-tip={i18n.t('msp:redirect address')}>
            {redirectUri}
          </Copy>
        </Tooltip>
      );
    },
  },
];
const verifyKeyFun = (value: any, callback: any) => {
  if (!value) return callback();
  const pattern = /^[0-9A-Za-z]{32}$/;
  if (!pattern.test(value)) {
    return callback(`${i18n.t('msp:32 digits letters and numbers')}`);
  }
  callback();
};
export const KEY_AUTH_FIELDS = [
  {
    label: 'App Key',
    name: 'key',
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
];
export const HMAC_AUTH_FIELDS = [
  {
    label: 'App Key',
    name: 'key',
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
  {
    label: 'App Secret',
    name: 'secret',
    required: false,
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
];
export const SIGN_AUTH_FIELDS = [
  {
    label: 'App Key',
    name: 'key',
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
  {
    label: 'App Secret',
    name: 'secret',
    required: false,
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
];

export const OAUTH_FIELDS = [
  {
    label: 'App Name',
    name: 'name',
  },
  {
    label: 'Client ID',
    name: 'client_id',
    required: false,
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
  {
    label: 'Client Secret',
    name: 'client_secret',
    required: false,
    rules: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          verifyKeyFun(value, callback);
        },
      },
    ],
  },
];

export const OPENAPI_CONSUMER_COLS = [
  {
    title: i18n.t('msp:consumer name'),
    dataIndex: 'name',
    key: 'name',
    width: 160,
  },
  {
    title: i18n.t('msp:consumer description'),
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    width: 180,
    render: (createAt: number) => moment(createAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const CONSUMER_AUTH_PACKAGE_COLS = [
  {
    title: i18n.t('msp:endpoint name'),
    dataIndex: 'name',
    key: 'name',
    width: '45%',
  },
  {
    title: i18n.t('msp:description'),
    dataIndex: 'description',
    key: 'description',
    width: '55%',
  },
];
export const HMAC_AUTH_COLS = [
  {
    title: 'App Key',
    dataIndex: 'key',
    key: 'key',
    render: (key: string) => (
      <Tooltip title={key}>
        <Copy className="for-copy" data-clipboard-tip=" App Key ">
          {key}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: 'App Secret',
    dataIndex: 'secret',
    key: 'secret',
    render: (secret: string) => (
      <Tooltip title={secret}>
        <Copy className="for-copy" data-clipboard-tip=" App Secret ">
          {secret}
        </Copy>
      </Tooltip>
    ),
  },
];

export const SIGN_AUTH_COLS = [
  {
    title: 'App Key',
    dataIndex: 'key',
    key: 'key',
    render: (key: string) => (
      <Tooltip title={key}>
        <Copy className="for-copy" data-clipboard-tip=" App Key ">
          {key}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: 'App Secret',
    dataIndex: 'secret',
    key: 'secret',
    render: (secret: string) => (
      <Tooltip title={secret}>
        <Copy className="for-copy" data-clipboard-tip=" App Secret ">
          {secret}
        </Copy>
      </Tooltip>
    ),
  },
];

export const ALI_CLOUD_APP_COLS = [
  {
    title: 'App Key',
    dataIndex: 'appKey',
    render: (key: string) => (
      <Tooltip title={key}>
        <Copy className="for-copy" data-clipboard-tip=" App Key ">
          {key}
        </Copy>
      </Tooltip>
    ),
  },
  {
    title: 'App Secret',
    dataIndex: 'appSecret',
    render: (secret: string) => (
      <Tooltip title={secret}>
        <Copy className="for-copy" data-clipboard-tip=" App Secret ">
          {secret}
        </Copy>
      </Tooltip>
    ),
  },
];

export const getOpenApiConsumerFields = (isEditing: boolean) => {
  return [
    {
      name: 'id',
      required: false,
      itemProps: { type: 'hidden' },
    },
    {
      name: 'name',
      label: i18n.t('msp:consumer name'),
      rules: [
        {
          pattern: /^(\w|_){1,20}$/g,
          message: i18n.t(
            'msp:Please enter a name consisting of letters, numbers and underscores within 20 characters.',
          ),
        },
      ],
      itemProps: {
        spellCheck: false,
        disabled: isEditing,
      },
    },
    {
      name: 'description',
      label: i18n.t('msp:consumer description'),
      rules: [{ max: 100, message: i18n.t('msp:please enter description within 100 characters') }],
      required: false,
    },
  ];
};

export const SCENE_MAP = {
  unity: i18n.t('msp:uniform domain name entry'),
  openapi: i18n.t('msp:OpenAPI for partners'),
  webapi: i18n.t('msp:web or app aggregation API'),
};

export const LIMIT_MAP = {
  qpd: i18n.t('msp:times/day'),
  qph: i18n.t('msp:times/hour'),
  qpm: i18n.t('msp:times/minute'),
  qps: i18n.t('msp:times/second'),
};

export const API_LIMIT_COLS = [
  {
    title: i18n.t('msp:consumer name'),
    dataIndex: 'consumerName',
    key: 'consumerName',
    width: '18%',
  },
  {
    title: i18n.t('msp:specified method'),
    dataIndex: 'method',
    key: 'method',
    width: '12%',
  },
  {
    title: i18n.t('msp:specified API path'),
    dataIndex: 'apiPath',
    key: 'apiPath',
    width: '20%',
  },
  {
    title: i18n.t('msp:traffic limit'),
    dataIndex: 'limit',
    key: 'limit',
    width: '16%',
    render: (limit: { qpd?: number; qph?: number; qpm?: number; qps?: number }) => {
      const targetField = Object.keys(LIMIT_MAP).find((unit) => limit[unit]) as string;
      return <span>{`${limit[targetField]} ${LIMIT_MAP[targetField]}`}</span>;
    },
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    width: '18%',
    render: (createAt: number) => moment(createAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];
