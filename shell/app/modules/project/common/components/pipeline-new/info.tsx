import * as React from 'react';
import { Panel } from 'common';
import { Tooltip } from 'antd';
import moment from 'moment';
import { useUserMap } from 'core/stores/userMap';
import i18n from 'i18n';

interface InfoData {
  name: string;
  desc?: string;
  updaterID: string;
  updatedAt: string;
}

interface IProps {
  operations?: React.ReactNode;
  info?: InfoData;
  className?: string;
}

const Info = (props: IProps) => {
  const { operations = null, info, className } = props;

  const userMap = useUserMap();

  const fields = [
    {
      label: i18n.t('name'),
      valueKey: 'name',
      valueItem: ({ value: val }: any) => {
        return (
          <Tooltip title={val}>
            <div className="nowrap">{val}</div>
          </Tooltip>
        );
      },
    },
    {
      label: i18n.t('dop:commit message'),
      valueKey: 'desc',
      valueItem: ({ value: val }: any) => {
        return (
          <Tooltip title={val}>
            <div className="nowrap">{val}</div>
          </Tooltip>
        );
      },
    },

    {
      label: i18n.t('dop:updater'),
      valueKey: 'updaterID',
      valueItem: ({ value: val }: any) => {
        const curUser = userMap[val];
        return curUser ? curUser.nick || curUser.name : val || '-';
      },
    },
    {
      label: i18n.t('update time'),
      valueKey: 'updatedAt',
      valueItem: ({ value: val }: any) => {
        return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex-h-center justify-between">
        <div className="font-medium mb-2">{'基本信息'}</div>
        <div>{operations}</div>
      </div>
      <Panel fields={fields} data={info} />
    </div>
  );
};

export default Info;
