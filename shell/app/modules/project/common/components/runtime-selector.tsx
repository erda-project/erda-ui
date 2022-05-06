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
import routeInfoStore from 'core/stores/route';
import breadcrumbStore from 'app/layout/stores/breadcrumb';
import { getRuntimes } from 'project/services/deploy';

import './runtime-selector.scss';

const RuntimeSelector = ({ runtimeName }: { runtimeName: string }) => {
  const { projectId, workspace, runtimeId } = routeInfoStore.useStore((s) => s.params);

  const getData = async (q: { pageNo: number }) => {
    const list = await getRuntimes({ ...q, projectID: +projectId, workspace });
    const { data } = list;
    return { list: data, total: data?.length || 0 };
  };

  const headIterationRender = React.useCallback(() => {
    return (
      <div className="flex text-base">
        <div className="w-full flex justify-between max-w-xs">
          <Ellipsis title={runtimeName} />
          <ErdaIcon type="caret-down" className="icon ml-0.5" size="14" />
        </div>
      </div>
    );
  }, [runtimeName]);

  return (
    <LoadMoreSelector
      className="runtimes-selector"
      value={runtimeId}
      getData={getData}
      dropdownMatchSelectWidth={false}
      showSearch={false}
      dataFormatter={({ list, total }) => ({
        total,
        list: list.map((item) => ({
          ...item,
          label: item.applicationName === item.name ? item.name : `${item.applicationName}/${item.name}`,
          value: item.id,
        })),
      })}
      dropdownStyle={{ width: 400 }}
      valueItemRender={headIterationRender}
      onClickItem={({
        value,
        applicationId,
        applicationName,
        name,
      }: {
        value: number;
        applicationId: number;
        name: string;
        applicationName: string;
      }) => {
        if (value !== +runtimeId) {
          breadcrumbStore.reducers.setInfo('runtimeName', name);
          breadcrumbStore.reducers.setInfo('appName', applicationName);
          goTo(goTo.pages.projectDeployRuntime, { projectId, workspace, appId: applicationId, runtimeId: value });
        }
      }}
    />
  );
};

export default RuntimeSelector;
