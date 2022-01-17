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
import { debounce } from 'lodash';
import { Input, Tooltip, Spin } from 'antd';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import { Badge, ErdaIcon } from 'common';
import { getAppList } from 'project/services/pipeline';
import PipelineProtocol from './components/pipeline-protocol';

import './index.scss';

const Pipeline = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [application, setApplication] = React.useState({ ID: 0 });
  const { ID: applicationId } = application;
  const [searchValue, setSearchValue] = React.useState('');
  const [list, loading] = getAppList.useState();

  const getList = React.useCallback(() => {
    getAppList.fetch({ projectID: projectId });
  }, [projectId]);

  React.useEffect(() => {
    getList();
  }, [getList]);

  const search = debounce((value: string) => {
    setSearchValue(value);
    setApplication({ ID: 0 });
  }, 1000);

  return (
    <div className="project-pipeline flex-1 flex bg-white min-h-0 mb-4 h-full">
      <div className="app-list overflow-auto h-full px-2 flex-shrink-0">
        <div className="flex flex-col">
          <div className="px-2 py-4 leading-4 font-medium">{i18n.t('dop:applications')}</div>
          <Input
            size="small"
            className="bg-default-06 border-transparent shadow-none mb-2 mx-2"
            style={{ width: 'auto' }}
            prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
            placeholder={i18n.t('search {name}', { name: i18n.t('dop:app name') })}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => search(e.target.value)}
          />
          <div className="flex-1">
            <Spin spinning={loading}>
              <div
                className={`application-item px-2 mb-1 leading-5 cursor-pointer rounded-sm flex-h-center ${
                  applicationId ? 'hover:bg-default-04' : 'text-purple-deep active'
                }`}
                onClick={() => setApplication({ ID: 0 })}
              >
                {i18n.t('dop:all')}
              </div>

              <div>
                {list
                  ?.filter((item) => (searchValue ? item.displayName.includes(searchValue) : true))
                  ?.map((item) => (
                    <div
                      className={`application-item px-2 mb-1 leading-5 cursor-pointer rounded-sm flex-h-center ${
                        applicationId === item.ID ? 'text-purple-deep active' : 'hover:bg-default-04'
                      }`}
                      onClick={() => setApplication(item)}
                    >
                      <div className="flex-1">{item.displayName}</div>
                      {item.runningNum ? (
                        <Tooltip title={i18n.t('running')}>
                          <div className="flex-h-center mr-3">
                            <Badge onlyDot breathing status={'success'} className="mr-0.5" />
                            <div className="bg-default-04 text-default-9 rounded-lg px-2 text-xs">
                              {item.runningNum}
                            </div>
                          </div>
                        </Tooltip>
                      ) : null}
                      {item.failedNum ? (
                        <Tooltip title={i18n.t('dop:number of failures in a day')}>
                          <div className="flex-h-center">
                            <Badge onlyDot breathing status={'error'} className="mr-0.5" />
                            <div className="bg-default-04 text-default-9 rounded-lg px-2 text-xs">{item.failedNum}</div>
                          </div>
                        </Tooltip>
                      ) : null}
                    </div>
                  ))}
              </div>
            </Spin>
          </div>
        </div>
      </div>

      <div className="pipeline-right flex-1 pt-2 h-full min-w-0">
        <PipelineProtocol application={application} getApps={getList} />
      </div>
    </div>
  );
};

export default Pipeline;
