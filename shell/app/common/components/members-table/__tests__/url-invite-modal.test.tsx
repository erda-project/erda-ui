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
import UrlInviteModal from '../url-invite-modal';
import { fireEvent, render, screen } from '@testing-library/react';

describe('UrlInviteModal', () => {
  it('should work well', () => {
    const onCancelFn = jest.fn();
    const url = 'https:www.erda.cloud';
    const code = 'erda';
    const wrapper = render(<UrlInviteModal visible onCancel={onCancelFn} code={code} tip="tips" url={url} />);
    expect(wrapper.baseElement.querySelector('.ant-modal-title')?.innerHTML).toBe(
      'The invitation link and verification code have been created',
    );
    expect(wrapper.baseElement.querySelector('.cursor-copy')?.getAttribute('data-clipboard-tip')).toBe(
      'invitation link and verification code',
    );
    wrapper.rerender(<UrlInviteModal visible onCancel={onCancelFn} tip="tips" url={url} />);
    expect(wrapper.baseElement.querySelector('.ant-modal-title')?.innerHTML).toBe(
      'The invitation link has been created.',
    );
    expect(wrapper.baseElement.querySelector('.cursor-copy')?.getAttribute('data-clipboard-tip')).toBe(
      'invitation link',
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onCancelFn).toHaveBeenCalled();
  });
});
