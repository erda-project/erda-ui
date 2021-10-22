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
import { colorMap } from 'charts/theme';
import { ContractiveFilter, CardContainer, Holder, Title } from 'common';
import { useUpdate } from 'common/use-hooks';
import { Button, Col, InputNumber, Progress, Radio, Row, Select, Spin, Table, Tooltip } from 'antd';
import { getResourceGauge, getResourceTable } from 'dcos/services/dashboard';
import { map } from 'lodash';
import React from 'react';
import { statusColorMap } from 'app/config-page/utils';
import i18n from 'i18n';
// import { ColumnsType } from 'antd/es/table';


export const ResourceSummary = React.memo(({ clusterNames }: { clusterNames: string[] }) => {
  const localCacheUnit = window.localStorage.getItem('cluster-summary-unit');
  const localCache = localCacheUnit ? localCacheUnit.split('-').map(a => +a) : [8, 32];
  const cpuAndMem = React.useRef({
    cpuUnit: localCache[0] || 8,
    memoryUnit: localCache[1] || 32,
  })

  const [data, loading] = getResourceGauge.useState();
  React.useEffect(() => {
    getResourceGauge.fetch({ clusterNames, ...cpuAndMem.current });
  }, [clusterNames]);
  if (!data) return null;

  const getOption = (item: ORG_DASHBOARD.GaugeChartBody) => {
    const colors = [colorMap.blue, colorMap.green]
    const [assigned, used] = item.name.split('\n');
    const option = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}',
      },
      series: [
        {
          // name: '',
          type: 'gauge',
          radius: '90%',
          startAngle: 200,
          endAngle: -20,
          axisLine: {
            lineStyle: {
              width: 14,
              color: [...item.split, 1].map((a, i) =>
                [a, colors[i]]
              )
            }
          },
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 6,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            color: colorMap.red,
          },
          splitLine: {           // 分隔线
            length: 12,         // 属性length控制线长
          },
          detail: {
            fontSize: 14,
            color: colorMap.red,
            formatter: [
              `{assigned|${assigned}}`,
              `{used|${used}}`,
            ].join('\n'),
            rich: {
              assigned: {
                color: colorMap.blue,
              },
              used: {
                color: colorMap.red,
                marginTop: '20px',
              },
            },
            offsetCenter: [0, '60%']
          },
          label: {
          },
          title: {
            color: colorMap.red,
          },
          data: item.value.map(v => 100 * v),
        }
      ],
    };
    return option;
  };

  return (
    <>
      <Title level={2} title='组织资源概览' tip={<div className='text-xs'><div>已分配资源：按照项目资源 Quota 配置所预留出的资源</div><div>
        已占用资源：已分配资源中，实际通过 Kubernetes 的 Request 资源申请方式占用的部分</div></div>} tipStyle={{ width: '400px' }} operations={[
          <>
            节点换算公式：
            <InputNumber min={1} max={9999} defaultValue={cpuAndMem.current.cpuUnit} onChange={value => { cpuAndMem.current.cpuUnit = value }} size="small" style={{ width: '80px' }} />
            <span>核</span>
            <InputNumber min={1} max={9999999} defaultValue={cpuAndMem.current.memoryUnit} onChange={value => { cpuAndMem.current.memoryUnit = value }} size="small" className='ml-1' style={{ width: '80px' }} />
            <span>G = 1个节点</span>
            <Button type="primary" className='ml-1' size="small" onClick={() => {
              window.localStorage.setItem('cluster-summary-unit', `${cpuAndMem.current.cpuUnit}-${cpuAndMem.current.memoryUnit}`);
              getResourceGauge.fetch({ clusterNames, ...cpuAndMem.current });
            }}>保存</Button>
          </>
        ]}
      />
      <Row justify="space-between" gutter={12}>
        {map(data, (item, key) => (
          <Col key={key} span={8}>
            <CardContainer.ChartContainer title={item?.title} holderWhen={!item}>
              <Echarts
                showLoading={loading}
                option={getOption(item)}
              />
            </CardContainer.ChartContainer>
          </Col>
        ))}
      </Row>
    </>
  );
});

const arrSortMinToMax = (_a, _b) => {
  const a = String(_a);
  const b = String(_b);
  let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/
  if (!cReg.test(a) || !cReg.test(b)) {
    return a.localeCompare(b)
  } else {
    return a.localeCompare(b, "zh")
  }
}

