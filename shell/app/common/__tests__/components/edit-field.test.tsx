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
import { EditField } from 'common';
import { mount, shallow } from 'enzyme';
import { describe, it, jest } from '@jest/globals';
import { Select } from 'app/nusi';
import i18n from 'i18n';
import moment from 'moment';
import { act } from 'react-dom/test-utils';

describe('EditField', () => {
  it('should render input type', () => {
    const suffix = <div className="suffix">suffix</div>;
    const changeCbFn = jest.fn();
    const changeFn = jest.fn();
    const wrapper = mount(
      <EditField
        name="name"
        label="name"
        type="input"
        labelStyle="desc"
        showRequiredMark
        itemProps={{
          onChange: changeFn,
        }}
        suffix={suffix}
        onChangeCb={changeCbFn}
        value="erda.cloud"
      />
    );
    expect(wrapper.find('.suffix')).toExist();
    expect(wrapper.find('.ant-form-item-required')).toExist();
    expect(wrapper.find('.color-text-sub')).toExist();
    expect(wrapper.find('input').prop('value')).toBe('erda.cloud');
    wrapper.setProps({
      labelStyle: undefined,
      showRequiredMark: false,
    });
    expect(wrapper.find('.ant-form-item-required')).not.toExist();
    expect(wrapper.find('.color-text')).toExist();
    wrapper.setProps({
      value: undefined,
      data: {
        name: 'erda',
      },
    });
    wrapper.update();
    expect(wrapper.find('input').prop('value')).toBe('erda');
    wrapper.find('input').simulate('change', { target: { value: 'erda cloud' } });
    expect(changeFn).toHaveBeenCalledTimes(1);
    wrapper.find('input').simulate('blur');
    expect(changeCbFn).toHaveBeenLastCalledWith({ name: 'erda cloud' });
  });
  it('should render select type', () => {
    const cls = 'select-item';
    const label = 'ID';
    const changeCbFn = jest.fn();
    const wrapper = shallow(
      <EditField
        name='id'
        label={label}
        type="select"
        onChangeCb={changeCbFn}
        disabled
        itemProps={{
          className: cls,
          options: <Select.Option value={1}>YES</Select.Option>,
        }}
      />
    );
    expect(wrapper.find('Option')).toHaveLength(1);
    expect(wrapper.find(`.${cls}`).prop('placeholder')).toBe(`${i18n.t('project:please set ')}${label}`);
    expect(wrapper.find(`.${cls}`).prop('disabled')).toBeTruthy();
    wrapper.setProps({
      disabled: false,
      itemProps: {
        className: cls,
        options: () => (
          <>
            <Select.Option value={1}>YES</Select.Option>
            <Select.Option value={0}>NO</Select.Option>
          </>
        ),
      },
    });
    expect(wrapper.find(`.${cls}`).prop('disabled')).toBeFalsy();
    expect(wrapper.find('Option')).toHaveLength(2);
    wrapper.find(`.${cls}`).prop('onChange')(1);
    wrapper.find(`.${cls}`).prop('onBlur')();
    expect(changeCbFn).toHaveBeenLastCalledWith({ id: 1 });
  });
  // TODO 2021/5/28 processing
  it.skip('should render markdown type', () => {
    const text = 'this is a piece of text';
    const wrapper = shallow(
      <EditField
        type="markdown"
        value={text}
        itemProps={{}}
      />
    );
  });
  it('should render datePicker type', () => {
    const curr = moment();
    const prev = curr.add(-1, 'days');
    const changeCbFn = jest.fn();
    const wrapper = mount(
      <EditField
        name="date"
        type="datePicker"
        value={curr}
        onChangeCb={changeCbFn}
        itemProps={{}}
      />
    );
    expect(wrapper.find('PickerWrapper').prop('value').isSame(curr, 'date')).toBeTruthy();
    act(() => {
      wrapper.find('PickerWrapper').prop('onChange')(prev);
      wrapper.find('PickerWrapper').prop('onBlur')();
    });
    expect(changeCbFn).toHaveBeenCalledTimes(1);
  });
  it('should render custom type', () => {
    const getComp = () => {
      return (
        <div className="custom-render">
          custom-render
        </div>
      );
    };
    const wrapper = shallow(
      <EditField
        name="tips"
        type="custom"
        getComp={getComp}
        itemProps={{}}
      />
    );
    expect(wrapper.find('.custom-render')).toExist();
  });
  it('should render readonly or last_readonly type', () => {
    const test = (type: 'readonly'|'last_readonly') => {
      const wrapper = mount(
        <EditField
          name="name"
          type={type}
          value="erda.cloud"
        />
      );
      expect(wrapper.find('.nowrap').text()).toBe('erda.cloud');
      wrapper.setProps({
        value: 'erda',
        valueRender: (v: string) => (<div className="value-render">{v}</div>),
      });
      expect(wrapper.find('.value-render').text()).toBe('erda');
    };
    test('readonly');
    test('last_readonly');
  });
  it('should render dateReadonly type', () => {
    const date = '2021-05-29';
    const wrapper = mount(
      <EditField
        name="date"
        type="dateReadonly"
        value={date}
        itemProps={{}}
      />
    );
    expect(wrapper.find('.prewrap').text()).toBe(date);
  });
});
