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

import { FilterGroupV, Panel, useUpdate, Holder, PureBoardGrid } from 'common';
import i18n from 'i18n';
import { debounce, isEmpty, get, forEach, mapKeys, map } from 'lodash';
import { DatePicker, Tabs, Select, Pagination } from 'app/nusi';
import * as React from 'react';
import moment from 'moment';
import logAnalyticsStore from '../../stores/log-analytics';
import './index.scss';
import addonStore from 'common/stores/addon';
import routeInfoStore from 'core/stores/route';
import { formatTime, getTimeRanges } from 'app/common/utils';
import { PAGINATION } from 'app/constants';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const LogCountChart = ({ chartQuery, loadData }: any) => {
  const layout = [
    {
      w: 24,
      h: 7,
      x: 0,
      y: 0,
      i: 'view-log-count',
      moved: false,
      static: false,
      view: {
        chartType: 'chart:line',
        hideHeader: true,
        chartQuery,
        loadData,
        // TODO: optionFn不管用，需要看一下怎么回事
        dataConvertor(responseData: any) {
          if (isEmpty(responseData)) return {};
          const { time = [], results = [] } = responseData || {};
          const data = get(results, '[0].data') || [];
          const yAxis = [];
          const metricData = [] as object[];
          // data: [{ k: {...} }, { k: {...} }]
          forEach(data, (item) => {
            mapKeys(item, (v) => {
              const { chartType, ...rest } = v;
              yAxis[v.axisIndex] = 1;
              metricData.push({
                ...rest,
                name: v.tag || v.name,
                type: chartType,
              });
            });
          });
          const yAxisLength = yAxis.length;
          const _time = time.map((t) => moment(t).format('MM-DD HH:mm'));
          return { xData: _time, metricData, yAxisLength, xAxisIsTime: true };
        },
      },
    },
  ];

  return <PureBoardGrid layout={layout} />;
};

