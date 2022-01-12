import * as React from 'react';
import { ErdaIcon } from 'common';
import { Input } from 'antd';
import i18n from 'i18n';
import './index.scss';

export interface HeadOperationBarProps {
  leftSolt?: React.ReactElement;
  onReload?: () => void;
  onSearch?: (v?: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  extraOperation?: React.ReactElement;
  className?: string;
}

const HeadOperationBar = (props: HeadOperationBarProps) => {
  const {
    onReload,
    leftSolt = null,
    extraOperation = null,
    onSearch,
    searchPlaceholder,
    searchValue: pSearchValue,
    className = '',
  } = props;
  const [searchValue, setSearchValue] = React.useState(pSearchValue);

  return (
    <div className={`w-full flex items-center min-h-[48px] px-4 head-operation-bar bg-default-02 ${className}`}>
      <div className="flex-1">
        {onSearch ? (
          <Input
            size="small"
            bordered={false}
            className="w-[180px] border-0 bg-black-02"
            value={searchValue}
            prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
            onChange={(e) => {
              const { value } = e.target;
              onSearch(value);
              setSearchValue(value);
            }}
            placeholder={searchPlaceholder || i18n.t('search by keyword')}
          />
        ) : null}
        {leftSolt}
      </div>
      <div className={'head-operations'}>
        {onReload ? <ErdaIcon type="refresh" onClick={onReload} /> : null}
        {extraOperation}
      </div>
    </div>
  );
};

export default HeadOperationBar;
