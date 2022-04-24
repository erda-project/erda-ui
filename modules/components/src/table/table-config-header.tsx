import React from 'react';
import { Checkbox, Popover } from 'antd';
import ErdaIcon from '../icon';
import { ErdaColumnType } from '.';
import { getLsColumnsConfig, saveLsColumnsConfig, transformDataIndex } from './utils';
import { usePrefixCls } from '../_util/hooks';
import cn from 'classnames';
import { ColumnsConfig } from './interface';

export interface TableConfigProps<T> {
  slotNode?: React.ReactNode;
  columns: Array<ErdaColumnType<T>>;
  setHiddenColumns: (val: string[]) => void;
  onReload: () => void;
  hideReload?: boolean;
  hideColumnConfig?: boolean;
  whiteHeader?: boolean;
  tableKey?: string;
}

function TableConfigHeader<T extends Record<string, any>>({
  slotNode,
  columns,
  setHiddenColumns,
  onReload,
  hideColumnConfig = false,
  hideReload = false,
  whiteHeader,
  tableKey,
}: TableConfigProps<T>) {
  const [clsPrefix] = usePrefixCls('table-header');

  React.useEffect(() => {
    if (!tableKey) {
      return;
    }
    const originLsConfig = getLsColumnsConfig(tableKey);
    if (!originLsConfig) {
      return;
    }
    const _columns = columns
      .map<string>(({ dataIndex: _dataIndex }): string => {
        const dataIndex = transformDataIndex(_dataIndex);
        return originLsConfig[dataIndex] && originLsConfig[dataIndex].hidden ? (_dataIndex as string) : '';
      })
      .filter(Boolean);
    setHiddenColumns(_columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHiddenColumns, tableKey]); // only trigger on mount

  const onCheck = (checked: boolean, title: string) => {
    const hiddenColumns: string[] = [];
    const lsColumns = columns.reduce<ColumnsConfig>((acc, { dataIndex, title: _title, hidden }) => {
      const _dataIndex = transformDataIndex(dataIndex);
      const currentStatus = _title === title ? !checked : !!hidden;
      acc[_dataIndex] = { dataIndex: _dataIndex, hidden: currentStatus };
      currentStatus && hiddenColumns.push(dataIndex as string);
      return acc;
    }, {});
    setHiddenColumns(hiddenColumns);
    if (tableKey) {
      saveLsColumnsConfig(tableKey, lsColumns);
    }
  };

  const showLength = columns.filter((item) => !item.hidden).length;
  const columnsFilter = columns
    .filter((item) => item.title && item.dataIndex)
    .map((item: ErdaColumnType<T>) => (
      <div key={`${item.dataIndex}`}>
        <Checkbox
          className={`${clsPrefix}-checkbox`}
          checked={!item.hidden}
          onChange={(e) => onCheck(e.target.checked, item.title as string)}
          disabled={showLength === 1 && !item.hidden}
        >
          {typeof item.title === 'function' ? item.title({}) : item.title}
        </Checkbox>
      </div>
    ));

  return (
    <div className={cn(`${clsPrefix}`, whiteHeader ? `${clsPrefix}-white-bg` : `${clsPrefix}-default-bg-02`)}>
      <div className={`${clsPrefix}-slot}`}>
        <div>{slotNode}</div>
      </div>
      <div className={`${clsPrefix}-ops`}>
        {!hideReload ? <ErdaIcon size="18" className={`${clsPrefix}-icon`} type="shuaxin" onClick={onReload} /> : null}
        {!hideColumnConfig ? (
          <Popover
            content={columnsFilter}
            trigger="click"
            placement="bottomRight"
            overlayClassName={`${clsPrefix}-columns-filter`}
            getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
          >
            <ErdaIcon type="shezhi" size="18" className={`${clsPrefix}-icon`} />
          </Popover>
        ) : null}
      </div>
    </div>
  );
}

export default TableConfigHeader;
