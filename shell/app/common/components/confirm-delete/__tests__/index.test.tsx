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
import { ConfirmDelete } from 'common';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import i18n from 'i18n';

const deleteItem = 'project';
const confirmTip = 'confirm to delete this project';
const secondTitle = 'confirm to delete this project in secondTitle';
const title = 'this is a title';
const defaultConfirmTip = i18n.t('Permanently delete {deleteItem}. Please pay special attention to it.', {
  deleteItem,
});

describe('ConfirmDelete', () => {
  it('render with default props ', () => {
    const wrapper = render(<ConfirmDelete deleteItem={deleteItem} />);
    expect(wrapper.container.querySelector('.text-desc')?.innerHTML).toBe(defaultConfirmTip);
  });
  it('render with customize props', async () => {
    const onConfirmFn = jest.fn();
    const onCancelFn = jest.fn();
    const wrapper = render(
      <ConfirmDelete
        onConfirm={onConfirmFn}
        onCancel={onCancelFn}
        deleteItem={deleteItem}
        confirmTip={confirmTip}
        secondTitle={secondTitle}
        title={title}
      >
        <div className="confirm-children" />
      </ConfirmDelete>,
    );
    expect(wrapper.container.querySelector('.text-desc')?.innerHTML).toBe(confirmTip);
    expect(wrapper.container.querySelectorAll('.confirm-children').length).toBe(1);
    fireEvent.click(wrapper.container.querySelector('.confirm-children')!);
    await waitFor(() => expect(wrapper.queryByText(title)).toBeInTheDocument());
    fireEvent.click(screen.getByText('ok'));
    expect(onConfirmFn).toHaveBeenCalled();
    fireEvent.click(wrapper.container.querySelector('.confirm-children')!);
    await waitFor(() => expect(wrapper.queryByText(title)).toBeInTheDocument());
    fireEvent.click(screen.getByText('cancel'));
    expect(onCancelFn).toHaveBeenCalled();
  });
});
