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
import { render } from '@testing-library/react';
import LazyRender from '..';

describe('LazyRender', () => {
  const windowIntersectionObserver = window.IntersectionObserver;
  const disconnect = jest.fn();
  beforeAll(() => {
    window.IntersectionObserver = jest.fn(function () {
      this.observe = () => {};
      this.disconnect = disconnect;
    });
  });
  afterAll(() => {
    window.IntersectionObserver = windowIntersectionObserver;
  });
  it('should work well', () => {
    const result = render(
      <LazyRender minHeight="100px">
        <div className="lazy-render-1" />
      </LazyRender>,
    );
    expect(result.container).isExit('.lazy-render-1', 0);
    const observerCallback = window.IntersectionObserver.mock.calls[0][0];
    observerCallback([{ isIntersecting: false }]);
    expect(result.container).isExit('.lazy-render-1', 0);
    observerCallback([{ isIntersecting: true }]);
    expect(result.container).isExit('.lazy-render-1', 1);
  });
});
