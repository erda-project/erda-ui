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
import { Drawer, Card, Col, Row } from 'antd';
import i18n from 'i18n';
import { ColumnProps } from 'antd/lib/table';
import { goTo } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import { ConfigurableFilter } from 'common';
import ErdaTable from 'common/components/table';
import { getReports, Report } from 'dop/services';

const ProjectReport = () => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  const [data, setData] = useState<Report[]>([]);
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<Report>({} as Report);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const payload = {
      start: '2023-08-08 00:00:00',
      end: '2023-08-11 00:00:00',
      orgId,
    };
    const res = await getReports(payload);

    if (res.success) {
      const list =
        res.data?.filter?.(
          (item, index) => res.data?.findIndex((report) => item.projectID === report.projectID) !== index,
        ) || [];
      setData(list);
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
      dataIndex: '',
    },
    {
      title: i18n.t('dop:work hours'),
      dataIndex: 'budgetMandayTotal',
    },
    {
      title: i18n.t('dop:estimated work hours'),
      dataIndex: 'taskEstimatedManday',
    },
    {
      title: i18n.t('dop:serious bug rate'),
      dataIndex: 'bugSeriousRate',
      render: (text) => (text || text === 0 ? `${text}%` : ''),
    },
    {
      title: i18n.t('dop:reopen bug rate'),
      dataIndex: 'bugReopenRate',
      render: (text) => (text || text === 0 ? `${text}%` : ''),
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
          value: detailData.budgetMandayTotal || '-',
        },
        {
          label: i18n.t('dop:estimated work hours'),
          value: detailData.taskEstimatedManday || '-',
        },
        {
          label: i18n.t('dop:actual manday total'),
          value: detailData.actualMandayTotal || '-',
        },
        {
          label: i18n.t('dop:unfinished assignee total'),
          value: detailData.unfinishedAssigneeTotal || '-',
        },
      ],
      [
        {
          label: i18n.t('dop:requirement total'),
          value: detailData.requirementTotal || '-',
          url: goTo.pages.requirementIssues,
          params: { projectId: detailData.projectID },
        },
        {
          label: i18n.t('dop:requirement done rate'),
          value: detailData.requirementDoneRate || '-',
        },
        {
          label: i18n.t('dop:requirement associated total'),
          value: detailData.requirementAssociatedTotal || '-',
        },
        {
          label: i18n.t('dop:requirement unassigned rate'),
          value: detailData.requirementUnassignedRate || '-',
        },
      ],
      [
        {
          label: i18n.t('dop:task total'),
          value: detailData.taskTotal || '-',
          url: goTo.pages.taskIssues,
          params: { projectId: detailData.projectID },
        },
        {
          label: i18n.t('dop:task done rate'),
          value: detailData.taskDoneRate || '-',
        },
        {
          label: i18n.t('dop:task associated rate'),
          value: detailData.taskAssociatedRate || '-',
        },
      ],
      [
        {
          label: i18n.t('dop:bug total'),
          value: detailData.bugTotal || '-',
          url: goTo.pages.bugIssues,
          params: { projectId: detailData.projectID },
        },
        {
          label: i18n.t('dop:bug undone rate'),
          value: detailData.bugUndoneRate || '-',
        },
        {
          label: i18n.t('dop:serious bug rate'),
          value: detailData.bugSeriousRate || '-',
        },
        {
          label: i18n.t('dop:low level bug rate'),
          value: detailData.bugLowLevelRate || '-',
        },
        {
          label: i18n.t('dop:demand design bug rate'),
          value: detailData.bugDemandDesignRate || '-',
        },
        {
          label: i18n.t('dop:online bug rate'),
          value: detailData.bugOnlineRate || '-',
        },
        {
          label: i18n.t('dop:reopen bug rate'),
          value: detailData.bugReopenRate || '-',
        },
      ],
    ],
    [detailData],
  );

  const filterConfig = [
    {
      label: i18n.t('default:Project code'),
      type: 'input',
      key: 'EmpProjectCode',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('default:Project code') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:bug undone rate'),
      type: 'input',
      key: 'bugUndoneRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:bug undone rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:serious bug rate'),
      type: 'input',
      key: 'bugSeriousRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:serious bug rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:low level bug rate'),
      type: 'input',
      key: 'bugLowLevelRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:low level bug rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:demand design bug rate'),
      type: 'input',
      key: 'bugDemandDesignRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:demand design bug rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:online bug rate'),
      type: 'input',
      key: 'bugOnlineRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:online bug rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: i18n.t('dop:reopen bug rate'),
      type: 'input',
      key: 'bugReopenRate',
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('dop:reopen bug rate') }),
      customProps: {
        autoComplete: 'off',
      },
    },
    {
      label: '',
      type: 'input',
      key: 'ProjectName',
      outside: true,
      placeholder: i18n.t('Please enter the {name}', { name: i18n.t('default:Project name') }),
      customProps: {
        autoComplete: 'off',
      },
    },
  ];

  const handleSearch = (values: Obj) => {
    console.log(values);
  };

  return (
    <div>
      <ErdaTable
        rowKey="assetID"
        columns={columns}
        dataSource={data}
        slot={<ConfigurableFilter hideSave fieldsList={filterConfig} onFilter={handleSearch} />}
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
        {fields.map((group) => (
          <Row gutter={8} className="mb-4">
            {group.map(
              (item) =>
                item[0] && (
                  <Col span={3} key={item[0].label}>
                    <Card
                      title={item.label}
                      hoverable
                      onClick={() => item.url && goTo(item.url, { ...item.params, jumpOut: true })}
                    >
                      {item.value}
                    </Card>
                  </Col>
                ),
            )}
          </Row>
        ))}
      </Drawer>
    </div>
  );
};

export default ProjectReport;
