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
import { Form, Input } from 'antd';
import { sleep } from 'test/utils';
import { Fields } from '../fields';
import { FormBuilder, IFormExtendType, PureFormBuilder } from '../form-builder';

type IFormBuilder = Parameters<typeof FormBuilder>[0];
type IPureFormBuilder = Parameters<typeof PureFormBuilder>[0];

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

describe('form-builder', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should FormBuilder work well', async () => {
    const successFn = jest.fn();
    const errorFn = jest.fn();
    const Comp = ({ children, ...props }: IFormBuilder) => {
      const ref = React.useRef<IFormExtendType>(null);
      const handleSubmit = () => {
        ref.current?.validateFieldsAndScroll?.(successFn, errorFn);
      };
      return (
        <FormBuilder {...props} ref={ref}>
          <Fields
            fid="name"
            fields={[
              {
                type: Input,
                fieldKey: 'name',
                id: 'name',
                name: 'name',
                required: true,
              },
            ]}
          />
          <div onClick={handleSubmit}>submit</div>
          {children}
        </FormBuilder>
      );
    };
    const result = render(
      <Comp>
        <div>FormBuilder child</div>
      </Comp>,
    );
    expect(result.getByText('FormBuilder child')).toBeTruthy();
    fireEvent.click(result.getByText('submit'));
    await sleep(1000);
    expect(errorFn).toHaveBeenCalled();
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    fireEvent.click(result.getByText('submit'));
    await sleep(1000);
    expect(successFn).toHaveBeenCalled();
  });
  it('should PureFormBuilder work well', () => {
    jest.useFakeTimers();
    const Comp = ({ children, ...props }: Omit<IPureFormBuilder, 'form'>) => {
      const [form] = Form.useForm();
      return (
        <PureFormBuilder isMultiColumn {...props} form={form}>
          <Fields
            fid="name"
            fields={[
              {
                type: Input,
                fieldKey: 'name',
                id: 'name',
                name: 'name',
                required: true,
              },
            ]}
          />
          {children}
        </PureFormBuilder>
      );
    };
    const sizeArr = [
      { width: 500, col: 12 },
      { width: 1000, col: 8 },
      { width: 1400, col: 6 },
      { width: 1800, col: 4 },
      { width: 2000, col: 3 },
    ];
    const result = render(
      <Comp>
        <div>PureFormBuilder child</div>
      </Comp>,
    );

    expect(result.getByText('PureFormBuilder child')).toBeTruthy();
    expect(result.container).isExist('.ant-col-24', 1);
    sizeArr.forEach((item) => {
      fireEvent.click(result.container.querySelector('.mock-resize-observer')!, { target: { width: item.width } });
      jest.runAllTimers();
      expect(result.container).isExist(`.ant-col-${item.col}`, 1);
    });
    jest.useRealTimers();
  });
});
