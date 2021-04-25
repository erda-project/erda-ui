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


/* eslint-disable import/no-extraneous-dependencies */
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import * as C from '../app/cube';
import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'util'

jest.mock('i18n', () => {
  return {
    t: (str, data) => {
      let token;
      let strFormat = str.replace(/\S+\:/, '').trim();
      if(!data){
        return strFormat;
      }
      const reg = /\{(\S+?)}/;
      while (token = reg.exec(strFormat)){
        strFormat = strFormat.replace(token[0], data[token[1]])
      }
      return strFormat
    },
    getCurrentLocale: ()=>({
      moment: 'en',
    })
  };
});
jest.mock('tsx-control-statements/components', () => {
  return {
    Choose: props => props.children,
    When: props => props.children,
    If: props => props.children,
    Otherwise: props => props.children,
    With: props => props.children
  }
})

jest.mock('holderjs', () => {
  return {
    run: () => {

    },
    addTheme: () => {

    }
  };
});

jest.mock('common/stores/user-map', () => {
  return C?.createStore({
    name: 'userMap',
    state: {
      1: {
        name: 'name-dice',
        nick: 'nick-dice'
      },
      2: {
        name: 'name-dice'
      },
      3: {
        nick: 'nick-dice'
      }
    },
    reducers: {
      setUserMap(state, userInfo: object) {
        return { ...state, ...userInfo };
      }
    }
  })
});

process.env = Object.assign(process.env, {
  mainVersion: 'mainVersion',
});
Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: 'OPENAPI-CSRF-TOKEN=OPENAPI-CSRF-TOKEN',
});
const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
customGlobal.TextDecoder = TextDecoder;
customGlobal.TextEncoder = TextEncoder;

