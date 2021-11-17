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
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useMount, useUnmount } from 'react-use';
import { Modal, Button, Spin, Switch, Table, Tooltip } from 'antd';
import { goTo } from 'common/utils';
import { ColumnProps } from 'app/interface/common';
import i18n from 'i18n';
import { useLoading } from 'core/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';
import orgMemberStore from 'common/stores/org-member';
import projectMemberStore from 'common/stores/project-member';
import cmpAlarmStrategyStore from 'app/modules/cmp/stores/alarm-strategy';
import mspAlarmStrategyStore from 'app/modules/msp/alarm-manage/alarm-strategy/stores/alarm-strategy';
import { ListTargets } from 'application/pages/settings/components/app-notify/common-notify-group';
import orgStore from 'app/org-home/stores/org';
import routeInfoStore from 'core/stores/route';
import './index.scss';

const { confirm } = Modal;

enum ScopeType {
  ORG = 'org',
  PROJECT = 'project',
  MSP = 'msp',
}

const alarmStrategyStoreMap = {
  [ScopeType.ORG]: cmpAlarmStrategyStore,
  [ScopeType.MSP]: mspAlarmStrategyStore,
};

const memberStoreMap = {
  [ScopeType.ORG]: orgMemberStore,
  [ScopeType.MSP]: projectMemberStore,
};

interface IProps {
  scopeType: ScopeType.ORG | ScopeType.MSP;
  scopeId: string;
  commonPayload?: Obj;
}

export default ({ scopeType, scopeId, commonPayload }: IProps) => {
  const memberStore = memberStoreMap[scopeType];
  const roleMap = memberStore.useStore((s) => s.roleMap);
  const { getRoleMap } = memberStore.effects;
  const alarmStrategyStore = alarmStrategyStoreMap[scopeType];
  const [alertList, alarmPaging] = alarmStrategyStore.useStore((s) => [s.alertList, s.alarmPaging]);
  const { total, pageNo, pageSize } = alarmPaging;
  const orgId = orgStore.getState((s) => s.currentOrg.id);
  const [getAlertDetailLoading, getAlertsLoading, toggleAlertLoading] = useLoading(alarmStrategyStore, [
    'getAlertDetail',
    'getAlerts',
    'toggleAlert',
  ]);
  const { getAlerts, toggleAlert, deleteAlert, getAlarmScopes, getAlertTypes, getAlertTriggerConditions } =
    alarmStrategyStore.effects;
  const { clearAlerts } = alarmStrategyStore.reducers;
  const { getNotifyGroups } = notifyGroupStore.effects;

  useMount(() => {
    let payload = { scopeType, scopeId };
    if (scopeType === ScopeType.MSP) {
      payload = {
        scopeType: commonPayload?.scopeType,
        scopeId: commonPayload?.scopeId,
      };
    }
    getAlerts();
    getAlarmScopes();
    getAlertTypes();
    getNotifyGroups(payload);
    getRoleMap({ scopeType, scopeId: scopeType === ScopeType.MSP ? commonPayload?.scopeId : scopeId });
    getAlertTriggerConditions(scopeType);
  });

  useUnmount(() => {
    clearAlerts();
  });

  const handleDeleteAlarm = (id: number) => {
    confirm({
      title: i18n.t('dop:are you sure you want to delete this item?'),
      content: i18n.t('dop:the notification will be permanently deleted'),
      onOk() {
        deleteAlert(id);
      },
    });
  };

  const handlePageChange = (no: number) => {
    getAlerts({ pageNo: no });
  };

  const alertListColumns: Array<ColumnProps<COMMON_STRATEGY_NOTIFY.IAlert>> = [
    {
      title: i18n.t('cmp:alarm name'),
      dataIndex: 'name',
      width: 150,
    },
    // ...insertWhen(scopeType === ScopeType.ORG, [
    //   {
    //     title: i18n.t('cmp:cluster'),
    //     dataIndex: 'clusterNames',
    //     width: 200,
    //     render: (clusterNames: string[]) => map(clusterNames, (clusterName) => alarmScopeMap[clusterName]).join(),
    //   },
    // ]),
    // ...insertWhen(scopeType === ScopeType.MSP && commonPayload?.projectType !== 'MSP', [
    //   {
    //     title: i18n.t('application'),
    //     dataIndex: 'appIds',
    //     width: 200,
    //     render: (appIds: string[]) => map(appIds, (appId) => alarmScopeMap[appId]).join(),
    //   },
    // ]),
    {
      title: i18n.t('default:notification target'),
      dataIndex: ['notifies', '0', 'notifyGroup'],
      width: 400,
      className: 'notify-info',
      ellipsis: true,
      render: (notifyGroup: COMMON_STRATEGY_NOTIFY.INotifyGroup) => {
        const tips = i18n.t('cmp:Notification group does not exist or has been remove. Please change one.');
        return (
          <div className="flex-div flex">
            {isEmpty(notifyGroup) ? (
              <Tooltip title={tips}>
                <span className="text-sub">{tips}</span>
              </Tooltip>
            ) : (
              <ListTargets targets={notifyGroup.targets} roleMap={roleMap} />
            )}
          </div>
        );
      },
    },
    {
      title: i18n.t('default:create time'),
      dataIndex: 'createTime',
      width: 180,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('default:operation'),
      dataIndex: 'id',
      width: 150,
      render: (_text, record) => {
        return (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => goTo(`./edit-strategy/${record.id}`)}>
              {i18n.t('edit')}
            </span>
            <span
              className="table-operations-btn"
              onClick={() => {
                handleDeleteAlarm(record.id);
              }}
            >
              {i18n.t('delete')}
            </span>
            <Switch
              size="small"
              defaultChecked={record.enable}
              onChange={() => {
                toggleAlert({
                  id: record.id,
                  enable: !record.enable,
                }).then(() => {
                  getAlerts({ pageNo });
                });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="alarm-strategy">
      <div className="top-button-group">
        <Button
          type="primary"
          onClick={() => {
            goTo('./add-strategy');
          }}
        >
          {i18n.t('cmp:new strategy')}
        </Button>
      </div>
      <Spin spinning={getAlertsLoading || toggleAlertLoading}>
        <Table
          rowKey="id"
          columns={alertListColumns}
          dataSource={alertList}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            onChange: handlePageChange,
          }}
          scroll={{ x: '100%' }}
        />
      </Spin>
    </div>
  );
};
