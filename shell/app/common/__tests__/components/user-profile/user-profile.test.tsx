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
import { UserProfile } from 'common';
import { shallow } from 'enzyme';

const loginUser = {
  id: '123456',
  name: 'dice',
  avatar: '//terminus-paas.oss-cn-hangzhou.aliyuncs.com/uc/2017/08/04/f1d1edb4-a841-4b1b-bf68-3f5c6f6fcf17.jpeg',
  phone: '131098871132',
  email: 'dice@alibaba-inc.com',
  lastLoginTime: '2020-12-12 10:00:00',
};

describe('UserProfile', () => {
  it('should support showName ', () => {
    const wrapper = shallow(<UserProfile data={loginUser} />);
    expect(wrapper.find('.erda-user-profile')).toExist();
    expect(wrapper.find({ alt: 'user-avatar' }).prop('src')).toContain(loginUser.avatar);
    // TODO: add more
  });
});
