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
import { Tooltip, Dropdown, Menu, Input } from 'antd';
import { map } from 'lodash';
import './index.scss';
import i18n from 'i18n';
import { useClickAway } from 'react-use';
import { ErdaIcon } from 'common';

interface Tab {
  key: string;
  text: string;
  disabled?: boolean;
  tip?: string;
  children?: Tab[];
}

interface IProps {
  tabs: Tab[];
  onSelect: (key: string, mainKey?: string) => void;
  value: string;
  className?: string;
  theme?: 'light' | 'dark';
  mode?: 'underline' | 'button';
  tabNameRender?: (v: { tabs: Tab[]; value: string; onSelect: (key: string) => void }) => React.ReactNode;
}

const SimpleTabs = (props: IProps) => {
  const { tabs, onSelect, value, className = '', tabNameRender, theme = 'light', mode = 'button' } = props;
  const [filterValue, setFilterValue] = React.useState('');
  const [active, setActive] = React.useState(false);

  const getMenu = (key: string, children: Tab[]) => {
    return (
      <Menu className="common-simple-tabs-menu min-w-[160px]">
        {/* <Menu.Item
          key="filter"
          onClick={(e) => {
            console.log('------', e);
            e.domEvent.stopPropagation();
            e.domEvent.preventDefault();
          }}
        >
          <Input
            size="small"
            placeholder={i18n.t('search')}
            prefix={<ErdaIcon type="search1" className="text-default-3" size="16" />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value.toLowerCase())}
          />
        </Menu.Item> */}
        <Menu.Item className="common-simple-tabs-dropdown block" key="option">
          {map(
            children.filter(
              (item) =>
                (item.text || '').toLowerCase().includes(filterValue?.toLowerCase()) ||
                item.key.toLowerCase().includes(filterValue?.toLowerCase()),
            ),
            (g) => {
              return (
                <div
                  onClick={() => {
                    onSelect(g.key, key);
                  }}
                  className={`cursor-pointer p-1 hover:bg-default-06 hover:text-purple-deep ${
                    value === g.key ? 'text-purple-deep bg-default-06' : ''
                  }`}
                >
                  {g.text}
                </div>
              );
            },
          )}
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <div className={`common-simple-tabs tabs-${mode} flex-h-center ${className} theme-${theme}`}>
      {map(tabs, (item) => {
        const isSelectedChildren = item.children?.find((cItem) => cItem.key === value);
        const isSelected = value === item.key || isSelectedChildren;
        const subText = item.children?.find((cItem) => cItem.key === value)?.text;
        const showText = tabNameRender?.({ tabs, value, onSelect }) || (
          <span>
            <span
              onClick={() => {
                isSelectedChildren && onSelect(item.key, item.key);
              }}
              className={`${isSelectedChildren ? 'text-purple-deep hover:underline' : ''}`}
            >
              {item.text}
            </span>
            <span>{subText ? ` / ${subText}` : ''}</span>
          </span>
        );

        const TabComp = (
          <div
            key={item.key}
            className={`group flex-h-center common-simple-tabs-item cursor-pointer ${isSelected ? 'selected' : ''} ${
              item.disabled ? 'not-allowed' : ''
            }`}
            onClick={() => !isSelected && !item.disabled && onSelect(item.key, item.key)}
          >
            <Tooltip title={item.tip}>
              <span>{showText}</span>
            </Tooltip>
            {item.children?.length ? (
              <ErdaIcon type="caret-down" className="ml-1 text-default-3 group-hover:text-default-8" />
            ) : null}
          </div>
        );

        return !item.disabled && item.children?.length ? (
          <Dropdown overlay={getMenu(item.key, item.children)}>{TabComp}</Dropdown>
        ) : (
          TabComp
        );
      })}
    </div>
  );
};

export default SimpleTabs;
