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
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputSelect from '..';

const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

describe('InputSelect', () => {
  const optionArr = ['Accept', 'Cookie', 'Date', 'From', 'Host'];
  const options = optionArr.map((item) => ({
    label: item,
    value: item,
  }));
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 200,
    });
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  });
  it('should render well with disabled', async () => {
    const onChangeFn = jest.fn();
    const result = render(<InputSelect value="erda" onChange={onChangeFn} className="input-select-inp" disabled />);
    expect(result.container).isExistClass('.ant-input', 'ant-input-disabled');
  });
  it('should work well with Select', async () => {
    jest.useFakeTimers();
    const blurFn = jest.fn();
    const changeFn = jest.fn();
    const result = render(
      <InputSelect onBlur={blurFn} onChange={changeFn} value={undefined} options={options} dropdownMatchSelectWidth />,
    );
    const inp = result.container.querySelector('.ant-input');
    fireEvent.keyDown(inp!);
    fireEvent.focus(inp!);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    expect(result.baseElement).isExist('.option-item', optionArr.length);
    const searchInp = result.baseElement.querySelector('[placeholder="Filter"]');
    fireEvent.focus(searchInp!);
    fireEvent.click(searchInp!);
    fireEvent.change(searchInp!, { target: { value: optionArr[0] } });
    expect(result.baseElement).isExist('.option-item', 1);
    fireEvent.change(searchInp!, { target: { value: '' } });
    expect(result.baseElement).isExist('.option-item', optionArr.length);
    fireEvent.blur(inp!);
    fireEvent.click(document.body);
    await waitFor(() => expect(result.baseElement).isExistClass('.ant-dropdown', 'ant-dropdown-hidden'));
    fireEvent.blur(inp!);
    fireEvent.change(inp!, { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith('erda');
    fireEvent.focus(inp!);
    await waitFor(() => expect(result.baseElement).not.isExistClass('.ant-dropdown', 'ant-dropdown-hidden'));
    act(() => {
      fireEvent.click(screen.getByText(optionArr[0]));
      jest.runAllTimers();
    });
    expect(changeFn).toHaveBeenLastCalledWith(optionArr[0]);
    result.rerender(
      <InputSelect
        value={optionArr[0]}
        onBlur={blurFn}
        onChange={changeFn}
        options={options}
        dropdownMatchSelectWidth
      />,
    );
    expect(inp.value).toBe(optionArr[0]);
    expect(blurFn).toHaveBeenCalled();
  });
  it('should work well with Cascader', async () => {
    jest.useFakeTimers();
    const cascaderOptions = [...optionArr].map((item, index) => ({
      isLeaf: index % 2 === 0,
      label: item,
      value: item,
    }));
    const blurFn = jest.fn();
    const changeFn = jest.fn();
    const loadDataFn = jest.fn();
    const result = render(
      <InputSelect
        onBlur={blurFn}
        onChange={changeFn}
        onLoadData={loadDataFn}
        value={undefined}
        options={cascaderOptions}
        dropdownMatchSelectWidth
      />,
    );
    const inp = result.container.querySelector('.ant-input');
    fireEvent.keyDown(inp!);
    fireEvent.focus(inp!);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    const searchInp = result.baseElement.querySelector('.option-group-search input');
    fireEvent.change(searchInp!, { target: { value: cascaderOptions[0].label } });
    expect(result.baseElement).isExist('.option-item', 1);
    fireEvent.change(searchInp!, { target: { value: '' } });
    expect(result.baseElement).isExist('.option-item', cascaderOptions.length);
    act(() => {
      fireEvent.click(screen.getByText(cascaderOptions[0].label));
      jest.runAllTimers();
    });
    expect(changeFn).toHaveBeenLastCalledWith([cascaderOptions[0].value]);
    act(() => {
      fireEvent.click(screen.getByText(cascaderOptions[1].label));
      jest.runAllTimers();
    });
    expect(loadDataFn).toHaveBeenLastCalledWith([cascaderOptions[1]]);
    fireEvent.blur(inp!);
    fireEvent.click(document.body);
    fireEvent.blur(inp!);
    result.rerender(
      <InputSelect
        onBlur={blurFn}
        onChange={changeFn}
        onLoadData={loadDataFn}
        value={cascaderOptions[0].value}
        options={cascaderOptions.map((item, index) => {
          return {
            ...item,
            children:
              index === 1
                ? [
                    {
                      label: 'child1',
                      value: 'child1',
                    },
                    {
                      label: 'child2',
                      value: 'child2',
                    },
                  ]
                : undefined,
          };
        })}
        dropdownMatchSelectWidth
      />,
    );
    fireEvent.focus(inp!);
    await waitFor(() => expect(result.baseElement).not.isExistClass('.ant-dropdown', 'ant-dropdown-hidden'));
    expect(result.baseElement).not.isExistClass('.option-group-search', 'shadow');
    const optionBox = result.baseElement.querySelector('.option-group-box');
    fireEvent.scroll(optionBox!, { target: { scrollTop: 10 } });
    expect(result.baseElement).isExistClass('.option-group-search', 'shadow');
    act(() => {
      fireEvent.click(screen.getByText(cascaderOptions[1].label));
      jest.runAllTimers();
    });
    act(() => {
      fireEvent.click(screen.getByText('child1'));
      jest.runAllTimers();
    });
    expect(changeFn).toHaveBeenLastCalledWith([cascaderOptions[1].value, 'child1']);
  });
});
