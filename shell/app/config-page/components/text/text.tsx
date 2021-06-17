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
import { map, isNumber, isString, isArray, isPlainObject } from 'lodash';
import { Copy, ErdaIcon } from 'common';
import { Badge, Title } from 'app/nusi';
import i18n from 'i18n';
import imgMap from '../../img-map';
import classnames from 'classnames';
import './text.scss';

const getStyle = (styleConfig?: CP_TEXT.IStyleConfig) => {
  const styleObj = {} as Obj;
  const { bold, ...rest } = styleConfig || {};
  if (bold) {
    styleObj.fontWeight = 'bold';
  }
  map(rest || {}, (v, k) => {
    styleObj[k] = isNumber(v) ? `${v}px` : v;
  });
  return styleObj;
};

const Text = (props: CP_TEXT.Props) => {
  const { execOperation, props: configProps, operations } = props;
  const { renderType, value, styleConfig, visible = true, textStyleName = {}, title, titleLevel = 3, gapSize = 'normal' } = configProps || {};

  const textClassNames = classnames({
    ...textStyleName,
  });
  if (!visible) return null;
  let TextComp: React.ReactChild | null = null;
  const styleObj = getStyle(styleConfig);
  switch (renderType) {
    case 'statusText':
      if (isArray(value)) {
        TextComp = (
          <>
            {map(value, ({ text, status }) => <Badge key={text} status={status || 'default'} text={text} className={textClassNames} />)}
          </>
        );
      } else if (typeof value === 'object') {
        const { status, text } = (value || {}) as CP_TEXT.IStatusTextItem;
        TextComp = <Badge status={status || 'default'} text={text} className={textClassNames} />;
      }
      break;
    case 'copyText': {
      const { text, copyText } = (value || {}) as CP_TEXT.ICopyText;
      TextComp = <Copy copyText={copyText} className={textClassNames}>{text || i18n.t('copy')}</Copy>;
    }
      break;
    case 'linkText':
      {
        const { text, isPureText = true } = (value || {}) as CP_TEXT.ILinkTextData;
        if (isString(text)) {
          TextComp = (
            <span style={styleObj} className={textClassNames}>
              {text}
            </span>
          );
        } else if (isArray(text)) {
          TextComp = (
            <span className={`${isPureText ? '' : 'v-align'}`}>
              {text.map((t, idx) => {
                if (isString(t)) {
                  return (
                    <span style={styleObj} key={idx} className={textClassNames}>
                      {t}
                    </span>
                  );
                } else if (isPlainObject(t)) {
                  const { text: tText, operationKey, styleConfig: tConfig, icon, iconStyleName = '', image = '', withTag, tagStyle={} } = t;
                  const tStyle = getStyle(tConfig);

                  return operationKey ? (
                    <a
                      style={{ ...styleObj, ...tStyle }}
                      key={idx}
                      onClick={() => {
                        operations && operations[operationKey] && execOperation(operations[operationKey]);
                      }}
                      className={`${textClassNames} hover-active`}
                    >
                      {tText}
                      {icon && <ErdaIcon iconType={icon} className={`mr4 ml4 ${iconStyleName}`} />}
                      {image && (
                        <img src={image?.startsWith('/images') ? imgMap[image] : image} className="text-image" />
                      )}
                    </a>
                  ) : (
                    <span key={idx} className={textClassNames} style={{ ...styleObj, ...tStyle }}>
                      {
                        withTag ? <span style={tagStyle}>{tText}</span> : tText
                      }
                      {icon && <ErdaIcon iconType={icon} className={`mr4 ml4 ${iconStyleName}`} />}
                      {image && (
                        <img src={image?.startsWith('/images') ? imgMap[image] : image} className="text-image" />
                      )}
                    </span>
                  );
                }
                return null;
              })}
            </span>
          );
        } else if (isPlainObject(text)) {
          const { operationKey, text: tText, styleConfig: tConfig, icon, image = '', iconStyleName } = text;
          const tStyle = getStyle(tConfig);
          TextComp = operationKey ? (
            <a
              className={`${textClassNames} hover-active`}
              style={{ ...styleObj, ...tStyle }}
              onClick={() => {
                operations && operations[operationKey] && execOperation(operations[operationKey]);
              }}
            >
              {tText}
              {icon && <ErdaIcon iconType={icon} className={`mr4 ml4 ${iconStyleName}`} />}
              {image && <img src={image?.startsWith('/images') ? imgMap[image] : image} className="text-image" />}
            </a>
          ) : (
            <span className={textClassNames} style={{ ...styleObj, ...tStyle }}>
              {tText}
              {icon && <ErdaIcon iconType={icon} className={`mr4 ml4 ${iconStyleName}`} />}
              {image && <img src={image?.startsWith('/images') ? imgMap[image] : image} className="text-image" />}
            </span>
          );
        }
      }
      break;
    default:
      if (isArray(value)) {
        TextComp = <span className={textClassNames}
          style={styleObj}>{value.join('. ')}</span>;
      } else if (isString(value)) {
        TextComp = <span className={textClassNames}
          style={styleObj}>{value}</span>;
      }
      break;
  }

  return (
    <>
      {title &&
        <Title
          title={title}
          showDivider={false}
          level={titleLevel}
          className={`gap-size-${gapSize}`}
        />
      }
      {TextComp}
    </>
  )

};

export default Text;
