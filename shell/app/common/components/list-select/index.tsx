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
import { Dropdown, Row, Col, Button, Input } from 'antd';
import i18n from 'i18n';
import { ErdaIcon, Pagination } from 'common';
import { IPaginationProps } from 'common/components/pagination';
import { useUpdateEffect } from 'react-use';

import './index.scss';

/**
 * list select
 * @param label The title used to display in buttons and popovers
 * @param value External value of the component
 * @param onChange A callback function when a component value changes
 * @param rowKey The ID of list
 * @param parentKey The ID of the menu item that the list corresponds to
 * @param menuRowKey The ID of menu
 * @param onMenuChange A callback function when the value of menu changes
 * @param onMenuFilter A callback function when menu filter
 * @param onListFilter A callback function when list filter
 * @param listPagination pagination of list
 * @param renderSelectedItem A function used to render the selected list
 * @param renderItem A function used to render the list
 */

interface IProps<T extends object = any> {
  label: React.ReactNode;
  value?: T[];
  onChange?: (values: T[]) => void;
  rowKey: string;
  parentKey: string;
  menuRowKey: string;
  renderSelectedItem?: (item: T) => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
  list: T[];
  menus: Array<{ title: string }>;
}

function ListSelect<T extends object = any>(props: IProps<T>) {
  const {
    label,
    renderSelectedItem = defaultRenderItem,
    onChange,
    rowKey = 'id',
    parentKey = 'pId',
    menuRowKey = 'id',
    value,
  } = props;
  const [selectedList, setSelectedList] = React.useState<T[]>([]);
  const [resultList, setResultList] = React.useState<T[]>([]);
  const [visible, setVisible] = React.useState<boolean>(false);
  const select = (selectItem: T, checked: boolean) => {
    setSelectedList((prev) =>
      checked ? [...prev, selectItem] : prev.filter((item) => item[rowKey] !== selectItem[rowKey]),
    );
  };

  const remove = (id: string) => {
    setSelectedList((prev) => prev.filter((item) => item[rowKey] !== id));
  };

  const removeResult = (id: string) => {
    const currentList = [...resultList];
    const index = resultList.findIndex((item) => item[rowKey] === id);
    currentList.splice(index, 1);
    onChange?.(currentList);
    setResultList(currentList);
  };

  const clear = () => {
    setSelectedList([]);
  };

  const onOk = () => {
    onChange?.(selectedList);
    setResultList(selectedList);
    setVisible(false);
  };

  React.useEffect(() => {
    value && setResultList(value);
  }, [value]);

  return (
    <div className="erda-list-select">
      <Dropdown
        trigger={['click']}
        overlay={
          <ListSelectOverlay
            {...props}
            selectedList={selectedList}
            select={select}
            remove={remove}
            onOk={onOk}
            onCancel={() => setVisible(false)}
            clear={clear}
            rowKey={rowKey}
            menuRowKey={menuRowKey}
            parentKey={parentKey}
          />
        }
        visible={visible}
        onVisibleChange={(_visible: boolean) => {
          _visible && setSelectedList(resultList);
          setVisible(_visible);
        }}
      >
        <div className="erda-list-select-btn px-2 py-1 rounded-sm inline-flex items-center cursor-pointer">
          <ErdaIcon type="plus" color="currentColor" size={16} className="mr-1" />
          {i18n.t('add {name}', { name: label })}
        </div>
      </Dropdown>
      <div className="result-list mt-4 rounded-sm">
        {resultList.map((item) => (
          <div
            className="erda-list-select-selected-item flex items-center p-2 hover:bg-default-04 rounded-sm"
            key={item[rowKey]}
          >
            <div className="flex-1 pr-2">{renderSelectedItem(item)}</div>
            <ErdaIcon
              type="close-small"
              size={24}
              className="erda-list-select-selected-item-delete cursor-pointer"
              onClick={() => removeResult(item[rowKey])}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListSelectOverlayProps<T> {
  label: React.ReactNode;
  multiple?: boolean;
  menus: Array<{ title: string }>;
  menusTotal?: number;
  list: T[];
  onMenuChange?: (item?: { title: string }) => void;
  onMenuFilter?: (q: string) => void;
  onListFilter?: (q: string) => void;
  onOk?: () => void;
  onCancel?: () => void;
  onMenuLoadMore?: (page: number, pageSize?: number) => void;
  listPagination?: IPaginationProps;
  renderSelectedItem?: (item: T) => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
  select: (item: T, checked: boolean) => void;
  remove: (id: string) => void;
  clear: () => void;
  selectedList: T[];
  rowKey: string;
  menuRowKey: string;
  parentKey: string;
  value?: T[];
  onChange?: (values: T[]) => void;
}

const defaultRenderItem = (item: { title: string }) => {
  return item.title || '-';
};

function ListSelectOverlay<T extends object = any>({
  label,
  multiple = true,
  menus: _menus,
  menusTotal = 0,
  list,
  onMenuChange,
  onMenuFilter,
  onListFilter,
  onOk,
  onCancel,
  onMenuLoadMore,
  listPagination,
  renderSelectedItem = defaultRenderItem,
  renderItem = defaultRenderItem,
  select,
  remove,
  clear,
  selectedList,
  rowKey,
  menuRowKey,
  parentKey,
}: ListSelectOverlayProps<T>) {
  const menus = React.useMemo(() => [{ [menuRowKey]: 0, title: i18n.t('dop:all') }, ..._menus], [_menus, menuRowKey]);
  const [selectedMenu, setSelectedMenu] = React.useState<number | string>(0);
  const [menusPageNo, setMenusPageNo] = React.useState<number>(1);

  useUpdateEffect(() => {
    onMenuChange && onMenuChange(menus.find((item) => item[menuRowKey] === selectedMenu));
  }, [selectedMenu, menus, onMenuChange, menuRowKey]);

  return (
    <Row className="erda-list-select-overlay text-white rounded">
      <Col span={12} className="px-2 h-full">
        <div className="py-3 px-2">
          {i18n.t('selected {name}', { name: label })}
          {selectedList.length && selectedList.length !== 0 ? (
            <span className="selected-num ml-2 rounded-full">{selectedList.length}</span>
          ) : null}
        </div>
        <div className="erda-list-select-selected-list overflow-y-auto">
          {selectedList.map((item) => (
            <div
              className="erda-list-select-selected-item flex items-center p-2 hover:bg-white-06 rounded-sm"
              key={item[rowKey]}
            >
              <div className="flex-1 pr-2 min-w-0 truncate">{renderSelectedItem(item)}</div>
              <ErdaIcon
                type="close-small"
                size={24}
                className="erda-list-select-selected-item-delete cursor-pointer text-white-4"
                onClick={() => remove(item[rowKey])}
              />
            </div>
          ))}
        </div>
        <div className="py-3 px-2">
          <Button className="mr-2" type="primary" onClick={onOk}>
            {i18n.t('ok')}
          </Button>
          <Button className="mr-2" onClick={onCancel}>
            {i18n.t('cancel')}
          </Button>
          <Button className="mr-2" onClick={clear}>
            {i18n.t('one click to clear')}
          </Button>
        </div>
      </Col>
      <Col span={12} className="px-2 h-full bg-white-08">
        <div className="py-3 px-2 flex items-center justify-between">{i18n.t('dop:all {name}', { name: label })}</div>
        <div className="erda-list-select-right-content flex">
          {menus && menus.length !== 0 ? (
            <div className="erda-list-select-menus p-2 bg-white-04">
              <Input
                prefix={<ErdaIcon type="search" color="currentColor" />}
                className="bg-white-06 border-none mb-2"
                placeholder={i18n.t('common:keyword to search')}
                onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => onMenuFilter?.(e.target.value)}
              />
              {menus.map((item) => {
                const selectNum = selectedList.filter((i) => i[parentKey] === item[menuRowKey]).length;
                return (
                  <div
                    className={`erda-list-select-menu-item flex items-center hover:bg-white-06 ${
                      selectedMenu === item[menuRowKey] ? 'active' : ''
                    }`}
                    onClick={() => setSelectedMenu(item[menuRowKey])}
                    key={item[menuRowKey]}
                  >
                    <span className="truncate" title={item.title}>
                      {item.title}
                    </span>
                    {selectNum !== 0 ? (
                      <span className="selected-num bg-purple-deep ml-2 rounded-full text-xs">{selectNum}</span>
                    ) : null}
                  </div>
                );
              })}
              {menus.length < menusTotal && onMenuLoadMore ? (
                <div
                  className="erda-list-select-menu-item hover:bg-white-06"
                  onClick={() => {
                    setMenusPageNo(menusPageNo + 1);
                    onMenuLoadMore(menusPageNo + 1);
                  }}
                >
                  <ErdaIcon type="loading" className="align-middle mr-2" spin />
                  {i18n.t('load more')}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex-1 pl-2 min-w-0">
            <div className="px-2 mb-2">
              <Input
                prefix={<ErdaIcon type="search" />}
                className="bg-white-06 border-none"
                placeholder={i18n.t('common:keyword to search')}
                onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => onListFilter?.(e.target.value)}
              />
            </div>
            <div className="erda-list-select-list flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto">
                {list?.map?.((item) => {
                  const checked = !!selectedList.find((listItem) => listItem[rowKey] === item[rowKey]);
                  return (
                    <div
                      className="px-2 py-3 rounded-sm cursor-pointer hover:bg-white-06 flex items-center"
                      onClick={() => select(item, !checked)}
                      key={item[rowKey]}
                    >
                      <Radio multiple={multiple} checked={checked} />
                      <div className="pl-3 flex-1 min-w-0 truncate">{renderItem(item)}</div>
                    </div>
                  );
                })}
              </div>

              {listPagination ? <Pagination hidePageSizeChange {...listPagination} /> : null}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

interface RadioProps {
  checked?: boolean;
  multiple?: boolean;
}

const Radio = ({ checked, multiple = false }: RadioProps) => {
  return multiple ? (
    <div
      className={`w-6 h-6 inline-block rounded-full border border-solid border-white-300 flex p-1 ${
        checked ? 'bg-purple-deep border-purple-deep' : ''
      }`}
    >
      {checked ? <ErdaIcon type="check" /> : null}
    </div>
  ) : (
    <div
      className={`w-6 h-6 inline-block rounded-full border border-solid border-white-300 flex p-1 ${
        checked ? 'border-purple-deep' : ''
      }`}
    >
      <div className={`inline-block flex-1 rounded-full ${checked ? 'bg-purple-deep' : ''}`} />
    </div>
  );
};

export default ListSelect;
