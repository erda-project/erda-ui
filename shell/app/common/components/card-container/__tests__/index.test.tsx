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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CardContainer from '../index';
import userEvent from '@testing-library/user-event';

describe('card-container', () => {
  const title = 'title text';
  const tip = 'tip text';
  it('render should be ok', () => {
    const fn = jest.fn();
    const wrapper = render(
      <CardContainer
        title={title}
        tip={tip}
        operation={
          <button id="btn" onClick={fn}>
            btn
          </button>
        }
      >
        <span id="child">children</span>
      </CardContainer>,
    );
    expect(wrapper.container.querySelectorAll('#child').length).toBe(1);
    expect(screen.getAllByText(title).length).toBe(1);
    fireEvent.click(screen.getByText('btn'));
    expect(fn).toHaveBeenCalled();
    userEvent.hover(wrapper.container.querySelector('iconpark-icon')!);
    waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(tip);
    });
  });
  it('should work well with array tips', () => {
    const wrapper = render(
      <CardContainer title={title} tip={[`${tip}-1`, { text: `${tip}-2`, style: { color: 'red' } }]} holderWhen>
        <span id="child">children</span>
      </CardContainer>,
    );
    expect(wrapper.container.querySelectorAll('#child').length).toBe(0);
    expect(wrapper.container.querySelectorAll('.empty-holder').length).toBe(1);
    userEvent.hover(wrapper.container.querySelector('iconpark-icon')!);
    waitFor(() => {
      expect(screen.getByText(`${tip}-2`)).toHaveStyle({ color: 'red' });
    });
  });
  it('render chart container should be ok', () => {
    render(
      <CardContainer.ChartContainer title={title}>
        <span id="child">children</span>
      </CardContainer.ChartContainer>,
    );
    expect(screen.getAllByText(title).length).toBe(1);
    expect(screen.getAllByText('children').length).toBe(1);
  });
});
