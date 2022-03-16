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
import { fireEvent, render, RenderResult } from '@testing-library/react';
import { Form } from 'antd';
import { flushPromises } from 'test/utils';
import KeyValueTextArea from '..';

describe('KeyValueTextArea', () => {
  const setUp = () => {
    let textAreaRef: React.MutableRefObject<KeyValueTextArea | undefined>;
    const Comp = (props) => {
      const [form] = Form.useForm();
      const textArea = React.useRef<KeyValueTextArea>();
      textAreaRef = textArea;
      return (
        <Form>
          <KeyValueTextArea {...props} form={form} ref={textArea} />
        </Form>
      );
    };
    const validateFn = jest.fn();
    const result = render(<Comp validate={validateFn} data={data} maxLength={10} existKeys={['type']} />);
    return {
      validateFn,
      result,
      textAreaRef,
    };
  };
  const data = 'name: erda\norg: erda.cloud';

  const assetValue = async (result: RenderResult, spy: jest.SpyInstance, str: string, msg: string) => {
    fireEvent.change(result.getByRole('textbox'), {
      target: {
        value: `${data}\n${str}`,
      },
    });
    await flushPromises();
    expect(spy).toHaveBeenLastCalledWith('async-validator:', [`${msg}`]);
    return Promise.resolve();
  };

  it('should work well', async () => {
    const spyOnConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    const { result, textAreaRef, validateFn } = setUp();
    fireEvent.change(result.getByRole('textbox'), {
      target: {
        value: `${data}\nenv:test`,
      },
    });
    await flushPromises();
    expect(textAreaRef.current?.getTextData()).toBe(`${data}\nenv:test`);
    expect(validateFn).toHaveBeenCalled();
    await assetValue(result, spyOnConsoleWarn, ':', '第3行: full-width punctuation not allowed');
    await assetValue(result, spyOnConsoleWarn, ':dev', '第3行: full-width punctuation not allowed');
    await assetValue(result, spyOnConsoleWarn, 'env:', '第3行: lack of english colon');
    await assetValue(result, spyOnConsoleWarn, 'env:  ', '第3行: missing value');
    await assetValue(result, spyOnConsoleWarn, 'name:erda', '第3行: key must be unique');
    await assetValue(
      result,
      spyOnConsoleWarn,
      'env:development',
      '第3行: the length of Value must not exceed 10 characters',
    );
    await assetValue(
      result,
      spyOnConsoleWarn,
      'environment:dev',
      '第3行: the length of Key must not exceed 10 characters',
    );
    await assetValue(result, spyOnConsoleWarn, 'type:dev', '3line: this configuration already exists');
    spyOnConsoleWarn.mockRestore();
  });
});
