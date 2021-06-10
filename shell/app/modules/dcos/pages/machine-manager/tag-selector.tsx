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
import { Select } from 'app/nusi';
import { map } from 'lodash';
import i18n from 'i18n';
import clusterDashboardStore from '../../stores/dashboard';

const { Option } = Select;

interface IProps {
  value?: string[];
  onChange: (data: string[]) => void;
}

// keep class style for using ref
const TagSelector = React.forwardRef(({ value, onChange }: IProps) => {
  const nodeLabels = clusterDashboardStore.useStore((s) => s.nodeLabels);

  return (
    <Select
      mode="multiple"
      className="full-width"
      placeholder={i18n.t('dcos:please select the label')}
      value={value || []}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      onChange={onChange}
    >
      {map(nodeLabels, (tag) => (
        <Option key={tag.label}>{tag.label}</Option>
      ))}
    </Select>
  );
});

export default TagSelector;
