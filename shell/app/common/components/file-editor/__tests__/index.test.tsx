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
import '@testing-library/jest-dom';
import FileEditor from '..';

jest.mock('react-ace', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const AceEditor = (props) => {
    return (
      <div className="mock-ace-editor" data-mode={props.mode}>
        {props.value}
      </div>
    );
  };
  return AceEditor;
});

describe('FileEditor', () => {
  const value = `
const babel = require( "@babel/core" );
const options = {
  ast: true,
  // presets: [ "@babel/preset-env" ]
};
const codeStr = "codes.map(code=>code.toUpperCase())";
const code = babel.transformSync( codeStr, options );
console.log( code.ast );
console.log( code.code )
  `;
  const jsonStr = '{"name":"erda-fe","org":"erda"}';
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well', () => {
    const createObjectURL = jest.fn();
    const revokeObjectURL = jest.fn();
    const changeFn = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    jest.useFakeTimers();
    const result = render(<FileEditor value={value} readOnly />);
    expect(result.container.querySelector('[data-mode="sh"]')?.innerHTML).not.toBeNull();
    result.rerender(<FileEditor value={''} readOnly />);
    expect(result.container.querySelector('pre')?.innerHTML).toBe('');
    result.rerender(<FileEditor value={value.repeat(5000)} readOnly />);
    expect(result.getByText('Download')).toBeTruthy();
    fireEvent.click(result.getByText('Download'));
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    result.rerender(<FileEditor value={value} actions={{ copy: true, format: true }} onChange={changeFn} />);
    jest.runAllTimers();
    expect(result.getByLabelText('icon: fz1')).toBeTruthy();
    fireEvent.click(result.getByLabelText('icon: sx'));
    expect(changeFn).not.toHaveBeenCalled();
    result.rerender(<FileEditor value={jsonStr} actions={{ copy: true, format: true }} onChange={changeFn} />);
    fireEvent.click(result.getByLabelText('icon: sx'));
    expect(changeFn).toHaveBeenCalled();
    result.rerender(<FileEditor value={'echo hello world'} autoHeight fileExtension="bash" />);
    expect(result.container.querySelector('.file-editor-container')).toHaveStyle({ height: '100%' });
    expect(result.container.querySelector('.mock-ace-editor')).toHaveAttribute('data-mode', 'sh');
  });
});
