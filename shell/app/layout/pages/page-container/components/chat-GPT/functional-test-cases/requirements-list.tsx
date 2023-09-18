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
import { Input, Table } from 'antd';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import projectStore from 'project/stores/project';
import { getIssues } from 'app/modules/project/services/issue';
import { IRow } from 'layout/services/ai-test';

const RequirementsList = ({ onSelect }: { onSelect: (rows: IRow[]) => void }) => {
  const { id: projectID } = projectStore.useStore((s) => s.info);
  const [requirementsList, setRequirementsList] = useState<ISSUE.IssueType[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    getRequirements();
  }, [current, searchValue, projectID]);

  const getRequirements = async () => {
    setLoading(true);
    const res = await getIssues({ pageSize: 10, type: 'REQUIREMENT', pageNo: current, projectID, title: searchValue });
    if (res.success) {
      setRequirementsList(res.data?.list || []);
      setTotal(res.data?.total || 0);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 120,
    },
    {
      title: i18n.t('default:Title'),
      dataIndex: 'title',
      render: (text: string) => (
        <div className="flex-h-center">
          <ErdaIcon type="xuqiu" className="text-xl mr-1" />
          <span className="truncate">{text}</span>
        </div>
      ),
      ellipsis: true,
    },
  ];
  return (
    <div className="p-4">
      <div className="mb-2">{i18n.t('common:requirements list')}</div>
      <div>
        <Input
          className={`bg-default-06 border-none config-filter-item w-[200px]`}
          prefix={<ErdaIcon fill="default-3" size="16" type="search" />}
          placeholder={i18n.t('default:Search by name and ID')}
          onBlur={(e) => setSearchValue(e.target.value)}
          onPressEnter={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <Table
          loading={loading}
          rowKey="id"
          columns={columns}
          dataSource={requirementsList}
          pagination={{
            total,
            onChange: (pageNo) => {
              setCurrent(pageNo);
            },
          }}
          rowSelection={{
            onChange: (_selectedRowKeys, selectedRows) => {
              onSelect(selectedRows);
            },
          }}
        />
      </div>
    </div>
  );
};

export default RequirementsList;
