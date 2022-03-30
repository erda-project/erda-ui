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
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemberScope } from 'common/stores/member-scope';
import projectMemberStore from 'common/stores/project-member';
import orgMemberStore from 'common/stores/org-member';
import appMemberStore from 'common/stores/application-member';
import sysMemberStore from 'common/stores/sys-member';
import mspProjectMember from 'common/stores/msp-project-member';
import * as Services from 'common/services';
import { getDefaultPaging } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import userStore from 'user/stores';
import routeInfoStore from 'core/stores/route';
import _ from 'lodash';
import { flushPromises } from 'test/utils';
import MemberSelector from '..';

type IProps = Omit<Parameters<typeof MemberSelector>[0], 'ref'>;
type IServiceName = keyof typeof Services;
const listRole = {
  list: [
    {
      role: 'Owner',
      name: 'Owner',
    },
    {
      role: 'Lead',
      name: 'Lead',
    },
    {
      role: 'Dev',
      name: 'Dev',
    },
    {
      role: 'QA',
      name: 'QA',
    },
  ],
  total: 5,
};
const roleMap = {
  Owner: 'Owner',
  Lead: 'Lead',
  Dev: 'Dev',
  QA: 'QA',
};

const currentOrg = {
  id: '27',
  creator: '12345t',
  desc: '',
  logo: '',
  name: 'cdp',
  displayName: 'dice-dev-pro',
  locale: '',
  isPublic: true,
  enableReleaseCrossCluster: false,
  selected: false,
  operation: '',
  status: '',
  type: 'FREE',
  publisherId: 0,
  domain: 'cdp-org.dev.terminus.io',
  version: 0,
  createdAt: '2021-06-21T09:43:02+08:00',
  updatedAt: '2021-06-21T09:43:02+08:00',
};

const loginUser = {
  id: '12345',
  email: '',
  nick: 'erda',
  name: 'ERDA',
  phone: '',
  avatar: 'https://uc.daily.terminus.io/3374d784-dcb3-49a2-8f56-a49dedacfaaf.png',
  token: 'abc',
  isSysAdmin: false,
};

const ucUser = {
  users: [
    {
      id: '12345',
      nick: 'erda',
      name: 'ERDA',
      avatar: 'https://uc.daily.terminus.io/3374d784-dcb3-49a2-8f56-a49dedacfaaf.png',
      phone: '',
      email: '',
      token: '',
      lastLoginAt: '',
      pwdExpireAt: '',
      source: '',
    },
    {
      id: '23456',
      name: 'erda-api-exec',
      nick: 'erda-api-exec',
      avatar: 'https://uc.hkci.terminus.io/bb6f18fd-d36f-4cc8-90b8-3b758e78f7d5.jpg',
      phone: '',
      email: '',
      token: '',
      lastLoginAt: '',
      pwdExpireAt: '',
      source: '',
    },
    {
      userId: '34567',
      name: 'ErdaDemo',
      nick: '',
      avatar: '',
      phone: '',
      email: '',
      token: '',
      lastLoginAt: '',
      pwdExpireAt: '',
      source: '',
    },
  ],
};

const params = {
  orgName: 'erda',
  projectId: 1,
  terminusKey: 1,
};

