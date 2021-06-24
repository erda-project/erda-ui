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

import { apiCreator } from 'common';
import { describe, it, jest } from '@jest/globals';
import axios from 'axios';
import userStore from 'common/stores/user-map';
import { notification } from 'app/nusi';

const apiMap = {
  getClusterList: '/api/clusters',
  putDomainList: '/api/domains',
  postDomainList: '/api/domains',
  deleteDomainList: '/api/domains',
  queryDomainList: '/api/domains',
};

const userInfo = {
  2: {
    id: '2',
    name: 'dice',
    nick: 'dice',
    avatar: '',
    phone: '',
    email: 'dice@dice.terminus.io',
    token: '',
    lastLoginAt: '',
    pwdExpireAt: '',
    source: '',
  },
};

describe('apiCreator', () => {
  const apis = apiCreator(apiMap, 'domain-manage');
  it('should apiCreator', async () => {
    jest.mock('axios');
    const spySuccess = jest.spyOn(notification, 'success');
    const getFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        userInfo,
        data: {
          list: [],
          total: 0,
        },
      },
    });
    const postFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {},
      },
    });
    const deleteFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {},
      },
    });
    axios.get = getFn;
    axios.post = postFn;
    axios.delete = deleteFn;
    const res = await apis.getClusterList({
      pageNo: 1,
      $options: {
        successMsg: 'success',
      },
    });
    expect(res).toStrictEqual({
      list: [],
      total: 0,
      paging: { pageNo: 1, pageSize: 15, total: 0, hasMore: false },
    });
    expect(getFn).toHaveBeenCalledTimes(1);
    expect(userStore.getState((s) => s)).toStrictEqual(userInfo);
    expect(spySuccess).toHaveBeenCalledTimes(1);
    await apis.postDomainList({
      $options: {
        autoMessage: true,
      },
    });
    expect(postFn).toHaveBeenCalledTimes(1);
    expect(spySuccess).toHaveBeenCalledTimes(2);
    await apis.deleteDomainList({
      $options: {
        autoMessage: true,
      },
    });
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(spySuccess).toHaveBeenCalledTimes(3);
    spySuccess.mockReset();
    jest.resetAllMocks();
  });
  it('request error', async () => {
    jest.mock('axios');
    const spyError = jest.spyOn(notification, 'error');
    const getFn = jest.fn().mockResolvedValue({
      data: {
        success: false,
        userInfo,
        err: 'error',
      },
    });
    axios.get = getFn;
    await apis.getClusterList({});
    expect(spyError).toHaveBeenCalled();
    axios.get = jest.fn().mockRejectedValue({ err: 'error' });
    try {
      await apis.getClusterList({});
    } catch (e) {
      expect(e).toStrictEqual({ err: 'error' });
    }
    spyError.mockReset();
    jest.resetAllMocks();
  });
});
