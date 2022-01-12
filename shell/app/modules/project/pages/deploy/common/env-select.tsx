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
import { ENV_MAP } from 'project/common/config';
import { map } from 'lodash';
import { DropdownSelectNew } from 'common';
import i18n from 'i18n';

interface IProps {
  value?: string;
  onChange?: (v: string) => void;
  onClickItem?: (v: string) => void;
  children?: React.ReactElement;
  placement?: string;
  required?: boolean;
  disabled?: boolean;
}

export const envMap = { DEFAULT: i18n.t('global'), ...ENV_MAP };

const EnvSelector = (props: IProps) => {
  const { children, ...rest } = props;
  return (
    <DropdownSelectNew
      {...rest}
      options={map(envMap, (v, k) => ({ key: k, label: v }))}
      optionSize={'small'}
      mode="simple"
      width={160}
    >
      {children}
    </DropdownSelectNew>
  );
};

export default EnvSelector;
