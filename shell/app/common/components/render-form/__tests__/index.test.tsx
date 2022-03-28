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
import { render } from '@testing-library/react';
import RenderForm from '..';

describe('RenderForm', () => {
  it('should be defined', () => {
    expect(RenderForm).toBeDefined();
  });
  it('should work well', () => {
    const list = [
      {
        type: 'input',
        label: 'NAME',
        name: 'name',
      },
    ];
    let formRef;
    const Comp = () => {
      const form = React.useRef(null);
      formRef = form;
      return <RenderForm list={list} ref={form} />;
    };
    render(<Comp />);
    expect(formRef).not.toBeNull();
  });
});
