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
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import _ from 'lodash';
import { resetMockDate, setMockDate } from 'test/utils';
import ExternalIte, { getSelectOptions } from '../external-item';

type IProps = Omit<Parameters<typeof ExternalIte>[0], 'onChange'>;

describe('ExternalItem', () => {
  beforeAll(() => {
    // @ts-ignore
    _.debounce = (fn: Function) => fn;
    // @ts-ignore
    _.throttle = (fn: Function) => fn;
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  const defaultOptions = [
    {
      label: 'dop',
      value: 'dop',
    },
    {
      label: 'msp',
      value: 'msp',
    },
    {
      label: 'cmp',
      value: 'cmp',
    },
    {
      label: 'emp',
      value: 'emp',
    },
  ];
  const genOptions = (count: number) =>
    new Array(count)
      .fill(1)
      .map((_item: number, index) => ({ label: `label-${index + 1}`, value: `value-${index + 1}` }));
  const setUp = (props: IProps) => {
    const changeFn = jest.fn();
    const result = render(<ExternalIte {...props} onChange={changeFn} />);
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(<ExternalIte {...props} {...n_props} onChange={changeFn} />);
    };
    return {
      result,
      rerender,
      changeFn,
    };
  };
  it('should render empty with invalid type', () => {
    const { result } = setUp({
      value: '',
      itemData: {
        key: 'name',
        type: '',
        label: 'appName',
      },
    });
    expect(result.container.firstChild).toBeNull();
  });
  it('should work well with input', () => {
    const itemData = {
      key: 'name',
      type: 'input',
      label: 'appName',
      placeholder: 'please type app Name',
    };
    const { result, changeFn, rerender } = setUp({
      value: '',
      itemData,
    });
    fireEvent.change(result.getByPlaceholderText(itemData.placeholder), { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith('erda');
    rerender({ value: 'erda' });
    expect(result.getByPlaceholderText(itemData.placeholder)).toHaveAttribute('value', 'erda');
  });
  it.each([{ borderTime: false }, { borderTime: true }])(
    'should work well with dateRange with borderTime is $borderTime',
    async ({ borderTime }) => {
      const { timestamp } = setMockDate();
      const itemData = {
        key: 'createdAt',
        type: 'dateRange',
        label: 'createdAt',
        customProps: {
          borderTime,
        },
      };
      const { result, changeFn } = setUp({
        value: [],
        itemData,
      });
      fireEvent.mouseDown(result.getByPlaceholderText('startDate'));
      fireEvent.focus(result.getByPlaceholderText('startDate'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 1));
      // select start date
      fireEvent.click(result.getAllByText('Today')[0]);
      fireEvent.mouseDown(result.getByPlaceholderText('endDate'));
      fireEvent.focus(result.getByPlaceholderText('endDate'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 2));
      // select end date
      fireEvent.click(result.getAllByText('Today')[1]);
      const createAt = borderTime ? [timestamp.startOfDay, timestamp.endOfDay] : [timestamp.current, timestamp.current];
      expect(changeFn).toHaveBeenLastCalledWith(createAt);
    },
  );
  it.each([{ borderTime: false }, { borderTime: true }])(
    'should work well with rangePicker with borderTime is $borderTime',
    async ({ borderTime }) => {
      const { moment, timestamp } = setMockDate();
      const currentDay = moment.format('YYYY-MM-DD');
      const nextDay = moment.clone().add(1, 'day');
      const nextDayStr = nextDay.format('YYYY-MM-DD');
      const itemData = {
        key: 'createdAt',
        type: 'rangePicker',
        label: 'createdAt',
        customProps: {
          ranges: [{ 'last 1 month': { label: 'last 1 month', range: [moment.clone().subtract(30, 'days'), moment] } }],
          selectableTime: [moment.clone().subtract(10, 'days'), moment.clone().add(10, 'days')],
          borderTime,
        },
      };
      const { result, changeFn } = setUp({
        value: [],
        itemData,
      });
      fireEvent.mouseDown(result.getByPlaceholderText('Start date'));
      fireEvent.focus(result.getByPlaceholderText('Start date'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-range-wrapper', 1));
      fireEvent.click(result.baseElement.querySelector(`[title="${currentDay}"]`)!);
      fireEvent.click(result.baseElement.querySelector(`[title="${nextDayStr}"]`)!);
      const createAt = borderTime
        ? [timestamp.startOfDay, nextDay.clone().endOf('day').valueOf()]
        : [timestamp.current, nextDay.clone().valueOf()];
      expect(changeFn).toHaveBeenLastCalledWith(createAt);
      resetMockDate();
    },
  );
  it('should work well with select', async () => {
    const itemData = {
      key: 'platform',
      type: 'select',
      label: 'PLATFORM',
      haveFilter: true,
      options: [...defaultOptions, ...genOptions(200)],
    };
    const { result, changeFn, rerender } = setUp({
      value: [],
      itemData,
    });
    fireEvent.click(result.getByText(itemData.label));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText(/load more/));
    fireEvent.change(result.getByPlaceholderText('search'), { target: { value: 'dop' } });
    expect(result.baseElement).isExist('.option-item', 1);
    fireEvent.change(result.getByPlaceholderText('search'), { target: { value: '' } });
    fireEvent.click(result.getByText('dop').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith(['dop']);
    fireEvent.click(result.getByText('msp').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith(['dop', 'msp']);
    fireEvent.click(result.getByText('Clear selected'));
    expect(changeFn).toHaveBeenLastCalledWith(undefined);
    rerender({
      itemData: {
        ...itemData,
        required: true,
      },
    });
    expect(result.queryByText('Clear selected')).toBeNull();
  });
  it('should work well with select single mode', async () => {
    const itemData = {
      key: 'platform',
      type: 'select',
      label: 'PLATFORM',
      mode: 'single',
      options: [
        {
          value: 'dop',
          label: 'dop',
        },
        {
          value: 'dop1',
          label: 'dop1',
        },
      ],
    };
    const { result, changeFn, rerender } = setUp({
      value: '',
      itemData,
    });
    fireEvent.click(result.getByText(itemData.label));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText('dop1').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith('dop1');
    rerender({
      value: 'dop1',
    });
    fireEvent.click(result.getByText('dop').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith('dop');
  });
  it('should work well with select group', async () => {
    const itemData = {
      key: 'platform',
      type: 'select',
      label: 'PLATFORM',
      options: [
        ...defaultOptions.map((item) => ({
          ...item,
          children:
            item.value === 'dop'
              ? [
                  {
                    label: 'project',
                    value: 'project',
                  },
                  {
                    label: 'app',
                    value: 'app',
                  },
                  {
                    label: 'test',
                  },
                  ...genOptions(200),
                ]
              : [],
        })),
      ],
    };
    const { result, changeFn } = setUp({
      value: [],
      itemData,
    });
    fireEvent.click(result.getByText(itemData.label));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    expect(result.baseElement).not.isExistClass('.option-group-content', 'no-expand');
    fireEvent.click(result.getByText(/load more/));
    fireEvent.click(result.getByText('project').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith(['project']);
    fireEvent.click(result.baseElement.querySelector('[name="down"]')!, { cancelBubble: true });
    expect(result.baseElement).isExistClass('.option-group-content', 'no-expand');
  });
  it('should getSelectOptions work well', () => {
    const options = [
      {
        label: 'dop',
        value: 'dop',
        children: [
          {
            label: 'project',
            value: 'project',
          },
          {
            label: 'application',
            value: 'application',
          },
        ],
      },
      {
        label: 'msp',
        value: 'msp',
        children: [
          {
            label: 'alarm',
            value: 'alarm',
          },
        ],
      },
      {
        label: 'cmp',
        value: 'cmp',
      },
    ];
    expect(getSelectOptions(options, '')).toStrictEqual(options);
    expect(getSelectOptions(options, 'application')).toStrictEqual([
      { label: 'dop', value: 'dop', children: [{ label: 'application', value: 'application' }] },
    ]);
    expect(getSelectOptions(options, 'cmp')).toStrictEqual([options[2]]);
  });
});
