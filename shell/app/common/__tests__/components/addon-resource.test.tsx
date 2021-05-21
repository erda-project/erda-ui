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
import AddonResource from 'common/components/addon-resource';
import { mount, shallow } from 'enzyme';
import { describe, it } from '@jest/globals';

describe('AddonResource', () => {
  it('resourceInfo is empty', () => {
    const wrapper = shallow(
      <AddonResource resourceInfo={{}} />
    );
    expect(wrapper).toBeEmptyRender();
  });
  it('resourceInfo is not empty', () => {
    const resourceInfo = {
      createdAt: '2021-04-24 12:12:12',
      reference: 'erda',
      workspace: 'STAGING',
      addonName: 'ERDA',
      plan: 'professional',
      cluster: 'erda cloud',
      version: '1.0.0',
    };
    const wrapper = mount(
      <AddonResource resourceInfo={resourceInfo} />
    );
    expect(wrapper.find('.info-key')).toHaveLength(7);
  });
});
