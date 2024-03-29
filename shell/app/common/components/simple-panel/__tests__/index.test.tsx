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
import '@testing-library/jest-dom';
import SimplePanel from '..';

describe('SimplePanel', () => {
  it('should render well', () => {
    const result = render(
      <SimplePanel style={{ height: 100 }} title="panel title">
        <div className="panel-child">panel-child</div>
      </SimplePanel>,
    );
    expect(result.container.firstChild).toHaveStyle({ height: '100px' });
    expect(result.getByText('panel title')).toBeTruthy();
    expect(result.getByText('panel-child')).toBeTruthy();
    result.rerender(
      <SimplePanel style={{ height: 100 }} className="erda_panel" title="panel title">
        <div className="panel-child">panel-child</div>
      </SimplePanel>,
    );
    expect(result.container.firstChild).toHaveClass('erda_panel');
  });
});
