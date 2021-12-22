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

import { ErdaIcon } from 'common';
import { map } from 'lodash';
import React from 'react';
import './scale-card.scss';

const ScaleCard = (props: CP_SCALE_CARD.Props) => {
  const { execOperation, data, onClick } = props;
  const { list } = data || {};

  return (
    <div className="scale-card">
      {map(list, (item, i) => {
        return (
          <div
            key={item.label}
            className="item text-normal shadow-card"
            style={{ left: -8 * i }}
            onClick={() => {
              execOperation?.(item.operations?.click, item);
              onClick?.(item);
            }}
          >
            <div className="icon-wrap">
              <ErdaIcon className="icon active-icon" type={item.icon} size={20} />
              <ErdaIcon className="icon normal-icon" type={item.icon + '-normal'} size={20} />
            </div>
            <span className="text truncate">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ScaleCard;
