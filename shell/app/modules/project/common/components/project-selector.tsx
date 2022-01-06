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
import { LoadMoreSelector, ErdaIcon, Ellipsis } from 'common';
import { goTo } from 'common/utils';
import { map } from 'lodash';
import { Tooltip } from 'antd';
import { getJoinedProjects } from 'user/services/user';
import routeInfoStore from 'core/stores/route';
import projectStore from 'project/stores/project';
import './project-selector.scss';

interface IProps {
  [pro: string]: any;
  value: string | number;
  onClickItem: (arg?: any) => void;
  projectId?: string;
}

const ProjectItem = (project: PROJECT.Detail) => {
  return project.displayName || project.name;
};

export const ProjectSelector = (props: IProps) => {
  const getData = (_q: any = {}) => {
    return getJoinedProjects(_q).then((res: any) => res.data);
  };

  return (
    <LoadMoreSelector
      getData={getData}
      dropdownMatchSelectWidth={false}
      dataFormatter={({ list, total }) => ({
        total,
        list: map(list, (item) => ({ ...item, label: item.displayName || item.name, value: item.id })),
      })}
      optionRender={ProjectItem}
      dropdownStyle={{ width: 400, height: 300 }}
      {...props}
    />
  );
};

const headProjectRender = (val: any = {}) => {
  const curProject = projectStore.getState((s) => s.info);
  const name = val.displayName || val.name || curProject.displayName || curProject.name || '';
  return (
    <div className="head-project-name flex pl-2 text-base">
      <div className="w-full flex justify-between">
        <Ellipsis className="font-bold" title={name} />
        <ErdaIcon type="caret-down" className="icon ml-0.5" size="14" />
      </div>
    </div>
  );
};

export const HeadProjectSelector = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  return (
    <div className="head-project-selector flex-1 overflow-hidden">
      <ProjectSelector
        valueItemRender={headProjectRender}
        value={projectId}
        onClickItem={(project: PROJECT.Detail) => {
          // 切换project
          goTo(goTo.pages.project, { projectId: project.id });
        }}
      />
    </div>
  );
};
