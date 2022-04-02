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
import { debounce, map } from 'lodash';
import moment from 'moment';
import { useMount, useUnmount, useUpdateEffect } from 'react-use';
import { Button, Dropdown, Input, Menu, Modal, Spin, Tooltip } from 'antd';
import { Badge, ErdaIcon, UserInfo } from 'common';
import ErdaTable, { IProps as TableProps } from 'common/components/table';
import { goTo } from 'common/utils';
import { ColumnProps } from 'app/interface/common';
import i18n from 'i18n';
import { useLoading } from 'core/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';
import orgMemberStore from 'common/stores/org-member';
import projectMemberStore from 'common/stores/project-member';
import cmpAlarmStrategyStore from 'app/modules/cmp/stores/alarm-strategy';
import mspAlarmStrategyStore from 'app/modules/msp/alarm-manage/alarm-strategy/stores/alarm-strategy';
import { IActions } from 'app/common/components/table/interface';
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

const AlarmStrategyList = ({ scopeType, scopeId, commonPayload }: IProps) => {
  const memberStore = memberStoreMap[scopeType];
  const { getRoleMap } = memberStore.effects;
  const alarmStrategyStore = alarmStrategyStoreMap[scopeType];
  const [alertList, alarmPaging] = alarmStrategyStore.useStore((s) => [s.alertList, s.alarmPaging]);
  const { total, pageNo, pageSize } = alarmPaging;
  const [getAlertsLoading, toggleAlertLoading] = useLoading(alarmStrategyStore, ['getAlerts', 'toggleAlert']);
  const { getAlerts, toggleAlert, deleteAlert, getAlarmScopes, getAlertTypes, getAlertTriggerConditions } =
    alarmStrategyStore.effects;
  const { clearAlerts } = alarmStrategyStore.reducers;
  const { getNotifyGroups } = notifyGroupStore.effects;
  const [searchValue, setSearchValue] = React.useState('');

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

  useUpdateEffect(() => {
    getAlerts({ name: searchValue });
  }, [searchValue]);

  useUnmount(() => {
    clearAlerts();
  });

  const handleDeleteAlarm = (id: number) => {
    confirm({
      title: i18n.t('dop:are you sure you want to delete this item?'),
      content: i18n.t('dop:the alarm strategy will be permanently deleted'),
      onOk() {
        deleteAlert(id);
      },
    });
  };

  const handlePageChange: TableProps<COMMON_STRATEGY_NOTIFY.IAlert>['onChange'] = (
    paging,
    _filters,
    _sorter,
    extra,
  ) => {
    const { current, pageSize: size } = paging;
    if (extra.action === 'paginate') {
      getAlerts({ pageNo: current, pageSize: size, name: searchValue });
    }
  };

  const handleEnableStrategy = (enable: string, record: COMMON_STRATEGY_NOTIFY.IAlert) => {
    toggleAlert({
      id: record.id,
      enable: enable === 'enable',
    }).then(() => {
      getAlerts({ pageNo, name: searchValue });
    });
  };

  const alertListColumns: Array<ColumnProps<COMMON_STRATEGY_NOTIFY.IAlert>> = [
    {
      title: i18n.t('cmp:alarm name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('status'),
      dataIndex: 'enable',
      render: (enable, record) => (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu
              onClick={(e) => {
                handleEnableStrategy(e.key, record);
              }}
            >
              <Menu.Item key="enable">
                <Badge text={i18n.t('Enable')} status="success" />
              </Menu.Item>
              <Menu.Item key="unable">
                <Badge text={i18n.t('unable')} status="default" />
              </Menu.Item>
            </Menu>
          }
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center justify-between px-2 cursor-pointer absolute top-0 left-0 bottom-0 right-0 hover:bg-default-04"
          >
            <Badge text={enable ? i18n.t('Enable') : i18n.t('unable')} status={enable ? 'success' : 'default'} />
            <ErdaIcon type="caret-down" size={20} fill="black-3" className="opacity-0 group-hover:opacity-100" />
          </div>
        </Dropdown>
      ),
    },
    {
      title: i18n.t('Rule'),
      dataIndex: 'ruleCount',
    },
    {
      title: i18n.t('default:Notification target'),
      dataIndex: 'notifies',
      className: 'notify-info',
      ellipsis: true,
      render: (notifies: COMMON_STRATEGY_NOTIFY.INotifyGroupNotify[]) => {
        const tips = i18n.t('cmp:Notification group does not exist or has been remove. Please change one.');
        if (notifies?.length && notifies[0].notifyGroup?.name) {
          const groupNames = map(notifies, (item) => item.notifyGroup?.name).join(', ');
          const groupLength = notifies.length;
          return `${groupNames} ${i18n.t('cmp:and {length} others', { length: groupLength })}`;
        }
        return (
          <div className="flex-div flex">
            <Tooltip title={tips}>
              <span className="text-sub">{tips}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: i18n.t('Creator'),
      dataIndex: 'creator',
      render: (text: string) => <UserInfo id={text} />,
    },
    {
      title: i18n.t('default:create time'),
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const actions: IActions<COMMON_STRATEGY_NOTIFY.IAlert> = {
    render: (record: COMMON_STRATEGY_NOTIFY.IAlert) => renderMenu(record),
  };

  const renderMenu = (record: COMMON_STRATEGY_NOTIFY.IAlert) => {
    const { editStrategy, deleteStrategy } = {
      editStrategy: {
        title: i18n.t('Edit'),
        onClick: () => {
          goTo(`./edit-strategy/${record.id}`);
        },
      },
      deleteStrategy: {
        title: i18n.t('delete'),
        onClick: () => {
          handleDeleteAlarm(record.id);
        },
      },
    };

    return [editStrategy, deleteStrategy];
  };

  const handleChange = React.useCallback(
    debounce((value) => {
      setSearchValue(value);
    }, 1000),
    [],
  );

  return (
    <div className="alarm-strategy">
      <div className="top-button-group">
        <Button
          type="primary"
          onClick={() => {
            goTo('./add-strategy');
          }}
        >
          {i18n.t('cmp:Add')}
        </Button>
      </div>
      <Spin spinning={getAlertsLoading || toggleAlertLoading}>
        <ErdaTable
          rowKey="id"
          columns={alertListColumns}
          dataSource={alertList}
          actions={actions}
          pagination={{
            current: pageNo,
            pageSize,
            total,
          }}
          slot={
            <Input
              size="small"
              className="w-[200px] bg-black-06 border-none ml-0.5"
              allowClear
              prefix={<ErdaIcon size="16" fill={'default-3'} type="search" />}
              onChange={(e) => {
                handleChange(e.target.value);
              }}
              placeholder={i18n.t('search {name}', { name: i18n.t('Name') })}
            />
          }
          onChange={handlePageChange}
        />
      </Spin>
    </div>
  );
};

export default AlarmStrategyList;
