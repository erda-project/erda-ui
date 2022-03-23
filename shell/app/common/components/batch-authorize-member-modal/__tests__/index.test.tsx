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
import appMemberStore from 'common/stores/application-member';
import * as Services from 'common/services';
import BatchAuthorizeMemberModal from '..';

const roleMap = {
  dev: 'DEV',
  pm: 'PM',
};

const data = {
  total: 100,
  list: [
    {
      id: 1,
      name: 'erda-ui',
      userId: '1',
      key: '1',
      memberRoles: 'DEV',
    },
  ],
};

describe('BatchAuthorizeMemberModal', () => {
  beforeAll(() => {
    jest.mock('common/stores/application-member');
    jest.mock('common/services');
    appMemberStore.useStore = (fn) => {
      return fn({ roleMap });
    };
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well', () => {
    const getApps = jest.fn().mockResolvedValue({
      success: true,
      data,
    });
    Object.defineProperty(Services, 'getApps', {
      value: getApps,
    });
    const getRoleMapFn = jest.fn();
    appMemberStore.effects.getRoleMap = getRoleMapFn;
    const result = render(<BatchAuthorizeMemberModal projectId="1" visible />);
    expect(getRoleMapFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.baseElement.querySelector('.results')!);
    expect(getApps).toHaveBeenCalled();
  });
});
