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
  const { execOperation, data, onClick, props: configProps } = props;
  if (!data?.list) return null;
  const { list } = data;
  const { align, fixedActive } = configProps || {};
  const [active, setActive] = React.useState(fixedActive || '');
  return (
    <div className={`scale-card flex ${align === 'right' ? 'justify-end' : ''}`}>
      {map(list, (item, i) => {
        const curActive = active === item.key;
        return (
          <div
            key={item.key}
            onMouseEnter={() => setActive(item.key)}
            onMouseLeave={() => setActive(fixedActive || '')}
            className={`item text-normal shadow-card ${curActive ? 'scale-card-active' : ''}`}
            style={{
              width: curActive ? item.width : undefined,
              left: align === 'right' ? 8 * (list.length - i - 1) : -8 * i,
            }}
            onClick={() => {
              execOperation?.(item.operations?.click, item);
              onClick?.(item);
            }}
          >
            <div className="icon-wrap">
              {typeof item.icon === 'string' ? (
                <>
                  <ErdaIcon className="icon active-icon" type={item.icon} size={20} />
                  <ErdaIcon className="icon normal-icon" type={`${item.icon}-normal`} size={20} />{' '}
                </>
              ) : (
                <>
                  {React.cloneElement(item.icon?.active, {
                    className: `icon active-icon ${item.icon?.active?.props.className}`,
                  })}
                  {React.cloneElement(item.icon?.normal, {
                    className: `icon normal-icon ${item.icon?.normal?.props.className}`,
                  })}
                </>
              )}
            </div>
            {typeof item.getComp === 'function' ? (
              item.getComp({ active: active === item.key })
            ) : (
              <span className="text truncate">{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScaleCard;
