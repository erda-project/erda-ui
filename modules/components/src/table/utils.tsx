import { Dropdown, Menu, Tooltip } from 'antd';
import cn from 'classnames';
import React from 'react';
import ErdaIcon from '../icon';
import { ErdaColumnType } from '.';
import { ColumnsConfig, TableRowActions } from './interface';

export const getLsColumnsConfig = (key: string): ColumnsConfig => {
  const str = localStorage.getItem(`table-key-${key}`);
  return str ? JSON.parse(str) : null;
};

// TODO consider different user use same PC condition
export const saveLsColumnsConfig = (key: string, config: ColumnsConfig) => {
  localStorage.setItem(`table-key-${key}`, JSON.stringify(config));
};

// due to dataIndex could be number | string | string[] | number[], to store it as key then should convert it to string
export const transformDataIndex = (dataIndex: string | number | ReadonlyArray<string | number> | undefined): string => {
  if (!dataIndex) {
    // eslint-disable-next-line no-console
    console.warn('dataIndex is required');
    return '-';
  }
  if (typeof dataIndex === 'number') {
    return `${dataIndex}`;
  }
  if (Array.isArray(dataIndex)) {
    return dataIndex.map((item) => `${item}`).join('-');
  }
  return dataIndex as string;
};

export function renderActions<T extends object = any>(
  clsPrefix: string,
  locale: { operation: string },
  actions?: TableRowActions<T> | null,
): Array<ErdaColumnType<T>> {
  if (actions) {
    const { render } = actions;
    return [
      {
        title: locale.operation,
        width: 100,
        dataIndex: 'operation',
        fixed: 'right',
        render: (_: unknown, record: T) => {
          const list = render(record).filter((item) => item.show !== false);

          const menu = (
            <Menu theme="dark">
              {list.map((item, index) => {
                const { title, onClick, disabled = false, disabledTip } = item;
                return (
                  <Menu.Item key={index} onClick={disabled ? undefined : onClick}>
                    <Tooltip title={disabled && disabledTip}>
                      <span
                        className={cn(`${clsPrefix}-menu-item`, {
                          [`${clsPrefix}-menu-item-disabled`]: !!disabled,
                        })}
                        onClick={disabled ? (e: any) => e && e.stopPropagation && e.stopPropagation() : undefined}
                      >
                        {title}
                      </span>
                    </Tooltip>
                  </Menu.Item>
                );
              })}
            </Menu>
          );

          return (
            <span onClick={(e) => e.stopPropagation()}>
              {!!list.length && (
                <Dropdown overlay={menu} align={{ offset: [0, 5] }} trigger={['click']}>
                  <ErdaIcon type="gengduo" size="16" className={`${clsPrefix}-action-more`} />
                </Dropdown>
              )}
            </span>
          );
        },
      },
    ];
  }
  return [];
}
