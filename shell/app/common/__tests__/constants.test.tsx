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

import { FULL_DOC_DOMAIN, HELP_DOCUMENT, WORKSPACE_LIST } from '../constants';
import { describe, it } from '@jest/globals';

describe('emoji', () => {
  it('should Data normal', () => {
    expect(WORKSPACE_LIST.length).toBe(4);
    expect(HELP_DOCUMENT).toBe(`${FULL_DOC_DOMAIN}/mainVersion/manual/deploy/resource-management.html#%E7%AE%A1%E7%90%86%E9%85%8D%E9%A2%9D`);
  });
});
