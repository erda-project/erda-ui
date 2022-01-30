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
import MenuPopover from '..';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('MenuPopover', () => {
  it('should ', async () => {
    const renderContent = (setVisible: Function) => {
      return (
        <div
          className="child-node"
          onClick={() => {
            setVisible(false);
          }}
        >
          child-node
        </div>
      );
    };
    const wrapper = render(<MenuPopover content={renderContent} />);
    fireEvent.click(wrapper.container.querySelector('iconpark-icon')!);
    wrapper.container.querySelector('.child-node');
    await waitFor(() => expect(wrapper.queryByText('child-node')).toBeInTheDocument());
  });
});
