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
import { RadioTabs } from 'common';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import Pipeline from 'project/common/components/pipeline-new';
import PipelineRecords from 'project/common/components/pipeline-new/records';

const AppPipeline = () => {
  const { pipelineTab, appId, projectId } = routeInfoStore.useStore((s) => s.params);
  const tabs = [
    {
      label: '流水线列表',
      value: 'list',
      href: goTo.resolve.pipelineRoot({ projectId, appId }),
      Comp: <Pipeline />,
    },
    {
      label: '执行记录',
      value: 'records',
      href: goTo.resolve.appPipelineRecords({ projectId, appId }),
      Comp: <PipelineRecords />,
    },
  ];

  const curTab = tabs.find((item) => item.value === pipelineTab);

  return (
    <div>
      <RadioTabs
        options={tabs}
        className="mb-4"
        value={pipelineTab}
        onChange={(v) => {
          const curHref = tabs.find((item) => item.value === v)?.href;
          curHref && goTo(curHref);
        }}
      />
      {curTab?.Comp}
    </div>
  );
};

export default AppPipeline;
