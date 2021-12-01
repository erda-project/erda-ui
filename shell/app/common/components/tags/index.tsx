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
import { Tooltip, Popconfirm } from 'antd';
import { Ellipsis, ErdaIcon } from 'common';
import i18n from 'i18n';
import { map, max } from 'lodash';
import { CloseOne as IconCloseOne } from '@icon-park/react';
import { auxiliaryColorMap as TagColorsMap } from 'common/constants';
import './index.scss';

interface ILabel {
  label: string;
  group?: string;
  color?: string;
}
export interface IProps extends Omit<IItemProps, 'label'> {
  labels: ILabel[] | ILabel;
  showCount?: number;
  containerClassName?: string;
  onAdd?: () => void;
}

interface IItemProps {
  colorMap?: Obj;
  label: ILabel;
  maxWidth?: number;
  size?: 'small' | 'default';
  checked?: boolean;
  deleteConfirm?: boolean;
  onDelete?: (p: ILabel) => void;
}

export const TagItem = (props: IItemProps) => {
  const { label: _label, size = 'default', maxWidth, onDelete, deleteConfirm = true, colorMap, checked } = props;
  const { label, color = 'blue' } = _label;
  const curColor = (colorMap || TagColorsMap)[color || 'blue'] || color || TagColorsMap.blue;
  const style = {
    maxWidth,
  };
  const cls = checked
    ? `text-${color}-deep bg-${color}-light border-0 border-solid border-l-2 border-l-${color}-mid`
    : `text-${color}-deep bg-${color}-light border-0 border-solid border-l-2 border-l-${color}-mid`;

  return (
    <span style={style} className={`tag-default twt-tag-item ${size} ${cls}`}>
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
const MAX_LABEL_WIDTH = 180;

const TagsRow = ({
  labels: propsLabels,
  showCount = 2,
  containerClassName = '',
  size = 'small',
  colorMap,
  onDelete,
}: IProps) => {
  const labels = propsLabels ? (Array.isArray(propsLabels) ? propsLabels : [propsLabels]) : [];
  const showMore = labels.length > showCount;

  const fullTags = () => {
    return labels.map((l) => <TagItem colorMap={colorMap} key={l.label} label={l} onDelete={onDelete} size={size} />);
  };

  const oneAndMoreTag = (
    <React.Fragment>
      {labels.slice(0, showCount).map((l) => (
        <TagItem colorMap={colorMap} key={l.label} label={l} maxWidth={100} onDelete={onDelete} size={size} />
      ))}
      {showMore ? (
        <Tooltip
          title={
            <div onClick={(e) => e.stopPropagation()} className="tags-container ">
              {fullTags()}
            </div>
          }
          placement="right"
          overlayClassName="tags-row-tooltip"
        >
          <ErdaIcon className={`twt-tag-ellipsis ${size}`} type="more" color="currentColor" />
        </Tooltip>
      ) : (
        labels
          .slice(showCount)
          .map((l) => (
            <TagItem colorMap={colorMap} key={l.label} label={l} maxWidth={160} onDelete={onDelete} size={size} />
          ))
      )}
    </React.Fragment>
  );

  return (
    <div
      className={`tags-container flex items-center justify-start ${containerClassName}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="tags-box flex items-center">{oneAndMoreTag}</span>
    </div>
  );
};

export default TagsRow;
