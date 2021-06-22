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

import * as React from 'react';
import { Select } from 'antd-latest';
import { get } from 'lodash';

const { Option, OptGroup } = Select;
const FixedSelect = React.forwardRef((props: any, ref) => {
  const { options: propsOptions, ...rest } = props;

  // Determine if the child elements of props.options is components
  const isComponent = propsOptions?.find((item: any) => React.isValidElement(item));
  const options = isComponent ? props.children || get(props, 'options') : null;
  return (
    <Select
      ref={ref}
      getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
      {...rest}
      options={isComponent ? undefined : propsOptions}
    >
      {options}
    </Select>
  );
}) as unknown as typeof Select;

(FixedSelect as any).Option = Option;
(FixedSelect as any).OptGroup = OptGroup;

export { FixedSelect };
