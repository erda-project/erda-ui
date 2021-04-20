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
import { map, isNumber, isArray } from 'lodash';
import Text from '../text/text';
import './text-group.scss';

// gapSize = 'm' | 's' | 'l'
const TextGroup = (props: CP_TEXT_GROUP.Props) => {
  const { execOperation, props: configProps, operations } = props;
  const { value, visible = true, gapSize = 'normal' } = configProps || {};

  if (!visible) return null;

  if (isArray(value)) {
    return (
      <div className='text-group'>
        {map(value, (item) =>
          <div className={`${gapSize}`}>
            <Text execOperation={execOperation} props={item.props} operations={operations} />
          </div>)
        }
      </div >
    )
  }

};

export default TextGroup;
