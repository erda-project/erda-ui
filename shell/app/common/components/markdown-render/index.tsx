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

import { emit } from 'core/event-hub';
import layoutStore, { useEscScope } from 'layout/stores/layout';
import React, { ImgHTMLAttributes, LinkHTMLAttributes } from 'react';
import { micromark } from 'micromark';
import ReactMarkdown from 'react-markdown';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import github from 'react-syntax-highlighter/dist/esm/styles/hljs/googlecode.js';
import './index.scss';

import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('bash', bash);

const ScalableImage = ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
  const [escStack, scalableImgSrc] = layoutStore.useStore((s) => [s.escStack, s.scalableImgSrc]);

  const enterEsc = useEscScope('scale-image', () => {
    closePreview();
  });

  const closePreview = React.useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    document.body.removeEventListener('click', closePreview);
  }, []);

  const openPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    enterEsc();
    layoutStore.reducers.setScalableImgSrc(src || '');
    document.body.addEventListener('click', closePreview);
  };

  const onLoad = () => {
    emit('md-img-loaded');
  };

  return (
    <span>
      <img
        style={{ cursor: 'zoom-in' }}
        onLoad={onLoad}
        src={src}
        onClick={openPreview}
        alt={alt || 'preview-image'}
        {...rest}
      />
      <span
        className={`${
          escStack.includes('scale-image') && src === scalableImgSrc
            ? 'fixed top-0 right-0 left-0 bottom-0 z-50 flex items-center justify-center overflow-auto bg-desc'
            : 'hidden'
        }`}
      >
        <img style={{ cursor: 'zoom-out', margin: 'auto' }} src={src} alt={alt || 'preview-image'} {...rest} />
      </span>
    </span>
  );
};

const Link = ({ href, children }: LinkHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank" onClick={(e) => e.stopPropagation()}>
      {children}
    </a>
  );
};

// overwrite code will add duplicate pre wrappers(SyntaxHighlighter + original) in multiple line, so overwrite pre
const pre = ({ children }: { children: React.ReactChild }) => {
  const preProps = children?.[0].props;
  const codeStr = preProps.children[0].replace(/\n$/, '');
  const match = /language-(\w+)/.exec(preProps.className);
  return (
    <SyntaxHighlighter language={match?.[1]} style={github}>
      {codeStr}
    </SyntaxHighlighter>
  );
};

interface IMdProps {
  value: string;
  className?: string;
  style?: React.CSSProperties;
  noWrapper?: boolean;
  components?: Obj<Function>;
}
export const MarkdownRender = ({ value, className, style, noWrapper, components }: IMdProps) => {
  const content = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{ img: ScalableImage, a: Link, pre, ...components }}
    >
      {value}
    </ReactMarkdown>
  );
  if (noWrapper) {
    return content;
  }
  return (
    <div style={style} className={`md-content ${className || ''}`}>
      {content}
    </div>
  );
};

// have to overwrite img or other elements by extension
const toHtml = (value: string) =>
  micromark(value, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
/** @deprecated prevent use this */
MarkdownRender.toHtml = toHtml;

export default MarkdownRender;
