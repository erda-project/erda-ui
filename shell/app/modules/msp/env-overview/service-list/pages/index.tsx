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
import { Button, Input, Tag, Tooltip } from 'antd';
import Pagination from 'common/components/pagination';
import { debounce, isNil } from 'lodash';
import EChart from 'charts/components/echarts';
import { CardColumnsProps, CardList, ErdaIcon, RadioTabs } from 'common';
import { goTo } from 'common/utils';
import { genLinearGradient, newColorMap } from 'app/charts/theme';
import './service-list.scss';
import routeInfoStore from 'core/stores/route';
import mspStore from 'msp/stores/micro-service';
import unknownIcon from 'app/images/default-project-icon.png';
import { getFormatter } from 'charts/utils';
import moment from 'moment';
import { getAnalyzerOverview, getServices } from 'msp/services/service-list';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import { functionalColor } from 'common/constants';

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
      color: genLinearGradient(color),
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

const CHART_MAP: {
  [k in MSP_SERVICES.SERVICE_LIST_CHART_TYPE]: {
    key: string;
    name: string;
    tips: string;
    convert: (value?: number) => string;
  };
} = {
  RPS: {
    key: 'rps',
    convert: (value?: number) => (isNil(value) ? '-' : `${value} reqs/s`),
    name: i18n.t('msp:average throughput'),
    tips: i18n.t('msp:definition of rps'),
  },
  AvgDuration: {
    key: 'avgDuration',
    convert: (value?: number) => (isNil(value) ? '-' : getFormatter('TIME', 'ns').format(value)),
    name: i18n.t('msp:average delay'),
    tips: i18n.t('msp:definition of average delay'),
  },
  ErrorRate: {
    key: 'errorRate',
    convert: (value?: number) => (isNil(value) ? '-' : `${value}%`),
    name: i18n.t('msp:error rate'),
    tips: i18n.t('msp:definition of error rate'),
  },
};

type IListItem = Merge<MSP_SERVICES.SERVICE_LIST_ITEM, { views: MSP_SERVICES.SERVICE_LIST_CHART['views'] }>;

const listDetail = (serviceId: string, serviceName: string) => {
  const currentProject = mspStore.getState((s) => s.currentProject);
  const params = routeInfoStore.getState((s) => s.params);
  goTo(goTo.pages.mspServiceAnalyze, {
    ...params,
    applicationId: currentProject?.type === 'MSP' ? '-' : serviceId.split('_')[0],
    serviceName,
    serviceId: window.encodeURIComponent(serviceId || ''),
  });
};

const tabs = [
  {
    label: '全部服务',
    value: 'allService',
  },
  {
    label: '异常服务',
    value: 'abnormalService',
  },
  {
    label: '无流量服务',
    value: 'noFlowService',
  },
];

