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
import { map } from 'lodash';
import { ReduceOne as IconReduceOne } from '@icon-park/react';
import { Select, Input } from 'antd';

const { Option } = Select;

interface IProps {
  keyOptions: COMMON_STRATEGY_NOTIFY.IAlertTriggerCondition[];
  id: string;
  current: {
    id: string;
    condition: string;
    operator: string;
    values: string;
    valueOptions: Array<{ key: string; display: string }>;
  };
  handleEditTriggerConditions: (id: string, data: { key: string; value: string }) => void;
  handleRemoveTriggerConditions: (id: string) => void;
  operatorOptions: Array<{ key: string; display: string; type: 'input' | 'none' | 'multiple' | 'single' }>;
  valueOptionsList: COMMON_STRATEGY_NOTIFY.IAlertTriggerConditionContent[];
}

export const TriggerConditionSelect = ({
  keyOptions,
  id,
  current,
  handleEditTriggerConditions,
  handleRemoveTriggerConditions,
  operatorOptions,
  valueOptionsList,
}: IProps) => {
  const { type } = operatorOptions.find((t) => t.key === current.operator) ?? operatorOptions[0];

  return (
    <div className="flex items-center mb-4">
      <Select
        className="mr-8"
        style={{ width: 340 }}
        value={current?.condition}
        onSelect={(value) => {
          handleEditTriggerConditions(id, { key: 'condition', value });
          const currentOptions =
            valueOptionsList
              .find((item: { key: string }) => item.key === value)
              ?.options.map((item: string) => ({ key: item, display: item })) ?? [];
          handleEditTriggerConditions(id, { key: 'valueOptions', value: currentOptions });
          handleEditTriggerConditions(id, { key: 'values', value: currentOptions[0]?.key });
        }}
      >
        {map(keyOptions, (item) => {
          return (
            <Option key={item?.key} value={item?.key}>
              {item?.displayName}
            </Option>
          );
        })}
      </Select>
      <Select
        className="mr-8 flex-grow-0"
        style={{ width: 340 }}
        value={current?.operator}
        onSelect={(value) => {
          handleEditTriggerConditions(id, { key: 'operator', value });
          handleEditTriggerConditions(id, {
            key: 'values',
            value: value === 'all' ? current?.valueOptions?.map((item) => item?.key)?.join(',') : undefined,
          });
        }}
      >
        {map(operatorOptions, (item) => {
          return (
            <Option key={item.key} value={item.key}>
              {item.display}
            </Option>
          );
        })}
      </Select>
      {['input', 'none'].includes(type) ? (
        <Input
          key={type}
          className="flex-grow-0"
          style={{ width: 360 }}
          disabled={type === 'none'}
          value={type === 'none' ? undefined : current?.values}
          onChange={(e) => {
            handleEditTriggerConditions(id, {
              key: 'values',
              value: type === 'none' ? current?.valueOptions?.map((item) => item?.key)?.join(',') : e.target.value,
            });
          }}
        />
      ) : (
        <Select
          value={type === 'single' ? current?.values : current?.values?.split(',')}
          className="flex-grow-0"
          style={{ width: 360 }}
          mode={type === 'single' ? undefined : type}
          onChange={(value) =>
            handleEditTriggerConditions(id, { key: 'values', value: type === 'single' ? value : value?.join(',') })
          }
        >
          {map(current?.valueOptions, (item) => {
            return (
              <Option key={item?.key} value={item?.key}>
                {item?.display}
              </Option>
            );
          })}
        </Select>
      )}
      <IconReduceOne className="cursor-pointer ml-8" size="16" onClick={() => handleRemoveTriggerConditions(id)} />
    </div>
  );
};
