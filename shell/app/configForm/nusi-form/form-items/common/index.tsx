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
import { Tooltip } from 'app/nusi';
import { Help as IconHelp } from '@icon-park/react';

export { createCombiner } from './combiner';

export const getLabel = (label: string, labelTip: string) => {
  let _label: any = label;
  if (labelTip) {
    _label = (
      <span>
        {label}&nbsp;
        <Tooltip title={labelTip}>
          <IconHelp className="text-icon" />
        </Tooltip>
      </span>
    );
  }
  return _label;
};

export const noop = (a: any) => a;
