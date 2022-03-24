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
import { Input } from 'antd';
import { fireEvent, render } from '@testing-library/react';
import * as utils from 'common/utils/query-string';
import { flushPromises } from 'test/utils';
import _ from 'lodash';
import Filter from '..';

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

describe('Filter', () => {
  const filterField = [
    {
      type: Input,
      name: 'title',
      customProps: {
        className: 'title-input',
        placeholder: 'filter by title',
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
  it('should Filter work well', async () => {
    jest.useFakeTimers('legacy');
    const spyOnUpdateSearch = jest.spyOn(utils, 'updateSearch').mockImplementation();
    const filterFn = jest.fn();
    const result = render(<Filter config={filterField} onFilter={filterFn} connectUrlSearch />);
    jest.runAllTimers();
    expect(spyOnUpdateSearch).toHaveBeenLastCalledWithNth(0, { name: undefined, title: undefined });
    fireEvent.change(result.getByPlaceholderText('filter by name'), { target: { value: 'erda' } });
    await flushPromises();
    expect(spyOnUpdateSearch).toHaveBeenLastCalledWith({ name: 'erda', title: undefined }, { replace: true });
    expect(filterFn).toHaveBeenLastCalledWith({ name: 'erda', title: undefined });
    jest.useRealTimers();
  });
  it('should Filter.Pure work well', () => {
    const query = {
      name: 'erda',
      title: 'erda-ui',
    };
    jest.useFakeTimers('legacy');
    const filterFn = jest.fn();
    const updateSearchFn = jest.fn();
    const result = render(
      <Filter.Pure
        config={filterField}
        onFilter={filterFn}
        connectUrlSearch
        updateSearch={updateSearchFn}
        query={query}
      />,
    );
    jest.runAllTimers();
    expect(updateSearchFn).toHaveBeenLastCalledWith(query);
    result.rerender(
      <Filter.Pure config={filterField} connectUrlSearch updateSearch={updateSearchFn} urlExtra={{ pageSize: 1 }} />,
    );
    expect(updateSearchFn).toHaveBeenLastCalledWith({ ...query, pageSize: 1 });
    jest.useRealTimers();
  });
});
