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
import { DatePicker } from 'app/nusi';
import { omit, isEmpty } from 'lodash';
import { RangePickerProps, RangePickerValue } from 'core/common/interface';

const { RangePicker: PreRangePicker } = DatePicker;

interface IProps extends RangePickerProps {
  borderTime?: boolean; //
}

/**
 * @param {boolean} [props.borderTime] - 启用边界时间[00:00:00, 23:59:59]
 */
const RangePicker = (props: IProps) => {
  const { borderTime, onChange, value, ...rest } = props;
  const [_value, setValue] = React.useState(value);

  React.useEffect(() => {
    setValue(value);
  }, [value]);

  const handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    const moments = dates as RangePickerValue;
    if (!isEmpty(dates)) {
      moments[0] = dates[0]?.startOf('date');
      moments[1] = dates[1]?.endOf('date');
    }

    setValue(moments);
    onChange && onChange(moments, dateStrings);
  };
  if (borderTime) {
    if (props.showTime) console.error('borderTime和showTime属性不能同时使用');
    return <PreRangePicker {...rest} value={_value} onChange={handleChange} />;
  }
  return <PreRangePicker {...omit(props, ['borderTime'])} />;
};

export default RangePicker;
