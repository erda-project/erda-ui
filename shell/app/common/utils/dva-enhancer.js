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

// import { markReq } from 'agent';
import { notify } from 'common/utils';
import { set } from 'lodash';
import { PAGINATION } from 'app/constants';

const defaultPaging = {
  pageNo: 1,
  pageSize: PAGINATION.pageSize,
  total: 0,
};

const isProdEnv = process.env.NODE_ENV === 'production';
function prefixType(type, model) {
  const prefixedType = `${model.namespace}/${type}`;
  if (
    (model.reducers && model.reducers[prefixedType]) ||
    (model.effects && model.effects[prefixedType])
  ) {
    return prefixedType;
  }
  return type;
}

function createEffects(sagaEffects, model) {
  function put(type, payload) {
    let action = type;
    if (typeof action === 'string') {
      action = {
        type: action,
        payload,
      };
    }
    return sagaEffects.put({ ...action, type: prefixType(action.type, model) });
  }

  function update(payload) {
    return put('@@updateState', payload);
  }

  function* call(fn, payload, config = {}) {
    const { paging, successMsg, errorMsg, fullResult } = config;
    const pagingKey = paging && paging.key;
    // eslint-disable-next-line no-useless-catch
    try {
      // save as request key for later abort
      // markReq(prefixType(fn.name, model));
      let _payload = payload;
      if (pagingKey) {
        const pageNo = paging.pageNo || defaultPaging.pageNo;
        const pageSize = paging.pageSize || defaultPaging.pageSize;
        _payload = { pageNo, pageSize, ...payload };
      }
      const result = yield sagaEffects.call(fn, _payload);
      const keys = Object.keys(result || {});
      // 标准格式的返回结果
      if (keys.includes('success') && (keys.includes('err') || keys.includes('data') || keys.includes('result'))) {
        const { success, data, err, userInfo, result: realResult = null } = result;
        const returnResult = data || realResult;
        set(result, 'data', returnResult);
        set(result, 'result', returnResult);
        if (userInfo) {
          yield put({
            type: 'common/setUserMap',
            payload: userInfo,
          });

          yield put({ // 兼容cdp的userMap
            type: 'dpCommon/setUserMap',
            payload: userInfo,
          });
        }
        if (success) {
          if (successMsg) {
            notify('success', successMsg);
          }
          if (pagingKey && data && 'total' in data && 'list' in data) {
            const hasMore = Math.ceil(data.total / _payload.pageSize) > _payload.pageNo;
            yield update({ [pagingKey]: { ..._payload, total: data.total, hasMore } });
          }
        } else {
          notify('error', err.msg || errorMsg);
        }
        return fullResult
          ? result
          : returnResult === undefined ? {} : returnResult;
      } else {
        if (!isProdEnv) {
          // eslint-disable-next-line no-console
          console.warn('非标准返回接口:', fn.name);
        }
        if (successMsg) {
          notify('success', successMsg);
        }
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  function* getParams() {
    return yield sagaEffects.select(state => state.routeInfo.params);
  }

  function* getQuery() {
    return yield sagaEffects.select(state => state.routeInfo.query);
  }

  return {
    ...sagaEffects, call, put, update, getParams, getQuery,
  };
}

export default {
  onEffect: (effect, sagaEffects, model) => function* effectEnhancer(action) {
    yield effect(action, createEffects(sagaEffects, model));
  },
};
