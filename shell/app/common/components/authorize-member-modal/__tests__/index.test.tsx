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
import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import routeInfoStore from 'core/stores/route';
import appMemberStore from 'common/stores/application-member';
import orgMemberStore from 'common/stores/org-member';
import { getAppList } from 'common/services';
import { flushPromises, sleep } from 'test/utils';
import AuthorizeMemberModal from '..';

const data = {
  total: 100,
  list: [
    {
      id: 1,
      name: 'erda-ui',
      userId: '1',
      key: '1',
      memberRoles: null,
    },
    {
      id: 2,
      name: 'erda',
      userId: '1',
      key: '2',
      memberRoles: ['DEV'],
    },
    {
      id: 3,
      name: 'erda-core',
      userId: '1',
      key: '3',
      memberRoles: ['LEAD'],
    },
  ],
};

const roleMap = {
  dev: 'DEV',
  pm: 'PM',
  Lead: 'LEAD',
};

jest.mock('axios', () =>
  jest.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        success: true,
        data,
      },
    }),
  ),
);
describe('AuthorizeMemberModal', () => {
  beforeAll(() => {
    jest.mock('common/stores/org-member');
    jest.mock('common/stores/application-member');
    jest.mock('common/services');
    jest.mock('core/stores/route');
    routeInfoStore.getState = (fn) => {
      return fn({
        params: {
          projectId: 1,
        },
      });
    };
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well', async () => {
    const spyOnGetAppList = jest.spyOn(getAppList, 'fetch');
    const closeModalFn = jest.fn();
    const updateMembersFn = jest.fn().mockResolvedValue({});
    const removeMemberFn = jest.fn().mockResolvedValue({});
    const getRoleMapFn = jest.fn();
    appMemberStore.useStore = (fn) => {
      return fn({ roleMap });
    };
    appMemberStore.effects.getRoleMap = getRoleMapFn;
    orgMemberStore.effects.updateMembers = updateMembersFn;
    orgMemberStore.effects.removeMember = removeMemberFn;
    let result: RenderResult;
    await act(async () => {
      result = render(<AuthorizeMemberModal type={'org'} closeModal={closeModalFn} member={{ userId: 'erda-1' }} />);
      expect(result.queryByRole('dialog')).toBeNull();
      await flushPromises();
      await sleep(1000);
      expect(spyOnGetAppList).toHaveBeenCalledTimes(1);
      spyOnGetAppList.mockReset();
      expect(result.queryByRole('dialog')).not.toBeNull();
    });
    expect(getRoleMapFn).toHaveBeenLastCalledWith({ scopeType: 'app' });
    await act(async () => {
      fireEvent.click(result.baseElement.querySelector('.ant-select-selection-item-remove')!.querySelector('span')!);
      await flushPromises();
    });
    expect(removeMemberFn).toHaveBeenCalled();
    expect(spyOnGetAppList).toHaveBeenCalledTimes(1);
    spyOnGetAppList.mockReset();
    // add new role
    fireEvent.mouseDown(result!.getByText(roleMap.Lead));
    await waitFor(() => expect(result.queryByRole('listbox')).toBeTruthy());
    await act(async () => {
      fireEvent.click(result!.getByText('PM'));
      await flushPromises();
    });
    expect(updateMembersFn).toHaveBeenCalled();
    expect(spyOnGetAppList).toHaveBeenCalledTimes(1);
    spyOnGetAppList.mockReset();
    fireEvent.click(result!.getByLabelText('right'));
    expect(spyOnGetAppList).toHaveBeenCalledTimes(1);
    spyOnGetAppList.mockReset();
    fireEvent.change(result!.getByPlaceholderText('search by application name'), { target: { value: 'erda' } });
    fireEvent.click(result!.getByLabelText('search'));
    expect(spyOnGetAppList).toHaveBeenCalledTimes(1);
    const { q, pageNo } = spyOnGetAppList.mock.calls[0][0];
    expect({ q, pageNo }).toStrictEqual({ pageNo: 1, q: 'erda' });
  });
});
