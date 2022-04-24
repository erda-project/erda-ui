import React from 'react';
import { Popover, Input, Button, Dropdown, Menu } from 'antd';
import ErdaIcon, { useErdaIcon } from '../icon';
import { usePrefixCls } from '../_util/hooks';
import { replaceMessage, useLocaleReceiver } from '../locale-provider';

export interface IPagination {
  pageSize: number;
  pageSizeOptions: string[];
}

export const PAGINATION: IPagination = {
  pageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
};

/**
 * 配置项：
    total // 总数，默认为0
    current // 当前页码，默认为1
    pageSize // 每页行数默认为PAGINATION.pageSize
    showSizeChanger // 是否选择pageSize的下拉选择框，默认为true
    onChange // 翻页或者pageSize选择时触发，第一个参数为current，第二个参数为pageSize
 */
export interface IPaginationProps {
  total?: number;
  current?: number;
  pageSize?: number;
  theme?: 'light' | 'dark';
  onChange: (page: number, pageSize: number) => void;
  hidePageSizeChanger?: boolean;
  hideTotal?: boolean;
}

interface IPaginationJumpProps {
  pagination: IPaginationProps;
  hidePopover: () => void;
}

const Pagination = (pagination: IPaginationProps) => {
  const {
    total = 0,
    current = 1,
    pageSize = PAGINATION.pageSize,
    onChange,
    hidePageSizeChanger: hidePageSizeChange = false,
    hideTotal = false,
    theme = 'light', // TODO
  } = pagination;

  useErdaIcon();
  const [locale] = useLocaleReceiver('Pagination');
  const [prefixCls] = usePrefixCls('pagination');

  const [goToVisible, setGoToVisible] = React.useState(false);

  return (
    <div className={`${prefixCls} theme-${theme}`}>
      {!hideTotal ? (
        <div className={`${prefixCls}-total`}>{replaceMessage(locale.totalText, { total: `${total}` })}</div>
      ) : null}
      <div className={`${prefixCls}-content`}>
        <div
          className={`${prefixCls}-pre ${current === 1 ? 'disabled' : 'pointer'}`}
          onClick={() => current > 1 && onChange?.(current - 1, pageSize)}
        >
          <ErdaIcon type="chevronleft" size={16} />
        </div>

        <Popover
          content={<PaginationJump pagination={pagination} hidePopover={() => setGoToVisible(false)} />}
          trigger="click"
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
          placement="top"
          overlayClassName={`${prefixCls}-popover`}
          visible={goToVisible}
          onVisibleChange={setGoToVisible}
        >
          <div className={`${prefixCls}-center`} onClick={() => setGoToVisible(true)}>
            {total ? current ?? 1 : 0} / {(total && pageSize && Math.ceil(total / pageSize)) || 0}
          </div>
        </Popover>

        <div
          className={`${prefixCls}-next ${
            current === Math.ceil(total / pageSize) || total === 0 ? 'disabled' : 'pointer'
          }`}
          onClick={() => total && current < Math.ceil(total / pageSize) && onChange?.(current + 1, pageSize)}
        >
          <ErdaIcon type="chevronright" size={16} />
        </div>
      </div>
      {!hidePageSizeChange ? (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              {PAGINATION.pageSizeOptions.map((item: string | number) => {
                return (
                  <Menu.Item key={item} onClick={() => onChange?.(1, +item)}>
                    <span className={`${prefixCls}-link`}>
                      {replaceMessage(locale.pageSizeText, { size: `${item}` })}
                    </span>
                  </Menu.Item>
                );
              })}
            </Menu>
          }
          align={{ offset: [0, 5] }}
          overlayStyle={{ minWidth: 120 }}
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <span className={`${prefixCls}-page-config`}>
            {replaceMessage(locale.pageSizeText, { size: `${pageSize}` })}
          </span>
        </Dropdown>
      ) : null}
    </div>
  );
};

const PaginationJump = ({ pagination, hidePopover }: IPaginationJumpProps) => {
  const { total = 0, pageSize = PAGINATION.pageSize, onChange } = pagination;
  const [value, setValue] = React.useState('');
  const [locale] = useLocaleReceiver('Pagination');

  const [prefixCls] = usePrefixCls('pagination-jump');

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: val } = e.target;
      if (!isNaN(Number(val)) && +val > 0 && !val.includes('.')) {
        setValue(val);
      } else if (!val) {
        setValue('');
      }
    },
    [setValue],
  );

  const jump = () => {
    const maxCurrent = Math.ceil(total / pageSize);
    if (value) {
      if (+value <= maxCurrent) {
        onChange?.(+value, pageSize);
      } else {
        onChange?.(maxCurrent, pageSize);
      }
      setValue('');
      hidePopover();
    }
  };

  return (
    <div className={`${prefixCls}`} onClick={(e) => e.stopPropagation()}>
      <span>{locale.goToPage}</span>
      <Input
        className="paging-input"
        autoFocus
        style={{ width: 80 }}
        value={value}
        onChange={handleChange}
        onPressEnter={jump}
      />
      <Button
        type="primary"
        size="small"
        icon={<ErdaIcon type="huiche" onClick={jump} className={`${prefixCls}-icon`} size="16" color="white" />}
      />
    </div>
  );
};

export default Pagination;
