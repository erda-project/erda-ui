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
import projectMemberStore from 'common/stores/project-member';
import orgMemberStore from 'common/stores/org-member';
import appMemberStore from 'common/stores/application-member';
import sysMemberStore from 'common/stores/sys-member';
import mspProjectMember from 'common/stores/msp-project-member';
import { MemberScope } from 'common/stores/member-scope';
import * as Services from 'common/services';
import { flushPromises } from 'test/utils';
import { AddMemberModal } from '../add-member-modal';

const storeMap = {
  [MemberScope.PROJECT]: projectMemberStore,
  [MemberScope.ORG]: orgMemberStore,
  [MemberScope.APP]: appMemberStore,
  [MemberScope.SYS]: sysMemberStore,
  [MemberScope.MSP]: mspProjectMember,
};
type IProps = Parameters<typeof AddMemberModal>[0];

const scope = {
  id: '123',
  type: MemberScope.PROJECT,
};

const roleMap = {
  Owner: 'Owner',
  Lead: 'Lead',
  PM: 'PM',
  PD: 'PD',
};

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

const queryParams = {
  org: 'erda',
};

const data = {
  total: 100,
  list: [
    {
      id: 1,
      name: 'erda-ui',
      displayName: 'erda-ui',
      userId: '1',
      key: '1',
      memberRoles: null,
    },
  ],
};
const roleList = ['Manager', 'Dev', 'Ops', 'Reporter'];
const roleListData = {
  list: roleList.map((role) => ({
    role,
    name: role.toUpperCase(),
  })),
  total: 9,
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

jest.mock('common/components/member-selector', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  const MemberSelector = () => {
    return <div className="mock-member-selector">mock-member-selector</div>;
  };
  MemberSelector.Add = (props) => {
    return <input {...props} data-id="mock-member-selector-add" type="text" />;
  };
  return MemberSelector;
});

describe('AddMemberModal', () => {
  const originMethodMap = {};
  Object.keys(storeMap).forEach((storeName) => {
    originMethodMap[storeName] ||= {};
    originMethodMap[storeName].addMembers = storeMap[storeName].effects.addMembers;
    originMethodMap[storeName].updateMembers = storeMap[storeName].effects.updateMembers;
  });
  afterAll(() => {
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].effects.addMembers = originMethodMap[storeName].addMembers;
      storeMap[storeName].effects.updateMembers = originMethodMap[storeName].updateMembers;
    });
    jest.resetAllMocks();
  });
  const setUp = (props?: Partial<IProps>) => {
    const closeFn = jest.fn();
    const Comp = (c_props: Partial<IProps>) => {
      const [visible, setVisible] = React.useState(false);
      return (
        <div>
          <div
            onClick={() => {
              setVisible(true);
            }}
          >
            openModal
          </div>
          <AddMemberModal
            hasConfigAppAuth
            scope={scope}
            {...c_props}
            roleMap={roleMap}
            memberLabels={memberLabels}
            queryParams={queryParams}
            visible={visible}
            toggleModal={() => {
              closeFn();
              setVisible(false);
            }}
          />
        </div>
      );
    };
    const result = render(<Comp {...props} />);
    const rerender = (n_props: Partial<IProps>) => {
      result.rerender(<Comp {...n_props} />);
    };
    const openModal = async () => {
      fireEvent.click(result.getByText('openModal'));
      await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
      await waitFor(() => expect(result.getByRole('dialog')).not.toHaveStyle({ display: 'none' }));
    };
    const closeModal = () => {
      fireEvent.click(result.getByText('Cancel'));
    };
    const submit = () => {
      fireEvent.click(result.getByText('Ok'));
    };
    return {
      result,
      closeFn,
      rerender,
      openModal,
      closeModal,
      submit,
    };
  };
  it('should work well', async () => {
    const getApps = jest.fn().mockResolvedValue({
      success: true,
      data,
    });
    const getRoleMap = jest.fn().mockResolvedValue({
      success: true,
      data: roleListData,
    });
    Object.defineProperty(Services, 'getApps', {
      value: getApps,
    });
    Object.defineProperty(Services, 'getRoleMap', {
      value: getRoleMap,
    });
    const addMembers = jest.fn().mockResolvedValue({});
    const updateMembers = jest.fn();
    Object.keys(storeMap).forEach((storeName) => {
      storeMap[storeName].effects.addMembers = addMembers;
      storeMap[storeName].effects.updateMembers = updateMembers;
    });
    const { result, openModal, rerender, submit, closeFn, closeModal } = setUp();
    await openModal();
    expect(result.baseElement.querySelector('#userIds')).toHaveAttribute('mode', 'multiple');
    expect(result.baseElement.querySelector('#userIds')).toHaveAttribute('scopetype', MemberScope.PROJECT);
    expect(result.baseElement).isExist('.ant-form-item', 5);
    fireEvent.click(result.baseElement.querySelector('.results')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    expect(getApps).toHaveBeenCalled();
    fireEvent.change(result.baseElement.querySelector('#userIds')!, { target: { value: 'erda' } });
    fireEvent.mouseDown(result.baseElement.querySelector('#roles')!.closest('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('PM'));
    submit();
    await flushPromises();
    expect(updateMembers).not.toBeCalled();
    await openModal();
    fireEvent.change(result.baseElement.querySelector('#userIds')!, { target: { value: 'erda' } });
    fireEvent.mouseDown(result.baseElement.querySelector('#roles')!.closest('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 1));
    fireEvent.click(result.getByText('PM'));
    // select Application
    fireEvent.click(result.baseElement.querySelector('.results')!);
    await waitFor(() => expect(result.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(result.getByRole('checkbox'));
    fireEvent.change(result.getByRole('checkbox'), { target: { checked: true } });
    submit();
    await flushPromises();
    expect(updateMembers).not.toBeCalled();
    fireEvent.mouseDown(result.baseElement.querySelector('#app_roles')!.closest('.ant-select-selector')!);
    await waitFor(() => expect(result.baseElement).isExist('.ant-select-dropdown', 2));
    fireEvent.click(result.getByText('REPORTER'));
    submit();
    await flushPromises();
    expect(updateMembers).toBeCalled();
    await openModal();
    rerender({ scope: { ...scope, type: MemberScope.ORG } });
    expect(result.baseElement).isExist('.ant-form-item', 3);
    expect(result.baseElement.querySelector('#userIds')).toHaveAttribute('scopetype', MemberScope.ORG);
    rerender({ scope: { ...scope, type: MemberScope.APP } });
    expect(result.baseElement).isExist('.ant-form-item', 2);
    expect(result.baseElement.querySelector('#userIds')).toHaveAttribute('scopetype', MemberScope.APP);
    closeFn.mockReset();
    closeModal();
    expect(closeFn).toHaveBeenCalled();
  });
});
