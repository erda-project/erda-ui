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
import Responsive from '..';
import * as hooks from 'common/use-hooks';
import { render } from '@testing-library/react';

interface Item {
  width: number;
  extraPadding: number;
  span: number;
  gutter: number;
}

describe('Responsive', () => {
  const data: Array<Item> = [
    { width: 480, extraPadding: 0, span: 6, gutter: 20 },
    { width: 640, extraPadding: 0, span: 6, gutter: 25 },
    { width: 800, extraPadding: 0, span: 4, gutter: 30 },
    { width: 960, extraPadding: 0, span: 4, gutter: 35 },
    { width: 1120, extraPadding: 32, span: 3, gutter: 40 },
    { width: 1280, extraPadding: 32, span: 3, gutter: 45 },
    { width: 1440, extraPadding: 32, span: 3, gutter: 50 },
    { width: 1600, extraPadding: 32, span: 2, gutter: 55 },
    { width: 1920, extraPadding: 32, span: 1, gutter: 60 },
  ];
  beforeAll(() => {
    jest.mock('common/use-hooks');
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  data.forEach((item: Item, index) => {
    it(`should work well ${item.width}`, () => {
      const { width, span, extraPadding, gutter } = item;
      Object.defineProperty(hooks, 'useMediaGt', {
        writable: true,
        value: (num: number) => {
          return width - extraPadding - gutter === num;
        },
      });
      const children = index === 0 ? null : <div className={`child-${index}`}>{index}</div>;
      const result = render(
        <Responsive itemWidth={100} percent={1} gutter={gutter}>
          {children}
        </Responsive>,
      );
      expect(result.container).toMatchSnapshot();
      expect(result.container).isExit(`.ant-col-${span}`, 1);
    });
  });
});
