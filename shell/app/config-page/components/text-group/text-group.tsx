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
import { map, isNumber, isString, isArray, isPlainObject } from 'lodash';
import Text from '../text/text';
import { Copy, Icon as CustomIcon } from 'common';
import { Badge } from 'nusi';
import i18n from 'i18n';

const getStyle = (styleConfig?: CP_TEXT.IStyleConfig) => {
  const styleObj = {} as Obj;
  const { bold, ...rest } = styleConfig || {};
  if (bold) {
    styleObj.fontWeight = 'bold';
  }
  map(rest || {}, (v, k) => {
    styleObj[k] = isNumber(v) ? `${v}px` : v;
  });
  return styleObj;
};

const TextGroup = (props: CP_TEXT.Props) => {
  const { execOperation, props: configProps, operations } = props;
  const { renderType, value, styleConfig, visible = true } = configProps || {};

  if (!visible) return null;
  let TextComp: React.ReactChild | null = null;
  const styleObj = getStyle(styleConfig);

  if (isArray(value)) {
    return (
      <div style={{ marginLeft: 80 }}>
        {map(value, (item) =>
          <div className='mb32' style={{ width: 500 }}>
            <Text execOperation={execOperation} props={item.props} operations={operations} />
          </div>)
        }
      </div >
    )
  }

};

export default TextGroup;
