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
import { Spin } from 'antd';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import { getAppList } from 'project/services/pipeline';
import PipelineProtocol from './components/pipeline-protocol';
import PipelineManage from 'project/common/components/pipeline-manage';

import './index.scss';

const Pipeline = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [applicationId, setApplicationId] = React.useState(0);
  const [data, loading] = getAppList.useState();
  const { list = [] } = data || {};

  React.useEffect(() => {
    getAppList.fetch({ projectId, pageSize: 1000 });
  }, []);

  return (
    <div className="project-pipeline flex-1 flex bg-white min-h-0 mb-4 h-full">
      <div className="app-list overflow-y-auto px-2">
        <Spin spinning={loading}>
          <div className="px-2 py-4 leading-4 font-medium">{i18n.t('dop:applications')}</div>
          <div
            className={`px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm ${
              applicationId ? '' : 'text-purple-deep'
            }`}
            onClick={() => setApplicationId(0)}
          >
            {i18n.t('dop:all')}
          </div>
          {list?.map((item) => (
            <div
              className={`px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm ${
                applicationId === item.id ? 'text-purple-deep' : ''
              }`}
              onClick={() => setApplicationId(item.id)}
            >
              {item.displayName}
            </div>
          ))}
        </Spin>
      </div>

      <div className="release-right flex-1 mt-2">
        <PipelineProtocol applicationID={applicationId} />
      </div>
    </div>
  );
};

export default Pipeline;
