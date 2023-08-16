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

import React, { useEffect, useState, useMemo } from 'react';
import { Drawer, Card, Col, Row, Tooltip } from 'antd';
import i18n from 'i18n';
import moment from 'moment';
import { ColumnProps } from 'antd/lib/table';
import { goTo } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import { ConfigurableFilter } from 'common';
import ErdaTable from 'common/components/table';
import { getReports, Report } from 'dop/services';
import RateSelect from './rate-select';
import ChartColumn from './chart-column';

interface listItem extends Report {
  chart: Report[];
}

const cardColorList = [undefined, '#16c2c3', '#697fff', '#f3b519'];

const ProjectReport = () => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [data, setData] = useState<Report[]>([]);
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<Report>({} as Report);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState<Obj>({
    time: [moment().subtract(7, 'day').startOf('day').valueOf(), moment().endOf('day').valueOf()],
  });

  useEffect(() => {
    const { projectName, empProjectCode, time, ...operations } = filterData;
    loadData({
      operations: Object.keys(operations)
        .filter((key) => operations[key])
        .map((key) => operations[key]),
      projectName,
      start: moment(time[0]).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(time[1]).format('YYYY-MM-DD HH:mm:ss'),
      labelQuerys: [
        ...(projectName ? [{ key: 'project_name', val: projectName, operation: 'like' }] : []),
        ...(empProjectCode ? [{ key: 'emp_project_code', val: empProjectCode, operation: '=' }] : []),
      ],
    });
  }, [filterData]);

  const loadData = async (params: Obj) => {
    setLoading(true);
    const payload = {
      orgId,
      ...params,
    };
    const res = await getReports(payload);

    if (res.success) {
      const list = [] as listItem[];
      res.data?.reverse()?.forEach((item) => {
        if (!list.find((report) => report.projectID === item.projectID)) {
          list.push({ ...item, chart: [item] });
        } else {
          list.find((report) => report.projectID === item.projectID)?.chart.push(item);
        }
      });
      setData(list.reverse()?.map((item) => ({ ...item, chart: item.chart.reverse() })));
      setLoading(false);
    }
  };

  const columns: Array<ColumnProps<Report>> = [
    {
      title: i18n.t('default:Project name'),
      dataIndex: 'projectName',
    },
    {
      title: `EMP ${i18n.t('default:Project code')}`,
      dataIndex: 'empProjectCode',
    },
    {
      title: i18n.t('default:Project trace chart'),
      dataIndex: 'chart',
      render: (chart) => <ChartColumn data={chart} />,
    },
    {
      title: i18n.t('dop:work hours'),
      dataIndex: 'budgetMandayTotal',
      sorter: (a: Report, b: Report) => a.budgetMandayTotal - b.budgetMandayTotal,
      render: (text) => (text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'),
    },
    {
      title: i18n.t('dop:estimated work hours'),
      dataIndex: 'taskEstimatedManday',
      sorter: (a: Report, b: Report) => a.taskEstimatedManday - b.taskEstimatedManday,
      render: (text) => (text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'),
    },
    {
      title: i18n.t('dop:serious bug rate'),
      dataIndex: 'bugSeriousRate',
      sorter: (a: Report, b: Report) => a.bugSeriousRate - b.bugSeriousRate,
      render: (text) =>
        text || text === 0 ? <Tooltip title={`${text * 100}%`}>{`${(text * 100).toFixed(2)}%`}</Tooltip> : '',
    },
    {
      title: i18n.t('dop:reopen bug rate'),
      dataIndex: 'bugReopenRate',
      sorter: (a: Report, b: Report) => a.bugReopenRate - b.bugReopenRate,
      render: (text) =>
        text || text === 0 ? <Tooltip title={`${text * 100}%`}>{`${(text * 100).toFixed(2)}%`}</Tooltip> : '',
    },
  ];

  const fields = useMemo(
    () => [
      [
        {
          label: i18n.t('default:Project name'),
          value: detailData.projectName || '-',
        },
        {
          label: `EMP ${i18n.t('default:Project code')}`,
          value: detailData.empProjectCode || '-',
        },
        {
          label: i18n.t('dop:work hours'),
          value: detailData.budgetMandayTotal,
          render: (text: number) => (text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:estimated work hours'),
          value: detailData.taskEstimatedManday,
          render: (text: number) => (text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:actual manday total'),
          value: detailData.actualMandayTotal,
          render: (text: number) => (text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:unfinished assignee total'),
          value: detailData.unfinishedAssigneeTotal,
          render: (text: number) => (text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'),
        },
      ],
      [
        {
          label: i18n.t('dop:requirement total'),
          value: detailData.requirementTotal,
          url: goTo.pages.requirementIssues,
          params: { projectId: detailData.projectID },
          render: (text: number) => (text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:requirement done rate'),
          value: detailData.requirementDoneRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:requirement associated rate'),
          value: detailData.requirementAssociatedRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:requirement unassigned rate'),
          value: detailData.requirementUnassignedRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
      ],
      [
        {
          label: i18n.t('dop:task total'),
          value: detailData.taskTotal,
          url: goTo.pages.taskIssues,
          params: { projectId: detailData.projectID },
          render: (text: number) => (text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:task done rate'),
          value: detailData.taskDoneRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:task associated rate'),
          value: detailData.taskAssociatedRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
      ],
      [
        {
          label: i18n.t('dop:bug total'),
          value: detailData.bugTotal,
          url: goTo.pages.bugIssues,
          params: { projectId: detailData.projectID },
          render: (text: number) => (text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'),
        },
        {
          label: i18n.t('dop:bug undone rate'),
          value: detailData.bugDoneRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:serious bug rate'),
          value: detailData.bugSeriousRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:low level bug rate'),
          value: detailData.bugLowLevelRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:demand design bug rate'),
          value: detailData.bugDemandDesignRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:online bug rate'),
          value: detailData.bugOnlineRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
        {
          label: i18n.t('dop:reopen bug rate'),
          value: detailData.bugReopenRate,
          render: (text: number) =>
            text ? <Tooltip title={`${text * 100}%`}>{(text * 100).toFixed(2)}%</Tooltip> : '0',
        },
      ],
    ],
    [detailData],
  );

  const filterConfig = [
    {
      label: i18n.t('default:Project code'),
      type: 'input',
      key: 'empProjectCode',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('default:Project code') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:bug undone rate'),
      key: 'bugUndoneRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: i18n.t('dop:serious bug rate'),
      key: 'bugSeriousRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: i18n.t('dop:low level bug rate'),
      key: 'bugLowLevelRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: i18n.t('dop:demand design bug rate'),
      key: 'bugDemandDesignRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: i18n.t('dop:online bug rate'),
      key: 'bugOnlineRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: i18n.t('dop:reopen bug rate'),
      key: 'bugReopenRate',
      type: 'custom',
      getComp: () => {
        return <RateSelect />;
      },
    },
    {
      label: '',
      type: 'input',
      key: 'projectName',
      outside: true,
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('default:Project name') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: '',
      type: 'rangePicker',
      key: 'time',
      outside: true,
      customProps: {
        autoComplete: 'off',
        allowClear: false,
      },
    },
  ];

  const handleSearch = (values: Obj) => {
    setFilterData(values);
  };

  return (
    <div>
      <ErdaTable
        loading={loading}
        rowKey="assetID"
        columns={columns}
        dataSource={data}
        slot={<ConfigurableFilter hideSave fieldsList={filterConfig} onFilter={handleSearch} value={filterData} />}
        onRow={(record) => {
          return {
            onClick: () => {
              setVisible(true);
              setDetailData(record);
            },
          };
        }}
      />
      <Drawer
        title={i18n.t('dop:project report detail')}
        visible={visible}
        width="90%"
        onClose={() => setVisible(false)}
      >
        {fields.map((group, index) => (
          <Row gutter={8} className="mb-4" key={index}>
            {group.map((item) => (
              <Col span={3} key={item.label}>
                <Card
                  title={item.label}
                  hoverable={!!item.url}
                  onClick={() => item.url && goTo(item.url, { ...item.params, jumpOut: true })}
                  className="text-center"
                  headStyle={{ backgroundColor: cardColorList[index] }}
                >
                  {item.render && typeof item.render === 'function' ? item.render(item.value) : item.value}
                </Card>
              </Col>
            ))}
          </Row>
        ))}
      </Drawer>
    </div>
  );
};

export default ProjectReport;
