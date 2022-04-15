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
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Menu } from 'common';
import * as utils from 'common/utils/go-to';

describe('Menu', () => {
  it('Menu should render empty', () => {
    const result = render(<Menu activeKey={'activeKey'} />);
    expect(result.container.firstChild).toBeNull();
  });
  it('should work well', async () => {
    const menus = [
      { key: 'create', name: 'CREATE' },
      { key: 'delete', name: 'DELETE' },
      { key: 'update', name: 'UPDATE' },
      { key: 'query', name: 'QUERY' },
    ];
    const goToSpy = jest.spyOn(utils, 'goTo').mockImplementation();
    const beforeTabChangeFn = jest.fn().mockResolvedValue(true);
    const result = render(
      <Menu activeKey={'delete'} menus={menus} beforeTabChange={beforeTabChangeFn} ignoreTabQuery />,
    );
    expect(result.container.querySelector('.tab-scroll-container')).isExit('.tab-menu-item', menus.length);
    fireEvent.click(result.getByText(menus[1].name));
    expect(goToSpy).not.toHaveBeenCalled();
    fireEvent.click(result.getByText(menus[0].name));
    await waitFor(() => expect(beforeTabChangeFn).toHaveBeenCalled());
    expect(goToSpy).toHaveBeenLastCalledWith('/erda/dop/apps/create');
    result.rerender(<Menu activeKey={'delete'} menus={menus} keepTabQuery={['id']} />);
    fireEvent.click(result.getByText(menus[0].name));
    expect(goToSpy).toHaveBeenLastCalledWith('/erda/dop/apps/create?id=1');
  });
});
