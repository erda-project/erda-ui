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
import { getProjectIterations } from 'project/services/project-iteration';

import './iteration-selector.scss';

const IterationSelector = ({ iterationName }: { iterationName: string }) => {
  const { projectId, iterationId } = routeInfoStore.useStore((s) => s.params);

  const getData = async (q: { pageNo: number }) => {
    const list = await getProjectIterations({ ...q, projectID: +projectId });
    return list.data || {};
  };

  const headIterationRender = React.useCallback(() => {
    return (
      <div className="flex text-base">
        <div className="w-full flex justify-between max-w-xs">
          <Ellipsis title={iterationName} />
          <ErdaIcon type="caret-down" className="icon ml-0.5" size="14" />
        </div>
      </div>
    );
  }, [iterationName]);

  return (
    <LoadMoreSelector
      className="iteration-selector"
      value={iterationId}
      getData={getData}
      dropdownMatchSelectWidth={false}
      showSearch={false}
      dataFormatter={({ list, total }) => ({
        total,
        list: list.map((item) => ({ ...item, label: item.title, value: item.id })),
      })}
      dropdownStyle={{ width: 400 }}
      valueItemRender={headIterationRender}
      onClickItem={({ value, label }: { value: number; label: string }) => {
        if (value !== +iterationId) {
          breadcrumbStore.reducers.setInfo('iterationName', label);
          goTo(goTo.pages.iterationDetail, { projectId, iterationId: value, issueType: 'all' });
        }
      }}
    />
  );
};

export default IterationSelector;
