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
import { Table } from 'core/nusi';
import { DOC_PROJECT_RESOURCE_MANAGE, WORKSPACE_LIST } from 'common/constants';
import { SectionInfoEdit } from 'project/common/components/section-info-edit';
import i18n from 'i18n';
import projectStore from 'project/stores/project';

import clusterStore from 'app/modules/cmp/stores/cluster';

interface IProps {
  hasEditAuth: boolean;
}

const workSpaceMap = {
  DEV: i18n.t('dev environment'),
  TEST: i18n.t('test environment'),
  STAGING: i18n.t('staging environment'),
  PROD: i18n.t('prod environment'),
};
const ProjectCluster = ({ hasEditAuth }: IProps) => {
  const clusterList = clusterStore.useStore((s) => s.list);
  const { getClusterList } = clusterStore.effects;
  const info = projectStore.useStore((s) => s.info);
  const { updateProject } = projectStore.effects;

  React.useEffect(() => {
    hasEditAuth && getClusterList();
  }, [getClusterList, hasEditAuth]);
  const { clusterConfig } = info;

  const options: object[] = [];
  clusterList.forEach((item) => {
    options.push({
      value: item.name,
      name: item.name,
    });
  });

  const configData = {};
  const tableData: object[] = [];
  const fieldsList: object[] = [];
  const sortBy = WORKSPACE_LIST;
  sortBy.forEach((workspace) => {
    const name = workspace.toUpperCase();
    const clusterName = clusterConfig?.[workspace];

    tableData.push({ workspace, clusterName });
    configData[`${name}`] = clusterName;
    fieldsList.push({
      label: workSpaceMap[name] || name,
      name: ['clusterConfig', name],
      type: 'select',
      options,
    });
  });

  const readonlyForm = (
    <Table
      rowKey="workspace"
      dataSource={tableData}
      columns={[
        {
          key: 'workspace',
          title: i18n.t('project:environments'),
          width: '200',
          dataIndex: 'workspace',
          render: (val: string) => workSpaceMap[val] || val,
        },
        {
          title: i18n.t('project:using clusters'),
          width: '400',
          dataIndex: 'clusterName',
          align: 'left',
        },
      ]}
      pagination={false}
      scroll={{ x: '100%' }}
    />
  );
  return (
    <SectionInfoEdit
      hasAuth={hasEditAuth}
      data={{ clusterConfig: configData }}
      readonlyForm={readonlyForm}
      fieldsList={fieldsList}
      updateInfo={updateProject}
      name={i18n.t('project:cluster setting')}
      desc={
        <span>
          {i18n.t(
            'For cluster resource information corresponding to each environment, the concept and settings of specific clusters, please see',
          )}
          <a href={DOC_PROJECT_RESOURCE_MANAGE} target="_blank" rel="noopener noreferrer">
            {' '}
            {i18n.t('documentation')}{' '}
          </a>
        </span>
      }
      formName={i18n.t('project:cluster used by the environment')}
    />
  );
};

export default ProjectCluster;