const LogAnalytics = () => {
  const routeQuery = routeInfoStore.useStore((s) => s.query);
  const addonDetail = addonStore.useStore((s) => s.addonDetail);
  const [appList, searchResult] = logAnalyticsStore.useStore((s) => [s.appList, s.searchResult]);
  const queryData = React.useRef({
    'tags.dice_application_name': routeQuery.appName,
    start: Date.now() - 7 * 3600 * 1000,
    end: Date.now(),
  });

  const [state, updater] = useUpdate({
    pageNo: 1,
    pageSize: PAGINATION.pageSize,
  });

  const search = React.useCallback(() => {
    if (addonDetail.cluster) {
      logAnalyticsStore.searchLogAnalytics({
        ...queryData.current,
        version: addonDetail.version,
        addonID: addonDetail.config.TERMINUS_LOG_KEY || addonDetail.realInstanceId,
        clusterName: addonDetail.cluster,
        size: 1000,
      });
    }
  }, [addonDetail.cluster, addonDetail.config.TERMINUS_LOG_KEY, addonDetail.realInstanceId, addonDetail.version]);

  const getChartData = React.useCallback(() => {
    return logAnalyticsStore.getStatistic({
      ...queryData.current,
      version: addonDetail.version,
      addonID: addonDetail.config.TERMINUS_LOG_KEY || addonDetail.realInstanceId,
      clusterName: addonDetail.cluster,
      size: 1000,
    });
  }, [addonDetail.cluster, addonDetail.config.TERMINUS_LOG_KEY, addonDetail.realInstanceId, addonDetail.version]);

  React.useEffect(() => {
    search();
    logAnalyticsStore.getAppList({ pageNo: 1, pageSize: 30 });
    return () => {
      logAnalyticsStore.clearResult();
    };
  }, [addonDetail.cluster, addonDetail.config.TERMINUS_LOG_KEY, search]);

  const onAppSearch = debounce((val: string) => {
    logAnalyticsStore.getAppList({
      pageNo: 1,
      pageSize: 30,
      q: val,
    });
  }, 300);

  const onSearch = (data: any) => {
    const { time, dice_application_name, tags, content } = data;
    const query: any = {
      tags: {},
    };
    if (time && time.length) {
      query.start = time[0].valueOf();
      query.end = time[1].valueOf();
    }
    if (dice_application_name) {
      query['tags.dice_application_name'] = dice_application_name;
    }
    // if (dice_service_name) {
    //   query['tags.dice_service_name'] = dice_service_name;
    // }
    if (tags) {
      tags.forEach((tag: string) => {
        const [k, v] = tag.split('=');
        if (k && v) {
          query[`tags.${k}`] = v;
        }
      });
    }
    if (content) {
      query.query = content;
    }
    queryData.current = query;
    search();
  };

  const onPageChange = (no: number, size?: number) => {
    updater.pageNo(no);
    size && updater.pageSize(size);
  };

  const end = state.pageNo * state.pageSize;
  const start = end - state.pageSize;
  const curList = (searchResult.data || []).slice(start, end);

  return (
    <div className="log-analytics">
      <FilterGroupV
        list={[
          {
            label: i18n.t('msp:time'),
            name: 'time',
            type: 'custom',
            percent: 12,
            Comp: (
              <RangePicker
                style={{ width: '100%' }}
                showTime={{ format: 'HH:mm' }}
                allowClear={false}
                format="MM-DD HH:mm"
                ranges={getTimeRanges()} // 因为选择预设range时不触发onOk，所以onChange时直接触发
              />
            ),
            defaultValue: [moment(queryData.current.start), moment(queryData.current.end)],
          },
          {
            label: i18n.t('msp:application name'),
            name: 'dice_application_name',
            type: 'select',
            percent: 12,
            showSearch: true,
            onSearch: onAppSearch,
            defaultValue: routeQuery.appName,
            placeholder: i18n.t('search by name'),
            options: appList.map((app) => ({ value: app.name, name: app.name })),
          },
          // {
          //   label: i18n.t('msp:service name'),
          //   name: 'dice_service_name',
          //   percent: 8,
          //   allowClear: true,
          // },
          {
            label: i18n.t('msp:tag'),
            name: 'tags',
            type: 'custom',
            placeholder: i18n.t('msp|format: Key=Value, press Enter to add', { nsSeparator: '|' }),
            percent: 24,
            allowClear: true,
            Comp: <Select mode="tags" allowClear />,
          },
          {
            label: i18n.t('msp:content'),
            name: 'content',
            percent: 24,
            placeholder: i18n.t('msp:search by content'),
            allowClear: true,
          },
        ]}
        onSearch={onSearch}
      />
      <Panel title={i18n.t('msp:number of logs')} className="block">
        {addonDetail.cluster && <LogCountChart chartQuery={{ ...queryData.current }} loadData={getChartData} />}
      </Panel>
      <div className="section-title mt24 mb0">{i18n.t('msp:detail')}</div>
      <Holder when={isEmpty(curList)}>
        {map(curList, (item) => {
          return (
            <div key={item.offset} className="log-analytic-item">
              <div className="title">
                <span>
                  {i18n.t('application')}：{item.tags.dice_application_name}
                </span>
                <span>
                  {i18n.t('service')}：{item.tags.dice_service_name}
                </span>
                <span>
                  {i18n.t('time')}：{formatTime(item.timestamp, 'YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
              <div className="content">
                <Tabs defaultActiveKey="1" size="small" className="log-content-tabs">
                  <TabPane tab="Text" key="1">
                    <pre className="code-block">{item.content}</pre>
                  </TabPane>
                  <TabPane tab="JSON" key="2">
                    <pre className="code-block">{JSON.stringify(item, null, 2)}</pre>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          );
        })}
        <Pagination
          current={state.pageNo}
          pageSize={state.pageSize}
          total={searchResult.total}
          showSizeChanger
          onChange={onPageChange}
        />
      </Holder>
    </div>
  );
};

export default LogAnalytics;
