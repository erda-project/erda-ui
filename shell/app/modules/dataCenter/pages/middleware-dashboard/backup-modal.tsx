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
import { FormModal, TableActions } from 'common';
import { Button, Table, TimePicker, Input, Select } from 'app/nusi';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';

import { set, cloneDeep } from 'lodash';
import moment from 'moment';
import './modal.scss';

const cronReg = /(?<minute>\S+)\s(?<hour>\S+)/;

interface IProps {
  visible: boolean;
  formData: MIDDLEWARE_DASHBOARD.IMiddleBase;
  onCancel: () => void;
}

const { Option } = Select;

// TODO 2020/7/21 备份功能3.17不做，备份策略产品还需要再考虑，先不翻译
const periods = [
  { value: '0 12 1 * ?', name: '1st of every month' },
  { value: '0 12 ? * 2', name: 'every monday' },
  { value: '0 12 * * ?', name: 'every day' },
];

const BackupModal = ({ visible, formData, onCancel }: IProps) => {
  const [strategies, setStrategies] = React.useState([] as any[]);
  React.useEffect(() => {
    if (visible) {
      setStrategies([]);
    }
    return () => {
      setStrategies([]);
    };
  }, [visible]);
  const handleChangeTime = (time: moment.Moment, index: number, backupRules: string) => {
    const [hour, minute] = time ? time.format('HH:mm').split(':') : [12, 0];
    const cron = backupRules.replace(cronReg, `${minute} ${hour}`);
    handleChange(index, cron, 'backupRules');
  };
  const handleAddStrategy = () => {
    setStrategies((p) => {
      const key = `strategy-${Date.now()}`;
      return p.concat({
        key,
        backupName: '',
        backupRules: '',
        backupOn: '',
      });
    });
  };
  const handleChange = (index: number, value: string, key: string) => {
    const target = cloneDeep(strategies);
    set(target, `[${index}].${key}`, value);
    setStrategies(target);
  };
  const columns: Array<ColumnProps<any>> = [
    {
      title: i18n.t('default:name'),
      dataIndex: 'backupName',
      width: 370,
      render: (text, _record, index) => {
        return (
          <Input
            autoComplete="off"
            value={text}
            onChange={(e) => {
              handleChange(index, e.target.value, 'backupName');
            }}
          />
        );
      },
    },
    {
      title: i18n.t('default:period'),
      dataIndex: 'backupRules',
      width: 300,
      render: (text: string, _record, index) => {
        const v = text.replace(cronReg, '0 12');
        return (
          <Select
            value={v}
            onChange={(value) => {
              handleChange(index, value as string, 'backupRules');
            }}
          >
            {periods.map(({ name, value }) => {
              return <Option value={value}>{name}</Option>;
            })}
          </Select>
        );
      },
    },
    {
      title: i18n.t('default:time'),
      dataIndex: 'time',
      width: 150,
      render: (_text, { backupRules }, index) => {
        let time;
        if (backupRules) {
          const { minute, hour } = backupRules.match(cronReg).groups || {};
          const timeStr = `${hour}:${minute}`;
          time = minute !== '*' && hour !== '*' ? moment(timeStr, 'HH:mm') : undefined;
        }
        return (
          <TimePicker
            allowClear={false}
            value={time}
            onChange={(value) => {
              handleChangeTime(value, index, backupRules);
            }}
            format="HH:mm"
          />
        );
      },
    },
    {
      title: '',
      dataIndex: 'backupOn',
      width: 100,
      render: (backupOn) => {
        return (
          <TableActions>
            <span>{backupOn ? i18n.t('default:deactivate') : i18n.t('default:enable')}</span>
            <span>{i18n.t('default:delete')}</span>
          </TableActions>
        );
      },
    },
  ];
  const fieldsList = [
    {
      label: i18n.t('default:name'),
      required: true,
      name: 'name',
      itemProps: {
        disabled: true,
      },
    },
    {
      label: '',
      getComp: () => (
        <>
          <Button type="ghost" className="mb-2 mt-2" onClick={handleAddStrategy}>
            {i18n.t('default:add strategy')}
          </Button>
          <Table columns={columns} dataSource={strategies} />
        </>
      ),
    },
  ];
  return (
    <FormModal
      destroyOnClose
      title={i18n.t('default:backup')}
      width={960}
      className="middleware-op-modal"
      visible={visible}
      fieldsList={fieldsList}
      formData={formData}
      onCancel={onCancel}
      // onOk={handleOk}
    />
  );
};

export default BackupModal;
