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
import { Dropdown, Row, Col, Button, Input, Timeline, Collapse, Modal, message } from 'antd';
import i18n from 'i18n';
import { ErdaIcon, Pagination } from 'common';
import { IPaginationProps } from 'common/components/pagination';
import { useUpdateEffect } from 'react-use';
import empty from 'app/images/empty.svg';

import './release-select.scss';

const { Panel } = Collapse;

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

interface IProps<T extends Obj> {
  value?: Array<{ active: boolean; list: T[] }>;
  rowKey?: string;
  parentKey?: string;
  menuRowKey?: string;
  readOnly?: boolean;
  onChange?: (values: Array<{ active: boolean; list: T[] }>) => void;
  renderSelectedItem?: (item: T) => React.ReactNode;
}

function ReleaseSelect<T extends { applicationId: string; title: string }>(props: IProps<T>) {
  const {
    renderSelectedItem = defaultRenderItem,
    onChange,
    rowKey = 'id',
    parentKey = 'pId',
    menuRowKey = 'id',
    value,
    readOnly,
  } = props;
  const [selectedList, setSelectedList] = React.useState<T[]>([]);
  const [groupList, setGroupList] = React.useState<Array<{ active: boolean; list: T[] }>>([{ active: true, list: [] }]);
  const [releaseVisible, setReleaseVisible] = React.useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = React.useState<number>(0);
  const select = (selectItem: T, checked: boolean) => {
    const groupIndex = groupList.findIndex((group) =>
      group.list.find((item) => item.applicationId === selectItem.applicationId),
    );
    if (groupIndex === -1 || groupIndex === currentGroup) {
      setSelectedList((prev) =>
        checked
          ? [...prev.filter((item) => item[parentKey] !== selectItem[parentKey]), selectItem]
          : prev.filter((item) => item[rowKey] !== selectItem[rowKey]),
      );
    } else {
      message.error(
        i18n.t('dop:this application already has release selected in {name}', {
          name: i18n.t('dop:group {index}', { index: groupIndex + 1 }),
        }),
      );
    }
  };

  const remove = (id: string) => {
    setSelectedList((prev) => prev.filter((item) => item[rowKey] !== id));
  };

  const removeResult = (i: number, id: string) => {
    const { list } = groupList[i];
    const currentList = [...list];
    const index = list.findIndex((item) => item[rowKey] === id);
    currentList.splice(index, 1);
    groupList[i].list = currentList;
    setGroupList([...groupList]);
    onChange?.(groupList);
  };

  const removeGroup = (index: number, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const _groupList = groupList.filter((_item, i) => i !== index);
    setGroupList(_groupList);
    onChange?.(_groupList);
  };

  const clear = () => {
    setSelectedList([]);
  };

  const onOk = () => {
    groupList[currentGroup].list = selectedList;
    setGroupList(groupList);
    onChange?.([...groupList]);
    setReleaseVisible(false);
  };

  React.useEffect(() => {
    value && setGroupList(value);
  }, [value]);

  return (
    <div className="erda-list-select">
      <Timeline className="mt-1 project-release-time-line">
        {groupList.map((group, index) => (
          <Timeline.Item
            dot={
              <div className="leading-4">
                <i
                  className={`inline-block rounded-full border-primary border-solid w-2 h-2 ${
                    group.active ? 'bg-primary' : ''
                  }`}
                  style={{ borderWidth: 1 }}
                />
              </div>
            }
          >
            <Collapse
              activeKey={group.active ? ['1'] : []}
              onChange={() => {
                groupList[index].active = !groupList[index].active;
                setGroupList([...groupList]);
              }}
              ghost
              className="time-line-collapse"
            >
              <Panel
                header={
                  <span className={`time-line-collapse-header ${group.active ? 'active' : ''}`}>
                    <span className="group-title">{i18n.t('dop:group {index}', { index: index + 1 })}</span>
                    {group.list?.length ? (
                      <span className="bg-default-1 rounded-full px-2 py-0.5 text-xs ml-1">{group.list.length}</span>
                    ) : (
                      ''
                    )}
                    {!readOnly ? (
                      <ErdaIcon
                        className="float-right mr-5 mt-1 text-default-6 remove-group"
                        type="remove"
                        size={16}
                        onClick={(e: React.MouseEvent<HTMLElement>) => removeGroup(index, e)}
                      />
                    ) : (
                      ''
                    )}
                  </span>
                }
                key="1"
              >
                {group.list?.length ? (
                  <div className="bg-default-02 p-2">
                    {group.list?.map?.((item) => (
                      <div
                        className={`erda-list-select-selected-item flex items-center p-2 rounded-sm ${
                          !readOnly ? 'hover:bg-default-04' : ''
                        }`}
                        key={item[rowKey]}
                      >
                        <div className="flex-1 pr-2 overflow-auto">{renderSelectedItem(item)}</div>
                        {!readOnly ? (
                          <ErdaIcon
                            type="close-small"
                            size={24}
                            className="erda-list-select-selected-item-delete cursor-pointer text-default-4"
                            onClick={() => removeResult(index, item[rowKey])}
                          />
                        ) : null}
                      </div>
                    ))}
                    {!readOnly ? (
                      <div
                        className="text-center text-purple-deep cursor-pointer"
                        onClick={() => {
                          setReleaseVisible(true);
                          setCurrentGroup(index);
                          setSelectedList(group.list);
                        }}
                      >
                        {i18n.t('dop:manage the group of releases')}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  <div className="bg-default-02 py-4 flex-all-center">
                    <img src={empty} className="mr-2" />
                    <div>
                      <div className="text-lg leading-6">{i18n.t('dop:no releases have been selected yet')}</div>
                      <div
                        className="text-xs text-purple-deep cursor-pointer leading-5"
                        onClick={() => {
                          setReleaseVisible(true);
                          setCurrentGroup(index);
                          setSelectedList([]);
                        }}
                      >
                        {i18n.t('dop:click to add application release')}
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            </Collapse>
          </Timeline.Item>
        ))}
        {!readOnly ? (
          <Timeline.Item
            dot={
              <div className="leading-4">
                <i
                  className="inline-block rounded-full border-primary border-solid w-2 h-2"
                  style={{ borderWidth: 1 }}
                />
              </div>
            }
          >
            <div
              className={'erda-list-select-btn px-2 leading-7 rounded-sm inline-flex items-center cursor-pointer'}
              onClick={() => setGroupList((prev) => [...prev, { active: true, list: [] }])}
            >
              <ErdaIcon type="plus" color="currentColor" size={16} className="mr-1" />
              {i18n.t('add {name}', { name: i18n.t('dop:group') })}
            </div>
          </Timeline.Item>
        ) : (
          ''
        )}
      </Timeline>
      <Modal
        visible={releaseVisible}
        onCancel={() => setReleaseVisible(false)}
        wrapClassName="no-wrapper-modal"
        width={1120}
        footer={null}
      >
        <ListSelectOverlay
          {...props}
          selectedList={selectedList}
          select={select}
          remove={remove}
          onOk={onOk}
          onCancel={() => setReleaseVisible(false)}
          clear={clear}
          rowKey={rowKey}
          menuRowKey={menuRowKey}
          parentKey={parentKey}
        />
      </Modal>
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
  renderSelectedItem?: (item: T, isDark?: boolean) => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
  select: (item: T, checked: boolean) => void;
  remove: (id: string) => void;
  clear: () => void;
  selectedList: T[];
  rowKey: string;
  menuRowKey: string;
  parentKey: string;
  rightSlot?: React.ReactNode;
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
  rightSlot,
}: ListSelectOverlayProps<T>) {
  const defaultSelectMenu = React.useMemo(
    () => ({ [menuRowKey]: 0, title: i18n.t('dop:all {name}', { name: i18n.t('App') }) }),
    [menuRowKey],
  );
  const menus = React.useMemo(() => [defaultSelectMenu, ..._menus], [_menus, defaultSelectMenu]);
  const [selectedMenu, setSelectedMenu] = React.useState<{ title: string }>(defaultSelectMenu);
  const [menusPageNo, setMenusPageNo] = React.useState<number>(1);

  useUpdateEffect(() => {
    onMenuChange && onMenuChange(selectedMenu);
  }, [selectedMenu, menus, menuRowKey]);

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
              <div className="flex-1 pr-2 min-w-0 truncate">{renderSelectedItem(item, true)}</div>
              <ErdaIcon
                type="close-small"
                size={24}
                className="erda-list-select-selected-item-delete cursor-pointer text-white-4"
                onClick={() => remove(item[rowKey])}
              />
            </div>
          ))}
          {!selectedList.length ? (
            <div className="h-full flex items-center justify-center flex-col">
              <img src={empty} />
              <div className="text-white-6 mt-2">{i18n.t('dop:no choice {name}', { name: label })}</div>
            </div>
          ) : null}
        </div>
        <div className="py-3 px-2">
          <Button className="mr-2" type="primary" onClick={onOk}>
            {i18n.t('ok')}
          </Button>
          <Button className="mr-2" onClick={clear}>
            {i18n.t('one click to clear')}
          </Button>
          <Button className="mr-2" onClick={onCancel}>
            {i18n.t('cancel')}
          </Button>
        </div>
      </Col>
      <Col span={12} className="px-2 h-full bg-white-08">
        <div className="py-3 px-2 flex items-center">
          <Dropdown
            trigger={['click']}
            getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
            overlay={
              <div className="erda-list-select-menus p-2 bg-default max-h-80">
                <div onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()}>
                  <Input
                    prefix={<ErdaIcon type="search" color="currentColor" />}
                    className="bg-white-06 border-none mb-2"
                    placeholder={i18n.t('search {name}', { name: i18n.t('dop:app name') })}
                    onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      onMenuFilter?.(e.target.value);
                      setSelectedMenu(defaultSelectMenu);
                    }}
                  />
                </div>

                {menus.map((item) => {
                  const selectNum = selectedList.filter((i) => i[parentKey] === item[menuRowKey]).length;
                  return (
                    <div
                      className={`erda-list-select-menu-item flex items-center hover:bg-white-06 ${
                        selectedMenu[menuRowKey] === item[menuRowKey] ? 'active' : ''
                      }`}
                      onClick={() => setSelectedMenu(item)}
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
            }
          >
            <div className="pl-2 flex-h-center cursor-pointer">
              {selectedMenu.title} <ErdaIcon size={16} type="caret-down" className="ml-1 text-white-3" />
            </div>
          </Dropdown>
          <div className="pl-4">{rightSlot}</div>
        </div>
        <div className="erda-list-select-right-content flex">
          <div className="flex-1 pl-2 min-w-0">
            <div className="px-2 mb-2">
              <Input
                prefix={<ErdaIcon type="search" />}
                className="bg-white-06 border-none"
                placeholder={i18n.t('search {name}', { name: label })}
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

                {!list.length ? (
                  <div className="h-full flex items-center justify-center flex-col">
                    <img src={empty} />
                    <div className="text-white-6 mt-2">{i18n.t('dop:no {name}', { name: label })}</div>
                  </div>
                ) : null}
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
      className={`w-6 h-6 inline-block rounded-full border border-solid border-white-3 flex p-1 ${
        checked ? 'bg-purple-deep border-purple-deep' : ''
      }`}
    >
      {checked ? <ErdaIcon type="check" /> : null}
    </div>
  ) : (
    <div
      className={`w-6 h-6 inline-block rounded-full border border-solid border-white-3 flex p-1 ${
        checked ? 'border-purple-deep' : ''
      }`}
    >
      <div className={`inline-block flex-1 rounded-full ${checked ? 'bg-purple-deep' : ''}`} />
    </div>
  );
};

export default ReleaseSelect;
