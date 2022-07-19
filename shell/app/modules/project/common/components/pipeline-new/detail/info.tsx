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
  pipelineDetail?: BUILD.IPipelineDetail;
}

const Info = (props: IProps) => {
  const { operations = null, info, className, pipelineDetail } = props;
  const userMap = useUserMap();
  const owner = pipelineDetail?.extra?.ownerUser?.id;

  const fields = [
    {
      label: i18n.t('Name'),
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
      label: i18n.t('dop:Updated by'),
      valueKey: 'updaterID',
      valueItem: ({ value: val }: any) => {
        const curUser = userMap[val];
        return curUser ? curUser.nick || curUser.name : val || '-';
      },
    },
    {
      label: i18n.s('Owner', 'dop'),
      valueKey: 'owner',
      valueItem: ({ value: val }: { value: string }) => {
        const curUser = userMap[val];
        return curUser ? curUser.nick || curUser.name : val || '-';
      },
    },
    {
      label: i18n.t('Update time'),
      valueKey: 'updatedAt',
      valueItem: ({ value: val }: any) => {
        return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex-h-center justify-between">
        <div className="font-medium mb-2">{i18n.t('dop:basic information')}</div>
        <div>{operations}</div>
      </div>
      <Panel fields={fields} data={{ ...info, owner }} />
    </div>
  );
};

export default Info;
