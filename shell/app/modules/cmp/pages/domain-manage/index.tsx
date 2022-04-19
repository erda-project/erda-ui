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
import { useMount } from 'react-use';
import i18n from 'i18n';
import { Spin, Tooltip } from 'antd';
import { isEmpty, map } from 'lodash';
import { LoadMoreSelector, ConfigurableFilter } from 'common';
import ErdaTable from 'common/components/table';
import { useUpdate, useUpdateSearch } from 'common/use-hooks';
import { getClusterList, getDomainList } from 'cmp/services/domain-manage';
import { getDefaultPaging, goTo } from 'common/utils';
import { getProjectList } from 'project/services/project';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';

const SERVER_TYPES = {
  service: i18n.t('service'),
  gateway: i18n.t('API gateway'),
  other: i18n.t('common:Others'),
};

const ENV_DIC = {
  DEV: i18n.t('develop'),
  TEST: i18n.t('test'),
  STAGING: i18n.t('staging'),
  PROD: i18n.t('production'),
};

interface IState {
  filterData: Obj;
}

const DomainManage = () => {
  const { projectName, ...rest } = routeInfoStore.useStore((s) => s.query);

  const [{ filterData }, updater] = useUpdate<IState>({
    filterData: { ...rest },
  });
  const projectNameRef = React.useRef<string | undefined>(projectName);
  const clusterList = getClusterList.useData();
  const [data, loadingList] = getDomainList.useState();
  const domainList = data?.list || [];
  const domainPaging = data?.paging || getDefaultPaging();

  const getProjectListData = (q: any) => {
    return getProjectList({ ...q, query: q.q }).then((res: any) => res.data);
  };

  useMount(() => {
    const userOrgId = orgStore.getState((s) => s.currentOrg.id);
    getClusterList.fetch({ orgID: userOrgId });
    getList(filterData);
  });

  const chosenItemConvert = React.useCallback((selectItem: { value: number; label: string }) => {
    if (isEmpty(selectItem)) {
      return [];
    }
    const { value, label } = selectItem;
    if (label) {
      return [{ value, label }];
    } else {
      return [{ value, label: projectNameRef.current || '' }];
    }
  }, []);

  const filterList = [
    {
      key: 'domain',
      type: 'input',
      label: i18n.t('msp:domain name'),
      outside: true,
      placeholder: i18n.t('please enter {name}', { name: i18n.t('msp:domain name') }),
    },
    {
      key: 'clusterName',
      type: 'select',
      label: i18n.t('Cluster name'),
      options: (clusterList || []).map((item) => ({ label: item.name, value: item.name })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Cluster name') }),
      itemProps: { mode: 'single' },
    },
    {
      key: 'type',
      type: 'select',
      label: i18n.t('Attribution type'),
      options: map(Object.keys(SERVER_TYPES), (item) => ({ label: SERVER_TYPES[item], value: item })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('Attribution type') }),
      itemProps: { mode: 'single' },
    },
    {
      key: 'projectID',
      type: 'custom',
      getComp: () => {
        return (
          <LoadMoreSelector
            getData={getProjectListData}
            placeholder={i18n.t('filter by {name}', { name: i18n.t('Project name') })}
            chosenItemConvert={chosenItemConvert}
            onChange={(id: string, record: { value: string; label: string }) => {
              projectNameRef.current = record?.label;
              // updater.projectData({ value: id, label: record?.label || undefined });
            }}
            dataFormatter={({ list, total }: { list: any[]; total: number }) => ({
              total,
              list: map(list, (project) => {
                const { name, id } = project;
                return { label: name, value: id };
              }),
            })}
          />
        );
      },
      label: i18n.t('Project name'),
    },
    {
      key: 'workspace',
      type: 'select',
      label: i18n.t('environment'),
      options: map(Object.keys(ENV_DIC), (item) => ({ label: ENV_DIC[item], value: item })),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('environment') }),
      itemProps: { mode: 'single' },
    },
  ];

  const onFilter = (params: Obj = {}) => {
    updater.filterData(params);
    getList({ pageNo: 1, ...params });
  };

  const [setUrlQuery] = useUpdateSearch({
    reload: onFilter,
  });

  React.useEffect(() => {
    setUrlQuery({ ...filterData, projectName: projectNameRef.current });
  }, [filterData, setUrlQuery]);

  const columns: any[] = [
    {
      title: i18n.t('Cluster name'),
      dataIndex: 'clusterName',
      render: (value: string) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: i18n.t('msp:domain name'),
      dataIndex: 'domain',
      render: (value: string) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: i18n.t('Attribution type'),
      dataIndex: 'type',
      render: (type: string) => <Tooltip title={SERVER_TYPES[type]}>{SERVER_TYPES[type]}</Tooltip>,
    },
    {
      title: i18n.t('Project name'),
      dataIndex: 'projectName',
      render: (value: string) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: i18n.t('msp:App name'),
      dataIndex: 'appName',
      render: (value: string) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: i18n.t('environment'),
      dataIndex: 'workspace',
      render: (key: string) => <Tooltip title={ENV_DIC[key]}>{ENV_DIC[key]}</Tooltip>,
    },
  ];

  const actions = {
    render: (record: DOMAIN_MANAGE.IDomain) => {
      const { domain, type, workspace: env, link, access = true } = record;
      if (!link) {
        return [];
      }

      const {
        projectID: projectId = '',
        tenantGroup = '',
        appID: appId = '',
        runtimeID: runtimeId = '',
        serviceName = '',
      } = link;

      return type !== 'other'
        ? [
            {
              title: i18n.t('manage'),
              disabled: !access,
              onClick: () => {
                if (type === 'service') {
                  if (serviceName && projectId && appId && runtimeId) {
                    goTo(goTo.pages.projectDeployRuntime, {
                      serviceName,
                      projectId,
                      appId,
                      runtimeId,
                      workspace: env,
                      jumpFrom: 'domainPage',
                      jumpOut: true,
                    });
                  }
                }
                if (type === 'gateway') {
                  if (domain && projectId && tenantGroup && env) {
                    goTo(goTo.pages.gatewayList, { domain, projectId, tenantGroup, env, jumpOut: true });
                  }
                }
              },
            },
          ]
        : [];
    },
  };

  const getList = (_q: Obj = {}) => {
    return getDomainList.fetch(_q);
  };

  const pagination = {
    total: domainPaging.total,
    current: domainPaging.pageNo,
    pageSize: domainPaging.pageSize,
    showSizeChanger: true,
    onChange: (no: number, size: number) => onFilter({ ...filterData, pageNo: no, pageSize: size }),
  };
  const { pageNo, pageSize, ...filterValue } = filterData;
  const slot = (
    <ConfigurableFilter
      hideSave
      value={filterValue}
      fieldsList={filterList}
      onFilter={(v) => onFilter({ ...v, pageNo: 1, pageSize: domainPaging.pageSize })}
    />
  );

  return (
    <Spin spinning={loadingList}>
      <ErdaTable
        slot={slot}
        columns={columns}
        dataSource={domainList}
        pagination={pagination}
        actions={actions}
        rowKey="id"
      />
    </Spin>
  );
};

export default DomainManage;
