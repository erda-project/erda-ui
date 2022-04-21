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
import { fireEvent, render, RenderOptions, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import _ from 'lodash';
import { resetMockDate, setMockDate } from 'test/utils';
import { message } from 'antd';
import ContractiveFilter, { getSelectOptions, ICondition } from '..';

type IProps = Parameters<typeof ContractiveFilter>[0];

jest.mock('common/components/member-selector', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const MemberSelector = React.forwardRef((props, ref: any) => {
    const [visible, setVisible] = React.useState(false);
    React.useEffect(() => {
      props.onDropdownVisible?.(visible);
    }, [visible]);
    React.useEffect(() => {
      if (ref) {
        ref.current = {
          show: (vis: boolean) => jest.fn(vis),
        };
      }
    }, [ref]);
    return (
      <div className="mock-member-selector">
        <div
          onClick={() => {
            setVisible(true);
          }}
        >
          open DropDown
        </div>
        <div
          onClick={() => {
            setVisible(false);
          }}
        >
          close DropDown
        </div>
        <div
          onClick={() => {
            setVisible(false);
            props.onChange?.('erda');
          }}
        >
          triggerChange
        </div>
        {props.resultsRender([{ label: 'member-erda', value: 'member-erda' }, { value: 'member-erda-ui' }])}
      </div>
    );
  });
  MemberSelector.Add = (props) => {
    return <input {...props} data-id="mock-member-selector-add" type="text" />;
  };
  return MemberSelector;
});

