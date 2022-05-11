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
import { replaceWithLink } from 'common/utils/i18n-replace-link';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
describe('replaceWithLink', () => {
  it('replaceWithLink should work fine', () => {
    const href = 'www.test.com';

    const result = render(<>{replaceWithLink('click [here] to see details', href)}</>);
    expect(result.getByText('here')).toHaveAttribute('href', href);
  });
});
