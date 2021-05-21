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
import { Button, message, Rate } from 'app/nusi';
import React, { PureComponent, ReactElement } from 'react';
import { Editor } from './editor';
import { IF } from 'common';
import './index.scss';

interface ICanView {
    menu?: boolean;
    md?: boolean;
    html?: boolean;
    fullScreen?: boolean;
    hideMenu?: boolean;
}

const defaultCanView = {
  menu: true,
  md: true,
  html: true,
  fullScreen: true,
  hideMenu: true,
}

interface IProps {
  value?: string | null;
  placeholder?: string;
  maxLength?: number;
  isShowRate: boolean;
  score: number;
  defaultMode?: 'md' | 'html' | 'both';
  extraRight?: ReactElement | ReactElement[];
  btnText?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  canView?: ICanView;
  notClearAfterSubmit?: boolean;
  style?: object,
  onSubmit?: (value: string, rate: number) => void;
  onChange?: (value: any) => void;
  onFocus?: (e: any) => void;
  onBlur?: (value: any) => void;
  onCancel?: () => void;
  onSetLS?: (content: string) => void;
}

interface IState {
  content: string;
  tempContent: string;
  score: number;
  view: {
    md: boolean;
    html: boolean;
    menu: boolean;
  }
}

export default class MarkdownEditor extends PureComponent<IProps, IState> {
  mdEditor: React.RefObject<unknown>;

  constructor(props: IProps) {
    super(props);
    this.mdEditor = React.createRef();
    const defaultMode = props.defaultMode || 'md';
    this.state = {
      content: props.value || '',
      tempContent: props.value || '',
      score: props.score || 0,
      view: {
        md: defaultMode === 'md' || defaultMode === 'both',
        html: defaultMode === 'html' || defaultMode === 'both',
        menu: true,
      },
    };
  }

  static getDerivedStateFromProps(nextProps:IProps, prevState: IState) {
    if (nextProps.value !== prevState.tempContent) {
      return {
        ...prevState,
        content: nextProps.value || '',
        tempContent: nextProps.value,
      };
    }
    return null;
  }

  componentDidMount() {
    const mdRef = this.mdEditor?.current as any;
    mdRef && mdRef.on('viewchange', (view: { html: boolean, md: boolean, menu: boolean }) => {
      this.setState({
        view,
      });
      if (view.md) {
        mdRef.nodeMdText.current && mdRef.nodeMdText.current.focus();
      }
    });
    if(this.props.autoFocus && this.state.view.md && mdRef.nodeMdText.current){
      mdRef.nodeMdText.current.focus();
    }
  }

  onSubmit = () => {
    const { onSubmit, notClearAfterSubmit = false } = this.props;

    onSubmit && onSubmit(this.state.content, this.state.score);

    if (!notClearAfterSubmit) {
      this.setState({ score: 0, content: '' });
    }
  };

  onBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur(this.state.content);
    }
  };

  onChange = (data: { html: string, text: string }) => {
    const { onChange, maxLength } = this.props;
    let v = data.text;
    if (maxLength && data.text.length > maxLength) {
      message.warn(i18n.t('common:The maximum length is {limit}, please upload with attachment', { limit: maxLength }));
      v = data.text.slice(0, maxLength);
    }

    this.setState({ content: v });
    onChange && onChange(v);
  };

  // 支持本地存储
  onSetLS = () => {
    const { onSetLS } = this.props;

    onSetLS && onSetLS(this.state.content);
  };

  renderButton() {
    const { onSubmit, onCancel, btnText, onSetLS } = this.props;
    const btns: JSX.Element[] = [];

    if (onSubmit) {
      btns.push(
        <Button
          key="md-editor-submit-btn"
          className="mt16 mb16 mr8"
          type="primary"
          onClick={this.onSubmit}
        >
          {btnText || i18n.t('common:submit')}
        </Button>
      );
    }

    if (onSetLS) {
      btns.push(
        <Button
          key="md-editor-keep-btn"
          className="mt16 mb16 mr8"
          onClick={this.onSetLS}
        >
          {i18n.t('application:temporary storage')}
        </Button>
      );
    }

    if (onCancel) {
      btns.push(
        <Button
          key="md-editor-cancel-btn"
          className="mt16 mb16"
          onClick={onCancel}
        >
          {i18n.t('common:cancel')}
        </Button>
      );
    }

    return btns;
  }

  onRateChange = (value: number) => {
    this.setState({
      score: value,
    });
  };

  render() {
    const { placeholder, readOnly, extraRight, onFocus, isShowRate, style = { height: '400px' }, canView } = this.props;
    const { content, view } = this.state;
    const disableEdit = view.html && !view.md; // 纯预览模式时禁用操作栏
    return (
      <div className="markdown-editor">
        <div className={`markdown-editor-content ${disableEdit ? 'disable-edit' : ''} ${readOnly ? 'read-only' : ''}`}>
          <Editor
            ref={this.mdEditor}
            {...{
              placeholder,
              readOnly,
              extraRight,
              onFocus,
              style,
            }}
            config={{
              view,
              canView: { ...defaultCanView, ...canView },
            }}
            value={content}
            onChange={this.onChange}
            onBlur={this.onBlur}
          />
        </div>
        <IF check={isShowRate}>
          <div>
            <span>{i18n.t('score')}：</span><Rate allowHalf onChange={this.onRateChange} value={this.state.score} />
          </div>
        </IF>
        {this.renderButton()}
      </div>
    );
  }
}
