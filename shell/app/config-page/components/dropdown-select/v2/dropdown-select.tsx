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

import { DropdownSelectNew } from 'common';
import React from 'react';

const DropdownSelect = (props: CP_DROPDOWN_SELECT_V2.Props) => {
  const { execOperation, props: configProps, state, customOp = {}, data, operations } = props;
  const { options: propsOptions, title: propsTitle, ...restProps } = configProps;

  const options = data?.options || propsOptions || [];
  const title = data?.title || propsTitle;

  React.useEffect(() => {
    customOp?.onStateChange?.(state);
  }, [state]);

  const onChange = (v: string) => {
    customOp?.onChange?.(v);
    operations?.onChange && execOperation({ key: 'onChange', ...operations.onChange, clientData: { value: v } });
  };

  return <DropdownSelectNew {...restProps} options={options} title={title} onChange={onChange} value={state.value} />;
};

export default DropdownSelect;
