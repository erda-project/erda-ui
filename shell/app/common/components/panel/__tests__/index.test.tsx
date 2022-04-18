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
      label: <div>测试label</div>,
      valueKey: 'test-label-element',
      tips: 'test-element-tips',
    },
    {
      label: 123,
      valueKey: 'test-label-number',
      tips: 'test-number-tips',
    },
    {
      label: ['name', 'label'],
      valueKey: 'test-label-arr',
      tips: 'test-arr-tips',
    },
    {
      hide: true,
      label: '测试label-hide',
      valueKey: 'test-label-hide',
      tips: 'test-tips-hide',
    },
    {
      valueKey: 'test-label-withOut-label',
      tips: 'test-tips-withOut-label',
    },
  ],
};

jest.mock('rc-resize-observer', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const ResizeObserverMock: React.FC<{ onResize: (data: { width: number }) => void }> = ({ onResize, children }) => {
    const handleClick = (e) => {
      onResize({ width: e.target.width });
    };
    React.useEffect(() => {
      handleClick({ target: { width: 100 } });
    }, []);
    return (
      <div className="mock-resize-observer" onClick={handleClick}>
        {children}
      </div>
    );
  };
  return ResizeObserverMock;
});

describe('Panel', () => {
  const setDOMRect = (width: number, height = 1000) => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width,
        height,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      } as DOMRect;
    });
  };
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should render well', () => {
    const result = render(<Panel {...props} columnNum={3} />);
    expect(result.container.querySelectorAll('.erda-panel-label').length).toBe(
      props.fields?.filter((t) => !t.hide).length,
    );
  });
  it('should render with multiColumn', () => {
    jest.useFakeTimers();
    const sizeArr = [
      {
        width: 500,
        col: 12,
      },
      {
        width: 500,
        col: 12,
      },
      {
        width: 1000,
        col: 6,
      },
      {
        width: 1200,
        col: 4,
      },
      {
        width: 1600,
        col: 3,
      },
    ];
    setDOMRect(200);
    const result = render(<Panel {...props} isMultiColumn />);
    expect(result.container).isExistClass('.erda-panel-item', 'ant-col-24');
    sizeArr.forEach((item) => {
      setDOMRect(item.width);
      fireEvent.click(result.container.querySelector('.mock-resize-observer')!, { target: { width: item.width } });
      jest.runAllTimers();
      expect(result.container).isExistClass('.erda-panel-item', `ant-col-${item.col}`);
    });
    result.rerender(<Panel {...props} isMultiColumn columnNum={3} />);
    expect(result.container).isExistClass('.erda-panel-item', 'ant-col-8');
    result.rerender(
      <Panel
        {...props}
        fields={[
          {
            label: '测试label',
            spaceNum: 2,
            valueKey: 'test-label',
            tips: 'test-tips',
          },
        ]}
        data={{}}
        isMultiColumn
        columnNum={3}
      />,
    );
    expect(result.container).isExistClass('.erda-panel-item', 'ant-col-16');
    jest.useRealTimers();
  });
});
