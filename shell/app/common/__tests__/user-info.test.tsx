// Copyright (c) 2021 Terminus, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import UserInfo from '../components/user-info';
import { shallow } from 'enzyme';
import { describe, it } from '@jest/globals';

describe('user-info', () => {
  it('fullData', () => {
    const wrapper = shallow(
      <UserInfo id={1} />
    );
    expect(wrapper.text()).toEqual('nick-dice');
  });
  it('onlyName', () => {
    const wrapper = shallow(
      <UserInfo id={2} />
    );
    expect(wrapper.text()).toEqual('name-dice');
  });
  it('onlyNick', () => {
    const wrapper = shallow(
      <UserInfo
        id={3}
        render={(data, id) => {
          return (
            <div className="render-comp">{data.name}{data.nick}-{id}</div>
          );
        }}
      />
    );
    expect(wrapper.find('.render-comp').length).toEqual(1);
  });
  it('noData', () => {
    const wrapper = shallow(
      <UserInfo id={4} />
    );
    expect(wrapper.text()).toEqual('4');
  });
});
