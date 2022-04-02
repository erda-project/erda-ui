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
import { Select, Tooltip } from 'antd';
import { ConfigurableFilter, CRUDTable, RadioTabs } from 'common';
import { useUpdate } from 'common/use-hooks';
import { map, get, isEmpty } from 'lodash';
import { insertWhen } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import approvalStore from '../../stores/approval';
import moment from 'moment';
import { useUserMap } from 'core/stores/userMap';
import DetailModal from '../certificate/detail-modal';
import { typeMap as certificateTypeMap } from '../certificate/index';
import i18n from 'i18n';
import { ColumnProps } from 'antd/lib/table';

const { Option } = Select;
const undoneStatusMap = {
  approved: {
    value: 'approved',
    label: i18n.t('passed'),
  },
  denied: {
    value: 'denied',
    label: i18n.t('Rejected'),
  },
};

const typeMap = {
  certificate: {
    value: 'certificate',
    name: i18n.t('cmp:certificate reference'),
  },
  'lib-reference': {
    value: 'lib-reference',
    name: i18n.t('cmp:library reference'),
  },
  'unblock-application': {
    value: 'unblock-application',
    name: i18n.t('cmp:unblocked application'),
  },
};

enum statusMap {
  pending = 'pending',
  denied = 'denied',
  approved = 'approved',
}

const Approval = () => {
  const tabs = [
    {
      value: 'undone',
      label: i18n.t('cmp:pending approval'),
    },
    {
      value: 'done',
      label: i18n.t('cmp:Approved'),
    },
  ];

  const [{ type, status, chosenDetail }, updater] = useUpdate({
    type: tabs[0].value as APPROVAL.ApprovalType,
    status: undefined as string | undefined,
    chosenDetail: {} as { type: string; iosInfo: any; androidInfo: any },
  });
  const { getApprovalList, updateApproval } = approvalStore.effects;
  const { clearApprovalList } = approvalStore.reducers;
  const userMap = useUserMap();
  const [loading] = useLoading(approvalStore, ['getApprovalList']);
  const [list, paging] = approvalStore.useStore((s) => {
    return type === 'done' ? [s.doneList, s.donePaging] : [s.undoneList, s.undonePaging];
  });

  const getColumns = ({ reloadList }: { reloadList: () => void }) => {
    const columns: Array<ColumnProps<APPROVAL.Item>> = [
      {
        title: i18n.t('Name'),
        dataIndex: 'title',
        render: (v: string) => {
          return <Tooltip title={v}>{v}</Tooltip>;
        },
      },
      {
        title: i18n.t('cmp:Application content'),
        width: 140,
        dataIndex: 'desc',
      },
      {
        title: i18n.t('Type'),
        dataIndex: 'type',
        width: 100,
        render: (val: APPROVAL.ApprovalItemType) => get(typeMap, `${val}.name`),
      },
      {
        title: i18n.t('cmp:Submitter'),
        dataIndex: 'submitter',
        width: 120,
        render: (val: string) => {
          const curUser = userMap[val];
          return curUser ? curUser.nick || curUser.name : '';
        },
      },
      {
        title: i18n.t('cmp:Submit time'),
        dataIndex: 'createdAt',
        width: 140,
        render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: i18n.t('operation'),
        dataIndex: 'op',
        width: type === 'done' ? 60 : 150,
        render: (_v: any, record: APPROVAL.Item) => {
          const { type: approvalType, status: approvalStatus, id, extra } = record;
          const { ios, android } = extra || {};
          let detail = {} as any;
          if (ios) {
            detail = {
              type: certificateTypeMap.IOS.value,
              iosInfo: JSON.parse(ios),
            };
          } else if (android) {
            detail = {
              type: certificateTypeMap.Android.value,
              androidInfo: JSON.parse(android),
            };
          }
          return (
            <div className="table-operations">
              {approvalType === 'certificate' && !isEmpty(detail) && (
                <span className="table-operations-btn" onClick={() => updater.chosenDetail(detail)}>
                  {i18n.t('Download')}
                </span>
              )}
              {approvalStatus === statusMap.pending ? (
                <>
                  <span
                    className="table-operations-btn"
                    onClick={() => {
                      updateApproval({ id, status: statusMap.approved }).then(() => {
                        reloadList();
                      });
                    }}
                  >
                    {i18n.t('dop:Approved')}
                  </span>
                  <span
                    className="table-operations-btn"
                    onClick={() => {
                      updateApproval({ id, status: statusMap.denied }).then(() => {
                        reloadList();
                      });
                    }}
                  >
                    {i18n.t('dop:denied')}
                  </span>
                </>
              ) : null}
            </div>
          );
        },
      },
    ];
    if (type === 'done') {
      columns.splice(
        4,
        0,
        ...[
          {
            title: i18n.t('cmp:Approver'),
            dataIndex: 'approver',
            render: (val: string) => {
              const curUser = userMap[val];
              return curUser ? curUser.nick || curUser.name : '';
            },
          },
          {
            title: i18n.t('cmp:Approval time'),
            dataIndex: 'approvalTime',
            width: 180,
            render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            title: i18n.t('cmp:Approve result'),
            dataIndex: 'status',
            width: 100,
            render: (val: string) => get(undoneStatusMap, `${val}.label`),
          },
        ],
      );
    }
    return columns;
  };

  const extraQuery = React.useMemo(() => {
    const typeStatus = type === 'undone' ? statusMap.pending : '';
    return { type, status: status || typeStatus };
  }, [status, type]);

  const fieldsList = [
    {
      key: 'status',
      type: 'select',
      label: i18n.t('status'),
      mode: 'single',
      options: Object.values(undoneStatusMap),
      placeholder: i18n.t('filter by {name}', { name: i18n.t('status') }),
    },
  ];
  return (
    <>
      <RadioTabs value={type} options={tabs} className="mb-2" onChange={(v) => updater.type(v)} />
      <CRUDTable<APPROVAL.Item>
        key={type}
        isFetching={loading}
        getList={getApprovalList}
        clearList={() => clearApprovalList(type)}
        list={list}
        paging={paging}
        getColumns={getColumns}
        extraQuery={extraQuery}
        tableProps={{
          onReload: (pageNo: number, pageSize: number) => getApprovalList({ ...extraQuery, type, pageNo, pageSize }),
          slot:
            type === 'done' ? (
              <ConfigurableFilter
                hideSave
                value={{ status }}
                fieldsList={fieldsList}
                onFilter={(values) => updater.status(values.status)}
              />
            ) : null,
        }}
      />
      <DetailModal detail={chosenDetail} onClose={() => updater.chosenDetail({})} />
    </>
  );
};

export default Approval;
