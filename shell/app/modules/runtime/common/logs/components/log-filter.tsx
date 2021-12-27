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
import { Button, DatePicker } from 'antd';
import { FormModal } from 'common';
import moment, { Moment } from 'moment';
import i18n from 'i18n';

export interface IQuery {
  pattern?: string;
  start?: number;
  end?: number;
}

interface IProps {
  onChange?: (data: IQuery) => void;
}

const disabledDate = (current: Moment) => {
  return current && current > moment().endOf('days');
};

const LogFilter = (props: IProps) => {
  const current = moment();
  const [visible, setVisible] = React.useState(false);
  const fieldsList = [
    {
      name: 'timeSpan',
      label: i18n.t('dop:duration'),
      initialValue: [current.clone().subtract(10, 'minutes'), current],
      config: {
        valuePropType: 'array',
      },
      getComp: () => {
        return (
          <DatePicker.RangePicker
            disabledDate={disabledDate}
            allowClear={false}
            placeholder={[i18n.t('common:start at'), i18n.t('common:end at')]}
            className="w-full"
            showTime
          />
        );
      },
    },
    {
      name: 'pattern',
      required: false,
      label: i18n.t('search {name}', { name: i18n.t('keywords') }),
    },
  ];
  const handleCancel = () => {
    setVisible(false);
  };
  const handleOk = ({ timeSpan, pattern }: { pattern?: string; timeSpan?: Moment[] }) => {
    const [start, end] = timeSpan ?? [];
    props.onChange?.({
      pattern,
      start: start ? start.valueOf() * 1000000 : undefined,
      end: end ? end.valueOf() * 1000000 : undefined,
    });
    handleCancel();
  };
  return (
    <>
      <Button
        type="ghost"
        onClick={() => {
          setVisible(true);
        }}
      >
        {i18n.t('advanced search')}
      </Button>
      <FormModal
        title={i18n.t('advanced search')}
        modalProps={{ destroyOnClose: true }}
        visible={visible}
        fieldsList={fieldsList}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </>
  );
};

export default LogFilter;
