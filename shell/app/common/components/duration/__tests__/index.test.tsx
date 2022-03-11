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
import Duration, { transformDuration } from '..';

jest.mock('antd', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const antd = jest.requireActual('antd');
  const Select: React.FC<any> = ({ children, onChange }) => {
    return (
      <select className="mock-select" onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    );
  };
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>;
  };
  return {
    ...antd,
    Select,
  };
});
describe('Duration', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should transformDuration work well', () => {
    expect(transformDuration({ timer: 2, unit: 'ms' })).toBe(2000000);
    expect(transformDuration({ timer: 2, unit: 's' })).toBe(2000000000);
    expect(transformDuration()).toBeUndefined();
  });
  it('should work well', async () => {
    const changeFn = jest.fn();
    const result = render(<Duration onChange={changeFn} />);
    const [minInp, maxInp] = result.getAllByRole('textbox');
    fireEvent.change(minInp, { target: { value: 1 } });
    fireEvent.change(maxInp, { target: { value: 3 } });
    expect(changeFn).toHaveBeenLastCalledWith([
      { timer: 1, unit: 'ms' },
      { timer: 3, unit: 'ms' },
    ]);
    fireEvent.change(result.container.querySelectorAll('.mock-select')[1]!, { target: { value: 's' } });
    expect(changeFn).toHaveBeenLastCalledWith([
      { timer: 1, unit: 'ms' },
      { timer: 3, unit: 's' },
    ]);
  });
  it('should work well with value', () => {
    const changeFn = jest.fn();
    const result = render(<Duration onChange={changeFn} value={[{ unit: 'ms' }, { unit: 'ms' }]} />);
    const [minInp] = result.getAllByRole('textbox');
    fireEvent.change(minInp, { target: { value: 3 } });
    expect(changeFn).toHaveBeenLastCalledWith([
      { timer: 3, unit: 'ms' },
      { timer: '', unit: 'ms' },
    ]);
  });
});
