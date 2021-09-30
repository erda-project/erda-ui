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

import { Icon as CustomIcon, CustomFilter, UserInfo } from 'common';
import { Button, Progress, Spin, Table, Select, Input } from 'core/nusi';
import React, { useState } from 'react';
import PlanModal, { IPlanModal } from './plan-modal';
import { goTo } from 'app/common/utils';
import { isEmpty } from 'lodash';
import { useEffectOnce } from 'react-use';
import { useLoading } from 'core/stores/loading';
import testPlanStore from 'project/stores/test-plan';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';
import './test-plan.scss';

const { Option } = Select;
const iconMap = {
  DOING: <CustomIcon type="jxz" className="rounded-full bg-blue text-white" />,
  PAUSE: <CustomIcon type="zt" className="rounded-full bg-yellow text-white" />,
  DONE: <CustomIcon type="tg" className="rounded-full bg-green text-white" />,
  DISCARD: <CustomIcon type="wtg" className="rounded-full bg-red text-white" />,
};
const statusMap = [
  { label: i18n.t('project:processing'), value: 'DOING' },
  { label: i18n.t('project:pause'), value: 'PAUSE' },
  { label: i18n.t('project:completed'), value: 'DONE' },
];
const archiveStatusMap = [
  { label: i18n.t('project:processing'), value: 'false' },
  { label: i18n.t('archived'), value: 'true' },
];

const TestPlan = () => {
  const [modalProp, setModalProp] = useState({ visible: false, testPlanId: '', mode: 'add' } as IPlanModal);
  const { getPlanList, toggleArchived } = testPlanStore.effects;
  const { clearPlanList } = testPlanStore.reducers;
  const [filterObj, setFilterObj] = React.useState<Obj>({ isArchived: 'false' });
  const [page, planList] = testPlanStore.useStore((s) => [s.planPaging, s.planList]);
  const [isFetching] = useLoading(testPlanStore, ['getPlanList']);

  const updateModalProp = (a: object) => {
    setModalProp({
      ...modalProp,
      ...a,
    });
  };
  useEffectOnce(() => {
    return () => {
      clearPlanList();
    };
  });

  const getList = React.useCallback(
    (q: any = {}) => {
      getPlanList(q);
    },
    [getPlanList],
  );

  const onPageChange = (pageNoNext: number) => {
    getList({ ...filterObj, pageNo: pageNoNext });
  };

  const onSearch = ({ status, ...query }: any) => {
    // 为空时不传该字段
    const currentQuery = { ...query };
    if (!isEmpty(status)) {
      currentQuery.status = status;
    }
    setFilterObj(currentQuery);
  };

  React.useEffect(() => {
    getList({ ...filterObj, pageNo: 1 });
  }, [filterObj, getList]);

  const columns: Array<ColumnProps<TEST_PLAN.Plan>> = [
    {
      title: i18n.t('project:plan name'),
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <div className="title flex items-center" title={`${record.id}-${text}`}>
            {iconMap[record.status]}
            <span className="truncate">
              {record.id}-{text}
            </span>
          </div>
        );
      },
    },
    {
      title: i18n.t('project:principal'),
      dataIndex: 'ownerID',
      width: 120,
      render: (text) => <UserInfo id={text} render={(data) => data.nick || data.name} />,
    },
    {
      title: i18n.t('project:passing rate'),
      dataIndex: 'useCasePassedCount',
      className: 'passing-rate',
      width: 160,
      render: (_text, { relsCount }) => {
        const { total, succ } = relsCount;
        const percent = Math.floor((succ / (total || 1)) * 100 || 0);
        return (
          <div className="sub">
            <span className="mr-1">{percent}%</span>
            <Progress style={{ width: '90px' }} percent={percent} showInfo={false} size="small" />
          </div>
        );
      },
    },
    {
      title: i18n.t('project:exacutive rate'),
      dataIndex: 'executionRate',
      className: 'passing-rate',
      width: 160,
      render: (_text, { relsCount }) => {
        const { total, succ, fail, block } = relsCount;
        const percent = Math.floor(((succ + fail + block) / (total || 1)) * 100 || 0);
        return (
          <div className="sub">
            <span className="mr-1">{percent}%</span>
            <Progress style={{ width: '90px' }} percent={percent} showInfo={false} size="small" />
          </div>
        );
      },
    },
    {
      title: i18n.t('default:operation'),
      dataIndex: 'id',
      width: 200,
      fixed: 'right',
      render: (id, record) => {
        return (
          <div className="table-operations">
            {!record.isArchived && (
              <span
                className="table-operations-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateModalProp({ visible: true, mode: 'edit', testPlanId: id });
                }}
              >
                {i18n.t('project:edit')}
              </span>
            )}
            <span
              className="table-operations-btn"
              onClick={(e) => {
                e.stopPropagation();
                updateModalProp({ visible: true, mode: 'copy', testPlanId: id });
              }}
            >
              {i18n.t('project:copy and create')}
            </span>
            <span
              className="table-operations-btn"
              onClick={async (e) => {
                e.stopPropagation();
                await toggleArchived({ id, isArchived: !record.isArchived });
                getList({ ...filterObj, pageNo: page.pageNo });
              }}
            >
              {record.isArchived ? i18n.t('project:unarchive') : i18n.t('archive')}
            </span>
          </div>
        );
      },
    },
  ];

  const filterConfig: FilterItemConfig[] = React.useMemo(
    () => [
      {
        type: Select,
        name: 'isArchived',
        customProps: {
          options: archiveStatusMap.map(({ label, value }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          )),
          defaultValue: 'false',
          allowClear: true,
          placeholder: i18n.t('project:archive status'),
        },
      },
      {
        type: Select,
        name: 'status',
        customProps: {
          options: statusMap.map(({ label, value }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          )),
          allowClear: true,
          placeholder: i18n.t('project:select status'),
          mode: 'multiple',
        },
      },
      {
        type: Input,
        name: 'name',
        customProps: {
          placeholder: i18n.t('default:search by name'),
          autoComplete: 'off',
        },
      },
    ],
    [],
  );

  return (
    <div>
      <div className="top-button-group">
        <Button type="primary" onClick={() => updateModalProp({ visible: true, mode: 'add', testPlanId: undefined })}>
          {i18n.t('project:new plan')}
        </Button>
        <PlanModal
          {...modalProp}
          afterSubmit={() => {
            getList({ ...filterObj, pageNo: modalProp.mode === 'edit' ? page.pageNo : 1 });
          }}
          onCancel={() => {
            updateModalProp({ visible: false });
          }}
        />
      </div>
      <CustomFilter config={filterConfig} onSubmit={onSearch} />
      <Spin spinning={isFetching}>
        <Table
          className="test-plan-list"
          rowKey="id"
          columns={columns}
          dataSource={planList}
          onRow={(plan: TEST_PLAN.Plan) => {
            return {
              onClick: () => {
                goTo(`./${plan.id}`);
              },
            };
          }}
          pagination={{
            // hideOnSinglePage: true,
            current: page.pageNo,
            total: page.total,
            pageSize: page.pageSize,
            onChange: onPageChange,
          }}
          scroll={{ x: 800 }}
        />
      </Spin>
    </div>
  );
};

export default TestPlan;
