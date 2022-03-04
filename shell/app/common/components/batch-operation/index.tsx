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

import { Button, Checkbox, Dropdown, Menu } from 'antd';
import { GetRowKey } from 'antd/lib/table/interface';
import { useUpdate } from 'app/common/use-hooks';
import { ErdaIcon } from 'common';
import { isPromise } from 'configForm/form/utils';
import i18n from 'i18n';
import { uniq, difference, intersection, map } from 'lodash';
import React from 'react';
import { IRowActions } from '../table/interface';

interface IBatchProps<T> {
  rowKey?: string | GetRowKey<T>;
  dataSource: T[];
  selectedKeys?: React.Key[];
  operations?: IRowActions[];
  operationRender?: (op: IRowActions) => JSX.Element;
  onSelectChange: (keys: React.Key[]) => void;
}

const emptyKeys: any[] = [];
const BatchOperation = <T extends Obj>(props: IBatchProps<T>) => {
  const defaultOperationRender = (op: IRowActions) => {
    return <div>{op.name}</div>;
  };
  const {
    rowKey = 'id',
    dataSource,
    onSelectChange,
    operations = [],
    selectedKeys = emptyKeys,
    operationRender = defaultOperationRender,
  } = props;

  const [{ checkAll, indeterminate }, updater, update] = useUpdate({
    checkAll: false,
    indeterminate: false,
  });
  const getKey = React.useCallback((item: T) => (typeof rowKey === 'function' ? rowKey(item) : item[rowKey]), [rowKey]);

  React.useEffect(() => {
    const allKeys: React.Key[] = map(dataSource, getKey);
    const curChosenKeys = intersection(allKeys, selectedKeys);
    update({
      checkAll: curChosenKeys.length === allKeys.length && allKeys.length > 0,
      indeterminate: curChosenKeys.length !== 0 && curChosenKeys.length < allKeys.length,
    });
  }, [update, dataSource, rowKey, selectedKeys, getKey]);

  const onCheckAllChange = () => {
    const allKeys: React.Key[] = map(dataSource, getKey);
    if (checkAll) {
      onSelectChange(difference(selectedKeys, allKeys));
    } else {
      onSelectChange(uniq(selectedKeys.concat(allKeys)));
    }
  };

  const visibleOperations = operations.filter((op) =>
    typeof op.isVisible === 'function' ? op.isVisible(selectedKeys) : true,
  );
  const dropdownMenu = (
    <Menu
      theme="dark"
      onSelect={({ key }) => {
        const op = visibleOperations.find((a) => a.key === key);
        if (op) {
          const result = op.onClick(selectedKeys);
          if (isPromise(result)) {
            result.then(() => onSelectChange([]));
          } else {
            onSelectChange([]);
          }
        }
      }}
    >
      {map(visibleOperations, (opItem) => {
        return (
          <Menu.Item key={opItem.key} disabled={opItem.disabled}>
            {operationRender(opItem)}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className="flex items-center">
      <Checkbox className="ml-0.5 mr-2" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
      <span className="mr-2">
        {`${i18n.t('selected {name}', {
          name: `${selectedKeys?.length || 0} ${i18n.t('common:items')}`,
        })}`}
      </span>
      {visibleOperations.length > 1 ? (
        <Dropdown
          overlay={dropdownMenu}
          overlayClassName="dice-cp-table-batch-operations"
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <Button className="flex items-center bg-default-06 border-transparent text-default-8">
            {i18n.t('batch operate')}
            <ErdaIcon size="18" type="caret-down" className="ml-1 text-default-4" />
          </Button>
        </Dropdown>
      ) : visibleOperations.length === 1 ? (
        <Button
          className="flex items-center bg-default-06 border-transparent text-default-8"
          disabled={visibleOperations[0].disabled}
          onClick={() => {
            const result = visibleOperations[0].onClick(selectedKeys);
            if (isPromise(result)) {
              result.then(() => onSelectChange([]));
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
