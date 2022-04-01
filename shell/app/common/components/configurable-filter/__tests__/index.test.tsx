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
import { FormInstance } from 'antd';
import _ from 'lodash';
import { flushPromises } from 'test/utils';
import ConfigurableFilter, { IProps } from '..';

describe('ConfigurableFilter', () => {
  const externalFieldsList = [
    {
      label: '',
      type: 'input',
      outside: true,
      key: 'keyword',
      placeholder: 'search by keywords',
      customProps: {
        autoComplete: 'off',
      },
    },
  ];
  const fieldsList = [
    {
      label: 'APP_NAME',
      type: 'input',
      key: 'keyword',
      placeholder: 'search by keywords',
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: 'ITERATION',
      type: 'select',
      key: 'iteration',
      placeholder: 'please select iteration',
      options: [
        { label: 'iteration-1.1', value: 123 },
        { label: 'iteration-1.2', value: 124 },
        { label: 'iteration-1.3', value: 125 },
      ],
    },
    {
      key: 'createdAtStartEnd',
      label: 'CREATE_AT',
      type: 'dateRange',
    },
  ];
  const initialInsideFieldsValue = fieldsList.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.key]: undefined,
    }),
    {},
  );
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _.debounce = (fn: Function) => fn;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _.throttle = (fn: Function) => fn;
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  const setUp = (props?: Partial<IProps>) => {
    const filterFn = jest.fn();
    const closeFn = jest.fn();
    const clearFn = jest.fn();
    const configChangeFn = jest.fn();
    const saveFilterFn = jest.fn();
    const deleteFilterFn = jest.fn();
    const filterRef: React.Ref<{ form: FormInstance }> = React.createRef();
    let firstOpen = true;
    const Comp = (c_props: Partial<IProps>) => {
      const newProps = {
        fieldsList,
        ...c_props,
      } as IProps;
      return (
        <ConfigurableFilter
          {...newProps}
          onFilter={filterFn}
          onClose={closeFn}
          onSaveFilter={saveFilterFn}
          onDeleteFilter={deleteFilterFn}
          onClear={clearFn}
          onConfigChange={configChangeFn}
          ref={filterRef}
        />
      );
    };
    const result = render(<Comp {...props} />);
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(<Comp {...n_props} />);
    };
    const openFilter = async () => {
      fireEvent.click(result.baseElement.querySelector('.erda-configurable-filter-btn')!);
      if (firstOpen) {
        await waitFor(() =>
          expect(result.baseElement.querySelector('.erda-configurable-filter')).not.toHaveStyle({ display: 'none' }),
        );
      } else {
        await waitFor(() =>
          expect(result.baseElement).not.isExitClass('.erda-configurable-filter', 'ant-popover-hidden'),
        );
      }
      firstOpen = false;
    };
    return {
      result,
      rerender,
      filterRef,
      filterFn,
      closeFn,
      clearFn,
      configChangeFn,
      saveFilterFn,
      deleteFilterFn,
      openFilter,
    };
  };
  it('should work well without insideFields', async () => {
    const { result, rerender, filterFn } = setUp({ fieldsList: externalFieldsList });
    expect(result.container).isExit('.erda-configurable-filter-btn', 0);
    await act(async () => {
      fireEvent.change(result.getByPlaceholderText('search by keywords'), { target: { value: 'erda' } });
      await flushPromises();
    });
    expect(filterFn).toHaveBeenLastCalledWith({ keyword: 'erda' });
    filterFn.mockReset();
    rerender({
      fieldsList: externalFieldsList,
      value: { keyword: 'erda cloud' },
    });
    await act(async () => {
      fireEvent.change(result.getByPlaceholderText('search by keywords'), { target: { value: 'erda cloud' } });
      await flushPromises();
    });
    expect(filterFn).not.toHaveBeenCalled();
  });
  it('should work well with insideFields', async () => {
    const { result, rerender, filterFn, closeFn, openFilter, clearFn } = setUp({ zIndex: 10, hideSave: true });
    await openFilter();
    fireEvent.click(result.getByText('cancel'));
    await waitFor(() => expect(result.baseElement).isExitClass('.erda-configurable-filter', 'ant-popover-hidden'));
    expect(closeFn).toHaveBeenCalledTimes(1);
    await openFilter();
    fireEvent.click(result.baseElement.querySelector('[name="guanbi"]')!);
    expect(closeFn).toHaveBeenCalledTimes(2);
    await openFilter();
    fireEvent.change(result.getByPlaceholderText('search by keywords'), { target: { value: 'erda' } });
    fireEvent.mouseDown(result.baseElement.querySelector('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('iteration-1.1'));
    await act(async () => {
      fireEvent.click(result.getByText('filter', { selector: 'button span' }));
      await flushPromises();
    });
    expect(filterFn).toHaveBeenLastCalledWith({
      ...initialInsideFieldsValue,
      iteration: [123],
      keyword: 'erda',
    });
    rerender({
      zIndex: 10,
      hideSave: true,
      value: {
        ...initialInsideFieldsValue,
        iteration: [123],
        keyword: 'erda',
      },
    });
    expect(result.baseElement).isExit('.erda-configurable-filter-clear-btn', 1);
    await act(async () => {
      fireEvent.click(result.baseElement.querySelector('.erda-configurable-filter-clear-btn')!);
      await flushPromises();
    });
    expect(filterFn).toHaveBeenLastCalledWith(initialInsideFieldsValue);
    expect(clearFn).toHaveBeenCalledTimes(1);
    rerender({
      zIndex: 10,
      hideSave: true,
      value: {
        ...initialInsideFieldsValue,
      },
    });
    expect(result.baseElement).isExit('.erda-configurable-filter-clear-btn', 0);
  });
  it('should work well with insideFields and haveSave', async () => {
    const configList = [
      {
        id: 'all',
        isPreset: true,
        label: 'openAll',
        values: {},
      },
      {
        id: 'defaultState',
        isPreset: true,
        label: 'presetFilter',
        values: {
          iteration: [123],
        },
      },
      {
        id: 'customFilter',
        isPreset: false,
        label: 'customFilter',
        values: {
          keyword: 'cloud',
        },
      },
    ];
    const { result, rerender, filterFn, closeFn, openFilter, clearFn, configChangeFn, saveFilterFn } = setUp({
      zIndex: 10,
      hideSave: false,
      configList,
    });
    await openFilter();
    expect(result.baseElement).isExitClass('.erda-configurable-filter', 'w-[960px]');
    await act(async () => {
      fireEvent.click(result.getByText('presetFilter').closest('.filter-config-selector-item')!);
      await flushPromises();
    });
    expect(filterFn).toHaveBeenLastCalledWith({
      ...initialInsideFieldsValue,
      iteration: [123],
    });
    fireEvent.change(result.getByPlaceholderText('search by keywords'), { target: { value: 'erda' } });
    fireEvent.click(result.getByText('new filter'));
    await waitFor(() => expect(result.baseElement).isExit('.erda-configurable-filter-add', 1));
    fireEvent.click(result.getByText('cancel', { selector: '.erda-configurable-filter-add button span' }));
    expect(result.baseElement).isExitClass('.erda-configurable-filter-add', 'ant-popover-hidden');
    fireEvent.click(result.getByText('new filter'));
    expect(result.baseElement).not.isExitClass('.erda-configurable-filter-add', 'ant-popover-hidden');
    fireEvent.change(result.getByPlaceholderText('please enter, within 10 characters'), {
      target: { value: 'ErdaFilter' },
    });
    await act(async () => {
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
    });
    expect(saveFilterFn).toHaveBeenLastCalledWith('ErdaFilter', {
      createdAtStartEnd: undefined,
      iteration: [123],
      keyword: 'erda',
    });
    await act(async () => {
      fireEvent.click(
        result
          .getByText('openAll', { selector: '.filter-config-selector-item .truncate' })
          .closest('.filter-config-selector-item')!,
      );
      await flushPromises();
    });
    fireEvent.change(result.getByPlaceholderText('search by keywords'), { target: { value: 'cloud' } });
    expect(result.getByText('customFilter').closest('.filter-config-selector-item')).toHaveClass('bg-default-04');
  });
});
