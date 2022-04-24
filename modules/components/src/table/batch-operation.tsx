import React from 'react';
import { GetRowKey } from 'antd/es/table/interface';
import { Button, Checkbox, Dropdown, Menu } from 'antd';
import ErdaIcon from '../icon';
import { usePrefixCls } from '../_util/hooks';
import { replaceMessage, useLocaleReceiver } from '../locale-provider';

interface IBatchProps<T> {
  rowKey?: string | GetRowKey<T>;
  dataSource: T[];
  selectedKeys?: React.Key[];
  operations?: BatchAction[];
  operationRender?: (op: BatchAction) => JSX.Element;
  onSelectChange: (keys: React.Key[]) => void;
}

interface BatchAction {
  key: string;
  name: string;
  disabled?: boolean;
  onClick: (selectedKeys: React.Key[]) => void | Promise<void>;
  isVisible?: (selectedKeys: React.Key[]) => boolean;
}

const defaultOperationRender = (op: BatchAction) => {
  return <div>{op.name}</div>;
};

const emptyKeys: Array<string | number> = [];

const BatchOperation = <T extends Obj>(props: IBatchProps<T>) => {
  const {
    rowKey = 'id',
    dataSource,
    onSelectChange,
    operations = [],
    selectedKeys = emptyKeys,
    operationRender = defaultOperationRender,
  } = props;

  const [prefixCls] = usePrefixCls('batch-operation');
  const [locale] = useLocaleReceiver('Table');

  const [checkAll, setCheckAll] = React.useState(false);
  const [indeterminate, setIndetermination] = React.useState(false);

  const getKey = React.useCallback((item: T) => (typeof rowKey === 'function' ? rowKey(item) : item[rowKey]), [rowKey]);

  React.useEffect(() => {
    const allKeys: React.Key[] = (dataSource ?? []).map(getKey);
    const curChosenKeys = allKeys.filter((value) => selectedKeys.includes(value)); // intersection
    setCheckAll(curChosenKeys.length === allKeys.length && allKeys.length > 0);
    setIndetermination(curChosenKeys.length !== 0 && curChosenKeys.length < allKeys.length);
  }, [dataSource, selectedKeys, getKey]);

  const onCheckAllChange = () => {
    const allKeys: React.Key[] = (dataSource ?? []).map(getKey);
    if (checkAll) {
      onSelectChange(selectedKeys.filter((value) => !allKeys.includes(value))); // difference
    } else {
      onSelectChange(Array.from(new Set(selectedKeys.concat(allKeys))));
    }
  };

  const visibleOperations = operations.filter((op) =>
    typeof op.isVisible === 'function' ? op.isVisible(selectedKeys) : true,
  );

  const dropdownMenu = (
    <Menu
      theme="dark"
      selectable
      onSelect={({ key }) => {
        const op = visibleOperations.find((a) => a.key === key);
        if (op) {
          const result = op.onClick(selectedKeys);
          if (result && result.then) {
            result.then?.(() => onSelectChange([]));
          } else {
            onSelectChange([]);
          }
        }
      }}
    >
      {visibleOperations.map((opItem) => {
        return (
          <Menu.Item key={opItem.key} disabled={opItem.disabled}>
            {operationRender(opItem)}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className={`${prefixCls}`}>
      <Checkbox className="checkbox" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
      <span className={`${prefixCls}-label`}>
        {replaceMessage(locale.selectedItemsText, { size: `${selectedKeys.length}` })}
      </span>
      {visibleOperations.length > 1 ? (
        <Dropdown
          overlay={dropdownMenu}
          overlayClassName={`${prefixCls}-dropdown`}
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <Button className="op-btn">
            {locale.batchOperation}
            <ErdaIcon size="18" type="caret-down" className="ml-1 text-default-4" />
          </Button>
        </Dropdown>
      ) : visibleOperations.length === 1 ? (
        <Button
          className="op-btn"
          disabled={visibleOperations[0].disabled}
          onClick={() => {
            const result = visibleOperations[0].onClick(selectedKeys);
            if (result && result.then) {
              result.then?.(() => onSelectChange([]));
            } else {
              onSelectChange([]);
            }
          }}
        >
          {visibleOperations[0].name}
        </Button>
      ) : null}
    </div>
  );
};

export default BatchOperation;
