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
import { Col, Input, Row, Spin, Tag, Pagination } from 'antd';
import { debounce, map } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import EChart from 'charts/components/echarts';
import EmptyHolder from 'common/components/empty-holder';
import { ErdaIcon } from 'common';
import { LinearGradient } from 'echarts/lib/util/graphic';
import './index.scss';
import routeInfoStore from 'core/stores/route';
import { getServices, getAnalyzerOverview } from 'msp/services/service-list';
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

const defaultSeriesConfig = (color: string) => ({
  type: 'line',
  showSymbol: false,
  itemStyle: {
    normal: {
      lineStyle: {
        color: color || '#798CF1',
      },
    },
  },
  areaStyle: {
    normal: {
      color: new LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color || '#798CF1' },
        { offset: 0.5, color: 'white' },
        { offset: 1, color: 'white' },
      ]),
    },
  },
});

const option = {
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
  const [data, dataLoading] = getServices.useState();
  const [{ serviceList }, updater] = useUpdate<{ serviceList: IList[] }>({
    serviceList: [] as IList[],
  });
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const overviewList = getAnalyzerOverview.useData();

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
    if (serviceIdList) {
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

  const onReload = () => {
    getServicesList();
  };

  const onPageChange = (page: number) => {
    getServices.fetch({
      tenantId,
      pageNo: page,
      pageSize: PAGINATION.pageSize,
    });
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white shadow pb-2">
      <div className="px-4 py-2 bg-header flex justify-between">
        <Input
          prefix={<ErdaIcon color="gray" type="search" />}
          bordered={false}
          allowClear
          placeholder={i18n.t('msp:search by project name')}
          className="bg-hover-gray-bg w-72"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
        <ErdaIcon size="20" type="refresh" onClick={onReload} />
      </div>
      <div className="px-2 mt-2 flex-1 overflow-y-auto">
        <Spin spinning={dataLoading}>
          {serviceList?.length ? (
            serviceList.map(({ id, language, views, lastHeartbeat, name }) => {
              return (
                <Row
                  key={id}
                  className="project-item card-shadow mb-2 mx-2 px-4 flex py-6 rounded-sm"
                  onClick={() => {}}
                >
                  <Col span={10} className="flex items-center">
                    <div className="w-14 h-14 mr-2">
                      <ErdaIcon type={ERDA_ICON[language]} size="56" />
                    </div>
                    <div>
                      <p className="mb-0.5 font-medium text-xl leading-8">{name}</p>
                      <Tag color="#59516C" className="mb-0.5 text-xs leading-5 border-0">
                        {i18n.t('msp:last active time')}: {lastHeartbeat}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={14} className="flex items-center">
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
                          series: [
                            {
                              ...defaultSeriesConfig,
                              data: value,
                              type: 'line',
                            },
                          ],
                        };

                        const errorRateOption = {
                          ...option,
                          xAxis: { data: timeStamp, show: false },
                          series: [
                            {
                              ...defaultSeriesConfig(value.find((val) => val !== 0) ? '#d84b65' : ''),
                              data: value,
                              type: 'line',
                            },
                          ],
                        };
                        return (
                          <Col span={8} className="flex">
                            <div>
                              <p className="mb-0 text-xl leading-8 font-number">
                                {data === 0 ? '-' : type === 'AvgDuration' ? `${Math.ceil(data / 1000000)}ms` : data}
                              </p>
                              <p className="mb-0 flex text-xs leading-5 text-desc">
                                {type === 'AvgDuration' ? i18n.t('msp:average delay') : null}
                                {type === 'ErrorRate' ? i18n.t('msp:error rate') : null}
                                {type === 'QPS' ? 'QPS' : null}
                                {type === 'QPS' ? <ErdaIcon fill="gray" className="ml-1" type="help" /> : null}
                              </p>
                            </div>
                            <div className="ml-4 mr-4 flex-1 overflow-hidden">
                              {type === 'QPS' || type === 'AvgDuration' ? (
                                <EChart
                                  style={{ width: '100%', height: '56px', minHeight: 0 }}
                                  option={currentOption}
                                />
                              ) : null}
                              {type === 'ErrorRate' ? (
                                <EChart
                                  style={{ width: '100%', height: '56px', minHeight: 0 }}
                                  option={errorRateOption}
                                />
                              ) : null}
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
        pageSize={PAGINATION.pageSize}
        onChange={onPageChange}
        className="flex justify-end mr-4 mb-5"
        total={data?.total}
      />
    </div>
  );
};

export default MicroServiceOverview;
