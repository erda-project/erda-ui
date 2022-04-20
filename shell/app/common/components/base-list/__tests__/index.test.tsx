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
import { fireEvent, render } from '@testing-library/react';
import ListItem from '../list-item';
import List from '..';

jest.mock('../list-item');
describe('List', () => {
  const EmptyHolder = <div>EmptyHolder</div>;
  const dataSource = [
    {
      id: 1,
      title: 'title1',
      titleState: [{ text: 'error', status: 'error' }],
      mainState: { text: 'error', status: 'error' },
      tags: [],
    },
  ] as unknown as ERDA_LIST.ListData[];
  const pagination = {
    total: 10,
    pageNo: 1,
    pageSize: 10,
    onChange: jest.fn(),
  };
  beforeAll(() => {
    (ListItem as any as jest.MockInstance<any, any>).mockImplementation((props: ERDA_LIST.ItemProps) => {
      return (
        <div className="erda-base-list-item">
          <div
            onClick={() => {
              props.onSelectChange?.(true);
            }}
          >
            triggerSelectChange
          </div>
        </div>
      );
    });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should render well', () => {
    const loadMoreFn = jest.fn();
    const selectChangeFn = jest.fn();
    const getKeyFn = jest.fn();
    const result = render(
      <List
        dataSource={dataSource}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        EmptyHolder={EmptyHolder}
      />,
    );
    expect(result.container).isExist('.erda-base-list-item', dataSource.length);
    fireEvent.click(result.getByText('triggerSelectChange'));
    expect(selectChangeFn).not.toHaveBeenCalled();
    result.rerender(
      <List
        dataSource={dataSource}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        onSelectChange={selectChangeFn}
        EmptyHolder={EmptyHolder}
      />,
    );
    fireEvent.click(result.getByText('triggerSelectChange'));
    expect(selectChangeFn).toHaveBeenLastCalledWith(1);
    result.rerender(
      <List
        pagination={pagination}
        isLoadMore
        dataSource={dataSource}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        EmptyHolder={EmptyHolder}
      />,
    );
    fireEvent.click(result.getByText('more'));
    expect(loadMoreFn).toHaveBeenCalledWith(pagination.pageNo);
    result.rerender(
      <List
        pagination={pagination}
        isLoadMore={false}
        dataSource={dataSource}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        EmptyHolder={EmptyHolder}
      />,
    );
    expect(result.container).isExist('.pagination-wrap', 1);
    result.rerender(
      <List
        whiteFooter
        pagination={pagination}
        isLoadMore={false}
        dataSource={dataSource}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        EmptyHolder={EmptyHolder}
      />,
    );
    expect(result.container).isExistClass('.pagination-wrap', 'bg-white');
    result.rerender(
      <List
        whiteFooter
        pagination={pagination}
        isLoadMore={false}
        dataSource={[]}
        onLoadMore={loadMoreFn}
        getKey={(item, idx) => {
          getKeyFn(item, idx);
          return item.id;
        }}
        EmptyHolder={EmptyHolder}
      />,
    );
    expect(result.getByText('EmptyHolder')).toBeTruthy();
  });
});
