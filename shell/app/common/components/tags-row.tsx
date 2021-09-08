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
import { Tooltip, Popconfirm, Ellipsis } from 'core/nusi';
import { some, has, groupBy, map } from 'lodash';
import i18n from 'i18n';
import { CloseOne as IconCloseOne, AddOne as IconAddOne } from '@icon-park/react';
import './tags-row.scss';

interface ILabel {
  label: string;
  group?: string;
  color?: string;
}
export interface IProps extends Omit<IItemProps, 'label'> {
  labels: ILabel[];
  showCount?: number;
  containerClassName?: string;
  onAdd?: () => void;
}

interface IItemProps {
  label: ILabel;
  maxWidth?: number;
  size?: 'small' | 'default';
  deleteConfirm?: boolean;
  onDelete?: (p: ILabel) => void;
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

export const TagItem = (props: IItemProps) => {
  const { label: _label, size, maxWidth = 200, onDelete, deleteConfirm = true } = props;
  const { label, color = 'gray' } = _label;
  const style = {
    maxWidth,
    ...(TagColorMap[color] ? undefined : { color, backgroundColor: `rgba(${color}, 0.1)` }),
  };

  const tagColor = TagColorMap[color] || '';
  return (
    <span style={style} className={`tag-default twt-tag-item ${size} text-${tagColor} bg-${tagColor} bg-opacity-10`}>
      {onDelete ? (
        deleteConfirm ? (
          <Popconfirm
            title={`${i18n.t('common:confirm deletion')}?`}
            arrowPointAtCenter
            zIndex={2000} //  popconfirm default zIndex=1030, is smaller than tooltip zIndex=1070
            onConfirm={(e) => {
              e && e.stopPropagation();
              onDelete(_label);
            }}
            onCancel={(e) => e && e.stopPropagation()}
          >
            <IconCloseOne theme="filled" size="12" className="tag-close cursor-pointer text-holder" />
          </Popconfirm>
        ) : (
          <IconCloseOne
            theme="filled"
            size="12"
            className="tag-close cursor-pointer text-holder"
            onClick={() => onDelete(_label)}
          />
        )
      ) : null}

      <Ellipsis
        title={label}
        zIndex={2010} // popconfirm zIndex is bigger than tooltip
      />
    </span>
  );
};

export const TagsRow = ({
  labels: propsLabels,
  showCount = 2,
  containerClassName = '',
  size = 'small',
  onDelete,
  onAdd,
}: IProps) => {
  const labels = propsLabels || [];
  const showMore = labels.length > showCount;
  const showGroup = some(labels, (l) => has(l, 'group'));

  const fullTags = () => {
    if (showGroup) {
      return (
        <div>
          {map(groupBy(labels, 'group'), (groupItem, gKey) => (
            <div key={gKey} className="tag-group-container mb-2">
              <span className="tag-group-name">{`${gKey} : `}</span>
              <span className="flex-1">
                {groupItem.map((item) => (
                  <TagItem key={item.label} label={item} onDelete={onDelete} size={size} />
                ))}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return labels.map((l) => <TagItem key={l.label} label={l} onDelete={onDelete} size={size} />);
  };

  const oneAndMoreTag = (
    <React.Fragment>
      {labels.slice(0, showCount).map((l) => (
        <TagItem key={l.label} label={l} maxWidth={120} onDelete={onDelete} size={size} />
      ))}
      {showMore ? (
        <Tooltip
          title={<span className="tags-container">{fullTags()}</span>}
          placement="right"
          overlayClassName="tags-row-tooltip"
        >
          <span className={`twt-tag-ellipsis ${size}`}>...&nbsp;&nbsp;</span>
        </Tooltip>
      ) : (
        labels
          .slice(showCount)
          .map((l) => <TagItem key={l.label} label={l} maxWidth={120} onDelete={onDelete} size={size} />)
      )}
    </React.Fragment>
  );

  return (
    <div
      className={`tags-container flex items-center flex-wrap justify-start ${containerClassName}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="tags-box flex item-center">{oneAndMoreTag}</span>
      {onAdd ? <IconAddOne onClick={onAdd} theme="outline" className="ml-2 fake-link" size="14" /> : null}
    </div>
  );
};
