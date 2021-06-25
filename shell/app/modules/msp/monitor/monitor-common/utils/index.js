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

import i18n from 'i18n';

export function getActiveKey(routes) {
  for (let i = routes.length - 1; i >= 0; i--) {
    if (routes[i].path && !routes[i].path.includes('/')) {
      return routes[i].path;
    }
  }
  return '';
}

/**
 * 关联验证
 * @param {
 *  form 表单对象
 *  ids 关联单表元素的ids
 *  valiFn 用于验证的方法
 *  errorMsg 错误信息
 * }
 */
export const valiAssociate = ({ form, ids, valiFn, errorMsg = i18n.t('msp:custom association error') }) => {
  return (rule, value, cb) => {
    const asValues = form.getFieldsValue(ids);
    const isVali = valiFn(value, asValues); // 验证方法
    if (!isVali) {
      cb(errorMsg);
    } else {
      cb();
    }
  };
};
