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
import ReadonlyField from '../readonly-field';
import { render } from '@testing-library/react';

describe('ReadonlyField', () => {
  it('should render well with renderData', () => {
    const value = 'erda cloud';
    const result = render(
      <ReadonlyField
        renderData={(v: string) => {
          return <div>{v}</div>;
        }}
        value={value}
      />,
    );
    expect(result.getByText(value)).toBeTruthy();
    result.rerender(<ReadonlyField renderData={<div>{value.toUpperCase()}</div>} value={value} />);
    expect(result.getByText(value.toUpperCase())).toBeTruthy();
    expect(result.queryByText(value)).toBeNull();
  });
  it('should render well withOut renderData', () => {
    const value = {
      name: 'erda FE',
      org: 'erda cloud',
    };
    const result = render(<ReadonlyField value={value} />);
    expect(result.getByText(JSON.stringify(value))).toBeTruthy();
    result.rerender(<ReadonlyField value={value.name} />);
    expect(result.queryByText(value.name)).not.toBeNull();
    result.rerender(<ReadonlyField />);
    expect(result.queryByText('-')).not.toBeNull();
  });
});
