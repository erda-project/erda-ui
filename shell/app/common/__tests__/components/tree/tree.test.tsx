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
import { TreeCategory } from 'common';
import { describe, it, jest } from '@jest/globals';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { sleep } from '../../../../../test/utils';

const simpleTreeData = [
  {
    isLeaf: false,
    titleAlias: 'erda-menu1',
    key: 'menu1',
  },
  {
    isLeaf: true,
    titleAlias: 'erda-menu1-1',
    key: 'menu1-1',
  },
];

const initTreeData = [
  {
    isLeaf: false,
    titleAlias: 'erda-root',
    key: 'leaf-root',
  },
];

describe('TreeCategory', () => {
  it('TreeCategory should support fuzzySearch', async () => {
    const fuzzySearch = jest.fn().mockResolvedValue(simpleTreeData);
    const getAncestors = jest.fn().mockResolvedValue(simpleTreeData);
    const selectNodeFn = jest.fn();
    const wrapper = shallow(
      <TreeCategory
        effects={{
          fuzzySearch,
          getAncestors,
        }}
        onSelectNode={selectNodeFn}
      />,
    );
    const select = wrapper.find('Select').at(0);
    expect(wrapper.find('Select')).toExist();
    select.prop('onSearch')();
    expect(fuzzySearch).not.toHaveBeenCalled();
    await act(async () => {
      await select.prop('onSearch')('erda');
    });
    expect(fuzzySearch).toHaveBeenLastCalledWith({ fuzzy: 'erda' });
    expect(wrapper.find('OptGroup').at(0).find('Option')).toHaveLength(simpleTreeData.filter((t) => !t.isLeaf).length);
    expect(wrapper.find('OptGroup').at(1).find('Option')).toHaveLength(simpleTreeData.filter((t) => t.isLeaf).length);
    await act(async () => {
      await select.prop('onChange')('leaf-menu1-1');
    });
    expect(getAncestors).toHaveBeenCalledTimes(1);
    expect(selectNodeFn).toHaveBeenCalledTimes(1);
    expect(selectNodeFn).toHaveBeenLastCalledWith({ inode: 'menu1-1', isLeaf: true });
    act(() => {
      select.prop('onChange')('menu1');
    });
    expect(wrapper.find('DirectoryTree').prop('expandedKeys')).toStrictEqual(['menu1', 'menu1-1']);
    act(() => {
      select.prop('onChange')();
    });
    expect(wrapper.find('OptGroup')).not.toExist();
    wrapper.setProps({
      effects: {
        fuzzySearch: undefined,
      },
    });
    expect(wrapper.find('Select')).not.toExist();
  });
  // process
  it.skip('TreeCategory should work well', async () => {
    const getAncestors = jest.fn().mockReturnValue(simpleTreeData);
    const selectNodeFn = jest.fn();
    let wrapper = mount(
      <TreeCategory
        initTreeData={initTreeData}
        currentKey="leaf-root"
        effects={{
          getAncestors,
        }}
        onSelectNode={selectNodeFn}
      />,
    );
    await sleep(1500);

    act(() => {
      wrapper.find('DirectoryTree').prop('onExpand')(['leaf-root']);
    });
    expect(wrapper.find('DirectoryTree').prop('expandedKeys')).toStrictEqual(['leaf-root']);
  });
});
