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
import { Tooltip } from 'app/nusi';
import { cutStr } from 'common/utils';
import './tags-column.scss';

export interface IProps {
  labels: Array<{ label: string; color: keyof typeof TagColorMap }>;
  showCount?: number;
  containerClassName?: string;
  size?: 'small' | 'default';
}

export const TagColorMap = {
  green: 'green',
  red: 'red',
  orange: 'orange',
  purple: 'purple',
  blue: 'blue',
  cyan: 'cyan',
  gray: 'gray',
};

export const TagsColumn = ({ labels, showCount = 3, containerClassName = '', size = 'small' }: IProps) => {
  const showMore = labels.length > showCount;

  const fullTags = (withCut?: boolean) =>
    labels.map((l) => (
      <span className={`tag-default twt-tag-item ${size} ${TagColorMap[l.color || 'gray'] || 'gray'}`} key={l.label}>
        {withCut ? cutStr(l.label, 15) : l.label}
      </span>
    ));

  const oneAndMoreTag = (
    <React.Fragment>
      {labels.slice(0, showCount).map((l) => (
        <span
          key={l.label}
          className={`tag-default colorful-light-bg twt-tag-item ${size} ${TagColorMap[l.color || 'gray'] || 'gray'}`}
        >
          {cutStr(l.label, 15)}
        </span>
      ))}
      {showMore ? (
        <Tooltip
          title={<span className="colorful-light-bg">{fullTags()}</span>}
          placement="top"
          overlayClassName="tags-tooltip"
        >
          <span>...&nbsp;&nbsp;</span>
        </Tooltip>
      ) : (
        labels.slice(showCount).map((l) => (
          <span
            key={l.label}
            className={`tag-default colorful-light-bg twt-tag-item ${size} ${TagColorMap[l.color || 'gray'] || 'gray'}`}
          >
            {cutStr(l.label, 15)}
          </span>
        ))
      )}
    </React.Fragment>
  );

  return (
    <div className={`tags-container ${containerClassName}`}>
      <span className="tags-box colorful-light-bg">{showMore ? oneAndMoreTag : fullTags(true)}</span>
    </div>
  );
};
