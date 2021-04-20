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
