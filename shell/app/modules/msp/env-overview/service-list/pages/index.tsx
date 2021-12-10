/* eslint-disable array-callback-return */
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
import { PAGINATION } from 'app/constants';
import { Col, Input, Row, Spin, Tag, Tooltip } from 'antd';
import Pagination from 'common/components/pagination';
import { debounce, map } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import EChart from 'charts/components/echarts';
import EmptyHolder from 'common/components/empty-holder';
import { ErdaAlert, ErdaIcon } from 'common';
import { goTo } from 'common/utils';
import { LinearGradient } from 'echarts/lib/util/graphic';
import './service-list.scss';
import routeInfoStore from 'core/stores/route';
import mspStore from 'msp/stores/micro-service';
import { getAnalyzerOverview, getServices } from 'msp/services/service-list';
import i18n from 'i18n';

interface Views {
  type: string;
  data: number;
  view: View[];
}
interface View {
  timestamp: number;
  value: number;
}
interface IList {
  id: string;
  language: string;
  lastHeartbeat: string;
  name: string;
  views?: Views[];
}

const defaultSeriesConfig = (color?: string) => ({
  type: 'line',
  showSymbol: false,
  itemStyle: {
    normal: {
      lineStyle: {
        color,
      },
    },
  },
  areaStyle: {
    normal: {
      color: new LinearGradient(0, 0, 0, 1, [
        { offset: 0, color },
        { offset: 0.3, color: 'rgba(48, 38, 71, 0.01)' },
        { offset: 1, color: 'rgba(48, 38, 71, 0.01)' },
      ]),
    },
  },
});

const option = {
  backgroundColor: 'rgba(48, 38, 71, 0.01)',
  xAxis: {
    show: false,
  },
  yAxis: {
    show: false,
  },
  grid: {
    top: '10%',
    bottom: '10%',
  },
};

enum ERDA_ICON {
  unknown = 'weizhi',
  java = 'java',
  golang = 'go',
  python = 'python',
  nodejs = 'nodejs',
  c = 'C-1',
  cpp = 'C++',
  php = 'php',
  dotnet = 'net',
  csharp = 'C',
}

