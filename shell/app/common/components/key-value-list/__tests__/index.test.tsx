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
import { render } from '@testing-library/react';
import KeyValueList from '..';

jest.mock('common/components/markdown-render', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const MarkdownRender = (props) => {
    return <div className="mock-markdown-render">{props.value}</div>;
  };
  return MarkdownRender;
});

describe('KeyValueList', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  const data = {
    name: 'erda-development',
    envs: ['test', 'dev', 'staging', 'pros'],
    activeTime: '2022-03-16 16:05:30',
    workSpace: {
      readme: '### this is markdown',
    },
    project: [
      {
        name: 'erda',
        env: {
          test: {
            envName: 'test',
          },
          dev: {
            envName: 'develop',
          },
        },
        application: [
          {
            name: 'app1',
          },
        ],
      },
    ],
    description: 'this is description',
  };
  it('should render well', () => {
    const result = render(<KeyValueList data={data} markdownTextFields={['readme']} />);
    expect(result.container).toMatchSnapshot();
    expect(result.container).not.isExistClass('.key-value-list', 'shrink');
    result.rerender(<KeyValueList data={data} markdownTextFields={['readme']} shrink />);
    expect(result.container).isExistClass('.key-value-list', 'shrink');
    result.rerender(
      <KeyValueList
        data={data}
        markdownTextFields={['readme']}
        shrink
        listRender={(v) => {
          return <div className="custom-list-render">custom-list-render: {JSON.stringify(v)}</div>;
        }}
        textRender={(k, v) => {
          return (
            <div className="custom-text-render">
              custom-text-render: {k}-{v}
            </div>
          );
        }}
      />,
    );
    expect(result.queryAllByText(/custom-list-render/).length).toBeGreaterThan(0);
    expect(result.queryAllByText(/custom-text-render/).length).toBeGreaterThan(0);
  });
});
