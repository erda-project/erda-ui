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
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErdaIcon from '../index';

describe('erda-icon', () => {
  it('render with iconType', () => {
    const fn = jest.fn();
    const wrapper = render(<ErdaIcon type="lock" isConfigPageIcon className="customize-cls" onClick={fn} />);
    const icon = wrapper.container.querySelector('iconpark-icon');
    expect(icon).toHaveClass('customize-cls');
    expect(icon).toHaveAttribute('color', 'currentColor');
    fireEvent.click(icon!);
    expect(fn).toHaveBeenCalled();
    wrapper.rerender(
      <ErdaIcon type="lock" color="primary" fill="normal" stroke="red" className="customize-cls" size={24} />,
    );
    expect(icon).toHaveAttribute('size', '24');
    expect(icon).toHaveAttribute('color', 'rgba(48, 38, 71, 1)');
    expect(icon).toHaveAttribute('fill', 'rgba(48, 38, 71, .8)');
    expect(icon).toHaveAttribute('stroke', '#d84b65');
  });
});
// 临时移除，检查逻辑需要调整
