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

import React, { useState, useEffect } from 'react';
import { Select, Input } from 'antd';
import i18n from 'i18n';

const { Option } = Select;

const RateSelect = ({
  onChange,
  id,
}: {
  onChange: ({ val, operation, key }?: { val: number; operation: string; key: string }) => void;
  id: string;
}) => {
  const [operation, setOperation] = useState('>');
  const [val, setVal] = useState<string>();

  useEffect(() => {
    if (val) {
      onChange({
        val: Number(val),
        operation,
        key: id,
      });
    } else {
      onChange(undefined);
    }
  }, [val]);

  return (
    <div className="flex">
      <Select className="w-[120px] flex-none" value={operation} onChange={setOperation}>
        <Option value={'>'}>{i18n.t('default:greater than')}</Option>
        <Option value={'>='}>{i18n.t('dop:Greater than or equal to')}</Option>
        <Option value={'='}>{i18n.t('dop:equal to')}</Option>
        <Option value={'<'}>{i18n.t('default:Less than')}</Option>
        <Option value={'<='}>{i18n.t('dop:Less than or equal to')}</Option>
      </Select>
      <Input
        value={val}
        onChange={(e) => {
          if (e.target.value) {
            const value = Number(e.target.value);
            !isNaN(value) && value <= 100 && value >= 0 && setVal(e.target.value);
          } else {
            setVal(undefined);
          }
        }}
      />
    </div>
  );
};

export default RateSelect;
