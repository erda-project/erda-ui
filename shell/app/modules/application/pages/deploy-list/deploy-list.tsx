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

import React from 'react';
import { Input, Spin, Popconfirm, Tooltip, Modal } from 'antd';
import i18n from 'i18n';
import { CustomFilter, MemberSelector, LoadMoreSelector } from 'common';
import { useUpdate, useFilter } from 'common/use-hooks';
import ErdaTable from 'common/components/table';
import { insertWhen, goTo } from 'common/utils';
import { get } from 'lodash';
import { useEffectOnce } from 'react-use';
import { FormModal } from 'app/configForm/nusi-form/form-modal';
import { useUserMap } from 'core/stores/userMap';
import { Link } from 'react-router-dom';
import { getProjectList } from 'project/services/project';
import { ColumnProps } from 'antd/lib/table';

interface IProps {
  type: APPROVE_TYPE;
  status: string;
  getList: (arg: object) => Promise<DEPLOY.IDeploy>;
  clearList: () => void;
  cancelDeployment?: (arg: { runtimeId: number }) => Promise<any>;
  updateApproval?: (arg: object) => Promise<any>;
  list: DEPLOY.IDeploy[];
  paging: IPaging;
  isFetching: boolean;
}

export enum APPROVE_TYPE {
  initiate = 'initiate',
  approve = 'approve',
}

export const approvalStatusMap = {
  WaitApprove: { name: i18n.t('pending approval'), value: 'WaitApprove' },
  Accept: { name: i18n.t('passed'), value: 'Accept' },
  Reject: { name: i18n.t('Rejected'), value: 'Reject' },
};

const fields = [
  {
    label: i18n.t('content'),
    component: 'textarea',
    key: 'reason',
    componentProps: {
      placeholder: i18n.t('dop:please enter the reason for rejection'),
    },
    rules: [{ max: '100', msg: i18n.t('length is {min}~{max}', { min: 1, max: 100 }) }],
    required: true,
    type: 'textarea',
  },
];

