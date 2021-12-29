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
import { ListSelect } from 'common';
import { mount } from 'enzyme';

const list = [{ id: '1-1', title: 'test1-1', pid: '1' }];
const menus = [{ id: '1', title: 'test1' }];
const value = [{ id: '1-1', title: 'test1-1', pid: '1' }];
const renderSelectedItem = (item: { id: string; title: string; pid: string }) => (
  <div className="render-selected-item">{item.title}</div>
);
const renderItem = (item: { id: string; title: string; pid: string }) => (
  <div className="render-item">{item.title}</div>
);

describe('list-select', () => {
  it('empty render should be ok', () => {
    const wrapper = mount(
      <ListSelect
        label="test"
        list={list}
        menus={menus}
        rowKey="id"
        parentKey="pid"
        menuRowKey="id"
        renderSelectedItem={renderSelectedItem}
        renderItem={renderItem}
      />,
    );
    const listDom = wrapper.find('.render-item');
    expect(listDom).toHaveHTML('test1-1');
  });

  it('render should be ok', () => {
    const wrapper = mount(
      <ListSelect
        value={value}
        label="test"
        list={list}
        menus={menus}
        rowKey="id"
        parentKey="pid"
        menuRowKey="id"
        renderSelectedItem={renderSelectedItem}
        renderItem={renderItem}
      />,
    );
    const listDom = wrapper.find('.render-selected-item');
    expect(listDom).toHaveHTML('test1-1');
  });
});
