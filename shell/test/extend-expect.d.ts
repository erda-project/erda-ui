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

/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R, T> {
    isExist: (selector: string, expected?: number) => jest.CustomMatcherResult;
    isExistClass: (selector: string, expected: string) => jest.CustomMatcherResult;
    toHaveBeenLastCalledWithNth: (nthParams: number, params: any) => jest.CustomMatcherResult;
  }
}
