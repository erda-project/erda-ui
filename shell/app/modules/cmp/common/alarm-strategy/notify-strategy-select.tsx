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
import { map, find } from 'lodash';
import { ReduceOne as IconReduceOne } from '@icon-park/react';
import i18n from 'i18n';
import { Select, Divider } from 'core/nusi';
import { WithAuth } from 'user/common';

const { Option } = Select;

export const NotifyStrategySelect = ({
  id,
  current,
  handleEditNotifyStrategy,
  valueOptions,
  updater,
  addNotificationGroupAuth,
  goToNotifyGroup,
  notifyGroups,
  alertLevelOptions,
  notifyChannelMap,
  handleRemoveNotifyStrategy,
}) => {
  return (
    <div className="flex items-center mb-4">
      <Select
        className="mr-8"
        value={current?.groupId}
        onSelect={(groupId: any) => {
          updater.activeGroupId(groupId);
          handleEditNotifyStrategy(id, { key: 'groupId', value: groupId });
          const activeGroup = find(notifyGroups, (item) => item.id === groupId);
          const groupTypeOptions =
            (activeGroup && notifyChannelMap[activeGroup.targets[0].type]).map((x) => ({
              key: x.value,
              display: x.name,
            })) || [];

          updater.groupTypeOptions(groupTypeOptions);
          handleEditNotifyStrategy(id, { key: 'groupType', value: groupTypeOptions?.[0]?.key });
        }}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <Divider className="my-1" />
            <div className="text-xs px-2 py-1 text-desc" onMouseDown={(e) => e.preventDefault()}>
              <WithAuth pass={addNotificationGroupAuth}>
                <span className="hover-active" onClick={goToNotifyGroup}>
                  {i18n.t('org:add more notification groups')}
                </span>
              </WithAuth>
            </div>
          </div>
        )}
      >
        {map(notifyGroups, (item) => (
          <Option key={item.id} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>

      <Select
        className="mr-8"
        value={current?.level}
        onChange={(value) => handleEditNotifyStrategy(id, { key: 'level', value })}
        mode="multiple"
      >
        {map(alertLevelOptions, (item) => {
          return (
            <Option key={item.key} value={item.key}>
              {item.display}
            </Option>
          );
        })}
      </Select>
      <Select
        placeholder="请选择对应值"
        value={current?.groupType}
        onChange={(value) => handleEditNotifyStrategy(id, { key: 'groupType', value })}
        mode="multiple"
      >
        {map(valueOptions, (item) => {
          return (
            <Option key={item?.key} value={item?.key}>
              {item?.display}
            </Option>
          );
        })}
      </Select>
      <IconReduceOne className="cursor-pointer ml-8" size="16" onClick={() => handleRemoveNotifyStrategy(id)} />
    </div>
  );
};