export const ResourceTable = React.memo(({ clusterNames }: { clusterNames: string[] }) => {
  const [state, updater, update] = useUpdate({
    ownerIds: [],
    projectIds: [],
  });
  const [data, loading] = getResourceTable.useState();
  React.useEffect(() => {
    getResourceTable.fetch({ clusterNames });
  }, [clusterNames]);

  const mergedList = (data?.list || []).map(item => ({
    ...item,
    projectName: item.projectDisplayName || item.projectName,
    ownerUserName: item.ownerUserNickname || item.ownerUserName,
  }))
  const columns: ColumnsType<ORG_DASHBOARD.ResourceTableRecord> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      sorter: {
        compare: (a, b) => arrSortMinToMax(a.projectName, b.projectName),
      },
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'ownerUserName',
      key: 'ownerUserName',
      sorter: {
        compare: (a, b) => arrSortMinToMax(a.ownerUserName, b.ownerUserName),
      },
      width: 120,
    },
    {
      title: 'CPU (核)',
      dataIndex: 'cpuQuota',
      key: 'cpuQuota',
      width: 80,
      sorter: {
        compare: (a, b) => a.cpuQuota - b.cpuQuota,
      },
      render: (text: string, c) => text,
    },
    {
      title: '内存 (G)',
      dataIndex: 'memQuota',
      key: 'memQuota',
      width: 80,
      sorter: {
        compare: (a, b) => a.memQuota - b.memQuota,
      },
      render: (text: string) => text,
    },
    {
      title: '换算节点数',
      dataIndex: 'nodes',
      key: 'nodes',
      width: 80,
      sorter: {
        compare: (a, b) => a.nodes - b.nodes,
      },
      render: (text: string) => text,
    },
    {
      title: 'CPU 占用水位',
      dataIndex: 'cpuWaterLevel',
      key: 'cpuWaterLevel',
      width: 120,
      sorter: {
        compare: (a, b) => a.cpuWaterLevel - b.cpuWaterLevel,
      },
      render: (_val: string) => {
        let value = +(_val ?? 0);
        value = +(`${value}`.indexOf('.') ? value.toFixed(2) : value);
        return !isNaN(+_val) ? (
          <Progress
            percent={value}
            format={(v) => <span className="text-dark-8">{`${v}%`}</span>}
            strokeColor={statusColorMap[status]}
          />
        ) : (
          _val
        )
      },
    },
    {
      title: '内存占用水位',
      dataIndex: 'memWaterLevel',
      key: 'memWaterLevel',
      width: 120,
      sorter: {
        compare: (a, b) => a.memWaterLevel - b.memWaterLevel,
      },
      render: (_val: string) => {
        let value = +(_val ?? 0);
        value = +(`${value}`.indexOf('.') ? value.toFixed(2) : value);
        return !isNaN(+_val) ? (
          <Progress
            percent={value}
            format={(v) => <span className="text-dark-8">{`${v}%`}</span>}
            strokeColor={statusColorMap[status]}
          />
        ) : (
          _val
        )
      },
    },
    {
      title: '描述',
      dataIndex: 'projectDesc',
      key: 'projectDesc',
      sorter: {
        compare: (a, b) => arrSortMinToMax(a.describe, b.describe),
      },
      width: 180,
    },
  ];

  const conditionsFilter = [
    {
      type: 'select',
      key: 'projectIds',
      label: '项目',
      haveFilter: true,
      fixed: true,
      emptyText: i18n.t('application:all'),
      showIndex: 1,
      options: (data?.list || []).map(prj => ({ label: prj.projectDisplayName, value: prj.projectID })),
    },
    {
      type: 'select',
      key: 'ownerNames',
      label: '负责人',
      haveFilter: true,
      fixed: true,
      emptyText: i18n.t('application:all'),
      showIndex: 1,
      options: (data?.list || []).map(prj => ({ label: prj.ownerUserName, value: prj.ownerUserID })),
    },
  ];

  let filterData = mergedList;
  if (state.ownerIds.length) {
    filterData = filterData.filter(a => state.ownerIds.includes(a.ownerUserID))
  }
  if (state.projectIds.length) {
    filterData = filterData.filter(a => state.projectIds.includes(a.projectID))
  }

  return (
    <>
      <Title level={2} mt={16} title={<span>项目资源分配情况<span className='ml-1 text-desc text-xs'>筛选项资源总和: CPU: {data?.summary.cpu}, 内存: {data?.summary.memory}, 换算节点: {data?.summary.node}</span></span>} operations={[
        <ContractiveFilter delay={1000} conditions={conditionsFilter} onChange={(values) => { update(values) }} />
      ]}
      />
      <Table
        rowKey="projectID"
        size="small"
        loading={loading}
        columns={columns}
        pagination={{ showSizeChanger: true }}
        dataSource={filterData}
        scroll={{ x: '100%' }}
      />
    </>
  )
})

