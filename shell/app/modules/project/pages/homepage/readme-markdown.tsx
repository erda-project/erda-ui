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
import i18n from 'core/i18n';
import { Tooltip } from 'antd';
import { MarkdownEditor } from 'common';
import remarkGfm from 'remark-gfm';
import { useUpdate } from 'common/use-hooks';
import ReactMarkdown from 'react-markdown';
import { ScalableImage } from 'common/components/edit-field';
import './index.scss';

interface IMdProps {
  value?: string;
  originalValue?: string;
  disabled?: boolean;
  hasEdited?: boolean;
  maxHeight: number;
  onChange: (v: string) => void;
  onSave: (v?: string) => void;
}
export const ReadMeMarkdown = ({ value, onChange, onSave, disabled, originalValue, maxHeight, ...rest }: IMdProps) => {
  const [{ v, expanded, expandBtnVisible, isEditing }, updater, update] = useUpdate({
    v: value,
    expanded: false,
    isEditing: false,
    expandBtnVisible: false,
  });

  const mdContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    updater.v(value);
  }, [updater, value]);

  const operationBtns = !disabled
    ? [
        {
          text: i18n.t('commit'),
          type: 'primary' as const,
          className: 'bg-default text-white h-8 flex justify-center items-center relative -top-0.5',
          onClick: (_v: string) => {
            onSave(_v);
            updater.isEditing(false);
          },
        },
        {
          text: i18n.t('cancel'),
          className: 'text-default-8 bg-default-06 h-8 flex justify-center items-center relative -top-0.5',
          onClick: () => {
            update({ v: originalValue, isEditing: false });
          },
        },
      ]
    : [];

  const maxMarkdownHeight = Math.max(document.documentElement.clientHeight - 300, 400);

  return isEditing ? (
    <MarkdownEditor
      {...rest}
      value={v}
      onChange={onChange}
      onBlur={(_v: string) => {
        onSave(_v);
      }}
      defaultMode="md"
      defaultHeight={maxMarkdownHeight}
      operationBtns={operationBtns}
    />
  ) : (
    <Tooltip
      placement="left"
      title={i18n.t('dop:click to edit')}
      overlayClassName="homepage-tooltip"
      arrowPointAtCenter
    >
      <div
        className="relative hover:bg-hover-gray-bg cursor-pointer rounded w-full"
        onClick={() => updater.isEditing(true)}
        style={{ maxHeight: expanded ? '' : maxHeight }}
      >
        <div className="overflow-hidden" style={{ maxHeight: 'inherit' }}>
          <div ref={mdContentRef} className="md-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: ScalableImage }}>
              {value || i18n.t('no description yet')}
            </ReactMarkdown>
            <div
              className={`absolute left-0 bottom-0 w-full h-16 bg-gradient-to-b from-transparent to-white flex justify-center items-center ${
                !expandBtnVisible || expanded ? 'hidden' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </Tooltip>
  );
};
