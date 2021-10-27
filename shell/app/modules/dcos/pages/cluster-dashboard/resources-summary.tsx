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
import { ColumnsType } from 'antd/es/table';

export const ResourceSummary = React.memo(({ clusterNameStr }: { clusterNameStr: string }) => {
  const localCacheUnit = window.localStorage.getItem('cluster-summary-unit');
  const localCache = localCacheUnit ? localCacheUnit.split('-').map((a) => +a) : [8, 32];
  const cpuAndMem = React.useRef({
    cpuPerNode: localCache[0] || 8,
    memPerNode: localCache[1] || 32,
  });

  const [data, loading] = getResourceGauge.useState();
  React.useEffect(() => {
    if (clusterNameStr) {
      getResourceGauge.fetch({ clusterName: clusterNameStr.split(','), ...cpuAndMem.current });
    }
  }, [clusterNameStr]);
  if (!data) return null;

  const getOption = (item: ORG_DASHBOARD.GaugeChartBody) => {
    const colors = [colorMap.blue, colorMap.green];
    const [assigned, used] = item.name.split('\n');
    const option = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}',
      },
      series: [
        {
          type: 'gauge',
          radius: '90%',
          startAngle: 200,
          endAngle: -20,
          axisLine: {
            lineStyle: {
              width: 14,
              color: [...item.split, 1].map((a, i) => [a, colors[i]]),
            },
          },
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 6,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            color: colorMap.red,
          },
          splitLine: {
            // 分隔线
            length: 12, // 属性length控制线长
          },
          detail: {
            fontSize: 14,
            color: colorMap.red,
            formatter: used ? [`{assigned|${assigned}}`, `{used|${used}}`].join('\n') : `{assigned|${assigned}}`,
            rich: {
              assigned: {
                color: colorMap.blue,
              },
              used: {
                color: colorMap.red,
                marginTop: '20px',
              },
            },
            offsetCenter: [0, '60%'],
          },
          label: {},
          title: {
            color: colorMap.red,
          },
          data: item.value.map((v) => 100 * v),
        },
      ],
    };
    return option;
  };

  return (
    <>
      <Title
        level={2}
        title={i18n.t('cmp:resource distribute')}
        tip={
          <div className="text-xs">
            <div>
              {i18n.t('cmp:Allocated resources&#58; The resources reserved by project resource Quota are configured')}
            </div>
            <div>
              {i18n.t(
                'cmp:Occupied resource&#58; The portion of allocated resource actually occupied by Kubernetes Request resource Request',
              )}
            </div>
          </div>
        }
        tipStyle={{ width: '500px' }}
        operations={[
          <>
            {i18n.t('cmp:Node conversion formula')}：
            <InputNumber
              min={1}
              max={9999}
              defaultValue={cpuAndMem.current.cpuPerNode}
              onChange={(value) => {
                cpuAndMem.current.cpuPerNode = value;
              }}
              size="small"
              style={{ width: '80px' }}
            />
            <span>{i18n.t('cmp:Core')}</span>
            <InputNumber
              min={1}
              max={9999999}
              defaultValue={cpuAndMem.current.memPerNode}
              onChange={(value) => {
                cpuAndMem.current.memPerNode = value;
              }}
              size="small"
              className="ml-1"
              style={{ width: '80px' }}
            />
            <span>G = {i18n.t('cmp:one node')}</span>
            <Button
              type="primary"
              className="ml-1"
              size="small"
              onClick={() => {
                window.localStorage.setItem(
                  'cluster-summary-unit',
                  `${cpuAndMem.current.cpuPerNode}-${cpuAndMem.current.memPerNode}`,
                );
                clusterNameStr &&
                  getResourceGauge.fetch({ clusterName: clusterNameStr.split(','), ...cpuAndMem.current });
              }}
            >
              {i18n.t('cmp:save')}
            </Button>
          </>,
        ]}
      />
      <Row justify="space-between" gutter={12}>
        {map(data, (item, key) => (
          <Col key={key} span={8}>
            <CardContainer.ChartContainer title={item?.title} holderWhen={!item}>
              <Echarts style={{ height: '320px' }} showLoading={loading} option={getOption(item)} />
            </CardContainer.ChartContainer>
          </Col>
        ))}
      </Row>
      <ResourceTable
        clusterNameStr={clusterNameStr}
        cpuPerNode={cpuAndMem.current.cpuPerNode}
        memPerNode={cpuAndMem.current.memPerNode}
      />
    </>
  );
});

