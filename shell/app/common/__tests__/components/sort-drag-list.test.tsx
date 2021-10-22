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
import { shallow } from 'enzyme';
import { SortDragGroupList } from 'common/components/sort-drag-list';

const value = [
  {
    type: 'type',
    draggable: true,
    data: {
      id: 1,
      groupId: 1,
      title: 'title',
    },
  },
];

describe('SortDragGroupList', () => {
  it('should support showName ', () => {
    const wrapper = shallow(<SortDragGroupList value={value} />);
    expect(wrapper.find('Fragment')).toExist();
  });
});
