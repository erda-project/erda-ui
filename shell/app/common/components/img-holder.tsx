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

import { compact, map } from 'lodash';
import * as Holderjs from 'holderjs';
import React from 'react';
import { useMount } from 'react-use';
import { ossImg } from 'common/utils';

// @ts-ignore
Holderjs.addTheme('avatar', {
  bg: '#6a549e',
  fg: '#fff',
  size: 10,
  font: 'PingFang SC',
  fontweight: 'normal',
});

interface IProps {
  src?: string;
  rect?: string;
  random?: boolean;
  size?: number | string;
  text?: string;
  theme?: string;
  type?: string;
  alt?: string;
  fg?: string;
  bg?: string;
  [propName: string]: any;
}

export const ImgHolder = (props: IProps) => {
  const {
    src,
    rect,
    random,
    size: _size,
    text: _text,
    theme: _theme,
    font = 'PingFang SC',
    fontweight = 'normal',
    type,
    fg,
    bg,
    ...otherProps
  } = props;
  const isHolder = React.useRef<boolean>(!src);
  const holder = React.useRef<HTMLElement>();
  const [errorInfo, setErrorInfo] = React.useState({});
  const style: React.CSSProperties = {};
  React.useEffect(() => {
    isHolder.current = !src;
  }, [src]);
  useMount(() => {
    initHolder();
  });

  const initHolder = () => {
    if (isHolder.current) {
      Holderjs.run({
        images: holder.current as HTMLElement,
      });
      Holderjs.setResizeUpdate(holder.current, false);
    }
  };

  const handleErr = (imgSrc?: string) => {
    setErrorInfo({ 'data-img-error-src': imgSrc });
  };

  if (isHolder.current) {
    let size = _size;
    let theme = _theme;
    const text = _text || '';
    if (type === 'avatar') {
      style.borderRadius = '100%';
      if (text.length === 1) {
        size = 12;
        theme = 'avatar';
      }
    }
    let holderParams = '';
    try {
      holderParams = encodeURI(
        compact(
          map({ random, size, text, theme, fg, bg, font, fontweight }, (v, k) => (v === undefined ? v : `${k}=${v}`)),
        ).join('&'),
      );
    } catch (error) {
      holderParams = encodeURI(
        compact(
          map({ random, size, text: 'n', theme, fg, bg, font, fontweight }, (v, k) =>
            v === undefined ? v : `${k}=${v}`,
          ),
        ).join('&'),
      );
    }
    return (
      <img
        alt="holder"
        data-text={text}
        data-src={`holder.js/${rect}?${holderParams}`}
        ref={holder as React.RefObject<HTMLImageElement>}
        style={style}
        {...otherProps}
      />
    );
  }
  let [w, h] = [200, 200];
  if (rect) {
    [w, h] = rect.split('x').map((a) => Number(a));
    style.width = `${w}px`;
    style.height = `${h}px`;
  }
  return (
    <img
      alt="holder"
      src={ossImg(src, { w: Math.round(w * 1.4), h: Math.round(h * 1.4) })} // 加载图片比展示尺寸稍微大一点更清晰
      onError={() => handleErr(src)}
      style={style}
      {...errorInfo}
      {...otherProps}
    />
  );
};

export default ImgHolder;
