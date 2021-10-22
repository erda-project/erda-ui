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

import { Echarts } from 'charts';
import { ChartContainer } from 'charts/utils';
import { CardContainer, ContractiveFilter, Holder, Title } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Col, DatePicker, Radio, Row, Table } from 'antd';
import { getResourceClass, getClusterTrend, getProjectTrend } from 'dcos/services/dashboard';
import { map, merge, update } from 'lodash';
import moment from 'moment';
import React from 'react';
import { produce } from 'immer';
import { useMount } from 'configForm/form/utils';
import i18n from 'i18n';
import { getProjectListNew } from 'project/services/project';


export const ResourcesUsagePie = React.memo(({ clusterNames }: { clusterNames: string[] }) => {
  const [state, updater] = useUpdate({
    resourceType: 'cpu' as ORG_DASHBOARD.CpuMem,
    interval: 'day',
    projectNames: [],
    clusterDateRange: [moment().startOf('day'), moment().endOf('day')],
  });
  const [data, loading] = getResourceClass.useState();
  React.useEffect(() => {
    getResourceClass.fetch({
      resourceType: state.resourceType,
      interval: state.interval,
      clusterNames,
    });
  }, [clusterNames, state.clusterDateRange, state.interval, state.projectNames, state.resourceType]);

  if (!data) return null;

  const { cluster, principal, project } = data;

  const getPieOption = (ops: ORG_DASHBOARD.EchartOption) => {
    const option = {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      series: map(ops.series, (serie) => {
        return {
          name: serie.name,
          type: 'pie',
          radius: '65%',
          center: ['50%', '46%'],
          label: {
            normal: {
              show: true,
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '20',
                fontWeight: 'bold',
              },
            },
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data: serie.data,
        };
      }),
    };
    return option;
  };

  const pieData = {
    cluster: cluster || [],
    principal: principal || [],
    project: project || [],
  }

  return (
    <>
      <Title level={1} title='资源类型' operations={[
        <>
          <Radio.Group buttonStyle="solid" onChange={e => updater.resourceType(e.target.value)} defaultValue={state.resourceType}>
            <Radio.Button value='cpu'>
              CPU
            </Radio.Button>
            <Radio.Button value='memory'>
              内存
            </Radio.Button>
          </Radio.Group>
        </>
      ]}
      />
      <Row justify="space-between" gutter={12}>
        {map(pieData, (item, key) => (
          <Col key={key} span={8}>
            <CardContainer.ChartContainer title={item.series[0]?.name} holderWhen={!item}>
              <Holder when={!item}>
                <Echarts
                  showLoading={loading}
                  option={getPieOption(item)}
                />
              </Holder>
            </CardContainer.ChartContainer>
          </Col>
        ))}
      </Row>
      <ResourceTrend clusterNames={clusterNames} resourceType={state.resourceType} />
    </>
  );
});

export const ResourceTrend = React.memo(({ clusterNames, resourceType }: { clusterNames: string[], resourceType: ORG_DASHBOARD.CpuMem }) => {
  const [state, updater] = useUpdate({
    interval: 'day',
    project: '',
    clusterDateRange: [moment().startOf('day'), moment().endOf('day')],
  });
  const [clusterTrend, loadingClusterTrend] = getClusterTrend.useState();
  const [projectTrend, loadingProjectTrend] = getProjectTrend.useState();
  React.useEffect(() => {
    getClusterTrend.fetch({
      clusterNames,
      resourceType,
      interval: state.interval,
      start: state.clusterDateRange[0].valueOf(),
      end: state.clusterDateRange[1].valueOf(),
    });
    getProjectTrend.fetch({
      clusterNames,
      resourceType,
      project: state.project,
      interval: state.interval,
      start: state.clusterDateRange[0].valueOf(),
      end: state.clusterDateRange[1].valueOf(),
    });
  }, [clusterNames, resourceType, state.clusterDateRange, state.interval, state.project]);

  const projectList = getProjectListNew.useData();
  useMount(() => {
    getProjectListNew.fetch({ pageNo: 1, pageSize: 1000 });
  });


  const getBarOption = (option: ORG_DASHBOARD.EchartOption) => {
    if (!option) return {}
    let newOption = option;
    const defaultOption = {
      xAxis: { splitLine: { show: false } },
      tooltip: { trigger: 'axis' },
      yAxis: { type: 'value' },
      series: option.series.map((item: Obj) => ({
        type: 'bar',
        barWidth: '60%',
        ...item,
        label: item.label ? { show: true, ...item.label } : undefined,
      })),
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
    }
    newOption = merge(
      defaultOption,
      option
    )
    if (option.legend) {
      newOption = merge(
        {
          legend: { bottom: 0 },
          grid: { bottom: 30 },
        },
        newOption,
      );
    }
    console.log('option:', newOption);
    return newOption;
  }

  const conditionsFilter = [
    {
      type: 'select',
      key: 'projectNames',
      label: '项目',
      placeholder: i18n.t('filter by {name}', { name: '项目' }),
      haveFilter: true,
      fixed: true,
      emptyText: i18n.t('application:all'),
      showIndex: 1,
      options: (projectList?.list || []).map(prj => ({ label: prj.displayName || prj.name, value: prj.id })),
      customProps: {
        mode: 'single',
      },
    },
  ];

  return (
    <>
      <Title level={2} mt={16} title='集群资源变化趋势' operations={[
        <DatePicker.RangePicker
          allowClear={false}
          allowEmpty={[false, false]}
          value={state.clusterDateRange}
          ranges={{
            Today: [moment().startOf('day'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
          }}
          onChange={(dates) => updater.clusterDateRange(dates)}
        />,
        <Radio.Group buttonStyle="solid" onChange={e => updater.interval(e.target.value)} defaultValue={state.interval}>
          <Radio.Button value='day'>
            按天
          </Radio.Button>
          <Radio.Button value='week'>
            按周
          </Radio.Button>
          <Radio.Button value='month'>
            按月
          </Radio.Button>
        </Radio.Group>
      ]}
      />
      <Row justify="space-between" gutter={12}>
        <Col span={12}>
          {/* <Title level={2} title='集群' /> */}
          <CardContainer.ChartContainer title={clusterTrend?.series[0]?.name}>
            <Holder when={!clusterTrend}>
              <Echarts
                showLoading={loadingClusterTrend}
                option={getBarOption(clusterTrend)}
              />
            </Holder>
          </CardContainer.ChartContainer>
        </Col>
        <Col span={12}>
          {/* <Title level={2} title='项目' operations={[
            <ContractiveFilter delay={1000} conditions={conditionsFilter} onChange={(values) => update(values)} />
          ]}
          /> */}
          <CardContainer.ChartContainer title={projectTrend?.series[0]?.name} operation={<ContractiveFilter delay={1000} conditions={conditionsFilter} onChange={(values) => update(values)} />}>
            <Holder when={!projectTrend}>
              <Echarts
                showLoading={loadingProjectTrend}
                option={getBarOption(projectTrend)}
              />
            </Holder>
          </CardContainer.ChartContainer>
        </Col>
      </Row>
    </>
  )
})

