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
import { Panel, Ellipsis } from 'app/nusi';
import { map } from 'lodash';

interface IField extends CP_PANEL.Field{
  valueItem?: (props: Obj)=> any;
}

export default (props: CP_PANEL.Props) => {
  const { props: configProps, data } = props || {};
  const { visible = true, fields, ...rest } = configProps || {};

  if (!visible) return null;
  const _fields = React.useMemo(() => {
    return map(fields, item => geRenderValue(item));
  }, [fields]);
  return <Panel {...rest} fields={_fields} data={data?.data} />;
};

const geRenderValue = (field: IField) => {
  const { renderType } = field;
  const reField = { ...field };
  switch (renderType) {
    case 'ellipsis':
      reField.valueItem = (props: Obj) => <Ellipsis title={props.value} />;
      break;
    default:
      break;
  }
  return reField;
};
