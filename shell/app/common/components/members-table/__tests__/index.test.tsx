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
import '@testing-library/jest-dom';
import { MemberScope } from 'common/stores/member-scope';
import orgMemberStore from 'common/stores/org-member';
import _ from 'lodash';
import { message } from 'antd';
import orgStore from 'app/org-home/stores/org';
import userStore from 'app/user/stores';
import projectMemberStore from 'common/stores/project-member';
import appMemberStore from 'common/stores/application-member';
import sysMemberStore from 'common/stores/sys-member';
import mspProjectMember from 'common/stores/msp-project-member';
import * as Services from 'common/services';
import { flushPromises } from 'test/utils';
import { getDefaultPaging } from 'common/utils';
import userEvent from '@testing-library/user-event';
import routeInfoStore from 'core/stores/route';
import { setConfig } from 'core/config';
import MembersTable from '..';

type IProps = Parameters<typeof MembersTable>[0];

const memberLabels = [
  {
    label: 'Outsource',
    name: 'Outsource',
  },
  {
    label: 'Partner',
    name: 'Partner',
  },
];

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
  id: '12345t',
  email: '',
  nick: 'erda',
  name: 'ERDA',
  phone: '',
  avatar: '',
  token: 'abc',
  isSysAdmin: false,
};
const data = {
  total: 100,
  list: [
    {
      id: '12345t',
      email: '',
      nick: 'erda',
      name: 'ERDA',
      phone: '',
      avatar: '',
      token: 'abc',
      isSysAdmin: false,
      userId: '12345t',
      roles: ['DEV', 'Owner'],
    },
    {
      id: '12345d',
      email: '',
      name: 'Dice',
      phone: '',
      avatar: '',
      token: 'abc',
      isSysAdmin: false,
      userId: '12345d',
      roles: ['DEV', 'Lead', 'QA'],
      labels: ['Outsource'],
    },
  ],
};
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

jest.mock('common/components/add-member-modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const AddMemberModal = (props) => {
    return props.visible ? (
      <div className="mock-add-member-modal">
        <div onClick={props.toggleModal}>toggleModal</div>
      </div>
    ) : null;
  };
  return AddMemberModal;
});

jest.mock('common/components/batch-authorize-member-modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const BatchAuthorizeMemberModal = (props) => {
    return props.visible ? (
      <div className="mock-batch-authorize-member-modal">
        <div
          onClick={() => {
            props.onOk({ applications: [1, 2], roles: ['Owner'] });
          }}
        >
          onOk
        </div>
        <div onClick={props.onCancel}>onCancel</div>
      </div>
    ) : null;
  };
  return BatchAuthorizeMemberModal;
});
jest.mock('common/components/members-table/url-invite-modal.tsx', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const UrlInviteModal = (props) => {
    return props.visible ? (
      <div className="mock-url-invite-modal">
        <div onClick={props.onCancel}>onCancel</div>
      </div>
    ) : null;
  };
  return UrlInviteModal;
});

jest.mock('common/components/authorize-member-modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const AuthorizeMemberModal = (props) => {
    return props.member ? (
      <div className="mock-authorize-member-modal">
        <div onClick={props.closeModal}>closeModal</div>
      </div>
    ) : null;
  };
  return AuthorizeMemberModal;
});

