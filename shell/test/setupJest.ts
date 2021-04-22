// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable import/no-extraneous-dependencies */
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import * as C from '../app/cube';
import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'util'

jest.mock('i18n', () => {
  return {
    t: (str) => str
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

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
customGlobal.TextDecoder = TextDecoder;
customGlobal.TextEncoder = TextEncoder;

