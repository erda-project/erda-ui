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
import { useMount } from 'react-use';
import i18n from 'i18n';
import { Spin, Table, Input, Select } from 'app/nusi';
import { isEmpty, map } from 'lodash';
import { Holder, LoadMoreSelector, useUpdate, Filter } from 'common';
import domainStore from '../../stores/domain-manage';
import { goTo } from 'app/common/utils';
import { getProjectList } from 'project/services/project';
import routeInfoStore from 'common/stores/route';
import { useLoading } from 'common/stores/loading';

const { Option } = Select;
const SERVER_TYPES = {
  service: i18n.t('common:service'),
  gateway: i18n.t('API gateway'),
  other: i18n.t('common:other'),
};

const ENV_DIC = {
  DEV: i18n.t('develop'),
  TEST: i18n.t('test'),
  STAGING: i18n.t('staging'),
  PROD: i18n.t('production'),
};

const envOptions = Object.keys(ENV_DIC).map((key:string) => <Option key={key} value={key}>{ENV_DIC[key]}</Option>);


const DomainManage = () => {
  const [domainList, clusterList, paging] = domainStore.useStore(s => [s.domainList, s.clusterList, s.domainPaging]);
  const { getDomainList, getClusterList } = domainStore.effects;
  const [loadingList] = useLoading(domainStore, ['getDomainList']);
  const { projectName, projectID } = routeInfoStore.useStore(s => s.query);

  const [{ projectData, query }, updater] = useUpdate({
    projectData: { value: projectID, label: projectName },
    query: {} as Obj,
  });

  const getProjectListData = (q: any) => {
    return getProjectList({ ...q, query: q.q }).then((res: any) => res.data);
  };

  useMount(() => {
    getClusterList();
  });

  const chosenItemConvert = React.useCallback((selectItem: {value: number, label: string}) => {
    if (isEmpty(selectItem)) {
      return [];
    }

    const { value, label } = selectItem;
    if (label) {
      return [{ value, label }];
    } else if (!isEmpty(projectData)) {
      return [{ value, label: projectData.label }];
    } else {
      return [{ value, label: '' }];
    }
  }, [projectData]);

  const filterConfig = React.useMemo(():FilterItemConfig[] => [
    {
      type: Input,
      name: 'domain',
      customProps: {
        placeholder: i18n.t('please choose {name}', { name: i18n.t('microService:domain name') }),
      },
    },
    {
      type: Select,
      name: 'clusterName',
      customProps: {
        options: map(clusterList, ({ name }) => <Option key={name} value={name}>{name}</Option>),
        placeholder: i18n.t('please choose {name}', { name: i18n.t('dcos:cluster name') }),
        allowClear: true,
      },
    },
    {
      type: Select,
      name: 'type',
      customProps: {
        options: map(Object.keys(SERVER_TYPES), value => <Option key={value} value={value}>{SERVER_TYPES[value]}</Option>),
        placeholder: i18n.t('please choose {name}', { name: i18n.t('attribution type') }),
        allowClear: true,
      },
    },
    {
      type: LoadMoreSelector,
      name: 'projectID',
      customProps: {
        placeholder: i18n.t('please choose {name}', { name: i18n.t('project name') }),
        allowClear: true,
        getData: getProjectListData,
        chosenItemConvert,
        onChange: (id:number, record: {value:number, label:string}) => {
          updater.projectData({ value: id, label: record?.label || undefined });
        },
        dataFormatter: ({ list, total }: { list: any[], total: number }) => ({
          total,
          list: map(list, project => {
            const { name, id } = project;
            return { label: name, value: id };
          }),
        }),
      },
    },
    {
      type: Select,
      name: 'workspace',
      customProps: {
        allowClear: true,
        options: envOptions,
        placeholder: i18n.t('please choose {name}', { name: i18n.t('application:environment') }),
      },
    },
  ], [chosenItemConvert, clusterList, updater]);

  const onFilter = (params: Obj) => {
    updater.query(params);
    getDomainList({ pageNo: 1, ...params, pageSize: paging.pageSize });
  };

  const urlExtra = React.useMemo(() => {
    return { pageNo: paging.pageNo, projectName: projectData.label };
  }, [paging.pageNo, projectData]);

  const columns: any[] = [
    {
      title: i18n.t('dcos:cluster name'),
      dataIndex: 'clusterName',
      tip: true,
    },
    {
      title: i18n.t('microService:domain name'),
      dataIndex: 'domain',
      tip: true,
    },
    {
      title: i18n.t('attribution type'),
      dataIndex: 'type',
      tip: true,
      render: (type: string) => {
        return <span>{SERVER_TYPES[type]}</span>;
      },
    },
    {
      title: i18n.t('project name'),
      dataIndex: 'projectName',
      tip: true,
    },
    {
      title: i18n.t('microService:application name'),
      dataIndex: 'appName',
      tip: true,
    },
    {
      title: i18n.t('application:environment'),
      dataIndex: 'workspace',
      tip: true,
      render: (key:string) => ENV_DIC[key],
    },
  ];

  const actions = {
    title: i18n.t('default:operation'),
    render: (record: DOMAIN_MANAGE.IDomain) => {
      const { domain, type, workspace: env, link } = record;
      if (!link) {
        return undefined;
      }

      const { projectID: projectId = '', tenantGroup = '', appID: appId = '', runtimeID: runtimeId = '', serviceName = '' } = link;
      return type !== 'other' ? [
        <span
          className='fake-link mr4'
          onClick={(e) => {
            e.stopPropagation();
            if (type === 'service') {
              if (serviceName && projectId && appId && runtimeId) {
                goTo(goTo.pages.runtimeDetail, { serviceName, projectId, appId, runtimeId, jumpFrom: 'domainPage', jumpOut: true });
              }
            }
            if (type === 'gateway') {
              if (domain && projectId && tenantGroup && env) {
                goTo(goTo.pages.gatewayList, { domain, projectId, tenantGroup, env, jumpOut: true });
              }
            }
          }}
        >
          {i18n.t('manage')}
        </span>,
      ] : [];
    },
    width: 150,
  };

  const pagination = {
    total: paging.total,
    current: paging.pageNo,
    pageSize: paging.pageSize,
    showSizeChanger: true,
    onChange: (no: number) => getDomainList({ ...query, pageNo: no }),
    onShowSizeChange: (_no: number, size: number) => getDomainList({ ...query, pageNo: 1, pageSize: size }),
  };

  return (
    <div className="cluster-manage-ct">
      <Filter config={filterConfig} onFilter={onFilter} connectUrlSearch urlExtra={urlExtra} />
      <Spin spinning={loadingList}>
        <Holder when={isEmpty(domainList)}>
          <Table
            columns={columns}
            dataSource={domainList}
            pagination={pagination}
            rowKey="id"
            rowAction={actions}
          />
        </Holder>
      </Spin>
    </div>
  );
};

export default DomainManage;
