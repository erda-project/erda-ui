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

import { Table } from 'antd';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import { get } from 'lodash';
import moment from 'moment';
import { caseStateMap } from 'project/pages/plan-detail/status-toggle';
import React from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  list: ISSUE.IRelativeTestCase[];
}
export const IssueTestCaseRelation = ({ list }: IProps) => {
  const projectId = routeInfoStore.useStore((s) => s.params.projectId);
  const columns = [
    {
      title: i18n.t('dop:test case'),
      dataIndex: 'name',
      render: (v: string, record: ISSUE.IRelativeTestCase) => {
        const { id: caseId, testSetID, testPlanID } = record;
        const url = goTo.resolve.testPlanDetail({
          projectId,
          testPlanID,
          caseId,
          testSetID,
        });
        return (
          <Link to={url} target="_blank">
            {v}
          </Link>
        );
      },
    },
    {
      title: i18n.t('dop:Priority'),
      dataIndex: 'priority',
    },
    {
      title: i18n.t('status'),
      dataIndex: 'execStatus',
      render: (v: string) => {
        return get(caseStateMap, `${v}.name`) || '';
      },
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => moment(v).format('YYYY/MM/DD HH:mm:ss'),
    },
  ];
  return (
    <If condition={!!list.length}>
      <Table size="small" columns={columns} dataSource={list} rowKey="id" pagination={false} scroll={{ x: '100%' }} />
    </If>
  );
};
