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
import { Avatar } from 'common';
import { render, screen, waitFor } from '@testing-library/react';
import userStore from 'user/stores';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

const loginUser: ILoginUser = {
  id: '123456',
  name: 'dice',
  nick: 'dice-jest',
  avatar: '//terminus-paas.oss-cn-hangzhou.aliyuncs.com/uc/2017/08/04/f1d1edb4-a841-4b1b-bf68-3f5c6f6fcf17.jpeg',
  phone: '131098871132',
  email: 'dice@alibaba-inc.com',
  token: 'abc-123',
  orgId: 2,
  orgDisplayName: 'erda',
  orgName: 'erda',
  orgPublisherAuth: false,
  orgPublisherId: 12,
  isSysAdmin: false,
};

describe('Avatar', () => {
  userStore.reducers.setLoginUser(loginUser);
  const sizeResult = (size = 24) => ({ height: `${size}px`, width: `${size}px` });
  const url = 'i am img url';
  it('should support showName ', () => {
    render(<Avatar className="avatar-comp" showName name={loginUser.name} />);
    userEvent.hover(screen.getByText(loginUser.name));
    waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(loginUser.nick);
    });
  });
  it('should support useLoginUser ', () => {
    const result = render(<Avatar className="avatar-comp" showName="tooltip" name={loginUser.name} url={url} />);
    let img: HTMLImageElement = screen.getByAltText('user-avatar');
    expect(img.src).toContain(encodeURIComponent(url));
    userEvent.hover(img);
    waitFor(() => {
      expect(screen.getByRole('tooltip').innerHTML).toBe(loginUser.nick);
    });
    result.rerender(<Avatar className="avatar-comp" showName="tooltip" name={loginUser.name} url={url} useLoginUser />);
    img = screen.getByAltText('user-avatar');
    expect(img.src).toContain(decodeURIComponent(loginUser.avatar));
  });
  it('should support wrapClassName ', () => {
    const result = render(
      <Avatar className="avatar-comp" showName name={loginUser.name} wrapClassName={'wrapClassName'} />,
    );
    expect(result.container.querySelectorAll('.wrapClassName').length).toBe(1);
    result.rerender(
      <Avatar className="avatar-comp" name={loginUser.name} wrapClassName={'wrapClassName'} />,
    )
    // dice-avatar
    expect(result.container.querySelectorAll('.dice-avatar').length).toBe(1);
  });
  it('should support size ', () => {
    const result = render(<Avatar className="avatar-comp" showName name={loginUser.name} />);
    expect(result.container.querySelector('.dice-avatar')).toHaveStyle(sizeResult(24));
    result.rerender(<Avatar className="avatar-comp" size={100} showName name={loginUser.name} />);
    expect(result.container.querySelector('.dice-avatar')).toHaveStyle(sizeResult(100));
  });
});
