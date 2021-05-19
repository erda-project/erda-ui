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

import * as React from 'react';
import { Icon as CustomIcon } from 'common';
import { List, Switch } from 'app/nusi';
import { Close as IconClose, Check as IconCheck } from '@icon-park/react';
import './addon-list.scss';

interface IAddIn {
  title?: string;
  desc?: string;
  icon: string;
  switchProps?: object;
}
interface IProps {
  data: IAddIn[];
}
export const AddonList = ({ data }: IProps) => {
  return (
    <List
      className="setting-addons"
      dataSource={data}
      renderItem={({ title, desc, icon, switchProps }: IAddIn) => (
        <List.Item actions={[
          <Switch
            checkedChildren={<IconCheck />}
            unCheckedChildren={<IconClose />}
            {...switchProps}
          />,
        ]}
        >
          <List.Item.Meta
            avatar={<CustomIcon className="list-icon" type={icon} />}
            title={(
              <span>{title}</span>
            )}
            description={desc}
          />
        </List.Item>
      )}
    />
  );
};
