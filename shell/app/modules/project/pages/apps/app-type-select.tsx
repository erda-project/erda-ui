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
import classnames from 'classnames';
import './app-type-select.scss';
import { Tooltip } from 'antd';
import { Icon as CustomIcon } from 'common';
import { groupBy, map } from 'lodash';
import i18n from 'i18n';

interface Img {
  src: string;
  name: string;
  value: string;
  groupIndex: number;
}
interface IProps {
  imgOptions: Img[];
  canCreateMobileApp?: boolean;
  value?: string;
  onChangeType: (value: string) => void;
}

export class AppTypeSelect extends React.PureComponent<IProps> {
  render() {
    const { imgOptions, value, onChangeType, canCreateMobileApp = true } = this.props;
    const optionGroup = groupBy(imgOptions, 'groupIndex');

    return (
      <div className="app-type-select">
        {map(optionGroup, (options, key) => {
          return (
            <div key={key} className="app-type-group">
              {options.map((img) => {
                const disabled = img.value === 'MOBILE' && !canCreateMobileApp;
                const cls = classnames('img-wrapper', {
                  active: value === img.value && !disabled,
                  'disabled-card': disabled,
                });

                return (
                  <Tooltip key={img.value} title={disabled ? i18n.t('dop:can-not-create-mobile-app-tip') : null}>
                    <div
                      className={cls}
                      onClick={() => {
                        if (!disabled) {
                          onChangeType(img.value);
                        }
                      }}
                    >
                      <img src={img.src} alt={img.name || 'image-option'} />
                      <CustomIcon type="yuanxingxuanzhongfill" />
                      <Tooltip title={img.name}>
                        <div className="desc truncate">{img.name}</div>
                      </Tooltip>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}
