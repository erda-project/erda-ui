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
import { act, fireEvent, render } from '@testing-library/react';
import { emit, off, on } from 'core/event-hub';
import layout from 'layout/stores/layout';
import MarkdownRender from '..';

// need to mock. Otherwise the stack overflows
jest.mock('react-syntax-highlighter', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const Light = (props) => {
    return <div>{props.children}</div>;
  };
  Light.registerLanguage = () => {};
  return {
    Light,
  };
});

describe('MarkdownRender', () => {
  const markdownContent = `
  # Header 1
  ## Header 2
  ### Header 3
  #### Header 4
  ##### Header 5

  link: [link](https://erda.cloud)

  image: ![alt text](https://erda.cloud/img.png)

  bold: **bold**
  italic: *italic*
  strikethrough: ~~strikethrough~~

  > quote

  ordered list:
  1. item 1
  2. item 2

  unordered list:
  - item 1
  - item 2

  code:
  \`inline\`

  block code:
  \`\`\`js
  const a = 1
  \`\`\`
  `;
  const spyOnDispatchEvent = jest.spyOn(window, 'dispatchEvent');
  const spyOnAddEventListener = jest.spyOn(window, 'addEventListener');
  beforeAll(() => {
    const eventMap = {};
    spyOnAddEventListener.mockImplementation((type: string, listener: EventListenerOrEventListenerObject) => {
      if (eventMap[type]) {
        eventMap[type].push(listener);
      } else {
        eventMap[type] = [listener];
      }
    });
    spyOnDispatchEvent.mockImplementation((e: Event) => {
      const events = eventMap[e.type] || [];
      const preventDefault = jest.fn();
      events.forEach((event: Function) => {
        event({ ...e, preventDefault });
      });
      return true;
    });
  });
  afterAll(() => {
    spyOnDispatchEvent.mockRestore();
    spyOnAddEventListener.mockRestore();
    jest.resetAllMocks();
  });
  it('should render well', () => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        emit('pressEsc', { event: e, stack: layout.getState((s) => s.escStack) });
      }
    });
    const imgLoadFn = jest.fn();
    const clickFn = jest.fn();
    on('md-img-loaded', imgLoadFn);
    const result = render(
      <div onClick={clickFn}>
        <MarkdownRender value={markdownContent} />
      </div>,
    );
    expect(result.container).isExist('.md-content', 1);
    expect(result.container).isExist('h1', 1);
    expect(result.container).isExist('h2', 1);
    expect(result.container).isExist('h3', 1);
    expect(result.container).isExist('h4', 1);
    expect(result.container).isExist('h5', 1);
    expect(result.container).isExist('img', 2);
    fireEvent.load(result.container.querySelectorAll('img')[0]!);
    expect(imgLoadFn).toHaveBeenCalled();
    fireEvent.click(result.container.querySelector('a')!);
    expect(clickFn).not.toHaveBeenCalled();
    expect(result.container).isExist('.bg-desc', 0);
    fireEvent.click(result.container.querySelectorAll('img')[0]);
    expect(result.container).isExist('.bg-desc', 1);
    fireEvent.click(result.container.querySelectorAll('img')[1]);
    expect(result.container).isExist('.bg-desc', 0);
    fireEvent.click(result.container.querySelectorAll('img')[0]);
    expect(result.container).isExist('.bg-desc', 1);
    act(() => {
      window.dispatchEvent({ type: 'keydown', key: 'Escape', code: 'Escape' });
    });
    expect(result.container).isExist('.bg-desc', 0);
    result.rerender(<MarkdownRender value={markdownContent} noWrapper />);
    expect(result.container).isExist('.md-content', 0);
    off('md-img-loaded', imgLoadFn);
  });
  it('should MarkdownRender.toHtml work well', () => {
    expect(MarkdownRender.toHtml('### title')).toBe('<h3>title</h3>');
  });
});