describe('MembersTable', () => {
  const originMethodMap = {};
  const storeMap = {
    [MemberScope.PROJECT]: projectMemberStore,
    [MemberScope.ORG]: orgMemberStore,
    [MemberScope.APP]: appMemberStore,
    [MemberScope.SYS]: sysMemberStore,
    [MemberScope.MSP]: mspProjectMember,
  };
  const setUp = async (props?: Partial<IProps>) => {
    const cleanMembers = jest.fn();
    const removeMember = jest.fn().mockResolvedValue({});
    const getMembers = jest.fn();
    const genOrgInviteCode = jest.fn();
    const updateMembers = jest.fn();
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].reducers.cleanMembers = cleanMembers;
      storeMap[storeName].effects.removeMember = removeMember;
      storeMap[storeName].effects.getMemberList = getMembers;
      storeMap[storeName].effects.genOrgInviteCode = genOrgInviteCode;
      storeMap[storeName].effects.updateMembers = updateMembers;
      storeMap[storeName].useStore = (fn) =>
        fn({ list: data.list, roleMap, paging: getDefaultPaging({ total: data.total }) });
    });
    orgStore.useStore = (fn) => fn({ currentOrg });
    userStore.useStore = (fn) => fn({ loginUser });
    const mockServices = {
      getUsers: jest.fn().mockResolvedValue({
        success: true,
        data,
      }),
      getRoleMap: jest.fn().mockResolvedValue({
        success: true,
        data: listRole,
      }),
      getMemberLabels: jest.fn().mockResolvedValue({
        success: true,
        data: {
          list: memberLabels,
        },
      }),
    };
    Object.keys(mockServices).forEach((item) => {
      Object.defineProperty(Services, item, {
        value: mockServices[item],
      });
    });
    let result!: RenderResult;
    await act(async () => {
      result = render(
        <MembersTable
          showAuthorize
          scopeKey={MemberScope.ORG}
          overwriteAuth={{ showAuthorize: true, edit: true, delete: true, add: true }}
          {...props}
        />,
      );
    });
    const rerender = (n_props?: Partial<IProps>) => {
      result.rerender(
        <MembersTable
          showAuthorize
          scopeKey={MemberScope.ORG}
          overwriteAuth={{ showAuthorize: true, edit: true, delete: true, add: true }}
          {...n_props}
        />,
      );
    };
    return {
      cleanMembers,
      getMembers,
      ...mockServices,
      genOrgInviteCode,
      removeMember,
      rerender,
      result,
      updateMembers,
    };
  };
  beforeAll(() => {
    Object.keys(storeMap).forEach((storeName) => {
      originMethodMap[storeName] ||= {};
      originMethodMap[storeName].addMembers = storeMap[storeName].effects.addMembers;
      originMethodMap[storeName].updateMembers = storeMap[storeName].effects.updateMembers;
    });
    // @ts-ignore
    _.debounce = (fn: Function) => fn;
    // @ts-ignore
    _.throttle = (fn: Function) => fn;
  });
  afterAll(() => {
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].effects.addMembers = originMethodMap[storeName].addMembers;
      storeMap[storeName].effects.updateMembers = originMethodMap[storeName].updateMembers;
    });
    jest.resetAllMocks();
  });
  it('MembersTable should work well with orgScope', async () => {
    jest.useFakeTimers('legacy');
    const spyError = jest.spyOn(message, 'error');
    // jest.useFakeTimers();
    const {
      result,
      cleanMembers,
      getMembers,
      updateMembers,
      genOrgInviteCode,
      getMemberLabels,
      getRoleMap,
      removeMember,
    } = await setUp();
    expect(getMembers).toHaveBeenCalled();
    expect(getRoleMap).toHaveBeenCalled();
    expect(getMemberLabels).toHaveBeenCalled();
    fireEvent.click(result.container.querySelector('[name="config"]')!);
    await waitFor(() => expect(result.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.click(result.getByText('Email').parentNode?.querySelector('[type="checkbox"]')!);
    fireEvent.click(result.getByText('member label').parentNode?.querySelector('[type="checkbox"]')!);
    userEvent.hover(result.getByText('Outsource'));
    await waitFor(() => expect(result.getAllByText('Outsource')).toHaveLength(2));
    await act(async () => {
      fireEvent.click(result.container.querySelector('[name="right"]')!);
      await flushPromises();
    });
    expect(getMembers).toHaveBeenLastCalledWith({ pageNo: 2, pageSize: 10, scope: { id: '27', type: 'org' } });
    // add member
    fireEvent.click(result.getByText('Add-member'));
    expect(result.container).isExist('.mock-add-member-modal', 1);
    fireEvent.click(result.getByText('toggleModal'));
    expect(result.container).isExist('.mock-add-member-modal', 0);
    genOrgInviteCode.mockResolvedValue({ verifyCode: 'verifyCode' });
    // invite member
    await act(async () => {
      fireEvent.click(result.getByText('Invite'));
      await flushPromises();
    });
    expect(result.container).isExist('.mock-url-invite-modal', 1);
    fireEvent.click(result.getByText('onCancel'));
    expect(result.container).isExist('.mock-url-invite-modal', 0);
    genOrgInviteCode.mockResolvedValue({ verifyCode: undefined });
    fireEvent.click(result.getByText('Invite'));
    await flushPromises();
    expect(spyError).toHaveBeenLastCalledWith('cannot generate invitation code temporarily');
    // search
    fireEvent.change(result.getByPlaceholderText('Search by nickname, username, email or phone number'), {
      target: { value: 'erda' },
    });
    expect(getMembers).toHaveBeenLastCalledWith({
      pageNo: 1,
      pageSize: 10,
      scope: { id: '27', type: 'org' },
      roles: [undefined],
      q: 'erda',
      label: undefined,
    });
    // operation
    fireEvent.click(result.container.querySelector('[name="more"]')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(result.getByText('Exit').closest('li')!);
    await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(result.getByText('OK'));
    await flushPromises();
    expect(removeMember).toHaveBeenCalled();
    fireEvent.click(result.getByText('authorize').closest('li')!);
    expect(result.container).isExist('.mock-authorize-member-modal', 1);
    fireEvent.click(result.getByText('closeModal'));
    expect(result.container).isExist('.mock-authorize-member-modal', 0);
    fireEvent.click(result.getByText('Edit').closest('li')!);
    await act(async () => {
      jest.runAllTimers();
      fireEvent.click(result.getByText('OK'));
      await flushPromises();
    });
    expect(updateMembers).toHaveBeenCalled();
    result.unmount();
    expect(cleanMembers).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
    spyError.mockReset();
  });
  it('should batch operations work well', async () => {
    const { result, updateMembers, removeMember } = await setUp();
    userEvent.hover(result.getByText('Batch Operation'));
    await waitFor(() => expect(result.container).isExist('.dice-cp-table-batch-operations', 1));
    const selectAll = () => {
      const selectAllCheckbox = result.container.querySelector('.ant-table-selection [type="checkbox"]')!;
      fireEvent.click(selectAllCheckbox);
      fireEvent.change(selectAllCheckbox, { target: { checked: true } });
    };
    selectAll();
    fireEvent.click(result.getByText('Edit').closest('li')!);
    fireEvent.click(result.getByText('authorize').closest('li')!);
    expect(result.container).isExist('.mock-batch-authorize-member-modal', 1);
    fireEvent.click(result.getByText('onOk'));
    expect(updateMembers).toHaveBeenCalled();
    expect(result.container).isExist('.mock-batch-authorize-member-modal', 0);
    selectAll();
    fireEvent.click(result.getByText('authorize').closest('li')!);
    expect(result.container).isExist('.mock-batch-authorize-member-modal', 1);
    fireEvent.click(result.getByText('onCancel'));
    expect(result.container).isExist('.mock-batch-authorize-member-modal', 0);
    selectAll();
    fireEvent.click(result.getByText('Remove').closest('li')!);
    await waitFor(() => expect(result.getAllByRole('dialog')).toHaveLength(2));
    fireEvent.click(result.getAllByText('OK')[1]);
    await flushPromises();
    expect(removeMember).toHaveBeenCalled();
  });
  it.each([{ scope: MemberScope.APP }, { scope: MemberScope.PROJECT }, { scope: MemberScope.MSP }])(
    'should work well with $scope',
    async ({ scope }) => {
      const replaceFn = jest.fn();
      const pushFn = jest.fn();
      const browserHistory = {
        replace: replaceFn,
        push: pushFn,
      };
      setConfig('history', browserHistory);
      window.location.pathname = process.env.mock_pathname!;
      routeInfoStore.getState = (fn) =>
        fn({
          params: {
            orgName: 'erda',
            projectId: 1,
            appId: 1,
            terminusKey: 1,
          },
        });
      const { result, removeMember } = await setUp({ scopeKey: scope });
      fireEvent.click(result.container.querySelector('[name="more"]')!);
      await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
      fireEvent.click(result.getByText('Exit').closest('li')!);
      await waitFor(() => expect(result.getAllByRole('dialog')).toHaveLength(1));
      fireEvent.click(result.getByText('OK'));
      await flushPromises();
      expect(removeMember).toHaveBeenCalled();
      if (scope === MemberScope.MSP) {
        expect(pushFn).toHaveBeenCalled();
      } else {
        expect(replaceFn).toHaveBeenCalled();
      }
      setConfig('history', undefined);
    },
  );
  it('should work well without add', () => {
    const result = render(
      <MembersTable
        showAuthorize
        scopeKey={MemberScope.ORG}
        overwriteAuth={{ showAuthorize: true, edit: true, delete: true, add: false }}
      />,
    );
    expect(result.queryByText('Add')).toBeNull();
  });
});
