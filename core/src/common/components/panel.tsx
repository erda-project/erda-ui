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
import { map, throttle } from 'lodash';
import { Row, Col } from 'nusi';
import ResizeObserver from 'rc-resize-observer';

export interface IPanelField {
  label?: React.ReactNode;
  value?: any;
  valueKey?: string;
  valueItem?: (item: IPanelField) => React.ReactNode;
  hide?: boolean;
}

interface IPanelProps {
  fields?: IPanelField[];
  data?: Nullable<Obj>;
  isMultiColumn?: boolean;
}

const handlers = {
  number: (num: React.ReactNode) => `${num}`,
  string: (str: React.ReactNode) => str,
  element: (obj: React.ReactNode) => {
    return getInnerText((obj as React.ReactElement).props.children);
  },
};

const getInnerText = (reactNode: React.ReactNode): string => {
  if (reactNode === null || reactNode === undefined) {
    return '';
  }
  const type = typeof reactNode;
  const nodeType = type !== 'object' ? type : Object.keys(reactNode).includes('props') ? 'element' : '';
  const handler: (p: React.ReactNode) => string = handlers[nodeType];
  if (handler) {
    return handler(reactNode);
  } else {
    return '';
  }
};

export const Panel = (props: IPanelProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = React.useState(0);
  const { fields = [], data, isMultiColumn = true } = props;
  const getRealValue = (item: IPanelField) =>
    data
      ? item.valueItem
        ? item.valueItem({ value: item.valueKey && data[item.valueKey] })
        : item.valueKey
        ? data[item.valueKey] || '-'
        : '-'
      : '-';

  const handleResize = throttle(() => {
    getWidth();
  }, 200);

  const getWidth = React.useCallback(() => {
    const _parentWidth = parentRef.current?.getBoundingClientRect().width || 0;
    setParentWidth(_parentWidth);
  }, [setParentWidth]);

  const colSpan = React.useMemo(() => {
    let _span = 1;
    switch (true) {
      case parentWidth < 400:
        _span = 24;
        break;
      case parentWidth < 600:
        _span = 12;
        break;
      case parentWidth < 1024:
        _span = 6;
        break;
      case parentWidth < 1440:
        _span = 4;
        break;
      default:
        _span = 3;
    }
    return _span;
  }, [parentWidth]);

  if (!isMultiColumn) {
    return (
      <>
        {map(fields, (item) => {
          if (item.hide) return null;
          return (
            <Row gutter={12} key={item.label as React.Key}>
              <Col span={24}>
                <div className="text-opacity-40 text-black" title={`${getInnerText(item.label)}`}>
                  {item.label}
                </div>
                <div title={getInnerText(getRealValue(item))} className="break-words">
                  {getRealValue(item)}
                </div>
              </Col>
            </Row>
          );
        })}
      </>
    );
  }
  return (
    <ResizeObserver onResize={handleResize}>
      <div ref={parentRef} className="mb-2">
        <Row gutter={12}>
          {parentWidth
            ? map(fields, (item) => {
                if (item.hide) return null;
                return (
                  <Col span={colSpan} key={item.label as React.Key}>
                    <div className="text-opacity-40 text-black" title={`${getInnerText(item.label)}`}>
                      {item.label}
                    </div>
                    <div title={getInnerText(getRealValue(item))} className="break-words mb-1">
                      {getRealValue(item)}
                    </div>
                  </Col>
                );
              })
            : null}
        </Row>
      </div>
    </ResizeObserver>
  );
};
