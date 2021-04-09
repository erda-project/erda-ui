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
import 'ace-builds';
import AceEditor, { IAceEditorProps } from 'react-ace';

import 'ace-builds/src-noconflict/ext-searchbox';
import highlight from 'ace-builds/src-noconflict/ext-static_highlight';
import 'ace-builds/src-noconflict/theme-github';

import javascriptMode from 'ace-builds/src-noconflict/mode-javascript';
import javaMode from 'ace-builds/src-noconflict/mode-java';
import kotlinMode from 'ace-builds/src-noconflict/mode-kotlin';
import xmlMode from 'ace-builds/src-noconflict/mode-xml';
import sassMode from 'ace-builds/src-noconflict/mode-sass';
import mysqlMode from 'ace-builds/src-noconflict/mode-mysql';
import jsonMode from 'ace-builds/src-noconflict/mode-json';
import htmlMode from 'ace-builds/src-noconflict/mode-html';
import golangMode from 'ace-builds/src-noconflict/mode-golang';
import cssMode from 'ace-builds/src-noconflict/mode-css';
import yamlMode from 'ace-builds/src-noconflict/mode-yaml';
import shMode from 'ace-builds/src-noconflict/mode-sh';
import typescriptMode from 'ace-builds/src-noconflict/mode-typescript';
import svgMode from 'ace-builds/src-noconflict/mode-svg';
import jsxMode from 'ace-builds/src-noconflict/mode-jsx';
import tsxMode from 'ace-builds/src-noconflict/mode-tsx';
import lessMode from 'ace-builds/src-noconflict/mode-less';
import rubyMode from 'ace-builds/src-noconflict/mode-ruby';
import pythonMode from 'ace-builds/src-noconflict/mode-python';
import dockerfileMode from 'ace-builds/src-noconflict/mode-dockerfile';

const supportLang = [
  'javascript',
  'java',
  'kotlin',
  'xml',
  'sass',
  'mysql',
  'json',
  'html',
  'golang',
  'css',
  'yaml',
  'sh',
  'typescript',
  'svg',
  'jsx',
  'tsx',
  'less',
  'ruby',
  'python',
  'dockerfile',
];
const modeMap = {
  'ace/mode/javascript': javascriptMode,
  'ace/mode/java': javaMode,
  'ace/mode/kotlin': kotlinMode,
  'ace/mode/xml': xmlMode,
  'ace/mode/sass': sassMode,
  'ace/mode/mysql': mysqlMode,
  'ace/mode/json': jsonMode,
  'ace/mode/html': htmlMode,
  'ace/mode/golang': golangMode,
  'ace/mode/css': cssMode,
  'ace/mode/yaml': yamlMode,
  'ace/mode/sh': shMode,
  'ace/mode/typescript': typescriptMode,
  'ace/mode/svg': svgMode,
  'ace/mode/jsx': jsxMode,
  'ace/mode/tsx': tsxMode,
  'ace/mode/less': lessMode,
  'ace/mode/ruby': rubyMode,
  'ace/mode/python': pythonMode,
  'ace/mode/dockerfile': dockerfileMode,
};

const extMap = {
  yml: 'yaml',
  kt: 'kotlin',
  js: 'javascript',
  ts: 'typescript',
  go: 'golang',
  sql: 'mysql',
  rb: 'ruby',
  py: 'python',
  Dockerfile: 'dockerfile',
};

interface IProps extends IAceEditorProps{
  fileExtension: string;
  editorProps?: object;
  autoHeight?: boolean;
  options?: object;
  value?: string;
  [prop: string]: any;
}

export const FileEditor = ({ fileExtension, editorProps, options, autoHeight = false, style: editorStyle, value, ...rest }: IProps) => {
  const _rest = { ...rest };
  const style: any = { width: '100%', lineHeight: '1.8', ...editorStyle };
  let mode = extMap[fileExtension] || fileExtension || 'sh';
  if (!supportLang.includes(mode)) {
    mode = 'sh';
  }
  React.useEffect(() => {
    if (!_rest.readOnly) {
      setTimeout(() => {
        // 编辑模式最后一行无法显示，很诡异的问题，需要主动触发一下resize
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }
  }, [_rest.readOnly]);
  const preDom = React.useRef(null);
  React.useEffect(() => {
    if (preDom.current && value) {
      highlight(preDom.current, {
        mode: new modeMap[`ace/mode/${mode}`].Mode(),
        theme: 'ace/theme/github',
        startLineNumber: 1,
        showGutter: true,
        trim: true,
      });
    }
  }, [mode, value]);
  if (_rest.readOnly) {
    return value ? (
      <pre data-mode={mode} ref={preDom} style={style}>
        {value}
      </pre>
    ) : (
      <pre style={{ height: '300px' }} />
    );
  }
  if (autoHeight) {
    style.height = '100%';
  } else if (!_rest.maxLines) {
    _rest.maxLines = 30;
  }
  return (
    <AceEditor
      mode={mode}
      theme="github"
      fontSize={12}
      style={style}
      editorProps={{ $blockScrolling: true, ...editorProps }}
      setOptions={{ ...options, useWorker: false }} // useWorker为true时切换编辑模式会有个报错
      value={value}
      {..._rest}
    />
  );
};
