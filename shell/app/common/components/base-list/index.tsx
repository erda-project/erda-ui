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
import Pagination from 'common/components/pagination';
import { EmptyHolder as DefaultEmptyHolder } from 'common';
import i18n from 'i18n';
import ListItem from 'app/common/components/base-list/list-item';
import './index.scss';

const List = (props: ERDA_LIST.Props) => {
  const {
    dataSource,
    isLoadMore,
    onLoadMore,
    pagination,
    getKey,
    EmptyHolder,
    defaultLogo,
    defaultBgImg,
    columnsInfoWidth,
    onSelectChange,
    batchOperation,
    whiteFooter,
    className = '',
  } = props;
  return (
    <div className={`erda-base-list ${className} flex flex-col`}>
      {dataSource.length ? (
        <>
          <div className="flex-1 overflow-auto">
            {dataSource.map((item: ERDA_LIST.ListData, idx: number) => {
              return (
                <ListItem
                  defaultLogo={defaultLogo}
                  defaultBgImg={defaultBgImg}
                  key={getKey(item, idx)}
                  onSelectChange={onSelectChange ? () => onSelectChange(item.id) : undefined}
                  data={item}
                  columnsInfoWidth={columnsInfoWidth}
                />
              );
            })}
          </div>
          {pagination &&
            (!isLoadMore ? (
              <div
                className={`pagination-wrap flex items-center justify-between px-4 ${
                  whiteFooter ? 'bg-white' : 'bg-default-02'
                }`}
              >
                <div>{batchOperation}</div>
                <Pagination {...pagination} current={pagination.pageNo} />
              </div>
            ) : (
              (pagination?.total || 0) > dataSource.length && (
                <div className="hover-active load-more" onClick={() => onLoadMore(pagination.pageNo)}>
                  {i18n.t('more')}
                </div>
              )
            ))}
        </>
      ) : (
        <div>{EmptyHolder || <DefaultEmptyHolder relative />}</div>
      )}
    </div>
  );
};

List.ListItem = ListItem;

export default List;
