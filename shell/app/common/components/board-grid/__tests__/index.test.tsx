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
import { dcRegisterComp, getLocale } from '@erda-ui/dashboard-configurator';
import WrappedTable from 'common/components/table';
import BoardGrid from '..';

describe('BoardGrid', () => {
  it('should dcRegisterComp work well', () => {
    const { Comp } = dcRegisterComp.getComp<typeof WrappedTable, any>('table', {});
    const result = render(<Comp columns={[{ title: 'name', dataIndex: 'name' }]} />);
    expect(result.container).isExist('.erda-table', 1);
  });
  it('should BoardGrid work well', () => {
    render(<BoardGrid {...{}} />);
    expect(getLocale()).toBe('zh');
  });
  it('should BoardGrid.Pure work well', () => {
    render(<BoardGrid.Pure {...{}} />);
    expect(getLocale()).toBe('zh');
  });
});
