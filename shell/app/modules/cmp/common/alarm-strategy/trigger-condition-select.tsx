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
  };
  handleEditTriggerConditions: (id: string, data: { key: string; value: string }) => void;
  handleRemoveTriggerConditions: (id: string) => void;
  operatorOptions: { key: string; display: string; type: 'input' | 'none' | 'multiple' | 'single' }[];
  valueOptions: { key: string; display: string }[];
  valueOptionsList: COMMON_STRATEGY_NOTIFY.IAlertTriggerConditionContent[];
}

export const TriggerConditionSelect = ({
  keyOptions,
  id,
  current,
  handleEditTriggerConditions,
  handleRemoveTriggerConditions,
  operatorOptions,
  valueOptions,
  updater,
  valueOptionsList,
}: IProps) => {
  const { type } = operatorOptions.find((t) => t.key === current.operator) ?? operatorOptions[0];
  console.log(current);
  return (
    <div className="flex items-center mb-4">
      <Select
        className="mr-8"
        value={current?.condition}
        onSelect={(value) => {
          handleEditTriggerConditions(id, { key: 'condition', value });
          const currentOptions =
            valueOptionsList
              .find((item: { key: any }) => item.key === value)
              ?.options.map((item: any) => ({ key: item, display: item })) ?? [];

          updater.triggerConditionValueOptions(currentOptions);
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
        className="mr-8"
        value={current?.operator}
        onSelect={(value) => handleEditTriggerConditions(id, { key: 'operator', value })}
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
          disabled={type === 'none'}
          value={type === 'none' ? undefined : current?.values}
          onChange={(e) => {
            handleEditTriggerConditions(id, { key: 'values', value: e.target.value });
          }}
        />
      ) : (
        <Select
          value={current?.values}
          mode={type === 'single' ? undefined : type}
          onSelect={(value) => handleEditTriggerConditions(id, { key: 'values', value })}
        >
          {map(valueOptions, (item) => {
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
