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
import { Tooltip, Menu, Popconfirm, Dropdown } from 'antd';
import { Copy, ErdaIcon, TagsRow, Badge, Avatar } from 'common';
import { has, map, isArray, get, sortBy, filter } from 'lodash';
import { getAvatarChars } from 'app/common/utils';
import { WithAuth } from 'user/common';
import i18n from 'i18n';
import { useUserMap } from 'core/stores/userMap';

interface Extra {
  customOp?: Obj;
  execOperation: (operation: CP_COMMON.Operation) => void;
}

export const convertTableData = (
  data?: CP_TABLE2.IData,
  haveBatchOp?: boolean,
  props?: CP_TABLE2.IProps,
  extra?: Extra,
) => {
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
      render: (val: Obj, record: Obj) => getRender(val, record, extra),
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

export const getRender = (val: Obj, record: Obj, extra?: Extra) => {
  const { type, data } = val || {};
  let Comp: React.ReactNode = null;
  switch (type) {
    case 'userAvatar':
      const userMap = useUserMap();
      const curUsers = [];
      if (isArray(data.value)) {
        data.value.forEach((vItem: any) => {
          curUsers.push(userMap[vItem] || {});
        });
      } else {
        curUsers.push(userMap[data.value] || {});
      }
      if (data.showIcon === false) {
        Comp = map(curUsers, (item) => item.nick || item.name || item.id || i18n.t('common:none')).join(', ');
      } else {
        Comp = (
          <div>
            {map(curUsers, (cU, idx) => {
              return (
                <span key={idx}>
                  {data.showIcon === false ? null : (
                    <Avatar src={cU.avatar} size="small">
                      {cU.nick ? getAvatarChars(cU.nick) : i18n.t('none')}
                    </Avatar>
                  )}
                  <span className="ml-0.5 mr-1" title={cU.name}>
                    {cU.nick || cU.name || data.value || i18n.t('common:none')}
                  </span>
                </span>
              );
            })}
          </div>
        );
      }
      break;
    case 'badge':
      Comp = data.text ? <Badge text={data.text} status={data.status} showDot={data.showDot} /> : '-';
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
    case 'moreOperations':
      {
        const { ops } = data;

        const getIcon = (icon: { type?: string; url?: string }) => {
          if (icon.type) {
            return <ErdaIcon type={icon.type} color="currentColor" className="mr-1" />;
          }
          if (icon.url) {
            return <img src={icon.url} />;
          }
          return null;
        };

        const getTableOperationItem = (op: CP_COMMON.Operation, key: string, record: Obj) => {
          const { confirm, disabled, disabledTip, text, icon } = op;
          if (disabled === true) {
            // 无权限操作
            return (
              <Menu.Item key={key} className="p-0">
                <WithAuth noAuthTip={disabledTip} key={key} pass={false}>
                  <span className="table-operations-btn px-4 py-1 block flex-h-center">
                    {icon ? getIcon(icon) : null}
                    {text}
                  </span>
                </WithAuth>
              </Menu.Item>
            );
          } else if (confirm) {
            // 需要确认的操作
            return (
              <Menu.Item key={key} className="p-0">
                <Popconfirm
                  title={confirm}
                  onConfirm={(e) => {
                    e && e.stopPropagation();
                    extra?.execOperation({
                      key: 'click',
                      clientData: {
                        dataRef: op,
                        parentDataRef: record,
                      },
                    });
                  }}
                  key={key}
                  onCancel={(e: any) => e && e.stopPropagation()}
                  zIndex={1100}
                >
                  <span
                    className="table-operations-btn px-4 py-1 block flex-h-center"
                    onClick={(e: any) => e.stopPropagation()}
                  >
                    {icon ? getIcon(icon) : null}
                    {text}
                  </span>
                </Popconfirm>
              </Menu.Item>
            );
          } else {
            // 普通的操作
            return (
              <Menu.Item key={key} className="p-0">
                <span
                  className="table-operations-btn px-4 py-1 block flex-h-center"
                  key={key}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    extra?.execOperation({
                      key: 'click',
                      clientData: {
                        dataRef: op,
                        parentDataRef: record,
                      },
                    });
                    const customFunc = get(extra, `customOp.operations.${key}`);
                    if (customFunc) {
                      customFunc(op);
                    }
                  }}
                >
                  {icon ? getIcon(icon) : null}
                  {text}
                </span>
              </Menu.Item>
            );
          }
        };

        const operationList = [] as any[];
        if (ops) {
          // 根据配置的operations展示
          const operations = sortBy(
            filter(map(ops) || [], (item: CP_COMMON.Operation) => item.show !== false),
            'showIndex',
          );

          map(operations, (item: CP_COMMON.Operation) => {
            if (item) {
              operationList.push(getTableOperationItem(item, item.id, record));
            }
          });
        }

        if (!operationList.length) {
          Comp = null;
        } else {
          Comp = (
            <div className="table-operations">
              <Dropdown
                overlay={
                  <Menu theme="dark" style={{ minWidth: 160, padding: '8px 0' }}>
                    {operationList}
                  </Menu>
                }
                align={{ offset: [0, 5] }}
                trigger={['click']}
              >
                <ErdaIcon
                  type="more"
                  className="cursor-pointer p-1 bg-hover rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          );
        }
      }
      break;
    default:
      Comp = (typeof data === 'string' ? data : data?.text) || '-';
      break;
  }
  return Comp;
};
