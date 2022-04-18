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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirm from '..';

describe('DeleteConfirm', () => {
  it('render with warn', async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const onShowFn = jest.fn();
    const onConfirmFn = jest.fn();
    const onCancelFn = jest.fn();
    const result = render(
      <DeleteConfirm>
        <div className="children" />
        <div className="children" />
        <div className="children" />
      </DeleteConfirm>,
    );
    expect(spy).toHaveBeenCalled();
    expect(result.container).isExist('.children', 3);
    result.rerender(
      <DeleteConfirm onCancel={onCancelFn}>
        <div className="delete-button">delete-button</div>
      </DeleteConfirm>,
    );
    fireEvent.click(result.getByText('delete-button'));
    await waitFor(() => expect(result.baseElement.querySelector('.ant-modal-confirm-confirm')).toBeInTheDocument());
    fireEvent.click(screen.getByText('No'));
    expect(onCancelFn).toHaveBeenCalled();
    result.rerender(
      <DeleteConfirm onShow={onShowFn} onConfirm={onConfirmFn} countDown={3}>
        <div className="delete-button">delete-button</div>
      </DeleteConfirm>,
    );
    fireEvent.click(result.getByText('delete-button'));
    expect(onShowFn).toHaveBeenCalled();
    await waitFor(() => expect(result.baseElement.querySelector('.ant-modal-confirm-confirm')).toBeInTheDocument());
    jest.advanceTimersByTime(4000);
    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirmFn).toHaveBeenCalled();
  });
});
