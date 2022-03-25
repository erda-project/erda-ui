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
import { FormInstance, Input, Select } from 'antd';
import { flushPromises } from 'test/utils';
import _ from 'lodash';
import BaseFilter, { IFilterProps } from '../base-filter';

// mock ResizeObserverMock due to it is used in Fields and default span is undefined
jest.mock('rc-resize-observer', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const ResizeObserverMock: React.FC<{ onResize: (data: { width: number }) => void }> = ({ onResize, children }) => {
    React.useEffect(() => {
      onResize({ width: 1000 });
    }, []);
    return <div className="mock-resize-observer">{children}</div>;
  };
  return ResizeObserverMock;
});

describe('BaseFilter', () => {
  beforeAll(() => {
    jest.mock('lodash');
    // @ts-ignore
    _.debounce = (fn: Function) => fn;
    // @ts-ignore
    _.throttle = (fn: Function) => fn;
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  const config = [
    {
      type: Select,
      name: 'org',
      customProps: {
        className: 'org-select',
        placeholder: 'filter by org',
      },
    },
    {
      type: Input,
      name: 'name',
      customProps: {
        className: 'name-input',
        placeholder: 'filter by name',
      },
    },
  ];
  const setUp = (props?: Partial<IFilterProps>) => {
    let baseFilterRef: React.RefObject<{ form: FormInstance; search: () => void }> | undefined;
    const submitFn = jest.fn();
    const Comp = (c_props?: Partial<IFilterProps>) => {
      const ref = React.useRef(null as any);
      baseFilterRef = ref;
      return <BaseFilter config={config} {...c_props} ref={ref} onSubmit={submitFn} />;
    };
    const result = render(<Comp {...props} />);
    const rendered = (n_props?: Partial<IFilterProps>) => {
      result.rerender(<Comp {...n_props} />);
    };
    return {
      result,
      baseFilterRef,
      rendered,
      submitFn,
    };
  };
  it('should work well', async () => {
    const { result, baseFilterRef, submitFn } = setUp();
    fireEvent.change(result.getByPlaceholderText('filter by name'), { target: { value: 'erda' } });
    expect(baseFilterRef?.current).toHaveProperty('form');
    expect(baseFilterRef?.current).toHaveProperty('search');
    await flushPromises();
    expect(submitFn).toHaveBeenLastCalledWith({ name: 'erda' });
    submitFn.mockReset();
    baseFilterRef?.current?.search();
    await flushPromises();
    expect(submitFn).toHaveBeenLastCalledWith({ name: 'erda' });
  });
  it('should work well with format field', async () => {
    const { result, baseFilterRef, submitFn } = setUp({
      config: config.map((item) => ({
        ...item,
        format: (_customProps, curValue) => {
          return curValue;
        },
      })),
    });
    fireEvent.change(result.getByPlaceholderText('filter by name'), { target: { value: 'erda' } });
    await flushPromises();
    expect(submitFn).toHaveBeenLastCalledWith({ name: 'erda' });
    submitFn.mockReset();
    baseFilterRef?.current?.search();
    await flushPromises();
    expect(submitFn).toHaveBeenLastCalledWith({ name: 'erda' });
  });
  it('should work well with format field', async () => {
    const { baseFilterRef, submitFn } = setUp({
      config: config.map((item) => ({
        ...item,
        required: item.name === 'name',
      })),
    });
    baseFilterRef?.current?.search();
    await flushPromises();
    expect(submitFn).not.toHaveBeenCalled();
  });
});
