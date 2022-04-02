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
import { Select } from 'antd';
import { resetMockDate, setMockDate } from 'test/utils';
import EditField from '..';

type IProps = Omit<Parameters<typeof EditField>[0], 'onChangeCb'>;

jest.mock('common/components/markdown-editor', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const MarkdownEditor = ({ operationBtns = [], ...props }: any) => {
    const [content, setContent] = React.useState(props.value);
    React.useEffect(() => {
      setContent(props.value);
      return () => {
        setContent(undefined);
      };
    }, [props.value]);
    return (
      <div className="mock-markdown-editor">
        <input
          id="mock-markdown-editor"
          {...props}
          value={content}
          onBlur={(e) => {
            props.onBlur?.(e.target.value);
          }}
          onChange={(e) => {
            setContent(e.target.value);
            props.onChange?.(e.target.value);
          }}
          type="text"
        />
        <div>
          {operationBtns.map((operationBtn: any, i: number) => {
            const { text, type, size, className: btnItemCls = '', onClick } = operationBtn;
            return (
              <button size={size} key={i} type={type} onClick={() => onClick(content)} className={btnItemCls}>
                {text}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  return MarkdownEditor;
});

jest.mock('common/components/markdown-render', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const MarkdownRender = (props: any) => {
    return <div className="mock-markdown-render">{props.value}</div>;
  };
  return MarkdownRender;
});

describe('EditField', () => {
  const setUp = (props: IProps) => {
    const editFieldRef = React.createRef();
    const changeFn = jest.fn();
    const result = render(<EditField ref={editFieldRef} {...props} onChangeCb={changeFn} />);
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(<EditField ref={editFieldRef} {...props} {...n_props} onChangeCb={changeFn} />);
    };

    return {
      result,
      editFieldRef,
      rerender,
      changeFn,
    };
  };
  it('should work well with input', () => {
    const itemChangeFn = jest.fn();
    const { result, changeFn, rerender } = setUp({
      type: 'input',
      name: 'appName',
      data: {},
      itemProps: {
        onChange: itemChangeFn,
        placeholder: 'please type app name',
      },
    });
    const inp = result.getByPlaceholderText('please type app name');
    fireEvent.change(inp, { target: { value: 'erda' } });
    expect(itemChangeFn).toHaveBeenCalledTimes(1);
    fireEvent.blur(inp);
    expect(changeFn).toHaveBeenLastCalledWith({ appName: 'erda' });
    changeFn.mockReset();
    fireEvent.focus(inp);
    fireEvent.keyDown(inp, { key: 'Enter', code: 13, keyCode: 13 });
    rerender({
      data: { appName: 'erda' },
      itemProps: undefined,
    });
    fireEvent.focus(inp);
    fireEvent.blur(inp);
    expect(changeFn).not.toHaveBeenCalled();
  });
  it('should render well with readonly', () => {
    const { result, rerender } = setUp({
      type: 'readonly',
      label: 'APP NAME',
      name: 'appName',
      data: {
        appName: 'erda',
      },
    });
    expect(result.queryByText('erda')).toBeTruthy();
    expect(result.queryByText('APP NAME')).toBeTruthy();
    rerender({
      valueRender: (value) => {
        return <div className="custom-value-render">{value}</div>;
      },
    });
    expect(result.container).isExit('.custom-value-render', 1);
  });
  it('should render well with dateReadonly', () => {
    const { moment, timestamp } = setMockDate();
    const refFn = jest.fn();
    const { result } = setUp({
      type: 'dateReadonly',
      label: 'CREATED AT',
      name: 'createdAt',
      icon: 'date',
      data: {
        createdAt: timestamp.current,
      },
      ref: refFn,
    });
    expect(result.container).isExit('iconpark-icon', 1);
    expect(result.container.querySelector('iconpark-icon')).toHaveAttribute('name', 'date');
    expect(result.queryByText(moment.format('YYYY/MM/DD'))).toBeTruthy();
    resetMockDate();
  });
  it('should work well with custom', () => {
    const getComp: IProps['getComp'] = ({ onChange, onSave, value, originalValue, disabled }) => {
      return (
        <input
          type="text"
          placeholder="please type app name"
          value={value}
          disabled={disabled}
          defaultValue={originalValue}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={(e) => {
            onSave(e.target.value);
          }}
        />
      );
    };
    const { result, changeFn } = setUp({
      type: 'custom',
      label: 'APP_NAME',
      name: 'appName',
      getComp,
    });
    fireEvent.change(result.getByPlaceholderText('please type app name'), { target: { value: 'erda' } });
    fireEvent.blur(result.getByPlaceholderText('please type app name'));
    expect(changeFn).toHaveBeenLastCalledWith({ appName: 'erda' });
  });
  it('should work well with select', async () => {
    const metaOptions = [
      {
        name: 'YES',
        value: 1,
      },
      {
        name: 'NO',
        value: 0,
      },
    ];
    const { result, changeFn } = setUp({
      type: 'select',
      name: 'app',
      label: 'APP',
      itemProps: {
        options: metaOptions.map((item) => (
          <Select.Option key={item.value} value={item.value}>
            {item.name}
          </Select.Option>
        )),
      },
    });
    fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('YES'));
    fireEvent.blur(result.getByRole('combobox'));
    expect(changeFn).toHaveBeenLastCalledWith({ app: 1 });
  });
  it('should work well with datePicker', async () => {
    const mockDate = setMockDate();
    const currentDay = mockDate.moment.format('YYYY-MM-DD');
    const { result, changeFn } = setUp({
      type: 'datePicker',
      name: 'createdAt',
      label: 'CREATED_AT',
      itemProps: {},
    });
    fireEvent.mouseDown(result.getByPlaceholderText('Select date'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-picker-dropdown', 1));
    fireEvent.click(result.baseElement.querySelector(`[title="${currentDay}"]`)!);
    fireEvent.blur(result.getByPlaceholderText('Select date'));
    expect(changeFn).toHaveBeenLastCalledWith({ createdAt: mockDate.moment.startOf('day').format() });
    resetMockDate();
  });
  it('should work well with markdown isEditMode is false', () => {
    const { result, changeFn } = setUp({
      type: 'markdown',
      name: 'doc',
      label: 'DOC',
      itemProps: {
        isEditMode: false,
      },
    });
    fireEvent.change(result.baseElement.querySelector('#mock-markdown-editor')!, { target: { value: 'erda' } });
    expect(changeFn).toHaveBeenLastCalledWith({ doc: 'erda' });
  });
  it('should work well with markdown when isEditMode is true', () => {
    jest.useFakeTimers();
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
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
    const { result, changeFn, rerender } = setUp({
      type: 'markdown',
      name: 'doc',
      label: 'DOC',
      itemProps: {
        isEditMode: true,
      },
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.queryByText('click to edit description')).toBeTruthy();
    fireEvent.click(result.getByText('click to edit description'));
    expect(result.container).isExit('.mock-markdown-editor', 1);
    fireEvent.click(result.getByText('cancel'));
    expect(result.queryByText('click to edit description')).toBeTruthy();
    setDOMRect(1000, 1000);
    rerender({
      data: {
        doc: 'erda cloud',
      },
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.click(result.container.querySelector('[name="edit"]')!);
    expect(result.container).isExit('.mock-markdown-editor', 1);
    fireEvent.blur(result.baseElement.querySelector('#mock-markdown-editor')!, { target: { value: 'erda cloud' } });
    expect(changeFn).toHaveBeenLastCalledWith({ doc: 'erda cloud' }, 'markdown');
    changeFn.mockReset();
    fireEvent.click(result.getByText('save'));
    expect(changeFn).toHaveBeenLastCalledWith({ doc: 'erda cloud' }, undefined);
    expect(result.container).isExit('[name="double-down"]', 1);
    fireEvent.click(result.getByText('Expand').parentNode!);
    expect(result.container).isExit('[name="double-down"]', 0);
    expect(result.container).isExit('[name="double-up"]', 1);
    jest.useRealTimers();
  });
});
