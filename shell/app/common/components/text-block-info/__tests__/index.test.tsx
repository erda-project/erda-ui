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
import TextBlockInfo from '..';

describe('TextBlockInfo', () => {
  const mainText = 'main text';
  const descText = 'desc text';
  const tips = 'desc tip';
  const subText = 'sub text';
  const subTip = 'sub tip';
  it('should render well', () => {
    const clickFn = jest.fn();
    const result = render(<TextBlockInfo main={mainText} />);
    expect(result.getByText(mainText)).toBeTruthy();
    result.rerender(<TextBlockInfo main={mainText} desc={descText} tip={tips} />);
    expect(result.getByText(descText)).toBeTruthy();
    expect(result.container).isExit('[name="help"]', 1);
    result.rerender(<TextBlockInfo main={mainText} desc={descText} tip={tips} sub={subText} subTip={subTip} />);
    expect(result.container).isExit('[name="help"]', 2);
    result.rerender(<TextBlockInfo main={mainText} sub={subText} desc={descText} onClick={clickFn} />);
    fireEvent.click(result.container.firstChild!);
    expect(clickFn).toHaveBeenCalledTimes(1);
    result.rerender(<TextBlockInfo main={mainText} extra={<div className="extra-node">extra-node</div>} />);
    expect(result.container).isExit('.extra-node', 1);
  });
});
