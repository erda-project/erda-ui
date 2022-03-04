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
import { ErrorBoundary } from 'common';
import { sleep } from 'test/utils';
import * as utils from 'common/utils/go-to';

describe('ErrorBoundary', () => {
  it('should work well', async () => {
    const Bomb = () => {
      const [bomb, setBomb] = React.useState(false);
      const handleClick = () => {
        setBomb(true);
      };
      if (bomb) {
        // @ts-ignore
        return window.bomb();
      }
      return <div onClick={handleClick}>bomb</div>;
    };
    const goToSpy = jest.spyOn(utils, 'goTo').mockImplementation();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    fireEvent.click(result.getByText('bomb'));
    expect(consoleSpy).toHaveBeenCalled();
    fireEvent.click(result.getByText('back to home'));
    expect(goToSpy).toHaveBeenCalledWith('/');
    await sleep(1000);
    result.rerender(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    fireEvent.click(result.getByText('bomb'));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
    goToSpy.mockRestore();
  });
});
