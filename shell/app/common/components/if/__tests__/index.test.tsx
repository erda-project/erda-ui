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
import IF from '..';

describe('IF', () => {
  it('check is bool', () => {
    const result = render(
      <IF check={false}>
        <div className="if">if</div>
        <IF.ELSE />
        <div className="else">else</div>
      </IF>,
    );
    expect(result.container).isExit('.if', 0);
    expect(result.container).isExit('.else', 1);
    result.rerender(
      <IF check>
        <div className="if">if</div>
        <IF.ELSE />
        <div className="else">else</div>
      </IF>,
    );
    expect(result.container).isExit('.if', 1);
    expect(result.container).isExit('.else', 0);
  });
  it('check is function', () => {
    const result = render(
      <IF check={() => false}>
        <div className="if">if</div>
        <IF.ELSE />
        <div className="else">else</div>
      </IF>,
    );
    expect(result.container).isExit('.if', 0);
    expect(result.container).isExit('.else', 1);
    result.rerender(
      <IF check={() => true}>
        <div className="if">if</div>
        <IF.ELSE />
        <div className="else">else</div>
      </IF>,
    );
    expect(result.container).isExit('.if', 1);
    expect(result.container).isExit('.else', 0);
  });
  it('render only one child', () => {
    const result = render(
      <IF check={false}>
        <div className="if">if</div>
      </IF>,
    );
    expect(result.container.firstChild).toBeNull();
    result.rerender(
      <IF check>
        <div className="if">if</div>
      </IF>,
    );
    expect(result.container).isExit('.if', 1);
  });
  it('render only if', () => {
    const result = render(
      <IF check={false}>
        <div className="if1">if</div>
        <div className="if2">if</div>
      </IF>,
    );
    expect(result.container.firstChild).toBeNull();
  });
  it('render empty', () => {
    const result = render(<IF check={false} />);
    expect(result.container.firstChild).toBeNull();
  });
});
