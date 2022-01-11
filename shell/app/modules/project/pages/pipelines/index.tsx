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
import { Badge } from 'common';
import { getAppList } from 'project/services/pipeline';
import PipelineProtocol from './components/pipeline-protocol';

import './index.scss';

const Pipeline = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [application, setApplication] = React.useState({ ID: 0 });
  const { ID: applicationId } = application;
  const [data, loading] = getAppList.useState();
  const { list = [] } = data || {};

  React.useEffect(() => {
    getAppList.fetch({ id: projectId });
  }, []);

  return (
    <div className="project-pipeline flex-1 flex bg-white min-h-0 mb-4 h-full">
      <div className="app-list overflow-auto h-full px-2">
        <div>
          <div className="px-2 py-4 leading-4 font-medium">{i18n.t('dop:applications')}</div>
          <div className="flex-1">
            <div
              className={`application-item px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm ${
                applicationId ? '' : 'text-purple-deep active'
              }`}
              onClick={() => setApplication({ ID: 0 })}
            >
              {i18n.t('dop:all')}
            </div>

            <Spin spinning={loading}>
              {list?.map((item) => (
                <div
                  className={`application-item px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm flex-h-center ${
                    applicationId === item.ID ? 'text-purple-deep active' : ''
                  }`}
                  onClick={() => setApplication(item)}
                >
                  <div className="flex-1">{item.displayName}</div>
                  {item.runningNum ? (
                    <div className="flex-h-center mr-3">
                      <Badge onlyDot breathing status={'success'} className="mr-0.5" />
                      <div className="bg-default-04 text-default-9 rounded-lg px-2 text-xs">{item.runningNum}</div>
                    </div>
                  ) : null}
                  {item.failedNum ? (
                    <div className="flex-h-center">
                      <Badge onlyDot breathing status={'error'} className="mr-0.5" />
                      <div className="bg-default-04 text-default-9 rounded-lg px-2 text-xs">{item.failedNum}</div>
                    </div>
                  ) : null}
                </div>
              ))}
            </Spin>
          </div>
        </div>
      </div>

      <div className="pipeline-right flex-1 pt-2 h-full">
        <PipelineProtocol application={application} />
      </div>
    </div>
  );
};

export default Pipeline;
