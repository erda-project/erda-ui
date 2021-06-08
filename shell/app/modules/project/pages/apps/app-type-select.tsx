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
import { Icon as CustomIcon } from 'common';

interface Img {
  src: string;
  name: string;
  value: string;
}
interface IProps {
  imgOptions: Img[];
  value?: string;
  onChangeType: (value: string) => void;
}
export class AppTypeSelect extends React.PureComponent<IProps> {
  render() {
    const { imgOptions, value, onChangeType } = this.props;
    return (
      <div className="app-type-select">
        {imgOptions.map((img) => (
          <div
            key={img.name}
            className={classnames(
              'img-wrapper',
              value === img.value && 'active',
            )}
            onClick={() => onChangeType(img.value)}
          >
            <img src={img.src} alt={img.name || 'image-option'} />
            <CustomIcon type="yuanxingxuanzhongfill" />
            <div className="desc">{img.name}</div>
          </div>
        ))}
      </div>
    );
  }
}
