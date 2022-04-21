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
import '@testing-library/jest-dom';
import ConfigSelector, { IProps } from '../config-selector';

describe('ConfigSelector', () => {
  const configList = [
    {
      id: 'all',
      isPreset: true,
      label: 'openAll',
      values: {},
    },
    {
      id: 'defaultState',
      isPreset: true,
      label: 'presetFilter',
      values: {
        iteration: [123],
      },
    },
    {
      id: 'customFilter',
      isPreset: false,
      label: 'customFilter',
      values: {
        keyword: 'cloud',
      },
    },
  ];
  const setUp = (props: Partial<IProps>) => {
    const changeFn = jest.fn();
    const deleteFn = jest.fn();
    const result = render(
      <ConfigSelector isNew={false} list={configList} {...props} onChange={changeFn} onDeleteFilter={deleteFn} />,
    );
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(
        <ConfigSelector isNew={false} list={configList} {...n_props} onChange={changeFn} onDeleteFilter={deleteFn} />,
      );
    };
    return { result, rerender, changeFn, deleteFn };
  };
  it('should work well', async () => {
    const { result, rerender, changeFn, deleteFn } = setUp({ defaultValue: configList[1].id });
    expect(result.getByText(configList[0].label).nextSibling).toBeNull();
    expect(result.getByText(configList[1].label).nextSibling).toHaveTextContent('default');
    fireEvent.click(result.getByText(configList[1].label).closest('.filter-config-selector-item')!);
    expect(changeFn).toHaveBeenLastCalledWith(configList[1]);
    rerender({
      defaultValue: configList[1].id,
      value: configList[1].id,
    });
    expect(result.queryByText('changed')).toBeNull();
    rerender({
      isNew: true,
      defaultValue: configList[1].id,
      value: configList[1].id,
    });
    expect(result.queryByText('changed')).not.toBeNull();
    fireEvent.click(result.container.querySelector('[name="gengduo"]')!);
    fireEvent.click(result.container.querySelector('[name="gengduo"]')?.parentNode!);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.click(result.getByText('Delete'));
    await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(result.getByText('OK'));
    expect(deleteFn).toHaveBeenLastCalledWith(configList[2]);
  });
  it('should render well with isNew', () => {
    const { result } = setUp({ isNew: true });
    expect(result.queryByText('changed')).not.toBeNull();
    expect(result.getByText('changed').closest('.filter-config-selector-item')?.innerHTML).toContain(
      configList[0].label,
    );
  });
});