describe('ContractiveFilter', () => {
  const genderMap = [
    {
      name: 'dop',
      id: 'dop',
      icon: 'dop',
    },
    {
      name: 'msp',
      id: 'msp',
      icon: 'msp',
    },
    {
      name: 'cmp',
      id: 'cmp',
      icon: 'cmp',
    },
    {
      name: 'emp',
      id: 'emp',
      icon: 'emp',
    },
  ];
  const conditionsFilter: ICondition<any>[] = [
    {
      key: 'name',
      type: 'input',
      label: 'NAME',
      fixed: true,
      placeholder: 'filter by name',
      customProps: {
        className: 'filter-condition-item-name',
      },
    },
    {
      key: 'addr',
      type: 'input',
      label: 'ADDR',
      fixed: false,
      placeholder: 'filter by addr',
      customProps: {
        className: 'filter-condition-item-addr',
      },
    },
    {
      key: 'platform',
      type: 'select',
      tips: 'this is tips',
      label: 'PLATFORM',
      fixed: true,
      options: genderMap.map((item) => ({ label: item.name, value: item.id, icon: '' })),
      customProps: {
        className: 'filter-condition-item-gender',
      },
    },
    {
      key: 'createAt',
      fixed: true,
      type: 'dateRange',
      label: 'CREATE_AT',
      customProps: {
        className: 'filter-condition-item-createAt',
      },
    },
    {
      key: 'updateAt',
      fixed: true,
      type: 'rangePicker',
      label: 'UPDATE_AT',
      customProps: {
        className: 'filter-condition-item-updateAt',
      },
    },
    {
      key: 'triggerAt',
      fixed: true,
      type: 'timespanRange',
      label: 'TRIGGER_AT',
      customProps: {
        className: 'filter-condition-item-triggerAt',
      },
    },
    {
      key: 'creator',
      fixed: true,
      type: 'memberSelector',
      label: 'CREATOR',
      customProps: {
        className: 'filter-condition-item-creator',
      },
    },
    {
      key: 'ip',
      label: 'creator',
      fixed: true,
      type: 'custom',
      customProps: {
        className: 'filter-condition-item-ip',
      },
      getComp: (props) => {
        return (
          <input
            type="text"
            placeholder="filter by ip"
            onChange={(e) => {
              props.onChange(e.target.value);
            }}
          />
        );
      },
    },
    {
      key: 'scope',
      label: 'SCOPE',
      fixed: true,
      type: 'hidden',
      customProps: {
        className: 'filter-condition-item-scope',
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
  const setUp = (props?: Partial<IProps>, option?: Omit<RenderOptions, 'queries'>) => {
    const changeFn = jest.fn();
    const result = render(
      <ContractiveFilter conditions={conditionsFilter} delay={100} {...props} onChange={changeFn} />,
      option,
    );
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(<ContractiveFilter conditions={conditionsFilter} delay={100} {...n_props} onChange={changeFn} />);
    };
    return {
      result,
      rerender,
      changeFn,
    };
  };
  it('should render well', () => {
    const div = document.createElement('div', {});
    div.className = 'contractive-filter-date-picker';
    const { result, rerender } = setUp(
      {
        initValue: {
          triggerAt: [
            { value: 0, unit: 'ms' },
            { value: 1, unit: 'ms' },
          ],
        },
      },
      { container: document.body.appendChild(div) },
    );
    fireEvent.click(div);
    rerender({
      values: {
        triggerAt: [
          { value: 0, unit: 's' },
          { value: 1, unit: 's' },
        ],
      },
    });
    expect(result.getByText('Filter')).toBeTruthy();
    expect(result.container).isExist('.contractive-filter-item-wrap', 9);
    result.unmount();
  });
  it('should work well with more', async () => {
    const { result, changeFn, rerender } = setUp({
      conditions: [
        ...conditionsFilter,
        {
          key: 'moreSelect',
          type: 'select',
          label: 'moreSelect',
          fixed: false,
        },
      ],
    });
    fireEvent.click(result.getByText('Filter'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByPlaceholderText('Filter conditions'));
    fireEvent.change(result.getByPlaceholderText('Filter conditions'), { target: { value: 'addr' } });
    fireEvent.click(result.getByRole('checkbox'));
    fireEvent.change(result.getByRole('checkbox'), { target: { checked: true } });
    expect(result.container).isExist('.contractive-filter-item-wrap', 10);
    fireEvent.change(result.getByPlaceholderText('Filter by addr'), { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith({ addr: 'erda' }, 'addr');
    fireEvent.click(result.getByText('Filter'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText('Clear selected'));
    expect(result.container).isExist('.contractive-filter-item-wrap', 9);
    expect(changeFn).toHaveBeenLastCalledWith({ addr: undefined }, undefined);
    rerender({
      values: {
        moreSelect: 1,
      },
      conditions: [
        ...conditionsFilter,
        {
          key: 'moreSelect',
          type: 'select',
          label: 'moreSelect',
          fixed: false,
        },
      ],
    });
    fireEvent.click(result.getByPlaceholderText('Filter conditions'));
    fireEvent.change(result.getByPlaceholderText('Filter conditions'), { target: { value: 'moreSelect' } });
    fireEvent.click(result.getByRole('checkbox'));
    fireEvent.change(result.getByRole('checkbox'), { target: { checked: true } });
    expect(result.container).isExist('[name="guanbi-fill"]', 1);
    fireEvent.click(result.container.querySelector('[name="guanbi-fill"]')!);
    expect(result.container).isExist('[name="guanbi-fill"]', 0);
    expect(changeFn).toHaveBeenLastCalledWith({ moreSelect: undefined }, 'moreSelect');
  });
  it('should getComp work well', () => {
    const { result, changeFn } = setUp();
    fireEvent.change(result.getByPlaceholderText('filter by ip'), { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith({ ip: 'erda' }, 'ip');
  });
  it('should work well with input', async () => {
    const { result, changeFn } = setUp();
    fireEvent.change(result.getByPlaceholderText('Filter by name'), { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith({ name: 'erda' }, 'name');
  });
  it('should work well with select ', async () => {
    const { result, changeFn, rerender } = setUp({
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform' ? { ...item, haveFilter: true, firstShowLength: 2 } : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText(/load more/));
    fireEvent.change(result.getByPlaceholderText('Search'), { target: { value: 'dop' } });
    fireEvent.click(result.getByText('dop').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith({ platform: ['dop'] }, 'platform');
    fireEvent.click(result.getByText('Clear selected'));
    expect(changeFn).toHaveBeenLastCalledWith({ platform: undefined }, 'platform');
    rerender({
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform' ? { ...item, haveFilter: true, required: true } : item,
      ),
    });
    expect(result.queryByText('Clear selected')).toBeNull();
  });
  it('should work well with select single mode', async () => {
    const { result, changeFn } = setUp({
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform'
          ? { ...item, haveFilter: true, customProps: { ...item.customProps, mode: 'single' } }
          : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText('dop').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith({ platform: 'dop' }, 'platform');
    expect(result.queryByText('Clear selected')).toBeNull();
  });
  it('should work well with select quickSelect', async () => {
    const quickOperationFn = jest.fn();
    const { result } = setUp({
      onQuickOperation: quickOperationFn,
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform'
          ? {
              ...item,
              haveFilter: true,
              quickSelect: {
                operationKey: 'quickSelect key',
                label: 'quickSelect label',
              },
            }
          : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.getByText('quickSelect label'));
    expect(quickOperationFn).toHaveBeenCalledTimes(1);
  });
  it('should work well with select quickAdd', async () => {
    const quickOperationFn = jest.fn();
    const { result } = setUp({
      onQuickOperation: quickOperationFn,
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform'
          ? {
              ...item,
              haveFilter: true,
              quickAdd: {
                operationKey: 'quickAdd key',
                show: true,
              },
            }
          : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    expect(result.getByText('Save')).toHaveClass('not-allowed');
    fireEvent.click(result.getByText('Save'));
    expect(quickOperationFn).not.toHaveBeenCalled();
    fireEvent.change(result.getByPlaceholderText('Please enter'), { target: { value: 'dop' } });
    fireEvent.click(result.getByText('Save'));
    expect(quickOperationFn).not.toHaveBeenCalled();
    fireEvent.change(result.getByPlaceholderText('Please enter'), { target: { value: 'erda' } });
    fireEvent.click(result.getByText('Save'));
    expect(quickOperationFn).toHaveBeenLastCalledWith({ key: 'quickAdd key', value: 'erda' });
  });
  it('should work well with select quickDelete', async () => {
    const quickOperationFn = jest.fn();
    const { result } = setUp({
      onQuickOperation: quickOperationFn,
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform'
          ? {
              ...item,
              haveFilter: true,
              quickDelete: {
                operationKey: 'quickDelete key',
                show: true,
              },
            }
          : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.baseElement.querySelector('.option-item-delete')!);
    expect(quickOperationFn).toHaveBeenLastCalledWith({ key: 'quickDelete key', value: 'dop' });
  });
  it('should work well with select group', async () => {
    const quickOperationFn = jest.fn();
    const { result, changeFn } = setUp({
      onQuickOperation: quickOperationFn,
      conditions: conditionsFilter.map((item) =>
        item.key === 'platform'
          ? {
              ...item,
              haveFilter: true,
              firstShowLength: 2,
              quickDelete: {
                operationKey: 'quickDelete key',
                show: true,
              },
              options: genderMap.map((op) => ({
                label: op.name,
                value: op.id,
                children:
                  op.id === 'dop'
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
                      ]
                    : [],
              })),
            }
          : item,
      ),
    });
    fireEvent.click(result.getByText('PLATFORM'));
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    fireEvent.click(result.baseElement.querySelector('[name="shanchu"]')!);
    expect(quickOperationFn).toHaveBeenLastCalledWith({ key: 'quickDelete key', value: 'project' });
    expect(result.baseElement).not.isExistClass('.option-group-content', 'no-expand');
    expect(result.baseElement).isExist('.option-group-content .option-item', 2);
    fireEvent.click(result.baseElement.querySelector('.option-group-label')!);
    expect(result.baseElement).isExistClass('.option-group-content', 'no-expand');
    fireEvent.click(result.baseElement.querySelector('.option-group-content .load-more')!);
    expect(result.baseElement).isExist('.option-group-content .option-item', 3);
    fireEvent.click(result.getByText('project').closest('.option-item')!);
    expect(changeFn).toHaveBeenLastCalledWith({ platform: ['project'] }, 'platform');
  });
  it('should work well with Duration', async () => {
    const spyOnError = jest.spyOn(message, 'error');
    const { result, changeFn } = setUp();
    const durationInps = result.container.querySelectorAll('.trace-duration .ant-input');
    const durationSelect = result.container.querySelectorAll('.trace-duration .ant-select-selector');
    fireEvent.mouseDown(durationSelect[1]);
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 1));
    fireEvent.click(result.getAllByText('s')[1]);
    expect(changeFn).toHaveBeenLastCalledWith(
      {
        triggerAt: [],
      },
      'triggerAt',
    );
    fireEvent.change(durationInps[0], { target: { value: 1 } });
    fireEvent.change(durationInps[1], { target: { value: 2 } });
    expect(changeFn).toHaveBeenLastCalledWith(
      {
        triggerAt: [
          { timer: 1, unit: 'ms' },
          { timer: 2, unit: 's' },
        ],
      },
      'triggerAt',
    );
    fireEvent.change(durationInps[0], { target: { value: 2000 } });
    fireEvent.change(durationInps[1], { target: { value: 1 } });
    expect(spyOnError).toHaveBeenLastCalledWith('wrong duration');
    spyOnError.mockClear();
  });
  it.each([{ borderTime: false }, { borderTime: true }])(
    'should work well with datePicker with borderTime is $borderTime',
    async ({ borderTime }) => {
      const { timestamp } = setMockDate();
      const { result, changeFn } = setUp({
        conditions: conditionsFilter
          .filter((item) => item.type !== 'rangePicker')
          .map((item) => {
            return item.type === 'dateRange'
              ? {
                  ...item,
                  customProps: {
                    ...item.customProps,
                    borderTime,
                  },
                }
              : {
                  ...item,
                };
          }),
      });
      fireEvent.mouseDown(result.getByPlaceholderText('Start date'));
      fireEvent.focus(result.getByPlaceholderText('Start date'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 1));
      // select start date
      fireEvent.click(result.getAllByText('Today')[0]);
      fireEvent.mouseDown(result.getByPlaceholderText('End date'));
      fireEvent.focus(result.getByPlaceholderText('End date'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-dropdown', 2));
      // select End date
      fireEvent.click(result.getAllByText('Today')[1]);
      const createAt = borderTime ? [timestamp.startOfDay, timestamp.endOfDay] : [timestamp.current, timestamp.current];
      expect(changeFn).toHaveBeenLastCalledWith({ createAt }, 'createAt');
      resetMockDate();
    },
  );
  it.each([{ borderTime: false }, { borderTime: true }])(
    'should work well with rangePicker with borderTime is $borderTime',
    async ({ borderTime }) => {
      const { moment, timestamp } = setMockDate();
      const currentDay = moment.format('YYYY-MM-DD');
      const nextDay = moment.clone().add(1, 'day');
      const nextDayStr = nextDay.format('YYYY-MM-DD');
      const { result, changeFn } = setUp({
        conditions: conditionsFilter
          .filter((item) => item.type !== 'dateRange')
          .map((item) => {
            return item.type === 'rangePicker'
              ? {
                  ...item,
                  customProps: {
                    ...item.customProps,
                    borderTime,
                    ranges: [
                      {
                        'last 1 month': { label: 'last 1 month', range: [moment.clone().subtract(30, 'days'), moment] },
                      },
                    ],
                    selectableTime: [moment.clone().subtract(10, 'days'), moment.clone().add(10, 'days')],
                  },
                }
              : {
                  ...item,
                };
          }),
      });
      fireEvent.mouseDown(result.getByPlaceholderText('Start date'));
      fireEvent.focus(result.getByPlaceholderText('Start date'));
      await waitFor(() => expect(result.baseElement).isExist('.ant-picker-range-wrapper', 1));
      fireEvent.click(result.baseElement.querySelector(`[title="${currentDay}"]`)!);
      fireEvent.click(result.baseElement.querySelector(`[title="${nextDayStr}"]`)!);
      const updateAt = borderTime
        ? [timestamp.startOfDay, nextDay.clone().endOf('day').valueOf()]
        : [timestamp.current, nextDay.clone().valueOf()];
      expect(changeFn).toHaveBeenLastCalledWith({ updateAt }, 'updateAt');
      resetMockDate();
    },
  );
  it('should work well with memberSelector', async () => {
    const { result, changeFn } = setUp();
    fireEvent.click(result.container.querySelector('.member-value')!);
    fireEvent.click(result.getByText('triggerChange'));
    expect(changeFn).toHaveBeenLastCalledWith({ creator: 'erda' }, 'creator');
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
  });
});
