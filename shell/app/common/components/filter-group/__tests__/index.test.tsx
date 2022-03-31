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
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import routeInfoStore from 'core/stores/route';
import FilterGroup, { FilterBarHandle, FilterCore, ToolBarWithFilter } from '..';
import * as utils from 'common/utils/go-to';

const list = [
  {
    label: 'name',
    name: 'name',
    type: 'input',
    className: 'name-comp',
    placeholder: 'please enter name',
  },
  {
    label: 'app',
    name: 'app',
    className: 'app-comp',
    placeholder: 'please enter app',
  },
  {
    label: 'nickName',
    name: 'nickName',
    type: 'select',
    mode: 'multiple',
    className: 'nickName-comp',
    allowClear: true,
    options: [
      { value: '1', name: 'Tom' },
      { value: '2', name: 'Jerry' },
    ],
  },
  {
    label: 'id',
    name: 'id',
    type: 'inputNumber',
    className: 'id-comp',
    placeholder: 'please enter id',
  },
  {
    label: 'org',
    name: 'org',
    type: 'custom',
    Comp: <div className="org-custom-comp" />,
  },
  {
    label: 'env',
    name: 'env',
    type: 'custom',
    getComp: (wrapOnChange) => {
      return (
        <input
          onChange={(e) => {
            wrapOnChange(e.target.value);
          }}
          className="env-custom-comp"
        />
      );
    },
  },
];

const simpleList = [
  {
    label: 'name',
    name: 'name',
    type: 'input',
    className: 'name-comp',
    placeholder: 'please enter name',
  },
];

const routerData = {
  query: {
    [FilterBarHandle.filterDataKey]: 'name[erda]',
  },
};

