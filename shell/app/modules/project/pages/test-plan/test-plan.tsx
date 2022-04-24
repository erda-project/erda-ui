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

import { Icon as CustomIcon, CustomFilter, UserInfo, MemberSelector, TopButtonGroup } from 'common';
import ErdaTable from 'common/components/table';
import { Button, Progress, Spin, Tooltip, Select, Input } from 'antd';
import React, { useState } from 'react';
import PlanModal, { IPlanModal } from './plan-modal';
import { goTo } from 'common/utils';
import { isEmpty } from 'lodash';
import { useEffectOnce } from 'react-use';
import { useLoading } from 'core/stores/loading';
import testPlanStore from 'project/stores/test-plan';
import iterationStore from 'project/stores/iteration';
import i18n from 'i18n';
import { ColumnProps } from 'antd/lib/table';
import './test-plan.scss';

const { Option } = Select;
const iconMap = {
  DOING: <CustomIcon type="jxz" className="rounded-full bg-blue text-white" />,
  PAUSE: <CustomIcon type="zt" className="rounded-full bg-yellow text-white" />,
  DONE: <CustomIcon type="tg" className="rounded-full bg-green text-white" />,
  DISCARD: <CustomIcon type="wtg" className="rounded-full bg-red text-white" />,
};
const statusMap = [
  { label: i18n.t('In Progress'), value: 'DOING' },
  { label: i18n.t('Paused'), value: 'PAUSE' },
  { label: i18n.t('dop:Completed'), value: 'DONE' },
];
const archiveStatusMap = [
  { label: i18n.t('In Progress'), value: 'false' },
  { label: i18n.t('Archived'), value: 'true' },
];

const TestPlan = () => {
  const [modalProp, setModalProp] = useState({ visible: false, testPlanId: '', mode: 'add' } as IPlanModal);
  const { getPlanList, toggleArchived } = testPlanStore.effects;
  const { clearPlanList } = testPlanStore.reducers;
  const [filterObj, setFilterObj] = React.useState<Obj>({ isArchived: 'false' });
  const [page, planList] = testPlanStore.useStore((s) => [s.planPaging, s.planList]);
  const [isFetching] = useLoading(testPlanStore, ['getPlanList']);
  const iterationList = iterationStore.useStore((s) => s.iterationList);

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

  const onPageChange = (pageNoNext: number, pageSize: number) => {
    getList({ ...filterObj, pageNo: pageNoNext, pageSize });
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
      title: i18n.t('dop:ID'),
      dataIndex: 'id',
      width: 80,
    },
    {
      title: i18n.t('dop:plan name'),
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <div className="title flex items-center" title={text}>
            {iconMap[record.status]}
            <span className="truncate">{text}</span>
          </div>
        );
      },
    },
    {
      title: i18n.t('dop:Iteration-owned'),
      dataIndex: 'iterationName',
      width: 100,
    },
    {
      title: i18n.t('dop:Principal'),
      dataIndex: 'ownerID',
      width: 120,
      render: (text) => <UserInfo id={text} render={(data) => data.nick || data.name} />,
    },
    {
      title: i18n.t('dop:Participant'),
      dataIndex: 'partnerIDs',
      width: 180,
      render: (text) => {
        const Partners = (
          <>
            {(text || []).map((t, idx) => (
              <UserInfo
                key={t}
                id={t}
                render={(data) => `${data.nick || data.name} ${idx === text.length - 1 ? '' : ', '}`}
              />
            ))}
          </>
        );
        return (
          <Tooltip title={Partners}>
            <div className="truncate">{Partners}</div>
          </Tooltip>
        );
      },
    },
    {
      title: i18n.t('dop:Pass rate'),
      dataIndex: 'useCasePassedCount',
      className: 'passing-rate',
      width: 120,
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
      title: i18n.t('dop:Execution rate'),
      dataIndex: 'executionRate',
      className: 'passing-rate',
      width: 120,
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
  ];

  const actions = {
    render: (record: TEST_PLAN.Plan) => {
      const { id } = record;
      return [
        {
          title: i18n.t('Edit'),
          onClick: () => updateModalProp({ visible: true, mode: 'edit', testPlanId: id }),
          show: !record.isArchived,
        },
        {
          title: i18n.t('dop:Copy and Add'),
          onClick: () => updateModalProp({ visible: true, mode: 'copy', testPlanId: id }),
        },
        {
          title: record.isArchived ? i18n.t('dop:Unarchive') : i18n.t('Archive'),
          onClick: async () => {
            await toggleArchived({ id, isArchived: !record.isArchived });
            // When has isArchived filter, this operation will delete the row from table
            const needGoToFirstPage = planList.length === 1 && typeof filterObj.isArchived !== 'undefined';
            getList({ ...filterObj, pageNo: needGoToFirstPage ? 1 : page.pageNo });
          },
        },
      ];
    },
  };

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
          placeholder: i18n.t('dop:archive status'),
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
          placeholder: i18n.t('dop:Select the status'),
          mode: 'multiple',
        },
      },
      {
        type: Select,
        name: 'iterationID',
        customProps: {
          options: iterationList.map(({ id, title }) => (
            <Option key={id} value={id}>
              {title}
            </Option>
          )),
          allowClear: true,
          placeholder: i18n.t('dop:Iteration-owned'),
          mode: 'multiple',
        },
      },
      {
        type: Input,
        name: 'name',
        customProps: {
          placeholder: i18n.t('Search by plan name'),
          autoComplete: 'off',
          size: 'normal',
        },
      },
      {
        type: MemberSelector,
        name: 'ownerID',
        customProps: {
          placeholder: i18n.t('please select {name}', { name: i18n.t('dop:principal') }),
          scopeType: 'project',
          mode: 'multiple',
        },
      },
      {
        type: MemberSelector,
        name: 'partnerID',
        customProps: {
          placeholder: i18n.t('please select {name}', { name: i18n.t('dop:participant') }),
          scopeType: 'project',
          mode: 'multiple',
        },
      },
    ],
    [iterationList],
  );

  return (
    <div>
      <TopButtonGroup>
        <Button type="primary" onClick={() => updateModalProp({ visible: true, mode: 'add', testPlanId: undefined })}>
          {i18n.t('Add')}
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
      </TopButtonGroup>
      <Spin spinning={isFetching}>
        <ErdaTable
          tableKey="manual-test-plan"
          className="test-plan-list"
          rowKey="id"
          columns={columns}
          dataSource={planList}
          actions={actions}
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
          slot={<CustomFilter config={filterConfig} onSubmit={onSearch} />}
        />
      </Spin>
    </div>
  );
};

export default TestPlan;
