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
import { Input, Table, Spin } from 'app/nusi';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { envMap } from 'msp/config';

const { Search } = Input;

const MsProjectList = () => {
  const onSearchKeyChange = () => {};

  const columns: Array<ColumnProps<any>> = [
    {
      title: i18n.t('project name'),
      dataIndex: 'projectName',
    },
    {
      title: i18n.t('msp:project type'),
      dataIndex: 'projectType',
    },
    {
      title: i18n.t('application:environment'),
      dataIndex: 'envs',
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createAt',
    },
    {
      title: i18n.t('application:operation'),
      dataIndex: 'projectId',
      width: 240,
      render: () => {
        return (
          <>
            <a href="" className="">
              {envMap.DEV}
            </a>
            <a href="" className="ml12">
              {envMap.TEST}
            </a>
            <a href="" className="ml12">
              {envMap.STAGING}
            </a>
            <a href="" className="ml12">
              {envMap.PROD}
            </a>
          </>
        );
      },
    },
  ];

  return (
    <div className="micro-service-project-list">
      <Spin spinning={false}>
        <Search
          className="search-input mb12 w-72"
          onChange={onSearchKeyChange}
          placeholder={i18n.t('msp:search by project name')}
        />
        <Table columns={columns} dataSource={[{}]} />
      </Spin>
    </div>
  );
};

export default MsProjectList;