describe('FilterGroup', () => {
  beforeAll(() => {
    jest.mock('core/stores/route');
    routeInfoStore.useStore = (fn) => {
      // @ts-ignore
      return fn(routerData);
    };
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('FilterGroup should render well', () => {
    const resetFn = jest.fn();
    const searchFn = jest.fn();
    const result = render(<FilterGroup list={simpleList} reversePosition onReset={resetFn} />);
    expect(result.container).isExit('.filter-group-left', 1);
    expect(result.container).isExit('.filter-group-right', 1);
    expect(result.container).isExit('.filter-group-left .ant-btn', 1);
    expect(result.container).isExit('.filter-group-right .ant-input', 1);
    result.rerender(<FilterGroup list={simpleList} reversePosition={false} onSearch={searchFn} />);
    expect(result.container).isExit('.filter-group-left .ant-input', 1);
    expect(result.container).isExit('.filter-group-right .ant-btn', 1);
  });
  it('should FilterBarHandle work well', () => {
    const queryStr = 'name[erda]||org[erda.cloud]';
    const data = { name: 'erda', org: 'erda.cloud' };
    expect(FilterBarHandle.queryToData(queryStr)).toStrictEqual(data);
    expect(FilterBarHandle.dataToQuery(data)).toBe(queryStr);
  });
  it('ToolBarWithFilter should work well', async () => {
    const ref = React.createRef<any>();
    const searchFn = jest.fn();
    const result = render(
      <ToolBarWithFilter list={simpleList} ref={ref} onSearch={searchFn} filterValue={{ name: 'erda' }}>
        <ToolBarWithFilter.FilterButton btnClassName="filter-btn" />
        <button className="reset-btn">reset</button>
      </ToolBarWithFilter>,
    );
    fireEvent.click(result.container.querySelector('.filter-btn')!);
    await waitFor(() => expect(result.baseElement).isExit('.ant-drawer', 1));
    act(() => {
      ref.current?.onSearchWithFilterBar({});
    });
    expect(searchFn).toHaveBeenCalled();
    act(() => {
      ref.current.onSearchWithFilterBar({ name: 'erda' });
    });
    expect(searchFn).toHaveBeenLastCalledWith({
      _Q_: 'name[erda]',
      name: 'erda',
    });
    fireEvent.click(result.baseElement.querySelector('.anticon-close ')!);
    expect(searchFn).toHaveBeenLastCalledWith({});
    fireEvent.click(result.getByText('clear'));
    expect(searchFn).toHaveBeenLastCalledWith({});
    fireEvent.click(result.getByText('cancel'));
    result.rerender(
      <ToolBarWithFilter
        list={list.map((item) => {
          return item.type === 'select' ? { ...item, mode: undefined } : item;
        })}
        ref={ref}
        onSearch={searchFn}
        filterValue={{ name: 'erda' }}
      >
        <ToolBarWithFilter.FilterButton btnClassName="filter-btn" />
        <button className="reset-btn">reset</button>
      </ToolBarWithFilter>,
    );
    fireEvent.mouseDown(result.baseElement.querySelector('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('Tom'));
    fireEvent.click(result.getByText('filter'));
    expect(searchFn).toHaveBeenLastCalledWith({
      _Q_: 'name[erda]||nickName[Tom]',
      name: undefined,
      nickName: '1',
    });
    userEvent.hover(result.baseElement.querySelector('.ant-select-selector')!);
    fireEvent.mouseDown(result.baseElement.querySelector('.ant-select-clear')!);
    fireEvent.click(result.getByText('filter'));
    expect(searchFn).toHaveBeenLastCalledWith({
      _Q_: 'name[erda]',
      name: undefined,
      nickName: undefined,
    });
  });
  it('FilterCore should work well', async () => {
    const initData = {
      _Q_: 'name[erda]||env[erda]',
      env: undefined,
      app: undefined,
      id: undefined,
      name: undefined,
      nickName: undefined,
      org: undefined,
    };
    const changeFn = jest.fn();
    const searchFn = jest.fn();
    const resetFn = jest.fn();
    const goToSpy = jest.spyOn(utils, 'goTo').mockImplementation();
    const result = render(
      <FilterCore list={list} onChange={changeFn} onSearch={searchFn} onReset={resetFn} syncUrlOnSearch>
        {({ CompList, resetButton, searchButton, search, reset }) => {
          return (
            <div>
              <div className="comp-list">{CompList}</div>
              <div className="reset-button">{resetButton}</div>
              <div className="search-button">{searchButton}</div>
              <div className="search-btn" onClick={search}>
                SEARCH
              </div>
              <div className="reset-btn" onClick={reset}>
                RESET
              </div>
            </div>
          );
        }}
      </FilterCore>,
    );
    fireEvent.change(result.container.querySelector('.env-custom-comp')!, { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith({
      ...initData,
      _Q_: 'name[erda]||env[erda]',
      env: 'erda',
    });
    fireEvent.change(result.getByPlaceholderText('please enter name'), { target: { value: 'erda cloud' } });
    expect(changeFn).toHaveBeenLastCalledWith({
      ...initData,
      _Q_: 'env[erda]',
      env: 'erda',
      name: 'erda cloud',
    });
    fireEvent.change(result.getByPlaceholderText('please enter id'), { target: { value: 123 } });
    expect(changeFn).toHaveBeenLastCalledWith({
      ...initData,
      _Q_: 'env[erda]',
      env: 'erda',
      name: 'erda cloud',
      id: 123,
    });
    fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('Tom'));
    expect(changeFn).toHaveBeenLastCalledWith({
      ...initData,
      _Q_: 'env[erda]||nickName[Tom]',
      env: 'erda',
      name: 'erda cloud',
      id: 123,
      nickName: ['1'],
    });
    changeFn.mockReset();
    fireEvent.click(result.getByText('search'));
    expect(searchFn).toHaveBeenLastCalledWith({
      ...initData,
      _Q_: 'env[erda]||nickName[Tom]',
      env: 'erda',
      name: 'erda cloud',
      id: 123,
      nickName: ['1'],
    });

    expect(goToSpy).toHaveBeenLastCalledWithNth(
      0,
      '/erda/dop/apps?id=123&name=erda%20cloud&nickName[]=1&env=erda&_Q_=env%5Berda%5D%7C%7CnickName%5BTom%5D',
    );
    goToSpy.mockReset();
    fireEvent.click(result.getByText('reset'));
    expect(resetFn).toHaveBeenCalled();
    expect(goToSpy).toHaveBeenCalled();
    goToSpy.mockClear();
  });
});
