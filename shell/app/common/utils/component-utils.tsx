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
import { Tooltip, Icon } from 'nusi';

export const getLabel = (label: string, labelTip: string, required = true) => {
  let _label: any = label;
  if (labelTip) {
    _label = (
      <span>
        {required ? <span style={{ color: 'red', marginRight: 4 }}>*</span> : null}
        {_label}&nbsp;
        <Tooltip title={labelTip}>
          <Icon type="question-circle-o" className='color-text-icon' />
        </Tooltip>
      </span>
    );
  }
  return _label;
};
