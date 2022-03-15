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
import ReadonlyForm from '..';

describe('ReadonlyForm', () => {
  const fieldsList = [
    {
      label: 'Avatar',
      name: 'avatar',
      viewType: 'image',
    },
    {
      label: 'name',
      name: 'name',
    },
    {
      label: 'tags',
      name: 'tags',
    },
    {
      label: 'status',
      name: 'status',
    },
    {
      label: 'itemProps',
      name: 'itemProps',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      label: 'info',
      getComp: () => {
        return <div>getComp</div>;
      },
    },
  ];
  const data = {
    name: 'ERDA',
    avatar: 'Avatar img url',
    tags: ['success', 'error'],
    status: [
      {
        status: 'success',
        color: 'green',
      },
      {
        status: 'error',
        color: 'red',
      },
    ],
  };
  it('should render well', () => {
    const result = render(<ReadonlyForm fieldsList={fieldsList} data={data} />);
    expect(result.container).toMatchSnapshot();
  });
});
