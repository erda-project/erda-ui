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
import { Col, Row, Spin } from 'antd';
import { RowProps } from 'antd/es/row';
import { ColProps } from 'antd/es/col';
import { get } from 'lodash';
import classnames from 'classnames';
import EmptyHolder from 'common/components/empty-holder';
import ErdaIcon from 'common/components/erda-icon';
import { useInViewport } from 'common/use-hooks';

interface CardColumnsProps<T> {
  dataIndex: keyof T | string[];
  colProps?: ColProps;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  children?: {
    rowProps?: RowProps;
    columns: CardColumnsProps<T>[];
  };
}

interface IProps<T = Record<string, any>> {
  size?: 'default' | 'small' | 'large';
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  rowClick?: (record: T) => void;
  onRefresh?: () => void;
  dataSource: T[];
  slot?: React.ReactNode;
  rowClassName?: string;
  columns: CardColumnsProps<T>[];
  emptyHolder?: React.ReactNode;
  onViewChange?: (data: T, flag?: boolean) => void;
}

const renderChild = <T extends unknown>(record: T, columns: CardColumnsProps<T>[], index: number) => {
  return columns.map((column) => {
    let nodes: React.ReactNode = get(record, column.dataIndex);
    if (column.render) {
      nodes = column.render(nodes, record, index);
    }
    if (column.children?.columns.length) {
      nodes = (
        <Row className="flex-1" gutter={8} {...column.children.rowProps}>
          {renderChild<T>(record, column.children.columns, index)}
        </Row>
      );
    }
    return (
      <Col key={column.dataIndex as string} span={12} {...column.colProps}>
        {nodes}
      </Col>
    );
  });
};

interface IRowProps<T> {
  rowClass?: string;
  rowClick: () => void;
  columns: CardColumnsProps<T>[];
  record: T;
  index: number;
  onViewChange?: (data: T, flag?: boolean) => void;
}

const RowItem = <T extends unknown>({ rowClick, rowClass, record, columns, index, onViewChange }: IRowProps<T>) => {
  const rowRef = React.useRef();
  const [isInView] = useInViewport(rowRef);
  React.useEffect(() => {
    onViewChange?.(record, isInView);
  }, [isInView, record]);
  return (
    <Row ref={rowRef} onClick={rowClick} className={rowClass}>
      {renderChild<T>(record, columns, index)}
    </Row>
  );
};

const CardList = <T extends unknown>({
  loading,
  dataSource,
  rowKey,
  rowClassName,
  columns,
  rowClick,
  slot,
  size = 'default',
  emptyHolder,
  onRefresh,
  onViewChange,
}: IProps<T>) => {
  return (
    <div className="card-list flex flex-1 flex-col bg-white shadow pb-2">
      <div className="card-list-header px-4 py-2 h-12 bg-lotion flex justify-between items-center">
        <div>{slot}</div>
        <div>
          {onRefresh ? (
            <ErdaIcon
              className="cursor-pointer"
              size="20"
              type="refresh"
              onClick={() => {
                onRefresh();
              }}
            />
          ) : null}
        </div>
      </div>
      <div className="card-list-body px-2 mt-2">
        <Spin spinning={!!loading}>
          {dataSource.length
            ? dataSource.map((record, index) => {
                let rowId;
                if (typeof rowKey === 'function') {
                  rowId = rowKey(record);
                } else {
                  rowId = record[rowKey];
                }
                const rowClass = classnames(
                  'shadow-card mb-4 mx-2 px-4 rounded-sm transition-all duration-300 hover:bg-grey',
                  {
                    'py-8': size === 'large',
                    'py-6': size === 'default',
                    'py-4': size === 'small',
                    [rowClassName as string]: !!rowClassName,
                    'cursor-pointer': rowClick,
                  },
                );
                return (
                  <RowItem<T>
                    key={rowId}
                    rowClass={rowClass}
                    rowClick={() => {
                      rowClick?.(record);
                    }}
                    columns={columns}
                    index={index}
                    record={record}
                    onViewChange={onViewChange}
                  />
                );
              })
            : emptyHolder || <EmptyHolder relative />}
        </Spin>
      </div>
    </div>
  );
};

export default CardList;
export { CardColumnsProps };
