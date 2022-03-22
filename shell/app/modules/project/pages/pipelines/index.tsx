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
import { Input, Tooltip, Spin, Divider, Alert, Button } from 'antd';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import { Badge, ErdaIcon, Ellipsis } from 'common';
import { fromNow } from 'common/utils';
import { getPipelineTypesList, getGuidesList } from 'project/services/pipeline';
import PipelineProtocol from './components/pipeline-protocol';

import './index.scss';

const Pipeline = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [type, setType] = React.useState({ key: '', rules: [] });
  const { key: typeKey } = type;
  const [searchValue, setSearchValue] = React.useState('');
  const [list, loading] = getPipelineTypesList.useState();
  const [guidesList] = getGuidesList.useState();
  const [appID, setAppID] = React.useState<number | null>(null);

  const getList = React.useCallback(() => {
    getPipelineTypesList.fetch({ projectID: projectId });
  }, [projectId]);

  React.useEffect(() => {
    getList();
  }, [getList]);

  const getGuides = React.useCallback(() => {
    getGuidesList.fetch({ kind: 'pipeline', projectID: projectId });
  }, [projectId]);

  React.useEffect(() => {
    getGuides();
  }, [getGuides]);

  const search = debounce((value: string) => {
    setSearchValue(value);
    setType({ key: '', rules: [] });
  }, 1000);

  return (
    <div className="h-full flex flex-col">
      {guidesList?.map((item) => (
        <Alert
          type="info"
          className="alert-blue mb-2"
          message={
            <div className="flex-h-center">
              <ErdaIcon type="daimafenzhi" size="20" className="text-blue mr-1" />
              <span className="font-medium mr-5">
                {item.appName || '-'}:{item.branch || '-'}
              </span>
              <span className="mr-1">
                {i18n.t('created at')} {fromNow(item.timeCreated)}
              </span>
              <div className="flex-1 text-right">
                <Button type="primary" onClick={() => setAppID(item.appID)}>
                  {i18n.t('add')}
                </Button>
              </div>
            </div>
          }
        />
      ))}

      <div className="project-pipeline flex-1 flex bg-white min-h-0 mb-4">
        <div className="app-list bg-default-02 overflow-auto h-full flex-shrink-0">
          <div className="flex flex-col">
            <div className="p-4 leading-4 font-medium">{i18n.t('dop:pipeline type')}</div>
            <Input
              size="small"
              className="bg-default-06 border-transparent mb-2 mx-4"
              style={{ width: 'auto' }}
              prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
              placeholder={i18n.t('search {name}', { name: i18n.t('dop:app name') })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => search(e.target.value)}
            />
            <div className="flex-1">
              <Spin spinning={loading}>
                <div
                  className={`application-item px-4 leading-5 cursor-pointer rounded-sm flex-h-center ${
                    typeKey ? 'hover:bg-white' : 'text-purple-deep active'
                  }`}
                  onClick={() => setType({ key: '', rules: [] })}
                >
                  {i18n.t('dop:all')}
                </div>

                <div>
                  {list
                    ?.filter((item) => (searchValue ? item.category.includes(searchValue) : true))
                    ?.map((item) => (
                      <div
                        key={item.key}
                        className={`application-item px-4 py-2 cursor-pointer rounded-sm flex flex-col ${
                          typeKey === item.key ? 'text-purple-deep active' : 'hover:bg-white'
                        }`}
                        onClick={() => setType(item)}
                      >
                        <div className="flex-h-center leading-5 flex-1">
                          <div className="flex-1 min-w-0">
                            <Ellipsis title={item.category} />
                          </div>
                          <div className="bg-default-04 text-default-9 rounded-2xl px-3 py-0.5 text-xs flex-h-center">
                            {item.runningNum ? (
                              <Tooltip title={i18n.t('running')}>
                                <div className="flex-h-center mr-0.5">
                                  <Badge onlyDot breathing status={'success'} className="mr-0.5" />
                                  <div>{item.runningNum}</div>
                                </div>
                              </Tooltip>
                            ) : null}
                            {item.failedNum ? (
                              <Tooltip title={i18n.t('dop:number of failures in a day')}>
                                <div className="flex-h-center">
                                  <Badge onlyDot breathing status={'error'} className="mr-0.5" />
                                  <div>{item.failedNum}</div>
                                </div>
                              </Tooltip>
                            ) : null}
                            {(item.runningNum || item.failedNum) && item.totalNum ? (
                              <Divider type="vertical" className="top-0" />
                            ) : null}
                            <Tooltip title={i18n.t('dop:total number of pipelines')}>
                              <div>{item.totalNum || 0}</div>
                            </Tooltip>
                          </div>
                        </div>
                        {item.rules?.length ? (
                          <div className="whitespace-nowrap text-default-6 text-xs">
                            <Ellipsis title={item.rules.join(', ')} />
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </Spin>
            </div>
          </div>
        </div>

        <div className="pipeline-right flex-1 pt-2 h-full min-w-0">
          <PipelineProtocol appID={appID} setAppID={setAppID} type={type} getTypes={getList} getGuides={getGuides} />
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
