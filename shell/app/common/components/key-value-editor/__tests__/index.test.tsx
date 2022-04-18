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
import { Form } from 'antd';
import { flushPromises } from 'test/utils';
import KeyValueEditor from '..';

type IProps = KeyValueEditor['props'];

describe('KeyValueEditor', () => {
  const data = {
    env: 'test',
    org: 'erda',
    name: 'erda.cloud',
  };
  const setUp = (props?: Partial<IProps>) => {
    let editor: React.MutableRefObject<KeyValueEditor | undefined>;
    const Comp = (c_props?: Partial<IProps>) => {
      const [form] = Form.useForm();
      const editorRef = React.useRef<KeyValueEditor>();
      editor = editorRef;
      return (
        <Form>
          <KeyValueEditor form={form} {...c_props} ref={editorRef} />
        </Form>
      );
    };
    const validateFn = jest.fn();
    const changeFn = jest.fn();
    const result = render(<Comp onChange={changeFn} dataSource={data} maxLength={10} {...props} />);
    const rerender = (re_props?: Partial<IProps>) => {
      result.rerender(<Comp onChange={changeFn} dataSource={data} maxLength={10} {...re_props} />);
    };
    return {
      validateFn,
      changeFn,
      rerender,
      result,
      editor,
    };
  };
  it('should render well', async () => {
    const { result, editor, rerender } = setUp();
    expect(result.queryByText('Entry Mode')).not.toBeNull();
    expect(result.container).isExist('.key-value-textarea-wrap', 0);
    expect(result.container).isExist('.key-value-table-wrap', 1);
    fireEvent.click(result.getByText('Text Mode'));
    await flushPromises();
    expect(result.container).isExist('.key-value-textarea-wrap', 1);
    expect(result.container).isExist('.key-value-table-wrap', 0);
    expect(editor.current?.getEditData()).toStrictEqual(data);
    fireEvent.click(result.getByText('Entry Mode'));
    await flushPromises();
    expect(result.container).isExist('.key-value-textarea-wrap', 0);
    expect(result.container).isExist('.key-value-table-wrap', 1);
    expect(editor.current?.getEditData()).toStrictEqual(data);
    rerender({ isNeedTextArea: false });
    expect(result.queryByText('Entry Mode')).toBeNull();
  });
  it('should work well with validateFields error', async () => {
    const validateFields = jest.fn().mockRejectedValue({});
    const { result } = setUp({ form: { validateFields } });
    expect(result.container).isExist('.key-value-textarea-wrap', 0);
    expect(result.container).isExist('.key-value-table-wrap', 1);
    fireEvent.click(result.getByText('Text Mode'));
    await flushPromises();
    expect(result.container).isExist('.key-value-textarea-wrap', 0);
    expect(result.container).isExist('.key-value-table-wrap', 1);
  });
});
