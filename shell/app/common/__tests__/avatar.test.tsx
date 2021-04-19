import React from 'react';
import { Avatar, AvatarList } from '../components/avatar';
import { shallow } from 'enzyme';
import { describe, it } from '@jest/globals';
import userStore from 'user/stores';

const loginUser:ILoginUser = {
  id: '123456',
  name: 'dice',
  nick: 'dice-jest',
  avatar: '//terminus-paas.oss-cn-hangzhou.aliyuncs.com/uc/2017/08/04/f1d1edb4-a841-4b1b-bf68-3f5c6f6fcf17.jpeg',
  phone: '131098871132',
  email: 'dice@alibaba-inc.com',
  token: 'abc-123',
  orgId: 2,
  orgDisplayName: '端点科技',
  orgName: 'terminus',
  orgPublisherAuth: false,
  orgPublisherId: 12,
  isSysAdmin: false,
};

describe('Avatar', () => {
  userStore.reducers.setLoginUser(loginUser);
  const sizeResult = (size = 24) => ({ height: `${size}px`, width: `${size}px` });
  const url = 'i am img url';
  it('should support showName ', () => {
    const wrapper = shallow(
      <Avatar
        className="avatar-comp"
        showName
        name={loginUser.name}
      />
    );
    expect(wrapper.find('.avatar-comp')).toExist();
    expect(wrapper.find('Tooltip').find('span').text()).toBe(loginUser.name);
    expect(wrapper.find({ alt: 'user-avatar' })).not.toExist();
    wrapper.setProps({ showName: false });
    expect(wrapper.find('Tooltip')).not.toExist();
    expect(wrapper.find({ color: true }).prop('type')).toContain('head');
    wrapper.setProps({ showName: 'tooltip' });
    expect(wrapper.find('Tooltip')).toExist();
    expect(wrapper.find({ color: true }).prop('type')).toContain('head');
  });
  it('should support useLoginUser ', () => {
    const wrapper = shallow(
      <Avatar
        className="avatar-comp"
        showName
        name={loginUser.name}
        url={url}
      />
    );
    expect(wrapper.find('span').at(1).text()).toBe(loginUser.name);
    expect(wrapper.find({ alt: 'user-avatar' }).prop('src')).toContain(url);
    wrapper.setProps({ useLoginUser: true });
    expect(wrapper.find('span').at(1).text()).toBe(loginUser.nick);
    expect(wrapper.find({ alt: 'user-avatar' }).prop('src')).toContain(loginUser.avatar);
  });
  it('should support wrapClassName ', () => {
    const wrapper = shallow(
      <Avatar
        className="avatar-comp"
        showName
        name={loginUser.name}
        wrapClassName={'wrapClassName'}
      />
    );
    expect(wrapper.find('.wrapClassName')).toExist();
  });
  it('should support size ', () => {
    const wrapper = shallow(
      <Avatar
        className="avatar-comp"
        showName
        name={loginUser.name}
      />
    );
    expect(wrapper.find('.dice-avatar').prop('style')).toStrictEqual(sizeResult(24));
    wrapper.setProps({ size: 100 });
    expect(wrapper.find('.dice-avatar').prop('style')).toStrictEqual(sizeResult(100));
  });
});
describe('AvatarList', () => {
  const names = ['A', 'B', 'C', 'D', 'E'];
  it('should ', () => {
    const wrapper = shallow(
      <AvatarList
        names={names}
        maxDisplay={3}
      />
    );
    expect(wrapper.find('Tooltip').children()).toHaveLength(4);
    expect(wrapper.find('Tooltip').children().last().text()).toBe('...');
    wrapper.setProps({ maxDisplay: 5 });
    expect(wrapper.find('Tooltip').children()).toHaveLength(names.length);
  });
});