const MicroServiceOverview = () => {
  const params = routeInfoStore.useStore((s) => s.params);
  const currentProject = mspStore.useStore((s) => s.currentProject);
  const [data, dataLoading] = getServices.useState();
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const overviewList = getAnalyzerOverview.useData();
  const [{ serviceList, searchValue }, updater] = useUpdate<{ serviceList: IList[]; searchValue: string }>({
    serviceList: [] as IList[],
    searchValue: '',
  });

  const listDetail = (serviceId: string, serviceName: string) => {
    goTo(goTo.pages.mspServiceAnalyze, {
      ...params,
      applicationId: currentProject?.type === 'MSP' ? '-' : serviceId.split('_')[0],
      serviceName,
      serviceId: window.encodeURIComponent(serviceId || ''),
    });
  };

  const getServicesList = () => {
    getServices.fetch({
      tenantId,
      pageNo: 1,
      pageSize: PAGINATION.pageSize,
    });
  };

  React.useEffect(() => {
    getServicesList();
  }, [tenantId]);

  React.useEffect(() => {
    const list = data?.list.map((itemOut) => {
      let views: Views[] = [];
      overviewList?.list.map((itemInner) => {
        if (itemOut?.id === itemInner?.serviceId) {
          views = itemInner.views;
        }
      });
      return { ...itemOut, views };
    });
    updater.serviceList(list);
  }, [overviewList]);

  const getOverview = () => {
    const serviceIdList = data?.list.map((item) => item?.id);
    if (serviceIdList?.length) {
      getAnalyzerOverview.fetch({
        tenantId,
        serviceIds: serviceIdList,
      });
    }
  };

  React.useEffect(() => {
    getOverview();
  }, [data]);

  const handleSearch = React.useCallback(
    debounce((keyword?: string) => {
      getServices.fetch({
        tenantId,
        pageNo: 1,
        serviceName: keyword,
        pageSize: PAGINATION.pageSize,
      });
    }, 1000),
    [],
  );

  const onReload = (searchVal: string) => {
    getServices.fetch({
      tenantId,
      pageNo: 1,
      serviceName: searchVal || '',
      pageSize: PAGINATION.pageSize,
    });
  };

  const onPageChange = (page: number, pageSize: number) => {
    getServices.fetch({
      tenantId,
      pageNo: page,
      pageSize,
    });
  };

  return (
    <div>
      <ErdaAlert
        message={i18n.t(
          'msp:show all connected services in the current environment, as well as the key request indicators of the service in the last hour',
        )}
      />
      <div className="flex flex-1 flex-col bg-white shadow pb-2">
        <div className="px-4 py-2 bg-header flex justify-between">
          <Input
            prefix={<ErdaIcon type="search1" />}
            bordered={false}
            allowClear
            placeholder={i18n.t('msp:search by service name')}
            className="bg-hover-gray-bg w-72"
            onChange={(e) => {
              handleSearch(e.target.value);
              updater.searchValue(e.target.value);
            }}
          />
          <ErdaIcon className="cursor-pointer" size="20" type="refresh" onClick={() => onReload(searchValue)} />
        </div>
        <div className="px-2 mt-2 flex-1 overflow-y-auto pt-2">
          <Spin spinning={dataLoading}>
            {serviceList?.length ? (
              serviceList.map(({ id, language, views, lastHeartbeat, name }) => {
                return (
                  <Row
                    key={id}
                    className="cursor-pointer hover:bg-grey project-item card-shadow mb-2 mx-2 px-4 flex py-6 rounded-sm"
                    onClick={() => {
                      listDetail(id, name);
                    }}
                  >
                    <Col span={8} className="flex items-center">
                      <div className="rounded-sm w-14 h-14 mr-2 language-wrapper">
                        <ErdaIcon type={ERDA_ICON[language]} size="56" />
                      </div>
                      <div>
                        <p className="mb-0.5 font-medium text-xl leading-8">{name}</p>
                        <Tag color="#59516C" className="mb-0.5 text-xs leading-5 border-0">
                          {i18n.t('msp:last active time')}: {lastHeartbeat}
                        </Tag>
                      </div>
                    </Col>
                    <Col span={16} className="flex items-center">
                      <Row gutter={8} className="flex-1">
                        {map(views, ({ data, type, view }) => {
                          const timeStamp: number[] = [];
                          const value: number[] = [];
                          view.map((item) => {
                            timeStamp.push(item.timestamp);
                            value.push(item.value);
                          });
                          const currentOption = {
                            ...option,
                            xAxis: { data: timeStamp, show: false },
                            tooltip: {
                              trigger: 'axis',
                              formatter: '{c0}',
                            },
                            series: [
                              {
                                ...defaultSeriesConfig(
                                  value.find((val) => val !== 0) && type === 'ErrorRate' ? '#d84b65' : '#798CF1',
                                ),
                                data: value.map((item) => {
                                  if (type === 'RPS' || type === 'ErrorRate') {
                                    return item.toFixed(2);
                                  } else {
                                    return (item / 1000000).toFixed(2);
                                  }
                                }),
                                type: 'line',
                                smooth: false,
                              },
                            ],
                          };

                          return (
                            <Col span={8} className="flex">
                              <div className="py-2">
                                <p className="mb-0 text-xl whitespace-nowrap leading-8 font-number">
                                  {type === 'RPS' ? (data === null ? '-' : `${data} reqs/s`) : null}
                                  {type === 'AvgDuration'
                                    ? data === null
                                      ? '-'
                                      : `${Math.ceil(data / 1000000).toFixed(2)}ms`
                                    : null}
                                  {type === 'ErrorRate' ? (data === null ? '-' : `${data}%`) : null}
                                </p>
                                <p className="mb-0 flex text-xs leading-5 text-desc">
                                  {type === 'AvgDuration' ? (
                                    <>
                                      {i18n.t('msp:average delay')}
                                      <Tooltip title={i18n.t('msp:definition of average delay')}>
                                        <ErdaIcon fill="gray" className="ml-1" type="help" />
                                      </Tooltip>
                                    </>
                                  ) : null}
                                  {type === 'ErrorRate' ? (
                                    <>
                                      {i18n.t('msp:error rate')}
                                      <Tooltip title={i18n.t('msp:definition of error rate')}>
                                        <ErdaIcon fill="gray" className="ml-1" type="help" />
                                      </Tooltip>
                                    </>
                                  ) : null}
                                  {type === 'RPS' ? (
                                    <>
                                      {i18n.t('msp:average throughput')}
                                      <Tooltip title={i18n.t('msp:definition of rps')}>
                                        <ErdaIcon fill="gray" className="ml-1" type="help" />
                                      </Tooltip>
                                    </>
                                  ) : null}
                                </p>
                              </div>
                              <div className="ml-1 mr-4 px-2 py-2 flex-1 chart-wrapper ">
                                <EChart
                                  style={{ width: '100%', height: '56px', minHeight: 0 }}
                                  option={currentOption}
                                />
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </Col>
                  </Row>
                );
              })
            ) : (
              <EmptyHolder relative />
            )}
          </Spin>
        </div>
        <Pagination
          current={data?.pageNo}
          pageSize={data?.pageSize}
          onChange={onPageChange}
          className="flex justify-end mr-4 mb-2"
          total={data?.total}
        />
      </div>
    </div>
  );
};

export default MicroServiceOverview;
