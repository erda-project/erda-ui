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
import { RenderFormItem } from 'common';
import { has, set, get, isArray } from 'lodash';
import classnames from 'classnames';

export default (props: any) => {
  const { mode, form, fromTable, ...other } = props;
  const { label, initialValue } = other;

  if (mode === 'detail') {
    let text = initialValue;
    const { type, optionsData, options, itemProps = {} } = other;
    switch (type) {
      case 'select':
        text = get((optionsData || options).find((item: any) => item.value === initialValue), 'name', text);
        break;
      case 'cascader':
        text = isArray(initialValue) ? initialValue.join('.') : initialValue;
        break;
      case 'radioGroup':
        text = get(itemProps.options.find((item: any) => item.value === initialValue), 'label', text);
        break;
      case 'checkbox':
        text = initialValue ? '是' : '否';
        break;
      default:
        text = initialValue;
        break;
    }

    return (
      <div className="form-item-text">
        {!fromTable && (
          <h6 className="form-item-label">{label}</h6>
        )}
        <p className={classnames('form-item-value', { 'no-margin': fromTable })}>{text}</p>
      </div>
    );
  }

  if (!has(other, 'itemProps.disabled')) {
    set(other, 'itemProps.disabled', false);
  }
  return (
    <RenderFormItem
      form={form}
      {...other}
    />
  );
};
