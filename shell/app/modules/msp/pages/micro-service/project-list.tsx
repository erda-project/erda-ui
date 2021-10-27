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
import { Input, Table } from 'antd';
import { useUpdate } from 'common/use-hooks';
import { formatTime, goTo } from 'common/utils';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { debounce } from 'lodash';
import { getMspProjectList } from 'msp/services';

const { Search } = Input;

interface IState {
  data: MS_INDEX.IMspProject[];
  loading: boolean;
  filterKey: string;
}

const MsProjectList = () => {
  const [{ data, loading, filterKey }, updater] = useUpdate<IState>({
    data: [],
    loading: false,
    filterKey: '',
  });

  const getList = async () => {
    updater.loading(true);
    try {
      const res = await getMspProjectList();
      updater.data(res.data || []);
    } finally {
      updater.loading(false);
    }
  };

  const handleSearch = React.useCallback(
    debounce((keyword?: string) => {
      updater.filterKey(keyword?.toLowerCase() || '');
    }, 500),
    [],
  );

  React.useEffect(() => {
    getList();
  }, []);

  const columns: Array<ColumnProps<MS_INDEX.IMspProject>> = [
    {
      title: i18n.t('project name'),
      dataIndex: 'displayName',
    },
    {
      title: i18n.t('msp:project type'),
      dataIndex: 'displayType',
    },
    {
      title: i18n.t('dop:environment'),
      dataIndex: 'relationship',
      width: 120,
      render: (relationship) => relationship.length,
    },
    {
      title: i18n.t('create time'),
      dataIndex: 'createTime',
      width: 200,
      render: (createTime: number) => (createTime ? formatTime(createTime / 1000000, 'YYYY-MM-DD HH:mm:ss') : null),
    },
    {
      title: i18n.t('msp:environment entrance'),
      dataIndex: 'id',
      width: 240,
      className: 'table-operations',
      render: (id: string, { relationship }) =>
        relationship.map((item) => {
          return item.tenantId ? (
            <a
              className="table-operations-btn"
              onClick={() => {
                goTo(goTo.pages.mspOverview, { tenantGroup: item.tenantId, projectId: id, env: item.workspace });
              }}
            >
              {item.displayWorkspace}
            </a>
          ) : (
            <span className="table-operations-btn text-dark-6 cursor-not-allowed no-underline">
              {item.displayWorkspace}
            </span>
          );
        }),
    },
  ];

  return (
    <div className="micro-service-project-list">
      <Search
        className="search-input mb-3 w-72"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        placeholder={i18n.t('msp:search by project name')}
      />
      <Table
        loading={loading}
        columns={columns}
        dataSource={data.filter((item) => item.displayName.toLowerCase().includes(filterKey))}
        rowKey="id"
      />
    </div>
  );
};

export default MsProjectList;