describe('MemberSelector', () => {
  const originMethodMap = {};
  const storeMap = {
    [MemberScope.PROJECT]: projectMemberStore,
    [MemberScope.ORG]: orgMemberStore,
    [MemberScope.APP]: appMemberStore,
    [MemberScope.SYS]: sysMemberStore,
    [MemberScope.MSP]: mspProjectMember,
  };
  const mockServices: Partial<{ [key in IServiceName]: jest.Mock }> = {
    getRoleMap: jest.fn().mockResolvedValue({
      success: true,
      data: listRole,
    }),
    getUsersNew: jest.fn((res) => {
      return Promise.resolve({
        success: true,
        data: {
          users: ucUser.users.filter((item) => item.name.toLowerCase().includes((res.q || '').toLowerCase())),
        },
      });
    }),
    getPlatformUserList: jest.fn((res) => {
      return Promise.resolve({
        success: true,
        data: {
          total: 100,
          list: [
            {
              id: '12345',
              nick: 'erda',
              name: 'ERDA',
              avatar: 'https://uc.daily.terminus.io/3374d784-dcb3-49a2-8f56-a49dedacfaaf.png',
              phone: '',
              email: '',
              token: '',
              lastLoginAt: '2022-03-17 10:37:50',
              pwdExpireAt: '2023-06-17 00:00:00',
              source: '',
              locked: false,
            },
            {
              id: '23456',
              name: 'erda-api-exec',
              nick: 'erda-api-exec',
              avatar: 'https://uc.hkci.terminus.io/bb6f18fd-d36f-4cc8-90b8-3b758e78f7d5.jpg',
              phone: '',
              email: '',
              token: '',
              lastLoginAt: '2022-03-10 17:14:44',
              pwdExpireAt: '2023-06-10 00:00:00',
              source: '',
              locked: false,
            },
            {
              userId: '34567',
              name: 'ErdaDemo',
              nick: '',
              avatar: '',
              phone: '',
              email: '',
              token: '',
              lastLoginAt: '2022-03-30 15:15:37',
              pwdExpireAt: '2023-06-10 00:00:00',
              source: '',
              locked: false,
            },
          ],
        },
      });
    }),
    searchPlatformUserList: jest.fn((res) => {
      return Promise.resolve({
        success: true,
        data: {
          users: ucUser.users.filter((item) => item.name.toLowerCase().includes((res.q || '').toLowerCase())),
        },
      });
    }),
    getUsers: jest.fn((res) => {
      return Promise.resolve({
        success: true,
        data: {
          users: ucUser.users.filter((item) => item.id === res.userID),
        },
      });
    }),
    getMembers: jest.fn().mockResolvedValue({
      success: true,
      data: {
        total: 100,
        list: [
          {
            id: '12345',
            nick: 'erda',
            name: 'ERDA',
            avatar: 'https://uc.daily.terminus.io/3374d784-dcb3-49a2-8f56-a49dedacfaaf.png',
            token: 'abc',
            isSysAdmin: false,
            roles: ['DEV', 'Lead', 'QA'],
            labels: ['Outsource'],
          },
          {
            id: '23456',
            name: 'erda-api-exec',
            nick: 'erda-api-exec',
            avatar: 'https://uc.hkci.terminus.io/bb6f18fd-d36f-4cc8-90b8-3b758e78f7d5.jpg',
            phone: '',
            token: 'abc',
            isSysAdmin: false,
            roles: ['DEV', 'Owner'],
          },
        ],
      },
    }),
  };
  const setUp = (props: IProps, mode?: 'add' | 'default') => {
    const changeFn = jest.fn();
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].useStore = (fn) => fn({ list: [], roleMap, paging: getDefaultPaging({ total: 0 }) });
    });
    routeInfoStore.useStore = (fn) => fn({ params });
    orgStore.useStore = (fn) => fn({ currentOrg });
    userStore.useStore = (fn) => fn({ loginUser });
    userStore.getState = (fn) => fn({ loginUser });
    const Comp = (c_props: IProps) => {
      const ref = React.useRef();
      return <MemberSelector {...c_props} onChange={changeFn} ref={ref} />;
    };
    if (mode === 'add') {
      const result = render(<MemberSelector.Add onChange={changeFn} {...props} />);
      const rerender = (n_props: IProps) => {
        result.rerender(<MemberSelector.Add onChange={changeFn} {...n_props} />);
      };
      return {
        ...mockServices,
        result,
        rerender,
        changeFn,
      };
    }
    const result = render(<Comp {...props} />);
    const rerender = (n_props: IProps) => {
      result.rerender(<Comp {...n_props} />);
    };
    return {
      ...mockServices,
      result,
      rerender,
      changeFn,
    };
  };
  beforeAll(() => {
    Object.keys(storeMap).forEach((storeName) => {
      originMethodMap[storeName] ||= {};
      originMethodMap[storeName].useStore = storeMap[storeName].useStore;
    });
    Object.keys(mockServices).forEach((item) => {
      Object.defineProperty(Services, item, {
        value: mockServices[item],
      });
    });
    // @ts-ignore
    _.debounce = (fn: Function) => fn;
    // @ts-ignore
    _.throttle = (fn: Function) => fn;
  });
  afterAll(() => {
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].useStore = originMethodMap[storeName].useStore;
    });

    jest.resetAllMocks();
  });
  it('should work well with uc scope', async () => {
    const { result, getUsersNew, changeFn, rerender, getUsers } = setUp({ scopeType: 'uc' });
    expect(result.container).isExit('.ant-select', 1);
    rerender({ value: '12345', scopeType: 'uc' });
    expect(getUsers).toHaveBeenLastCalledWith({ userID: ['12345'] });
    await act(async () => {
      fireEvent.change(result.getByRole('combobox'), { target: { value: 'test' } });
      await flushPromises();
    });
    expect(getUsersNew).toHaveBeenLastCalledWith({ q: 'test', pageNo: 1, pageSize: 15 });
    expect(result.getByText('please confirm that the user is registered')).toBeTruthy();
    await act(async () => {
      fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
      fireEvent.focus(result.getByRole('combobox'));
      fireEvent.change(result.getByRole('combobox'), { target: { value: 'erda' } });
      await flushPromises();
    });
    expect(getUsersNew).toHaveBeenLastCalledWith({ q: 'erda', pageNo: 1, pageSize: 15 });
    fireEvent.mouseDown(result.container.querySelector('.ant-select-selector')!);
    fireEvent.focus(result.getByRole('combobox'));
    await waitFor(() => expect(result.baseElement).isExit('.ant-select-dropdown', 1));
    await waitFor(() =>
      expect(result.baseElement).not.isExitClass('.ant-select-dropdown', 'ant-select-dropdown-hidden'),
    );
    fireEvent.click(result.getByText('erda-api-exec'));
    expect(changeFn).toHaveBeenLastCalledWithNth(0, '23456');
    getUsers?.mockReset();
    rerender({ value: '23456', scopeType: 'uc' });
    expect(getUsers).not.toHaveBeenCalled();
  });
  it('should work well with project scope', async () => {
    const { result, getRoleMap, changeFn, rerender, getMembers } = setUp({
      scopeType: 'project',
      showSelfChosen: true,
      showRole: true,
      selectSelfInOption: true,
      selectNoneInOption: true,
    });
    await flushPromises();
    expect(getRoleMap).toHaveBeenLastCalledWith({ scopeId: params.projectId, scopeType: 'project' });
    fireEvent.click(result.getByText('choose self'));
    expect(changeFn).toHaveBeenCalled();
    changeFn.mockReset();
    fireEvent.click(result.baseElement.querySelector('.results')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    expect(getMembers).toHaveBeenCalled();
    fireEvent.click(result.getByText(/erda-api-exec/i).closest('.load-more-list-item')!);
    expect(changeFn).toHaveBeenLastCalledWithNth(0, '23456');
    fireEvent.click(result.getAllByText('choose self')[1]);
    expect(changeFn).toHaveBeenLastCalledWithNth(0, '12345');
    fireEvent.click(result.getByText('unspecified'));
    expect(changeFn).toHaveBeenLastCalledWithNth(0, 'unassigned');
  });
  it('should work well with sys scope', async () => {
    jest.useFakeTimers('legacy');
    const { result, changeFn, getPlatformUserList, searchPlatformUserList, rerender } = setUp({
      scopeType: 'sys',
    });
    await flushPromises();
    fireEvent.click(result.baseElement.querySelector('.results')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    expect(getPlatformUserList).toHaveBeenCalled();
    act(() => {
      fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
      jest.advanceTimersByTime(1000);
    });
    await flushPromises();
    expect(searchPlatformUserList).toHaveBeenCalled();
    rerender({
      scopeType: 'sys',
      mode: 'multiple',
      value: ['12345'],
      allowClear: true,
      selectNoneInOption: true,
    });
    fireEvent.click(result.getByLabelText('close'));
    expect(changeFn).toHaveBeenLastCalledWithNth(0, []);
    fireEvent.click(result.getByText('unspecified'));
    rerender({
      scopeType: 'sys',
      mode: 'multiple',
      value: ['unassigned'],
      allowClear: true,
      selectNoneInOption: true,
    });
    fireEvent.click(result.getAllByRole('checkbox')[1]);
    expect(changeFn).toHaveBeenLastCalledWithNth(0, ['23456']);
    jest.useRealTimers();
  });
  it('should work well with org or app scope', async () => {
    const { result, getMembers, rerender } = setUp({
      scopeType: 'org',
      type: 'Category',
    });
    rerender({
      scopeType: 'app',
      categorys: Object.keys(roleMap).map((item) => ({ label: item, value: item })),
    });
    fireEvent.click(result.baseElement.querySelector('.results')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    expect(getMembers).not.toHaveBeenCalled();
  });
  it('should MemberSelector.Add render well', () => {
    const { result, rerender } = setUp({ scopeType: 'org' }, 'add');
    expect(result.container).isExit('.ant-select', 1);
    rerender({ scopeType: 'app' });
    expect(result.container).isExit('.load-more-selector', 1);
  });
});
