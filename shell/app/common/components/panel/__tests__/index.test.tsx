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
import Panel, { PanelProps } from '../index';

const props: PanelProps = {
  isMultiColumn: false,
  fields: [
    {
      label: '测试label',
      valueKey: 'test-label',
      tips: 'test-tips',
    },
    {
      hide: true,
      label: '测试label-hide',
      valueKey: 'test-label-hide',
      tips: 'test-tips-hide',
    },
  ],
};

describe('Panel', () => {
  const mockFn = jest.fn();
  beforeEach(() => {
    jest.doMock('rc-resize-observer', () => {
      const ResizeObserverMock: React.FC<{ onResize: () => void }> = ({ onResize, children }) => {
        mockFn.mockImplementation(() => {
          onResize();
        });
        return <div className="mock-resize-observer">{children}</div>;
      };
      return ResizeObserverMock;
    });
  });
  it('should render well', () => {
    const wrapper = render(<Panel {...props} />);
    expect(wrapper.container.querySelectorAll('.erda-panel-label').length).toBe(1);
  });
  it('should render with multiColumn', () => {
    const wrapper = render(<Panel {...props} isMultiColumn />);
    expect(wrapper.container).toMatchSnapshot();
  });
});
