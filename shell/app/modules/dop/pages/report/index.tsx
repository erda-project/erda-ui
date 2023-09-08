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
import { Drawer, Card, Col, Row, Tooltip, Spin, Progress } from 'antd';
import i18n from 'i18n';
import moment from 'moment';
import { ColumnProps } from 'antd/lib/table';
import { encode } from 'js-base64';
import { goTo } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import { ConfigurableFilter, ErdaIcon, ContractiveFilter } from 'common';
import ErdaTable from 'common/components/table';
import { getReports, Report } from 'dop/services';
import { getProjectIterations } from 'project/services/project-iteration';
import { getStatesByIssue } from 'project/services/issue-workflow';
import RateSelect from './rate-select';
import ChartColumn from './chart-column';

interface listItem extends Report {
  chart: Report[];
}

const cardColorList = [undefined, '#16c2c3', '#697fff', '#f3b519'];

const ProjectReport = ({ route }: { route: { path: string } }) => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [data, setData] = useState<Report[]>([]);
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<Report>({} as Report);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState<Obj>({
    time: [moment().subtract(7, 'day').startOf('day').valueOf(), moment().endOf('day').valueOf()],
  });
  const [iterations, setIterations] = useState<ITERATION.Detail[]>([]);
  const [selectIterations, setSelectIterations] = useState<number[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [states, setStates] = useState<ISSUE_WORKFLOW.IIssueStateItem[]>([]);

  useEffect(() => {
    init();
  }, [filterData]);

  const init = () => {
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
        ...(empProjectCode ? [{ key: 'emp_project_code', val: empProjectCode, operation: 'like' }] : []),
      ],
    });
  };

  const loadData = async (params: Obj) => {
    setLoading(true);
    const payload = {
      orgId,
      isAdmin: route?.path?.indexOf?.('orgCenter') !== -1,
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
    } else {
      setData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detailData?.projectID) {
      getIterations(detailData.projectID);
      getState();
    }
  }, [detailData.projectID]);

  const getIterations = async (projectID: number) => {
    setLoading(true);
    const res = await getProjectIterations({ projectID, pageSize: 999, pageNo: 1 });
    if (res.success) {
      setIterations(res.data?.list || []);
    }
    setLoading(false);
  };

  const getDatail = async (iterationIDs: number[]) => {
    setDetailLoading(true);
    const { time } = filterData;
    const { projectID } = detailData;
    const payload = {
      orgId,
      start: moment(time[0]).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(time[1]).format('YYYY-MM-DD HH:mm:ss'),
      projectIDs: [Number(projectID)],
      iterationIDs,
    };
    const res = await getReports(payload);
    if (res.success) {
      res.data && setDetailData(res.data[res.data.length - 1]);
    }
    setDetailLoading(false);
  };

  const getState = async () => {
    const { projectID } = detailData;
    const res = await getStatesByIssue({ projectID });
    if (res.success) {
      setStates(res.data || []);
    }
  };

  const columns: Array<ColumnProps<Report>> = [
    {
      title: i18n.t('default:Project name'),
      dataIndex: 'projectName',
      render: (text, record) => (
        <div>
          <div className="erda-table-td-title">{record.projectDisplayName || '-'}</div>
          <div className="text-sub leading-none text-xs">{text}</div>
        </div>
      ),
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

  const fields = useMemo(() => {
    return [
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
          render: (text: number) => (
            <span className="text-2xl">{text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'}</span>
          ),
        },
        {
          label: i18n.t('dop:estimated work hours'),
          value: detailData.taskEstimatedManday,
          render: (text: number) => (
            <span className="text-2xl">{text ? <Tooltip title={text}>{text.toFixed(2)}</Tooltip> : '0'}</span>
          ),
        },
        {
          label: i18n.t('dop:actual manday total'),
          value: detailData.actualMandayTotal,
          render: (text: number) => (
            <span className="text-2xl">{text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}</span>
          ),
        },
        {
          label: i18n.t('dop:unfinished assignee total'),
          value: detailData.unfinishedAssigneeTotal,
          render: (text: number) => (
            <span className="text-2xl">{text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}</span>
          ),
        },
      ],
      [
        {
          label: i18n.t('dop:requirement total'),
          value: detailData.requirementTotal,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'REQUIREMENT',
              issueFilter__urlQuery: encode(
                getIssuesStates(
                  states,
                  'REQUIREMENT',
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id),
                ),
              ),
            },
          },
          render: (text: number) => (
            <span className="flex items-center justify-center h-[120px] text-2xl">
              {text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}
            </span>
          ),
        },
        {
          label: i18n.t('dop:requirement done rate'),
          value: detailData.requirementDoneRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [30, 80])}
            />
          ),
          tip: i18n.t('dop:requirement done rate tip'),
        },
        {
          label: i18n.t('dop:requirement associated rate'),
          value: detailData.requirementAssociatedRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [20, 80])}
            />
          ),
          tip: i18n.t('dop:requirement associated rate tip'),
        },
        {
          label: i18n.t('dop:requirement unassigned rate'),
          value: detailData.requirementUnassignedRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [20, 80], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:requirement unassigned rate tip'),
        },
      ],
      [
        {
          label: i18n.t('dop:task total'),
          value: detailData.taskTotal,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'TASK',
              issueFilter__urlQuery: encode(
                getIssuesStates(
                  states,
                  'TASK',
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id),
                ),
              ),
            },
          },
          render: (text: number) => (
            <span className="flex items-center justify-center h-[120px] text-2xl">
              {text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}
            </span>
          ),
        },
        {
          label: i18n.t('dop:task done rate'),
          value: detailData.taskDoneRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
            />
          ),
          tip: i18n.t('dop:task done rate tip'),
        },
        {
          label: i18n.t('dop:task associated rate'),
          value: detailData.taskAssociatedRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [30, 80])}
            />
          ),
          tip: i18n.t('dop:task associated rate tip'),
        },
        {
          label: i18n.t('dop:tasks whose estimated duration is longer than 2 days'),
          value: detailData.taskEstimatedDayGtTwoTotal,
          render: (text: number) => (
            <span className="flex items-center justify-center h-[120px] text-2xl">
              {text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}
            </span>
          ),
        },
      ],
      [
        {
          label: i18n.t('dop:bug total'),
          value: detailData.bugTotal,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'BUG',
              issueFilter__urlQuery: encode(
                getIssuesStates(
                  states,
                  'BUG',
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id),
                  ['OPEN', 'WORKING', 'RESOLVED', 'REOPEN', 'CLOSED'],
                ),
              ),
            },
          },
          render: (text: number) => (
            <span className="flex items-center justify-center h-[120px] text-2xl">
              {text ? <Tooltip title={text}>{Math.round(text)}</Tooltip> : '0'}
            </span>
          ),
          tip: i18n.t('dop:bug total tip'),
        },
        {
          label: i18n.t('dop:bug undone rate'),
          value: detailData.bugDoneRate,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'BUG',
              issueFilter__urlQuery: encode(
                getIssuesStates(
                  states,
                  'BUG',
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id),
                  ['OPEN', 'WORKING', 'REOPEN', 'RESOLVED'],
                ),
              ),
            },
          },
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [20, 80])}
            />
          ),
          tip: i18n.t('dop:bug undone rate tip'),
        },
        {
          label: i18n.t('dop:serious bug rate'),
          value: detailData.bugSeriousRate,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'BUG',
              issueFilter__urlQuery: encode(
                `{"severities":["FATAL","SERIOUS"],"iterationIDs":[${
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id)
                }]}`,
              ),
            },
          },
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [10, 20], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:serious bug rate tip'),
        },
        {
          label: i18n.t('dop:low level bug rate'),
          value: detailData.bugLowLevelRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [5, 10], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:low level bug rate tip'),
        },
        {
          label: i18n.t('dop:demand design bug rate'),
          value: detailData.bugDemandDesignRate,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'BUG',
              issueFilter__urlQuery: encode(
                `{"bugStages":["demandDesign"],"iterationIDs":[${
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id)
                }]}`,
              ),
            },
          },
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [5, 10], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:demand design bug rate tip'),
        },
        {
          label: i18n.t('dop:online bug rate'),
          value: detailData.bugOnlineRate,
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [2.5, 5], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:online bug rate tip'),
        },
        {
          label: i18n.t('dop:reopen bug rate'),
          value: detailData.bugReopenRate,
          url: goTo.pages.issues,
          params: {
            projectId: detailData.projectID,
            query: {
              tab: 'BUG',
              issueFilter__urlQuery: encode(
                getIssuesStates(
                  states,
                  'BUG',
                  selectIterations.length ? selectIterations : iterations.map((item) => item.id),
                  ['REOPEN'],
                ),
              ),
            },
          },
          render: (text: number) => (
            <Progress
              size="small"
              percent={text ? Number((text * 100).toFixed(2)) : 0}
              type="dashboard"
              gapDegree={120}
              strokeColor={rateColor(Number((text * 100).toFixed(2)), [2.5, 5], [undefined, '#f3b519', '#f5212d'])}
            />
          ),
          tip: i18n.t('dop:reopen bug rate tip'),
        },
      ],
    ];
  }, [detailData, states, selectIterations]);

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
      key: 'bugDoneRate',
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
        onReload={() => init()}
      />
      <Drawer
        title={i18n.t('dop:project report detail')}
        visible={visible}
        width="90%"
        onClose={() => {
          setVisible(false);
          getDatail([]);
          setSelectIterations([]);
          setIterations([]);
        }}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          <div className="mb-2">
            <ContractiveFilter
              onChange={(value) => {
                if (value.iteration) {
                  getDatail(value.iteration);
                  setSelectIterations(value.iteration);
                } else {
                  getDatail([]);
                  setSelectIterations([]);
                }
              }}
              conditions={[
                {
                  emptyText: i18n.t('common:All'),
                  fixed: true,
                  haveFilter: true,
                  key: 'iteration',
                  label: i18n.t('dop:iteration'),
                  options: iterations.map((iteration) => ({ label: iteration.title, value: iteration.id })),
                  type: 'select',
                },
              ]}
            />
          </div>
          {fields.map((group, index) => (
            <Row gutter={[8, 16]} className="mb-4" key={index}>
              {group.map((item) => (
                <Col span={4} key={item.label}>
                  <Card
                    title={
                      <span className="flex items-center">
                        <Tooltip title={item.label} className={item.tip ? `truncate` : ''}>
                          {item.label}
                        </Tooltip>
                        {item.tip ? (
                          <Tooltip title={item.tip} className="flex-none w-[12px] ml-2">
                            <ErdaIcon type="help" />
                          </Tooltip>
                        ) : (
                          ''
                        )}
                      </span>
                    }
                    onClick={() => item.url && goTo(item.url, { ...item.params, jumpOut: true })}
                    className={`text-center ${!!item.url && 'shadow-card-lg cursor-pointer'}`}
                    headStyle={{ backgroundColor: cardColorList[index], padding: '0 16px' }}
                  >
                    {item.render && typeof item.render === 'function' ? (
                      item.render(item.value)
                    ) : (
                      <span className="text-2xl">{item.value}</span>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          ))}
        </Spin>
      </Drawer>
    </div>
  );
};

const getIssuesStates = (
  states: ISSUE_WORKFLOW.IIssueStateItem[],
  type: string,
  iterations: number[],
  belone?: string[],
) => {
  const list = states.filter((state) => state.issueType === type && (!belone || belone.includes(state.stateBelong)));
  return `{"states":[${list.map((state) => state.stateID)}],"iterationIDs":[${iterations}]}`;
};

const rateColor = (rate: number, points: number[], colors: Array<string | undefined> = ['#f5212d', '#f3b519']) => {
  for (let i = 0; i < points.length; i++) {
    if (rate <= points[i]) {
      return colors[i];
    }
  }

  return colors[colors.length - 1];
};

export default ProjectReport;
