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
import Holder from '../index';
import { render } from '@testing-library/react';

describe('Holder', () => {
  it('should render EmptyListHolder', () => {
    const result = render(
      <Holder when={() => true}>
        <div className="holder-child">holder-child</div>
      </Holder>,
    );
    expect(result.container.querySelectorAll('.empty-list').length).toBe(1);
    expect(result.container.querySelectorAll('.holder-child').length).toBe(0);
  });
  it('should render EmptyHolder', () => {
    const result = render(
      <Holder when page>
        <div className="holder-child">holder-child</div>
      </Holder>,
    );
    expect(result.container.querySelectorAll('.empty-list').length).toBe(0);
    expect(result.container.querySelectorAll('.empty-holder').length).toBe(1);
    expect(result.container.querySelectorAll('.holder-child').length).toBe(0);
  });
  it('should render custom child', () => {
    const result = render(
      <Holder when={false}>
        <div className="holder-child">holder-child</div>
      </Holder>,
    );
    expect(result.container.querySelectorAll('.empty-list').length).toBe(0);
    expect(result.container.querySelectorAll('.empty-holder').length).toBe(0);
    expect(result.getAllByText('holder-child').length).toBe(1);
  });
});
