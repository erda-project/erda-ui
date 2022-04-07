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
import MarkdownEditor, { EC_MarkdownEditor } from '..';
import { fireEvent, render } from '@testing-library/react';

jest.mock('common/components/markdown-editor/editor.tsx', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const Editor = (props: any) => {
    return (
      <input
        className="mock-markdown-editor"
        {...props}
        onChange={(e) => {
          props.onChange({ text: e.target.value, html: e.target.value });
        }}
      />
    );
  };
  return Editor;
});

describe('MarkdownEditor', () => {
  const str = 'erda cloud markdown editor';
  const maxLength = 10;
  it('should work well', async () => {
    jest.useFakeTimers();
    const ref = React.createRef<EC_MarkdownEditor>();
    const changeFn = jest.fn();
    const blurFn = jest.fn();
    const result = render(<MarkdownEditor ref={ref} maxLength={maxLength} onChange={changeFn} onBlur={blurFn} />);
    jest.runAllTimers();
    fireEvent.change(result.getByRole('textbox'), { target: { value: str } });
    expect(changeFn).toHaveBeenLastCalledWith(str.slice(0, maxLength));
    fireEvent.blur(result.getByRole('textbox'));
    expect(blurFn).toHaveBeenLastCalledWith(str.slice(0, maxLength));
    jest.useRealTimers();
  });
  it('should operationBtns work well', async () => {
    jest.useFakeTimers();
    const ref = React.createRef<EC_MarkdownEditor>();
    const clickFn = jest.fn();
    const result = render(
      <MarkdownEditor
        ref={ref}
        maxLength={maxLength}
        operationBtns={[
          {
            text: 'save',
            onClick: clickFn,
          },
        ]}
      />,
    );
    jest.runAllTimers();
    fireEvent.change(result.getByRole('textbox'), { target: { value: str } });
    fireEvent.click(result.getByText('save'));
    expect(clickFn).toHaveBeenLastCalledWith(str.slice(0, maxLength));
    ref.current?.clear();
    fireEvent.click(result.getByText('save'));
    expect(clickFn).toHaveBeenLastCalledWith('');
    jest.useRealTimers();
  });
});
