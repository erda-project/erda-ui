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
import { SearchTableManage } from 'common';
import { shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

describe('SearchTableManage', () => {
  it('should render well', () => {
    const fn = jest.fn();
    const wrapper = shallow(
      <SearchTableManage
        searchList={[]}
        columns={[]}
        getTableList={fn}
        isFetching={false}
        extraItems={<div className="extraItems">extraItems</div>}
        tableList={[]}
        tableTotal={999}
        pageSize={15}
        currPage={1}
      />
    );
    const { onChange, onShowSizeChange } = wrapper.find('Table').prop('pagination');
    onChange(2);
    expect(fn).toHaveBeenLastCalledWith({ currPage: 2 });
    onShowSizeChange();
    expect(fn).toHaveBeenLastCalledWith({ currPage: 1 });
  });
});