const PureDeployList = (props: IProps) => {
  const { list, paging, getList, clearList, type, status, isFetching, updateApproval } = props;
  const userMap = useUserMap();

  useEffectOnce(() => {
    return () => {
      clearList();
    };
  });

  const [{ modalVis, editData }, , update] = useUpdate({
    modalVis: false,
    editData: undefined as DEPLOY.IDeploy | undefined,
  });

  const updateState = (val: DEPLOY.IUpdateApproveBody) => {
    updateApproval &&
      updateApproval(val).then(() => {
        fetchDataWithQuery(1);
      });
  };

  const columns: Array<ColumnProps<DEPLOY.IDeploy>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: i18n.t('Project/App/Branch'),
      dataIndex: 'projectName',
      width: 240,
      render: (projectName: string, record: DEPLOY.IDeploy) => {
        const mainInfo = `${projectName}/${record.applicationName}/${record.branchName}`;
        return <Tooltip title={mainInfo}>{mainInfo}</Tooltip>;
      },
    },
    {
      title: i18n.t('Approval content'),
      dataIndex: 'approvalContent',
      render: (item: string) => <Tooltip title={item}>{item}</Tooltip>,
    },
    {
      title: i18n.t('dop:pipeline ID'),
      dataIndex: 'buildId',
      width: 120,
      render: (val: string, record: DEPLOY.IDeploy) => {
        if (!val) return '';
        const { buildId, projectId, applicationId } = record;
        return (
          <Link to={goTo.resolve.pipeline({ projectId, appId: applicationId, pipelineID: buildId })} target="_blank">
            {val}
          </Link>
        );
      },
    },
    ...(insertWhen(type === APPROVE_TYPE.approve, [
      {
        title: i18n.t('Applicant'),
        dataIndex: 'operator',
        width: 120,
        render: (val: string) => {
          const curUser = userMap[val];
          return curUser ? curUser.nick || curUser.name : '';
        },
      },
    ]) as Array<ColumnProps<DEPLOY.IDeploy>>),
    ...(insertWhen(type === APPROVE_TYPE.initiate && status === 'WaitApprove', [
      {
        title: i18n.t('Approver'),
        dataIndex: 'approver',
        render: (val: string[]) => {
          const approver = (val || []).map((item) => {
            const curUser = userMap[item];
            return curUser ? curUser.nick || curUser.name : '';
          });
          const approvalPerson = i18n.t('wait for {approver} to approve', { approver: approver.join('、') });
          return <Tooltip title={approvalPerson}>{approvalPerson}</Tooltip>;
        },
      },
    ]) as Array<ColumnProps<DEPLOY.IDeploy>>),
  ];

  const getProjectListData = (q: any) => {
    return getProjectList({ ...q }).then((res: any) => res.data);
  };

  const actionMap = {
    approve: {
      approved: {
        title: i18n.t('cmp:Approve result'),
        dataIndex: 'approvalStatus',
        width: 160,
        render: (val: string) => (approvalStatusMap[val] || {}).name,
      },
    },
    initiate: {
      Reject: {
        title: i18n.t('dop:reason for rejection'),
        dataIndex: 'approvalReason',
        render: (approvalReason: string) => {
          return <Tooltip title={approvalReason}>{approvalReason}</Tooltip>;
        },
      },
    },
  };

  const action = get(actionMap, `${type}.${status}`);
  action && columns.push({ ...action, fixed: 'right', align: 'center' });

  const actions = {
    render: (record: DEPLOY.IDeploy) => [
      {
        title: i18n.t('dop:pass'),
        onClick: () => {
          Modal.confirm({
            title: i18n.t('is it confirmed?'),
            onOk() {
              updateState({
                id: record.id,
                reject: false,
              });
            },
          });
        },
      },
      {
        title: i18n.t('dop:denied'),
        onClick: () => update({ modalVis: true, editData: record }),
      },
    ],
  };

  const { onSubmit, onReset, fetchDataWithQuery, autoPagination } = useFilter({
    getData: getList,
    debounceGap: 500,
  });

  const filterConfig = React.useMemo(
    () => [
      {
        type: Input,
        name: 'id',
        rules: [
          {
            pattern: /^[0-9]*$/,
            message: i18n.t('can only contain numbers'),
          },
        ],
        customProps: {
          placeholder: i18n.t('filter by {name}', { name: 'ID' }),
        },
      },
      ...insertWhen(type === APPROVE_TYPE.approve, [
        {
          type: MemberSelector,
          name: 'operator',
          customProps: {
            placeholder: i18n.t('filter by {name}', { name: i18n.t('Applicant') }),
            scopeType: 'org',
            size: 'small',
          },
        },
      ]),
      {
        type: LoadMoreSelector,
        name: 'projectId',
        customProps: {
          placeholder: i18n.t('please choose {name}', { name: i18n.t('Project name') }),
          allowClear: true,
          getData: getProjectListData,
        },
      },
    ],
    [type],
  );

  const onCancel = () => update({ modalVis: false, editData: undefined });

  const onFinish = (value: { reason: string }) => {
    updateState({ ...value, id: editData.id, reject: true });
    onCancel();
  };
  return (
    <div>
      <Spin spinning={isFetching}>
        <ErdaTable
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={paging ? autoPagination(paging) : false}
          onReload={() => onReset()}
          slot={<CustomFilter onSubmit={onSubmit} onReset={onReset} config={filterConfig} isConnectQuery />}
          actions={type === 'approve' && status === 'pending' ? actions : null}
        />
      </Spin>
      <FormModal
        title={i18n.t('dop:reason for rejection')}
        onCancel={onCancel}
        onOk={onFinish}
        visible={modalVis}
        fieldList={fields}
      />
    </div>
  );
};

export default PureDeployList;
