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
import { isPromise, isImage, removeProtocol, ossImg, uuid, isValidJsonStr, insertWhen,
  reorder, encodeHtmlTag, convertToFormData, getFileSuffix, filterOption, regRules,
  isClassComponent, countPagination, notify, equalByKeys, setApiWithOrg, sleep, getLabel,
} from 'common/utils';
import { describe, it, jest } from '@jest/globals';

class ClassComp extends React.Component {
  render() {
    return undefined;
  }
}
const FunComp = () => null;

describe('utils', () => {
  it('isImage ', () => {
    const suffixes = ['jpg', 'bmp', 'gif', 'png', 'jpeg', 'svg'];
    expect(isImage('images/a.doc')).toBe(false);
    suffixes.map((suffix) => {
      expect(isImage(`images/a.${suffix}`)).toBe(true);
      expect(isImage(`images/a.${suffix.toUpperCase()}`)).toBe(true);
    });
  });
  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({ then: null })).toBe(false);
    expect(isPromise([])).toBe(false);
    expect(isPromise(null)).toBe(false);
  });
  it('removeProtocol', () => {
    expect(removeProtocol('http://www.erda.cloud')).toBe('//www.erda.cloud');
    expect(removeProtocol('www.erda.cloud')).toBe('www.erda.cloud');
  });
  it('ossImg', () => {
    expect(ossImg()).toBeUndefined();
    expect(ossImg(null)).toBeUndefined();
    expect(ossImg('http://oss.erda.cloud')).toBe('//oss.erda.cloud?x-oss-process=image/resize,w_200,h_200');
    expect(ossImg('http://oss.erda.cloud', {
      op: 'op',
      h: 100,
      w: 100,
    })).toBe('//oss.erda.cloud?x-oss-process=image/op,h_100,w_100');
  });
  it('isValidJsonStr', () => {
    expect(isValidJsonStr('')).toBe(true);
    expect(isValidJsonStr('erda')).toBe(false);
    expect(isValidJsonStr('{"name":"erda"}')).toBe(true);
  });
  it('uuid', () => {
    expect(uuid()).toHaveLength(20);
    expect(uuid(0)).toHaveLength(36);
  });
  it('insertWhen', () => {
    expect(insertWhen(true, [1, 2, 3]).length).toBe(3);
    expect(insertWhen(false, [1, 2, 3]).length).toBe(0);
  });
  it('reorder', () => {
    expect(reorder([1, 2, 3], 0, 2)).toStrictEqual([2, 3, 1]);
  });
  it('encodeHtmlTag', () => {
    expect(encodeHtmlTag('<div>Erda Cloud</div>')).toBe('&lt;div&gt;Erda Cloud&lt;/div&gt;');
    expect(encodeHtmlTag('')).toBe('');
  });
  it('convertToFormData', () => {
    // jest.mock('FormData')
    const data = {
      name: 'ErdaCloud',
      id: 12,
    };
    const fData = new FormData();
    fData.append('name', data.name);
    fData.append('id', data.id);
    expect(convertToFormData(data)).toStrictEqual(fData);
  });
  it('getFileSuffix', () => {
    expect(getFileSuffix('')).toBe('');
    expect(getFileSuffix('erda.cloud')).toBe('cloud');
    expect(getFileSuffix('erda')).toBe('erda');
  });
  it('filterOption', () => {
    const data = {
      props: {
        children: 'Erda Cloud',
      },
    };
    expect(filterOption('erda', data)).toBe(true);
    expect(filterOption('dice', data)).toBe(false);
  });
  it('regRules', () => {
    expect(regRules.lenRange(1, 10).message).toBe('length is 1~10');
    expect(regRules.lenRange(1, 10).pattern.toString()).toBe('/^[\\s\\S]{1,10}$/');
  });
  it('isClassComponent', () => {
    expect(isClassComponent(ClassComp)).toBe(true);
    expect(isClassComponent(FunComp)).toBe(false);
  });
  it('countPagination', () => {
    const data = {
      pageSize: 10, total: 99, minus: 1, pageNo: 1,
    };
    expect(countPagination({ ...data })).toStrictEqual({ pageNo: 1, pageSize: 10 });
    expect(countPagination({ ...data, pageNo: 10, minus: 11 })).toStrictEqual({ pageNo: 9, pageSize: 10 });
  });
  it('notify', () => {
    notify('success', 'success info');
    expect(document.querySelectorAll('.ant-notification').length).toBe(1);
    expect(document.getElementsByClassName('ant-notification-notice-description')[0].innerHTML).toBe('success info');
  });
  it('should equalByKeys', () => {
    expect(equalByKeys({ a: 1, b: 2 }, { a: 1, b: 2 }, ['a', 'b'])).toBe(true);
    expect(equalByKeys({ a: 1, b: 1 }, { a: 1, b: 2 }, ['a', 'b'])).toBe(false);
  });
  it('setApiWithOrg should work fine', () => {
    expect(setApiWithOrg('/api/user')).toBe('/api/workBench/user');
    expect(setApiWithOrg('/common/user')).toBe('/common/user');
  });
  it('sleep should work fine', () => {
    jest.useFakeTimers();
    const flagTruthy = sleep(1000, 123, true);
    jest.advanceTimersByTime(1000);
    expect(flagTruthy).resolves.toBe(123);
    const flagFalsy = sleep(1000, 123, false);
    jest.advanceTimersByTime(1000);
    expect(flagFalsy).rejects.toBe(123);
  });
});
