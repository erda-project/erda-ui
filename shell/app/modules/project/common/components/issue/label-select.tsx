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

import labelStore from 'project/stores/label';
import { map, isEmpty } from 'lodash';
import { Select } from 'nusi';
import * as React from 'react';
import { useEffectOnce } from 'react-use';
import i18n from 'i18n';
import { filterOption } from 'app/common/utils';
import { useLoading } from 'app/common/stores/loading';

const { Option } = Select;

interface IProps {
  value?: string[];
  type: string;
  placeholder?: string;
  fullWidth?: boolean;
  mode?: string;
  onChange?(v: string[]): void;
}
export default ({ value = [], onChange = () => { }, type, mode = 'multiple', placeholder, fullWidth, ...rest }: IProps) => {
  const list = labelStore.useStore(s => s.list);
  const { getLabels } = labelStore.effects;
  const [loading] = useLoading(labelStore, ['getLabels']);

  useEffectOnce(() => {
    if (!list.length && !loading) {
      getLabels({ type });
    }
  });

  return (
    <Select
      allowClear
      placeholder={placeholder || i18n.t('please select labels')}
      mode={mode as any}
      style={{ width: fullWidth ? '100%' : '268px' }}
      value={value && !isEmpty(list) ? value.map(v => String(v)) : undefined}
      filterOption={filterOption}
      onChange={onChange as any}
      {...rest}
    >
      {map(list, ({ id, name }) => <Option key={id} value={String(id)}>{name}</Option>)}
    </Select>
  );
};
