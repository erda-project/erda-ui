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
import { Table, Pagination } from 'antd';
import { DOC_PROJECT_RESOURCE_MANAGE, WORKSPACE_LIST } from 'common/constants';
import { SectionInfoEdit } from 'project/common/components/section-info-edit';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import projectStore from 'project/stores/project';
import clusterStore from 'app/modules/cmp/stores/cluster';

import './project-cluster.scss';

interface IProps {
  hasEditAuth: boolean;
}

const ProjectCluster = ({ hasEditAuth }: IProps) => {
  return (
    // <SectionInfoEdit
    //   hasAuth={hasEditAuth}
    //   data={{ clusterConfig: configData }}
    //   readonlyForm={readonlyForm}
    //   fieldsList={fieldsList}
    //   updateInfo={updateProject}
    //   name={i18n.t('project:cluster setting')}
    //   desc={
    //     <span>
    //       {i18n.t(
    //         'For cluster resource information corresponding to each environment, the concept and settings of specific clusters, please see',
    //       )}
    //       <a href={DOC_PROJECT_RESOURCE_MANAGE} target="_blank" rel="noopener noreferrer">
    //         {' '}
    //         {i18n.t('documentation')}{' '}
    //       </a>
    //     </span>
    //   }
    //   formName={i18n.t('project:cluster used by the environment')}
    // />
    <Pagination defaultCurrent={1} total={50} />
  );
};

export default ProjectCluster;
