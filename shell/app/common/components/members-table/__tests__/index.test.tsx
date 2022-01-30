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
import MembersTable from '../index';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { MemberScope } from 'common/stores/member-scope';
import memberLabelStore from 'common/stores/member-label';
import userStore from 'user/stores';
import orgStore from 'app/org-home/stores/org';
import orgMemberStore from 'common/stores/org-member';
import appMemberStore from 'common/stores/application-member';
import { getDefaultPaging } from 'common/utils';
import _ from 'lodash';
import { message } from 'antd';
import ErdaTable from 'common/components/table';
import FormModal from 'common/components/form-modal';
import BatchAuthorizeMemberModal from 'common/components/batch-authorize-member-modal';
import AuthorizeMemberModal from 'common/components/authorize-member-modal';
import AddMemberModal from 'common/components/add-member-modal';

jest.mock('common/components/table');
jest.mock('common/components/form-modal');
jest.mock('common/components/batch-authorize-member-modal');
jest.mock('common/components/authorize-member-modal');
jest.mock('common/components/add-member-modal');

const memberLabels = [
  {
    label: 'Outsource',
    name: '外包人员',
  },
  {
    label: 'Partner',
    name: '合作伙伴',
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

const list: IMember[] = [
  {
    id: '12345t',
    userId: '12345t',
    email: 'erda@erda.cloud',
    mobile: '123****5294',
    name: 'ERDA',
    nick: 'erda',
    avatar: '',
    status: '',
    scope: {
      type: 'org',
      id: '27',
    },
    roles: ['Lead'],
    labels: null,
    removed: false,
  },
  {
    id: '12345o',
    userId: '12345o',
    email: 'dice@erda.cloud',
    mobile: '124****5294',
    name: 'DICE',
    nick: 'dice',
    avatar: '',
    status: '',
    scope: {
      type: 'org',
      id: '27',
    },
    roles: ['Lead'],
    labels: null,
    removed: false,
  },
];

const roleMap = {
  Owner: 'Owner',
  Lead: 'Lead',
  PM: 'PM',
  PD: 'PD',
};

describe('MembersTable', () => {
  beforeAll(() => {
    jest.mock('common/stores/member-label');
    jest.mock('app/user/stores');
    jest.mock('app/org-home/stores/org');
    jest.mock('common/stores/org-member');
    jest.mock('common/stores/application-member');
    jest.mock('lodash');
    memberLabelStore.useStore = (fn) => fn({ memberLabels });
    orgStore.useStore = (fn) => fn({ currentOrg });
    userStore.useStore = (fn) => fn({ loginUser });
    orgMemberStore.useStore = (fn) => fn({ list, roleMap, paging: getDefaultPaging() });
    appMemberStore.effects.getRoleMap = jest.fn();
    _.debounce = (fn: Function) => fn;
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('MembersTable should work well', async () => {
    const spyError = jest.spyOn(message, 'error');
    jest.useFakeTimers();
    const getMemberLabels = jest.fn();
    const getRoleMap = jest.fn();
    const getMemberList = jest.fn();
    const cleanMembers = jest.fn();
    const updateMembers = jest.fn();
    const removeMember = jest.fn().mockResolvedValue();
    const genOrgInviteCode = jest.fn().mockResolvedValue({ verifyCode: 'verifyCode' });
    memberLabelStore.effects.getMemberLabels = getMemberLabels;
    orgMemberStore.effects.getRoleMap = getRoleMap;
    orgMemberStore.effects.updateMembers = updateMembers;
    orgMemberStore.effects.getMemberList = getMemberList;
    orgMemberStore.effects.removeMember = removeMember;
    orgMemberStore.effects.genOrgInviteCode = genOrgInviteCode;
    orgMemberStore.reducers.cleanMembers = cleanMembers;
    const paginationChange = jest.fn();
    const rowClassFn = jest.fn();
    let formModalProps: Record<string, any> = {};
    let addMemberProps: Record<string, any> = {};
    let tableActions: { render: (data: IMember) => Array<any> } = {
      render: () => [],
    };
    (ErdaTable as unknown as jest.MockInstance<any, any>).mockImplementation(
      ({ slot, pagination, rowClassName, ...rest }) => {
        paginationChange.mockImplementation(() => {
          pagination.onChange();
        });
        rowClassFn.mockImplementation(rowClassName);
        tableActions = rest.actions || {};
        return <div className="mock-erda-table">{slot}</div>;
      },
    );
    (FormModal.render as unknown as jest.MockInstance<any, any>).mockImplementation((props) => {
      formModalProps = props;
      return (
        <div className="mock-form-modal" id={props.title}>
          {props.visible}
        </div>
      );
    });
    (BatchAuthorizeMemberModal as unknown as jest.MockInstance<any, any>).mockImplementation((props) => {
      return (
        <div className="mock-batch-authorize-member-modal" id={props.title}>
          {props.visible}
        </div>
      );
    });
    (AuthorizeMemberModal as unknown as jest.MockInstance<any, any>).mockImplementation((props) => {
      return (
        <div className="mock-authorize-member-modal" id={props.title}>
          {props.visible}
        </div>
      );
    });
    (AddMemberModal as unknown as jest.MockInstance<any, any>).mockImplementation((props) => {
      addMemberProps = props;
      return (
        <div className="mock-add-member-modal" id={props.title}>
          {props.visible}
        </div>
      );
    });
    const wrapper = render(
      <MembersTable showAuthorize scopeKey={MemberScope.ORG} overwriteAuth={{ showAuthorize: true }} />,
    );
    expect(getMemberLabels).toHaveBeenLastCalledWith();
    expect(getRoleMap).toHaveBeenLastCalledWith({ scopeId: currentOrg.id, scopeType: 'org' });
    act(() => {
      paginationChange.getMockImplementation()?.();
      expect(rowClassFn.getMockImplementation()?.({ removed: true })).toBe('not-allowed');
      expect(rowClassFn.getMockImplementation()?.({ removed: false })).toBe('');
    });
    const actions = tableActions.render?.(list[0]);
    expect(wrapper.baseElement).toMatchSnapshot();
    const [edit, authorize, remove] = actions;
    act(() => {
      edit.onClick?.();
    });
    expect(formModalProps.visible).toBeTruthy();
    act(() => {
      formModalProps.onCancel();
    });
    expect(formModalProps.visible).toBeFalsy();
    act(() => {
      remove.onClick?.();
    });
    await waitFor(() => expect(wrapper.baseElement.querySelector('.ant-modal-confirm-confirm')).toBeInTheDocument());
    fireEvent.click(screen.getByText('OK'));
    expect(removeMember).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('add member'));
    expect(addMemberProps.visible).toBeTruthy();
    act(() => {
      addMemberProps.toggleModal();
    });
    expect(addMemberProps.visible).toBeFalsy();
    // expect(tableActions.length).toBe(1)
    // triggerDropdownSelect(wrapper, 'edit');
    // expect(wrapper.find({ title: 'batch set the role of member' })).toExist();
    // act(() => {
    //   wrapper
    //     .find('Table')
    //     .at(0)
    //     .prop('rowSelection')
    //     .onChange(list.map((t) => t.userId));
    // });
    // act(() => {
    //   wrapper.find({ title: 'batch set the role of member' }).at(0).prop('onOk')();
    // });
    // wrapper.update();
    // expect(updateMembers).toHaveBeenLastCalledWith(
    //   {
    //     scope: {
    //       id: '27',
    //       type: 'org',
    //     },
    //     userIds: ['12345t', '12345o'],
    //   },
    //   { isSelf: true, queryParams: {} },
    // );
    // expect(wrapper.find({ title: 'batch set the role of member' })).not.toExist();
    // triggerDropdownSelect(wrapper, 'authorize');
    // expect(wrapper.find('BatchAuthorizeMemberModal').prop('visible')).toBeTruthy();
    // act(() => {
    //   wrapper.find('BatchAuthorizeMemberModal').prop('onOk')({ applications: [1, 2], roles: ['PM', 'PD'] });
    // });
    // expect(updateMembers).toHaveBeenLastCalledWith({
    //   roles: ['PM', 'PD'],
    //   scope: { id: undefined, type: 'project' },
    //   targetScopeIds: [1, 2],
    //   targetScopeType: 'app',
    //   userIds: ['12345t', '12345o'],
    // });
    // triggerDropdownSelect(wrapper, 'remove');
    // jest.runAllTimers();
    // $$<HTMLButtonElement>('.ant-btn-primary')[2].click();
    // expect(removeMember).toHaveBeenCalledTimes(1);
    // act(() => {
    //   wrapper.find('FilterGroup').prop('onChange')({ query: 'erda-cloud', queryRole: 'admin', label: ['PM', 'PD'] });
    // });
    // triggerTableAction(wrapper, 0, 'edit');
    // act(() => {
    //   wrapper.find({ title: 'set the role of member erda' }).at(0).prop('onOk')();
    // });
    // expect(updateMembers).toHaveBeenLastCalledWith(
    //   {
    //     scope: {
    //       id: '27',
    //       type: 'org',
    //     },
    //     userIds: ['12345t'],
    //   },
    //   {
    //     isSelf: true,
    //     queryParams: {
    //       label: ['PM', 'PD'],
    //       pageNo: 1,
    //       q: 'erda-cloud',
    //       roles: ['admin'],
    //     },
    //   },
    // );
    // triggerTableAction(wrapper, 0, 'exit');
    // jest.runAllTimers();
    // $$<HTMLButtonElement>('.ant-btn-primary')[2].click();
    // expect(removeMember).toHaveBeenCalledTimes(2);
    // act(() => {
    //   wrapper.find('.members-list').find('Button').at(0).simulate('click');
    // });
    // wrapper.update();
    // expect(wrapper.find('AddMemberModal').prop('visible')).toBeTruthy();
    // act(() => {
    //   wrapper.find('AddMemberModal').prop('toggleModal')();
    // });
    // wrapper.update();
    // expect(wrapper.find('AddMemberModal').prop('visible')).toBeFalsy();
    // await act(async () => {
    //   await wrapper.find('.members-list').find('Button').at(1).simulate('click');
    // });
    // wrapper.update();
    // expect(genOrgInviteCode).toHaveBeenCalled();
    // expect(wrapper.find('UrlInviteModal').prop('visible')).toBeTruthy();
    // wrapper.find('UrlInviteModal').prop('onCancel')();
    // wrapper.update();
    // expect(wrapper.find('UrlInviteModal').prop('visible')).toBeFalsy();

    wrapper.unmount();
    expect(cleanMembers).toHaveBeenCalledTimes(1);
    spyError.mockReset();
  });
});
