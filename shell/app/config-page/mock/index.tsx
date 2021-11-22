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

/** *
 * @author: zhangxj
 * @description: the unified way to useMock in config-page(prevent build mock data in the production environment ):
 * 1: create a file(.mock.ts) under the folder mock, includes a mock data and a enhanceMock function.
 * 2: <ConfigPage useMock={useMock(fileName)} ... />
 *
 * @param key string [the file name]
 * * */

export const useMock = (key: string) => (payload: Obj) => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.resolve();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        // /* @vite-ignore */
        import(`./${key}.mock`).then((file) => {
          const { mockData, enhanceMock } = file;
          resolve(typeof enhanceMock === 'function' ? enhanceMock(mockData, payload) : mockData);
        });
      }, 500);
    });
  }
};
