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
import { Tooltip } from 'antd';
import { Copy, ErdaIcon, TagsRow } from 'common';
import { has } from 'lodash';
import i18n from 'i18n';

export const convertTableData = (data?: CP_TABLE2.IData, haveBatchOp?: boolean, props?: CP_TABLE2.IProps) => {
  const { columnsMap: pColumnsMap, pageSizeOptions } = props || {};
  const { table } = data || {};
  const { columns: dataColumns, rows, pageNo, pageSize, total } = table || {};
  const { columnsMap, merges, orders } = dataColumns || {};
  const columns: Obj[] = [];
  const dataSource: Obj[] = [];
  const selectedRowKeys: string[] = [];
  let rowSelection: Obj | undefined;

  orders?.forEach((item) => {
    columns.push({
      dataIndex: item,
      key: item,
      sorter: !!columnsMap?.[item].enableSort,
      ...columnsMap?.[item],
      title: getTitleRender(columnsMap?.[item]),
      render: (val: Obj, record: Obj) => getRender(val, record),
      ...pColumnsMap?.[item],
    });
  });

  rows?.forEach((item) => {
    const { selected, id, selectable, cellsMap, operations } = item;
    if (haveBatchOp) {
      selected && selectedRowKeys.push(id);
    }
    const dataItem: Obj = { id, selectable };
    columns.forEach((cItem) => {
      const curDataKey = cItem.dataIndex;
      if (merges?.[curDataKey]) {
        const curItem: Obj = { type: 'multiple' };
        merges[curDataKey].orders.forEach((oItem) => {
          curItem[oItem] = cellsMap?.[oItem];
        });
        dataItem[curDataKey] = curItem;
      } else {
        dataItem[curDataKey] = cellsMap?.[curDataKey];
      }
    });
    dataItem.rowOperations = { ...operations };
    dataSource.push(dataItem);
  });
  if (haveBatchOp) {
    rowSelection = {
      getCheckboxProps: (record: Obj) => ({ disabled: has(record, 'selectable') ? !record.selectable : true }),
      selectedRowKeys,
    };
  }
  return { dataSource, columns, rowSelection, rowKey: 'id', total, pageNo, pageSize, pageSizeOptions };
};

const getTitleRender = (column?: CP_TABLE2.ColumnItem) => {
  const { title, tip } = column || {};
  if (title && tip) {
    return (
      <div className="flex items-center">
        {title}
        <Tooltip title={tip}>
          <ErdaIcon type="info" size="14" className="text-sm text-sub ml-2" />
        </Tooltip>
      </div>
    );
  }
  return title;
};

export const getRender = (val: Obj, record: Obj) => {
  const { type, data } = val || {};
  let Comp: React.ReactNode = null;
  switch (type) {
    case 'userAvatar':
      break;
    case 'dropDownMenu':
      // {
      // const {menus, operations} = data || {};
      // Comp = <DropdownSelectNew options={} />
      // }
      break;
    case 'text':
      {
        const value = (typeof data === 'string' ? data : data?.text) || '-';
        Comp = data.enableCopy ? (
          <span className="flex group" title={value}>
            <Copy copyText={value} className="ant-table-cell-ellipsis group-hover:text-purple-deep">
              {value || i18n.t('copy')}
            </Copy>
            <span className="text-desc opacity-0 group-hover:text-purple-deep group-hover:opacity-100">
              <ErdaIcon type="fz1" size={12} className="ml-1" />
            </span>
          </span>
        ) : (
          value
        );
      }
      break;
    case 'labels':
      {
        const { labels, showCount } = data;
        // TODO showCount should be calculated based on the container width
        Comp = (
          <TagsRow
            labels={labels.map((item: { id: string; title?: string; color?: string; group?: string }) => ({
              ...item,
              label: item.title || item.id,
            }))}
            showCount={showCount ?? 2}
          />
        );
      }
      break;
    default:
      Comp = (typeof data === 'string' ? data : data?.text) || '-';
      break;
  }
  return Comp;
};