const MicroServiceOverview = () => {
  const [data, dataLoading] = getServices.useState();
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const overviewList = getAnalyzerOverview.useData();
  const [searchValue, setSearchValue] = React.useState('');
  const [pagination, setPagination] = React.useState({ current: 1, pageSize: PAGINATION.pageSize });
  const [serviceType, setServiceType] = React.useState(tabs[0].value);

  const getServicesList = React.useCallback(() => {
    getServices.fetch({
      tenantId,
      serviceName: searchValue || undefined,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, [tenantId, pagination, searchValue, serviceType]);

  React.useEffect(() => {
    getServicesList();
  }, [getServicesList]);

  React.useEffect(() => {
    const serviceIdList = data?.list.map((item) => item?.id);
    if (serviceIdList?.length) {
      getAnalyzerOverview.fetch({
        view: 'service_overview',
        tenantId,
        serviceIds: serviceIdList,
      });
    }
  }, [data]);

  const onPageChange = (current: number, pageSize?: number) => {
    setPagination({ current, pageSize: pageSize || PAGINATION.pageSize });
  };

  const handleChange = React.useCallback(
    debounce((keyword: string) => {
      setSearchValue(keyword);
    }, 1000),
    [],
  );

  const columns: CardColumnsProps<IListItem>[] = [
    {
      dataIndex: 'language',
      colProps: { span: 8, className: 'flex items-center' },
      render: (language, { name, lastHeartbeat }) => {
        return (
          <>
            <div className="rounded-sm w-14 h-14 mr-2 language-wrapper">
              {ERDA_ICON[language] ? (
                <ErdaIcon type={ERDA_ICON[language]} size="56" />
              ) : (
                <img src={unknownIcon} width={56} height={56} />
              )}
            </div>
            <div>
              <p className="mb-0.5 font-medium text-xl leading-8">{name}</p>
              <Tag color="#59516C" className="mb-0.5 text-xs leading-5 border-0">
                {i18n.t('msp:last active time')}: {lastHeartbeat}
              </Tag>
            </div>
          </>
        );
      },
    },
    {
      dataIndex: 'id',
      colProps: { span: 16, className: 'flex items-center' },
      children: {
        columns: Object.keys(CHART_MAP).map((key) => {
          const chartItem = CHART_MAP[key];
          const item: CardColumnsProps<IListItem> = {
            colProps: {
              span: 8,
              className: 'flex items-center',
            },
            dataIndex: chartItem[key],
            render: (_: number, { views, ...rest }) => {
              const { type, view } = views.find((t) => t.type === key) || {};
              const timeStamp: number[] = [];
              const value: number[] = [];
              view?.forEach((v) => {
                timeStamp.push(v.timestamp);
                value.push(v.value);
              });
              const currentOption = {
                ...option,
                xAxis: { data: timeStamp, show: false },
                tooltip: {
                  trigger: 'axis',
                  formatter: (param: Obj[]) => {
                    const { data: count, axisValue: time } = param[0] ?? [];
                    return `<div style="color:rgba(255,255,255,0.60);margin-bottom:8px;">${moment(+time).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}</div><div class="flex justify-between"><span>${
                      chartItem.name
                    }</span><span style='margin-left:10px;'>${chartItem.convert(count)}</span></div>`;
                  },
                },
                series: [
                  {
                    ...defaultSeriesConfig(
                      value.find((val) => val !== 0) && type === 'ErrorRate'
                        ? newColorMap.warning4
                        : newColorMap.primary4,
                    ),
                    data: value,
                    type: 'line',
                    smooth: false,
                  },
                ],
              };
              return (
                <>
                  <div className="py-2">
                    <p className="mb-0 text-xl whitespace-nowrap leading-8 font-number">
                      {chartItem.convert(rest[chartItem.key])}
                    </p>
                    <p className="mb-0 flex text-xs leading-5 text-desc">
                      {chartItem.name}
                      <Tooltip title={chartItem.tips}>
                        <ErdaIcon fill="gray" className="ml-1" type="help" />
                      </Tooltip>
                    </p>
                  </div>
                  <div className="py-2 flex-1 chart-wrapper ">
                    <EChart style={{ width: '95%', height: '56px', minHeight: 0 }} option={currentOption} />
                  </div>
                </>
              );
            },
          };
          return item;
        }),
      },
    },
  ];

  const list = React.useMemo(() => {
    return (data?.list ?? []).map((item) => {
      return {
        ...item,
        views: overviewList?.list.find((t) => t.serviceId === item.id)?.views ?? [],
      };
    });
  }, [data?.list, overviewList?.list]);

  return (
    <div>
      <div className="top-button-group">
        <Button type="default">
          <ErdaIcon type="refresh" /> 刷新数据
        </Button>
      </div>
      <DiceConfigPage
        showLoading
        scenarioType="service-overview"
        scenarioKey="service-overview"
        fullHeight={false}
        customProps={{
          dataRank: {
            op: {
              clickRow: (item: CP_DATA_RANK.IItem) => {
                listDetail(item.id, item.name);
              },
            },
            props: {
              theme: [
                {
                  color: functionalColor.actions,
                  titleIcon: 'mail',
                  backgroundIcon: 'baocun',
                },
                {
                  color: functionalColor.success,
                  titleIcon: 'mysql',
                  backgroundIcon: 'shezhi',
                },
                {
                  color: functionalColor.warning,
                  titleIcon: 'RocketMQ',
                  backgroundIcon: 'map-draw',
                },
                {
                  color: functionalColor.error,
                  titleIcon: 'morenzhongjianjian',
                  backgroundIcon: 'data-server',
                },
              ],
            },
          },
        }}
      />
      <RadioTabs defaultValue={tabs[0].value} options={tabs} onChange={setServiceType} className="mb-2" />
      <CardList<IListItem>
        loading={dataLoading}
        rowKey="id"
        columns={columns}
        dataSource={list}
        rowClick={({ id, name }) => {
          listDetail(id, name);
        }}
        slot={
          <Input
            prefix={<ErdaIcon type="search1" />}
            bordered={false}
            allowClear
            placeholder={i18n.t('msp:search by service name')}
            className="bg-hover-gray-bg w-72"
            onChange={(e) => {
              handleChange(e.target.value);
            }}
          />
        }
      />
      <div className="flex flex-1 flex-col bg-white shadow pb-2">
        <Pagination
          {...pagination}
          onChange={onPageChange}
          className="flex justify-end mr-4 mb-2"
          total={data?.total ?? 0}
        />
      </div>
    </div>
  );
};

export default MicroServiceOverview;
