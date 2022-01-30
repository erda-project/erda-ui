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

import { mergeSearch, qs, setSearch, updateSearch } from 'common/utils';
import * as GoTo from 'common/utils/go-to';

describe('query-string', () => {
  beforeAll(() => {
    jest.mock('common/utils/go-to');
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('qs.parse', () => {
    expect(qs.parse(process.env.mock_search)).toEqual({ id: '1' });
    expect(qs.parse('ids[]=1&ids[]=2&ids[]=3', { arrayFormat: 'bracket' })).toEqual({ ids: ['1', '2', '3'] });
  });
  it('qs.parseUrl', () => {
    expect(qs.parseUrl(process.env.mock_href)).toEqual({
      query: { id: '1' },
      url: 'https://terminus-org.app.terminus.io/erda/dop/apps',
    });
  });
  it('qs.stringify', () => {
    expect(qs.stringify({ id: '1' })).toEqual('id=1');
    expect(qs.stringify({ ids: ['1', '2', '3'] }, { arrayFormat: 'bracket' })).toEqual('ids[]=1&ids[]=2&ids[]=3');
  });
  it('qs.extract', () => {
    expect(qs.extract(process.env.mock_href)).toEqual('id=1');
  });
  it('mergeSearch', () => {
    expect(mergeSearch({ orgName: 'erda' })).toEqual({ id: '1', orgName: 'erda' });
    expect(mergeSearch({ orgName: 'erda' }, true)).toBe('id=1&orgName=erda');
    expect(mergeSearch({ orgName: 'erda' }, true, true)).toBe('orgName=erda');
    expect(mergeSearch({ orgName: 'erda' }, false, true)).toEqual({ orgName: 'erda' });
  });
  it('updateSearch', () => {
    const goTo = jest.fn();
    Object.defineProperty(GoTo, 'goTo', {
      value: goTo,
    });
    updateSearch({ orgName: 'erda' });
    expect(goTo).toHaveBeenCalled();
  });
  it('setSearch', () => {
    const goTo = jest.fn();
    Object.defineProperty(GoTo, 'goTo', {
      value: goTo,
    });
    setSearch({ orgName: 'erda' }, [], true);
    expect(goTo).toHaveBeenLastCalledWith(`${process.env.mock_pathname}?orgName=erda`, { replace: true });
  });
});
