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
import { Button, Progress, Spin, Table, Select, Input } from 'nusi';
import React, { useState } from 'react';
import PlanModal, { IPlanModal } from './plan-modal';
import { goTo, insertWhen } from 'app/common/utils';
import { map, isEmpty } from 'lodash';
import { useEffectOnce } from 'react-use';
import MemberStore from 'common/stores/project-member';
import routeInfoStore from 'common/stores/route';
import { useLoading } from 'app/common/stores/loading';
import testPlanStore from 'project/stores/test-plan';
import i18n from 'i18n';
import { ColumnProps } from 'interface/common';
import './test-plan.scss';
import { TEST_TYPE } from '../test-manage/case';

const { Option } = Select;
const iconMap = {
  DOING: <CustomIcon type="jxz" className="bg-color-icon blue" />,
  PAUSE: <CustomIcon type="zt" className="bg-color-icon yellow" />,
  DONE: <CustomIcon type="tg" className="bg-color-icon green" />,
  DISCARD: <CustomIcon type="wtg" className="bg-color-icon red" />,
};
const statusMap = [
  { label: i18n.t('project:processing'), value: 'DOING' },
  { label: i18n.t('project:pause'), value: 'PAUSE' },
  { label: i18n.t('project:completed'), value: 'DONE' },
];

const TestPlan = () => {
  const testType = routeInfoStore.useStore(s => s.params.testType) || TEST_TYPE.manual;
  const projectMembers = MemberStore.useStore(s => s.list);
  const { getMemberList: getProjectMembers } = MemberStore.effects;
  const [modalProp, setModalProp] = useState({ visible: false, testPlanId: '', mode: 'add' } as IPlanModal);
  const { getPlanList } = testPlanStore.effects;
  const { clearPlanList } = testPlanStore.reducers;
  const [page, planList] = testPlanStore.useStore(s => [s.planPaging, s.planList]);
  const params = routeInfoStore.useStore(s => s.params);
  const [isFetching] = useLoading(testPlanStore, ['getPlanList']);

  const updateModalProp = (a: object) => {
    setModalProp({
      ...modalProp,
      ...a,
    });
  };
  useEffectOnce(() => {
    getProjectMembers({ scope: { type: 'project', id: params.projectId }, pageNo: 1, pageSize: 1000 }); // TODO: 后端后期会重构该接口，返回userMap，无需查列表
    getList();
    return () => {
      clearPlanList();
    };
  });

  const getList = (q: any = {}) => {
    getPlanList(q);
  };

  const memberMap = {};
  map(projectMembers, (m: any) => { memberMap[+m.userId] = m; });

  const onPageChange = (pageNoNext: number) => {
    getList({ pageNo: pageNoNext });
  };

  const onSearch = ({ status, ...query }: any) => {
    // 为空时不传该字段
    const currentQuery = { ...query };
    if (!isEmpty(status)) {
      currentQuery.status = status;
    }
    getList({ ...currentQuery, pageNo: 1 });
  };

  const columns: Array<ColumnProps<TEST_PLAN.Plan>> = [
    {
      title: i18n.t('project:plan name'),
      dataIndex: 'name',
      render: (text, record) => {
        return <div className="title v-align">{iconMap[record.status]}{record.id}-{text}</div>;
      },
    },
    {
      title: i18n.t('project:principal'),
      dataIndex: 'ownerID',
      render: (text) => <UserInfo id={text} render={(data) => data.nick || data.name} />,
    },
    ...insertWhen(testType === 'manual', [

      {
        title: i18n.t('project:passing rate'),
        dataIndex: 'useCasePassedCount',
        className: 'passing-rate',
        render: (_text, { relsCount }) => {
          const { total, succ } = relsCount;
          const percent = Math.floor((succ / total) * 100 || 0);
          return (
            <div className="sub">
              <span className="mr4">{percent}%</span>
              <Progress style={{ width: '90px' }} percent={percent} showInfo={false} size="small" />
            </div>
          );
        },
      },
    ]),
    {
      title: i18n.t('default:operation'),
      dataIndex: 'id',
      width: 140,
      render: (id) => {
        return (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={(e) => {
                e.stopPropagation();
                updateModalProp({ visible: true, mode: 'edit', testPlanId: id });
              }}
            >
              { i18n.t('project:edit')}
            </span>
            <span
              className="table-operations-btn"
              onClick={(e) => {
                e.stopPropagation();
                updateModalProp({ visible: true, mode: 'copy', testPlanId: id });
              }}
            >
              { i18n.t('project:copy and create')}
            </span>
          </div>
        );
      },
    },
  ];

  const filterConfig:FilterItemConfig[] = React.useMemo(() => [
    ...insertWhen(testType === 'manual', [
      {
        type: Select,
        name: 'status',
        customProps: {
          options: statusMap.map(({ label, value }) => <Option value={value}>{label}</Option>),
          allowClear: true,
          placeholder: i18n.t('project:select status'),
          mode: 'multiple',
        },
      },
    ]),
    {
      type: Input,
      name: 'name',
      customProps: {
        placeholder: i18n.t('default:search by name'),
        autoComplete: 'off',
      },
    },
  ], [testType]);

  return (
    <div>
      <div className="top-button-group">
        <Button
          type="primary"
          onClick={() => updateModalProp({ visible: true, mode: 'add', testPlanId: undefined })}
        >
          {i18n.t('project:new plan')}
        </Button>
        <PlanModal {...modalProp} onCancel={() => { updateModalProp({ visible: false }); }} />
      </div>
      <CustomFilter config={filterConfig} onSubmit={onSearch} />
      <Spin spinning={isFetching}>
        <Table
          tableKey="test-plan-list"
          className="test-plan-list"
          rowKey="id"
          columns={columns}
          dataSource={planList}
          onRow={(plan: TEST_PLAN.Plan) => {
            return {
              onClick: () => { goTo(`./${plan.id}`); },
            };
          }}
          pagination={{
            // hideOnSinglePage: true,
            current: page.pageNo,
            total: page.total,
            pageSize: page.pageSize,
            onChange: onPageChange,
          }}
        />
      </Spin>
    </div>
  );
};

export default TestPlan;
