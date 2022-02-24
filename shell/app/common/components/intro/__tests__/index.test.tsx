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
import Intro from '../index';
import { fireEvent, render } from '@testing-library/react';

describe('Intro', () => {
  it('should work well', () => {
    const introImg = 'intro.png';
    const action = 'test btn';
    const content = 'intro content';
    const fn = jest.fn();
    const result = render(<Intro introImg={introImg} action={action} onAction={fn} content={content} />);
    fireEvent.click(result.getByText(action));
    expect(fn).toHaveBeenCalled();
    expect(result.container.querySelector('img')?.getAttribute('src')).toBe(introImg);
    expect(result.getAllByText(content).length).toBe(1);
  });
});
