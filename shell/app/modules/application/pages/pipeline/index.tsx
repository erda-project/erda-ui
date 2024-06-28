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
import { Alert } from 'antd';
import routeInfoStore from 'core/stores/route';
import Pipeline from 'project/common/components/pipeline-new';
import PipelineRecords from 'project/common/components/pipeline-new/records';
import i18n from 'i18n';
import ObsoletedPipeline from './obsoleted-pipeline';

const AppPipeline = () => {
  const { pipelineTab, appId, projectId } = routeInfoStore.useStore((s) => s.params);

  const tabs = [
    {
      label: i18n.t('dop:Pipeline List'),
      value: 'list',
      href: goTo.resolve.pipelineNewRoot({ projectId, appId }),
      Comp: <Pipeline />,
    },
    {
      label: i18n.t('dop:Execution Records'),
      value: 'records',
      href: goTo.resolve.appPipelineRecords({ projectId, appId }),
      Comp: <PipelineRecords />,
    },
  ];

  const curTab = tabs.find((item) => item.value === pipelineTab);
  if (pipelineTab === 'obsoleted') {
    return <ObsoletedPipeline />;
  }

  return (
    <div className="flex flex-col h-full">
      <Alert
        type="info"
        message={
          <span>
            {i18n.t(
              'dop:The new pipeline page is in the trial stage, and you can still manually switch to the old version for use.',
            )}
            <span
              onClick={() => {
                goTo('../obsoleted');
              }}
              className="text-purple-deep cursor-pointer"
            >
              {i18n.t('dop:Switch to old version')}
            </span>
          </span>
        }
        className="mb-2 bg-blue-1 border-blue"
      />
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
