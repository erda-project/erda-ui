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

import i18n from 'i18n';
import { Button, message } from 'antd';
import React, { ReactElement } from 'react';
import Editor from './editor';
import { useUpdate } from 'app/common/use-hooks';
import { map } from 'lodash';
import { useMount } from 'react-use';
import { BaseButtonProps } from 'antd/es/button/button';
import { useEscScope } from 'layout/stores/layout';
import './index.scss';

interface BtnProps extends BaseButtonProps {
  text: string;
  onClick: (v: string) => void;
}
interface IProps {
  value?: string | null;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  defaultMode?: 'md' | 'html';
  extraRight?: ReactElement | ReactElement[];
  readOnly?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  operationBtns?: BtnProps[];
  showMenu?: boolean;
  defaultHeight?: number;
  onChange?: (value: string) => void;
  onFocus?: (e: any) => void;
  onBlur?: (value: any) => void;
}

interface IState {
  content: string;
  tempContent: string;
  view: {
    md: boolean;
    html: boolean;
    menu: boolean;
  };
  fullscreen: boolean;
}

export interface EC_MarkdownEditor {
  clear: () => void;
}

const MarkdownEditor: React.ForwardRefRenderFunction<EC_MarkdownEditor, IProps> = (
  {
    placeholder,
    readOnly,
    extraRight,
    style,
    defaultMode = 'md',
    autoFocus,
    value,
    maxLength,
    className = '',
    operationBtns,
    showMenu = true,
    defaultHeight,
    onChange,
    onFocus,
    onBlur,
  },
  ref,
) => {
  const mdEditorRef = React.useRef<any>(null); // TODO ts type should export from @erda-ui/react-markdown-editor-lite

  const [{ content, view, tempContent, fullscreen }, updater] = useUpdate<IState>({
    content: value || '',
    tempContent: value || '',
    view: {
      md: defaultMode === 'md',
      html: defaultMode === 'html',
      menu: showMenu,
    },
    fullscreen: false,
  });

  const enterEsc = useEscScope('markdown-editor', () => {
    mdEditorRef.current?.fullScreen(false);
    updater.fullscreen(false);
  });
  React.useEffect(() => {
    mdEditorRef.current?.on('fullscreen', (isFullScreen: boolean) => {
      if (isFullScreen) {
        updater.fullscreen(isFullScreen);
        enterEsc();
      }
    });
  }, [enterEsc, updater]);

  useMount(() => {
    setTimeout(() => {
      const mdRef = mdEditorRef?.current;
      mdRef?.on('viewchange', (_view: { html: boolean; md: boolean; menu: boolean }) => {
        updater.view(_view);
        if (_view.md) {
          mdRef.nodeMdText.current && mdRef.nodeMdText.current.focus();
        }
      });

      if (autoFocus && view.md && mdRef.nodeMdText.current) {
        mdRef?.nodeMdText.current.focus();
      }
    });
  });

  React.useImperativeHandle(
    ref,
    () => ({
      clear: () => updater.content(''),
    }),
    [updater],
  );

  React.useEffect(() => {
    if (value !== tempContent) {
      updater.content(value || '');
      updater.tempContent(value || '');
    }
  }, [tempContent, updater, value]);

  const onChangeContent = (data: { html: string; text: string }) => {
    if (data.text.match(/>{100,}/)) {
      message.warn(i18n.t('common:The quotes (>) nesting level cannot exceed 100')); // will cause cursor jump, don't know why
      return;
    }
    let v = data.text;
    if (maxLength && data.text.length > maxLength) {
      message.warn(i18n.t('common:The maximum length is {limit}, please upload with attachment', { limit: maxLength }));
      v = data.text.slice(0, maxLength);
    }
    updater.content(v);
    onChange?.(v);
  };

  const disableEdit = view.html && !view.md; // 纯预览模式时禁用操作栏

  const curShowButton = !!operationBtns?.length;

  // const height: string | number = style.height ? parseInt(style.height, 10) : 400;
  // height = view.menu ? (view.md && curShowButton ? height + 50 : height) : 'auto';

  const btnCls = fullscreen ? 'fixed full-screen-btn' : 'absolute';

  return (
    <div className={`markdown-editor relative ${className}`} tabIndex={0}>
      <div
        className={`markdown-editor-content flex flex-col ${disableEdit ? 'disable-edit' : ''} ${
          readOnly ? 'read-only' : ''
        } ${curShowButton ? 'show-btn' : ''}`}
      >
        <Editor
          ref={mdEditorRef}
          {...{
            placeholder,
            readOnly,
            extraRight,
            onFocus,
            style,
          }}
          config={{
            view,
          }}
          defaultHeight={defaultHeight || 400}
          value={content}
          onChange={onChangeContent}
          onBlur={() => onBlur?.(content)}
        />
        <If condition={!!operationBtns?.length}>
          <div
            className={`${btnCls} w-full left-0 bottom-0 pl-4 py-3 space-x-3`}
            style={{ borderTop: '1px solid rgba(48, 38, 71, 0.2)' }}
          >
            {map(operationBtns, (operationBtn, i) => {
              const { text, type, size, className: btnItemCls = '', onClick } = operationBtn;
              return (
                <Button size={size} key={i} type={type} onClick={() => onClick(content)} className={btnItemCls}>
                  {text}
                </Button>
              );
            })}
          </div>
        </If>
      </div>
    </div>
  );
};

export default React.forwardRef<EC_MarkdownEditor, IProps>(MarkdownEditor);
