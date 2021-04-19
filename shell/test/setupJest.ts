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

