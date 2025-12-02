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

import { getFormatter } from 'charts/utils';

describe('charts/utils#getFormatter', () => {
  it('formats storage size to human readable text', () => {
    const formatter = getFormatter('STORAGE', 'B');

    expect(formatter.format(8238634)).toBe('7.86 MB'); // roughly 7.86MB
    expect(formatter.format(512)).toBe('512 B');
  });
});
