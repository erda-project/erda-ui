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
import { MarkdownEditor, EditField } from 'common';
import remarkGfm from 'remark-gfm';
import { useUpdate } from 'common/use-hooks';
import ReactMarkdown from 'react-markdown';
import './index.scss';
import MouseTooltip from 'react-sticky-mouse-tooltip';

interface IMdProps {
  value?: string;
  originalValue?: string;
  disabled?: boolean;
  maxHeight: number;
  onChange: (v: string) => void;
  onSave: (v: string) => void;
}

const { ScalableImage } = EditField;

export const ReadMeMarkdown = ({ value, onChange, onSave, disabled, originalValue, maxHeight }: IMdProps) => {
  const [{ v, expanded, expandBtnVisible, isEditing, cursorType, tooltipVisible }, updater, update] = useUpdate({
    v: value,
    expanded: false,
    isEditing: false,
    expandBtnVisible: false,
    cursorType: '',
    tooltipVisible: false,
  });

  const mdContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    updater.v(value);
  }, [updater, value]);

  React.useEffect(() => {
    document.addEventListener('mousemove', (e) => {
      if (e.target) {
        updater.cursorType(e.target.style.cursor || '');
      }
    });
  }, [cursorType, updater]);

  // if hover on image, the tooltip can't be showed, for click at image, it will be enlarge image instead of editing
  if (document.getElementById('tooltip-with-mouse')) {
    if (cursorType === 'zoom-in') {
      document.getElementById('tooltip-with-mouse').style.display = 'none';
    } else {
      document.getElementById('tooltip-with-mouse').style.display = 'block';
    }
  }

  const operationBtns = !disabled
    ? [
        {
          text: i18n.t('commit'),
          type: 'primary' as const,
          className: 'bg-default text-white h-7 flex justify-center items-center relative -top-0.5',
          onClick: (_v: string) => {
            onSave(_v);
            updater.isEditing(false);
          },
        },
        {
          text: i18n.t('cancel'),
          className: 'text-default-8 bg-default-06 h-7 flex justify-center items-center relative -top-0.5',
          onClick: () => {
            update({ v: originalValue, isEditing: false });
          },
        },
      ]
    : [];

  const maxMarkdownHeight = Math.max(document.documentElement.clientHeight - 240, 400);

  return isEditing ? (
    <MarkdownEditor
      value={v}
      onChange={onChange}
      defaultMode="md"
      defaultHeight={maxMarkdownHeight}
      operationBtns={operationBtns}
    />
  ) : (
    <div
      className="relative cursor-pointer rounded w-full"
      onClick={() => updater.isEditing(true)}
      style={{ maxHeight: expanded ? '' : maxHeight }}
    >
      <MouseTooltip visible={tooltipVisible} offsetX={15} offsetY={10}>
        <span id="tooltip-with-mouse" className="bg-default text-white p-2 rounded-[3px]">
          {i18n.t('dop:click to edit')}
        </span>
      </MouseTooltip>
      <div
        className="overflow-hidden"
        style={{ maxHeight: 'inherit' }}
        onMouseEnter={() => {
          updater.tooltipVisible(true);
        }}
        onMouseLeave={() => {
          updater.tooltipVisible(false);
        }}
      >
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
  );
};
