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
import '@testing-library/jest-dom';
import ErdaIcon, { ErdaIconProps, useErdaIcon } from '../../src/icon';

const TestIconComp = (props: ErdaIconProps<'green' | 'red'>) => {
  useErdaIcon({
    url: '//at.alicdn.com/t/font_500774_mn4zbo4c94.js',
    colors: {
      green: '#52C41A',
    },
  });

  return <ErdaIcon {...props} />;
};

describe('test Erda Icon', () => {
  it('render basic icon', () => {
    const { container } = render(<TestIconComp type="chinese" />);
    const iconDom = container.querySelector('.erda-icon > use');
    expect(iconDom?.getAttribute('xlink:href')?.includes('#icon-chinese')).toBeTruthy();
  });
  it('render predefine color icon', () => {
    const { container } = render(<TestIconComp type="aliyun" />);
    const iconDom = container.querySelector('.erda-icon > use');
    expect(iconDom?.getAttribute('xlink:href')?.includes('#icon-aliyun')).toBeTruthy();
  });
});