const arrSortMinToMax = (_a, _b) => {
  const a = String(_a);
  const b = String(_b);
  let cReg =
    /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
  if (!cReg.test(a) || !cReg.test(b)) {
    return a.localeCompare(b);
  } else {
    return a.localeCompare(b, 'zh');
  }
};

export const ResourceTable = React.memo(
  ({ clusterNameStr, cpuPerNode, memPerNode }: { clusterNameStr: string; cpuPerNode: number; memPerNode: number }) => {
    const [state, updater, update] = useUpdate({
      ownerIds: [],
      projectIds: [],
    });
    const [data, loading] = getResourceTable.useState();
    React.useEffect(() => {
      if (clusterNameStr) {
        getResourceTable.fetch({ clusterName: clusterNameStr.split(','), cpuPerNode, memPerNode });
      }
    }, [clusterNameStr, cpuPerNode, memPerNode]);

    const mergedList = (data?.list || []).map((item) => ({
      ...item,
      projectName: item.projectDisplayName || item.projectName,
      ownerUserName: item.ownerUserNickname || item.ownerUserName,
    }));
    const columns: ColumnsType<ORG_DASHBOARD.ResourceTableRecord> = [
      {
        title: i18n.t('cmp:Project'),
        dataIndex: 'projectName',
        key: 'projectName',
        sorter: {
          compare: (a, b) => arrSortMinToMax(a.projectName, b.projectName),
        },
        width: 120,
      },
      {
        title: i18n.t('cmp:Owner'),
        dataIndex: 'ownerUserName',
        key: 'ownerUserName',
        sorter: {
          compare: (a, b) => arrSortMinToMax(a.ownerUserName, b.ownerUserName),
        },
        width: 120,
      },
      {
        title: `CPU (${i18n.t('cmp:Core')})`,
        dataIndex: 'cpuQuota',
        key: 'cpuQuota',
        width: 80,
        sorter: {
          compare: (a, b) => a.cpuQuota - b.cpuQuota,
        },
        render: (text: string, c) => text,
      },
      {
        title: `${i18n.t('cmp:Memory')} (G)`,
        dataIndex: 'memQuota',
        key: 'memQuota',
        width: 80,
        sorter: {
          compare: (a, b) => a.memQuota - b.memQuota,
        },
        render: (text: string) => text,
      },
      {
        title: i18n.t('cmp:Number of converted nodes'),
        dataIndex: 'nodes',
        key: 'nodes',
        width: 80,
        sorter: {
          compare: (a, b) => a.nodes - b.nodes,
        },
        render: (text: string) => text,
      },
      {
        title: `CPU ${i18n.t('cmp:Water Level')}`,
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
          );
        },
      },
      {
        title: i18n.t('cmp:Memory Water Level'),
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
          );
        },
      },
      {
        title: i18n.t('cmp:Description'),
        dataIndex: 'projectDesc',
        key: 'projectDesc',
        sorter: {
          compare: (a, b) => arrSortMinToMax(a.projectDesc, b.projectDesc),
        },
        width: 180,
      },
    ];

    const conditionsFilter = [
      {
        type: 'select',
        key: 'projectIds',
        label: i18n.t('cmp:Project'),
        haveFilter: true,
        fixed: true,
        emptyText: i18n.t('dop:all'),
        showIndex: 1,
        options: (data?.list || []).map((prj) => ({ label: prj.projectDisplayName, value: prj.projectID })),
      },
      {
        type: 'select',
        key: 'ownerNames',
        label: i18n.t('cmp:Owner'),
        haveFilter: true,
        fixed: true,
        emptyText: i18n.t('dop:all'),
        showIndex: 1,
        options: (data?.list || []).map((prj) => ({ label: prj.ownerUserName, value: prj.ownerUserID })),
      },
    ];

    let filterData = mergedList;
    if (state.ownerIds.length) {
      filterData = filterData.filter((a) => state.ownerIds.includes(a.ownerUserID));
    }
    if (state.projectIds.length) {
      filterData = filterData.filter((a) => state.projectIds.includes(a.projectID));
    }

    return (
      <>
        <Title
          level={2}
          mt={16}
          title={
            <span>
              {i18n.t('cmp:Allocation of project resources')}
              <span className="ml-1 text-desc text-xs">
                {i18n.t('cmp:The total number of selected resources')}: CPU: {data?.summary?.cpu},{' '}
                {i18n.t('cmp:Memory')}: {data?.summary?.memory}, {i18n.t('cmp:Conversion nodes')}: {data?.summary?.node}
              </span>
            </span>
          }
          operations={[
            <ContractiveFilter
              delay={1000}
              conditions={conditionsFilter}
              onChange={(values) => {
                update(values);
              }}
            />,
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
    );
  },
);
