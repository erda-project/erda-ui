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
import { ErdaIcon } from 'common';

import './index.scss';

interface IProps {
  label: React.ReactNode;
  menus: Obj[];
  list: Obj[];
  renderSelectedItem?: (item: Obj) => React.ReactNode;
  renderItem?: (item: Obj) => React.ReactNode;
}

const ListSelect = ({ label, menus, list, renderSelectedItem, renderItem }: IProps) => {
  return (
    <div className="erda-list-select">
      <Dropdown
        trigger={['click']}
        overlay={
          <ListSelectOverlay
            menus={menus}
            list={list}
            label={label}
            renderSelectedItem={renderSelectedItem}
            renderItem={renderItem}
          />
        }
      >
        <div className="erda-list-select-btn flex items-center cursor-pointer">
          <ErdaIcon type="plus" color="currentColor" size={16} className="mr-1" />
          添加{label}
        </div>
      </Dropdown>
    </div>
  );
};

interface ListSelectOverlayProps {
  label: React.ReactNode;
  menus: Obj[];
  list: Obj[];
  onMenuChange: (item?: Obj) => void;
  renderSelectedItem?: (item: Obj) => React.ReactNode;
  renderItem?: (item: Obj) => React.ReactNode;
}

const defaultList = [
  { title: '这里是版本名称', application: 'Erda', createdAt: '2021/09/09 11:09:09' },
  { title: '这里是版本名称', application: 'Erda', createdAt: '2021/09/09 11:09:09' },
  { title: '这里是版本名称', application: 'Erda', createdAt: '2021/09/09 11:09:09' },
  { title: '这里是版本名称', application: 'Erda', createdAt: '2021/09/09 11:09:09' },
];

const defaultRenderItem = (item) => {
  return item.title || '-';
};

const ListSelectOverlay = ({
  label,
  menus: _menus,
  list,
  onMenuChange,
  renderSelectedItem = defaultRenderItem,
  renderItem = defaultRenderItem,
}: ListSelectOverlayProps) => {
  const menus = React.useMemo(() => [{ id: 0, title: '全部' }, ..._menus], [_menus]);
  const [selectedList, setSelectedList] = React.useState(defaultList);
  const [selectedMenu, setSelectedMenu] = React.useState<number | string>(0);

  const select = (item) => {
    const currentList = [...selectedList];
    const prevItemIndex = currentList.findIndex((listItem) => item.pid === listItem.pid);
    if (prevItemIndex || prevItemIndex === 0) {
      currentList.splice(prevItemIndex, 1);
    }
    setSelectedList([...currentList, item]);
  };

  React.useEffect(() => {
    onMenuChange && onMenuChange(menus.find((item) => item.id === selectedMenu));
  }, [selectedMenu, menus, onMenuChange]);

  return (
    <Row className="erda-list-select-overlay text-white rounded">
      <Col span={12} className="px-2 h-full">
        <div className="py-3 px-2">已选{label}</div>
        <div className="erda-list-select-selected-list overflow-y-auto">
          {selectedList.map((item) => (
            <div className="erda-list-select-selected-item flex items-center p-2 hover:bg-white-06 rounded-sm">
              <div className="flex-1 pr-2">{renderSelectedItem(item)}</div>
              <ErdaIcon
                type="close-small"
                size={24}
                className="erda-list-select-selected-item-delete cursor-pointer text-white-4"
              />
            </div>
          ))}
        </div>
        <div className="py-3 px-2">
          <Button className="mr-2" type="primary">
            确定
          </Button>
          <Button className="mr-2">取消</Button>
          <Button className="mr-2">一键清空</Button>
        </div>
      </Col>
      <Col span={12} className="px-2 h-full bg-white-08">
        <div className="py-3 px-2 flex items-center justify-between">全部{label}</div>
        <div className="erda-list-select-right-content flex">
          {menus && menus.length !== 0 ? (
            <div className="erda-list-select-menus p-2 bg-white-04">
              <Input className="bg-white-06 border-none mb-2" placeholder="搜索关键字" />
              {menus.map((item) => (
                <div
                  className={`erda-list-select-menu-item ${selectedMenu === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedMenu(item.id)}
                >
                  {item.title}
                </div>
              ))}
            </div>
          ) : null}

          <div className="erda-list-select-list flex-1 pl-2">
            <div className="px-2 mb-2">
              <Input className="bg-white-06 border-none" placeholder="搜索关键字" />
            </div>
            {list?.map?.((item) => (
              <div className="px-2 py-3 rounded-sm cursor-pointer hover:bg-white-06 flex" onClick={() => select(item)}>
                <Radio checked={!!selectedList.find((listItem) => listItem.id === item.id)} />
                <div className="pl-3 flex-1">{renderItem(item)}</div>
              </div>
            ))}
          </div>
        </div>
      </Col>
    </Row>
  );
};

interface RadioProps {
  checked?: boolean;
}

const Radio = ({ checked }: RadioProps) => {
  return (
    <div
      className={`inline-block rounded-full w-6 border border-solid border-white-300 flex p-1 ${
        checked ? 'border-purple-deep' : ''
      }`}
    >
      <div className={`inline-block flex-1 rounded-full ${checked ? 'bg-purple-deep' : ''}`} />
    </div>
  );
};

export default ListSelect;
