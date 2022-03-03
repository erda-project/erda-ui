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
import Tags from '..';
import { render } from '@testing-library/react';

//group?: string;
//   color?: string;
//   checked?: boolean;
const labels = [
  {
    label: 'tag1',
  },
  {
    label: 'tag2',
  },
  {
    label: 'tag3',
  },
  {
    label: 'tag4',
    group: 'tagGroup',
  },
  {
    label: 'tag5',
    group: 'tagGroup',
  },
];

describe('Tags', () => {
  it('should ', () => {
    const result = render(<Tags labels={labels} maxShowCount={10} />);
    expect(result.container).toMatchSnapshot();
  });
});
