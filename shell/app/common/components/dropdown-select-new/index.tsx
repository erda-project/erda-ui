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

import { Dropdown, Menu, Input } from 'antd';
import { ErdaIcon } from 'common';
import React from 'react';
import { map } from 'lodash';
import i18n from 'i18n';
import { useUpdateEffect } from 'react-use';
import './index.scss';

type Size = 'small' | 'middle' | 'big';
export interface DropdownSelectNewProps {
  options: Option[];
  title?: string;
  optionSize?: Size;
  size?: Size;
  showFilter?: boolean;
  mode?: 'simple' | 'normal';
  required?: boolean;
  trigger?: Array<'click' | 'hover' | 'contextMenu'>;
  className?: string;
  overlayClassName?: string;
  width?: number;
  value?: string;
  disabled?: boolean;
  onChange?: (val: string, option: Option) => void;
  onClickItem?: (val: string, option: Option) => void;
  children?: React.ReactElement;
}

interface Option {
  label: string;
  key: string;
  icon?: string;
  imgURL?: string;
  desc?: string;
  disabled?: boolean;
  children?: Option[];
}

const DropdownSelect = (props: DropdownSelectNewProps) => {
  const {
    options,
    title,
    trigger,
    showFilter,
    optionSize = 'middle',
    size = 'middle',
    mode = 'normal',
    required,
    className = '',
    overlayClassName = '',
    value: pValue,
    width,
    disabled,
    children,
    onChange,
    onClickItem: pClickItem,
    ...restProps
  } = props;
  const [filterValue, setFilterValue] = React.useState('');
  const [active, setActive] = React.useState(false);
  const [value, setValue] = React.useState(pValue);

  const contentRef = React.useRef<HTMLDivElement>(null);
  useUpdateEffect(() => {
    if (pValue !== value) {
      setValue(pValue);
    }
  }, [pValue]);

  React.useEffect(() => {
    // 控制点击外部关闭 dropdown
    const handleCloseDropdown = (e: MouseEvent) => {
      const node = e.target as Node;
      const inner = contentRef.current?.contains(node);
      if (!inner && node !== contentRef.current) {
        setActive(false);
      }
    };
    document.body.addEventListener('click', handleCloseDropdown);
    return () => document.body.removeEventListener('click', handleCloseDropdown);
  }, []);

  const onClickItem = (option: Option) => {
    pClickItem?.(option.key, option);
    if (option.key === value && required) return;
    const curValue = option.key === value ? '' : option.key;
    if (onChange) {
      setValue(curValue);
      onChange(curValue, option);
    }
  };

  const overlay = (
    <Menu style={{ width }} className="erda-dropdown-select-menu">
      {title ? (
        <Menu.Item key="title">
          <div className="text-white">{title}</div>
        </Menu.Item>
      ) : null}
      {showFilter ? (
        <Menu.Item key="filter">
          <Input
            autoFocus
            size="small"
            placeholder={i18n.t('search')}
            prefix={<ErdaIcon type="search1" size="16" />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </Menu.Item>
      ) : null}
      <Menu.Item className="erda-dropdown-option-content block" key="option">
        {map(options, (item: Option) => {
          const isGroup = item.children?.length;

          if (isGroup) {
            return <GroupOpt onClickItem={onClickItem} key={item.key} value={value} option={item} size={optionSize} />;
          } else {
            return (
              <Item
                value={value}
                key={item.key}
                onClickItem={onClickItem}
                option={item}
                size={optionSize}
                className={className}
              />
            );
          }
        })}
      </Menu.Item>
    </Menu>
  );

  const allOption = options.reduce(
    (_optArr: Option[], _curOpt: Option) => _optArr.concat(_curOpt.children ?? _curOpt),
    [],
  );

  const chosenItem = allOption?.find((item) => item.key === value);
  return (
    <Dropdown
      overlayClassName={overlayClassName}
      className="erda-dropdown-select"
      overlay={overlay}
      visible={active}
      trigger={trigger || ['click']}
      {...restProps}
    >
      <div
        ref={contentRef}
        className={`inline-flex items-center cursor-pointer erda-dropdown-select-content ${
          disabled ? 'not-allowed' : ''
        }`}
        style={{ maxWidth: width }}
        onClick={() => !disabled && (mode === 'simple' || children) && setActive(!active)}
      >
        {children || (
          <>
            {chosenItem ? (
              <Item
                option={{ ...chosenItem }}
                size={size}
                onlyIcon={mode === 'simple'}
                className={`p-0 seleted-item ${className}`}
                switcher={
                  <span
                    className="rounded-sm bg-default-06 text-default-8 px-2 py-0.5 ml-1 hover:bg-purple-deep hover:text-white"
                    onClick={() => !disabled && setActive(!active)}
                  >
                    {i18n.t('common:switch')}
                  </span>
                }
              />
            ) : (
              <div>{i18n.t('please select')}</div>
            )}
            {mode === 'simple' ? <ErdaIcon type="caret-down" className="icon" size="14" /> : null}
          </>
        )}
      </div>
    </Dropdown>
  );
};

interface ItemProps extends Omit<DropdownSelectNewProps, 'options' | 'onClickItem'> {
  className?: string;
  onlyIcon?: boolean;
  option: Option;
  value?: string;
  switcher?: JSX.Element;
  size?: Size;
  onClickItem?: (op: Option) => void;
}

const Item = (props: ItemProps) => {
  const { option, size = 'middle', className = '', onlyIcon, value, onClickItem, switcher = null } = props;
  const { icon, imgURL, label, key, desc } = option;
  const iconSizeMap = {
    small: 16,
    middle: 24,
    big: 40,
  };
  return (
    <div
      className={`${className} ${size} cursor-pointer erda-dropdown-select-option-item flex w-full`}
      onClick={() => onClickItem?.(option)}
    >
      <div className="flex items-center flex-1 overflow-hidden">
        {icon ? (
          <ErdaIcon type={icon} className={`option-img ${onlyIcon ? 'mr-0' : ''}`} size={iconSizeMap[size]} />
        ) : imgURL ? (
          <img src={imgURL} className={`option-img ${onlyIcon ? 'mr-0' : ''}`} />
        ) : null}
        {onlyIcon ? null : (
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center">
              <div className="truncate option-label">{label}</div>
              {switcher}
            </div>
            {desc ? <div className="option-desc truncate ">{desc}</div> : null}
          </div>
        )}
      </div>
      <span className="flex">{value === key ? <ErdaIcon type="check" className="ml-2 text-purple-deep" /> : null}</span>
    </div>
  );
};

interface IGroupOptProps {
  value: string;
  size?: Size;
  option: Option;
  onClickItem?: (op: Option) => void;
}

const GroupOpt = (props: IGroupOptProps) => {
  const { option, value, size, onClickItem } = props;
  // const [expand, setExpand] = React.useState(true);

  const useOption = option.children;

  return (
    <div className={'erda-dropdown-select-option-group  w-full'}>
      <div
        className="erda-dropdown-select-option-group-label flex items-center justify-between"
        // onClick={() => setExpand(!expand)}
      >
        <div className="flex items-center text-xs p-1">{option.label}</div>
        {/* <ErdaIcon type="down" className={`expand-icon flex items-center ${expand ? 'expand' : ''}`} size="16" /> */}
      </div>
      <div className={'erda-dropdown-select-option-group-content'}>
        {useOption?.map((cItem) => {
          return <Item onClickItem={onClickItem} key={cItem.key} value={value} option={cItem} size={size} />;
        })}
      </div>
    </div>
  );
};

export default DropdownSelect;
