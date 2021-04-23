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

import * as React from 'react';
import { map, isEmpty, isNull, every, forEach, uniqueId, filter, find, findIndex, fill, cloneDeep } from 'lodash';
import moment from 'moment';
import { useMount } from 'react-use';
import { Modal, Button, Spin, Switch, Select, Table, Input, InputNumber, Popover, Divider, Tooltip } from 'app/nusi';
import { FormModal, useSwitch, useUpdate } from 'common';
import { goTo, insertWhen } from 'common/utils';
import { WrappedFormUtils, ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { useLoading } from 'app/common/stores/loading';
import notifyGroupStore from 'application/stores/notify-group';
import orgMemberStore from 'common/stores/org-member';
import projectMemberStore from 'common/stores/project-member';
import dataCenterAlarmStrategyStore from 'app/modules/dataCenter/stores/alarm-strategy';
import microServiceAlarmStrategyStore from 'app/modules/microService/monitor/monitor-alarm/stores/alarm-strategy';
import { notifyChannelOptionsMap, smsNotifyChannelOptionsMap, ListTargets } from 'application/pages/settings/components/app-notify/common-notify-group';
import { usePerm, WithAuth } from 'user/common';
import clusterStore from 'dataCenter/stores/cluster';
import orgStore from 'app/org-home/stores/org';
import './index.scss';

const { confirm, warning } = Modal;

enum ScopeType {
  ORG = 'org',
  PROJECT = 'project',
}

enum SilencePeriodType {
  FIXED = 'fixed',
  DOUBLED = 'doubled',
}

const SILENCE_PERIOD_POLICY_MAP = {
  [SilencePeriodType.FIXED]: i18n.t('org:fixed'),
  [SilencePeriodType.DOUBLED]: i18n.t('org:doubled'),
};

const alarmStrategyStoreMap = {
  [ScopeType.ORG]: dataCenterAlarmStrategyStore,
  [ScopeType.PROJECT]: microServiceAlarmStrategyStore,
};

const memberStoreMap = {
  [ScopeType.ORG]: orgMemberStore,
  [ScopeType.PROJECT]: projectMemberStore,
};

const notifyGroupPage = {
  [ScopeType.ORG]: goTo.pages.dataCenterNotifyGroup,
  [ScopeType.PROJECT]: goTo.pages.projectNotifyGroup,
};

interface IProps {
  scopeType: ScopeType.ORG | ScopeType.PROJECT;
  scopeId: string;
}

export default ({ scopeType, scopeId }: IProps) => {
  const memberStore = memberStoreMap[scopeType];
  const roleMap = memberStore.useStore(s => s.roleMap);
  const { getRoleMap } = memberStore.effects;
  const alarmStrategyStore = alarmStrategyStoreMap[scopeType];
  const [alertList, alarmPaging, alarmScopeMap, alertTypes] = alarmStrategyStore.useStore(s => [s.alertList, s.alarmPaging, s.alarmScopeMap, s.alertTypes]);
  const { total, pageNo, pageSize } = alarmPaging;
  const orgId = orgStore.getState(s => s.currentOrg.id);
  const [getAlertDetailLoading, getAlertsLoading, toggleAlertLoading] = useLoading(alarmStrategyStore, ['getAlertDetail', 'getAlerts', 'toggleAlert']);
  const { getAlerts, createAlert, editAlert, toggleAlert, deleteAlert, getAlertDetail, getAlarmScopes, getAlertTypes } = alarmStrategyStore.effects;
  const { getNotifyGroups } = notifyGroupStore.effects;
  const notifyGroups = notifyGroupStore.useStore(s => s.notifyGroups);
  const [modalVisible, openModal, closeModal] = useSwitch(false);

  const orgAddNotificationGroupAuth = usePerm(s => s.org.dataCenter.alarms.addNotificationGroup.pass);

  const { getSMSNotifyConfig } = clusterStore.effects;
  const enableMS = clusterStore.useStore(s => s.enableMS);
  const notifyChannelMap = enableMS ? smsNotifyChannelOptionsMap : notifyChannelOptionsMap;

  const addNotificationGroupAuth = scopeType === ScopeType.ORG ? orgAddNotificationGroupAuth : true; // 企业中心的添加通知组，需要验证权限，项目的暂无埋点

  const [state, updater, update] = useUpdate({
    editingRules: [] as any,
    editingFormRule: {},
    activedGroupId: undefined,
  });

  useMount(() => {
    getSMSNotifyConfig({ orgId });
    getAlerts();
    getAlarmScopes();
    getAlertTypes();
    getNotifyGroups({ scopeType, scopeId });
    getRoleMap({ scopeType, scopeId });
  });

  // 获取规则枚举
  const windows = React.useMemo(() => alertTypes.windows, [alertTypes.windows]);
  const silenceMap = React.useMemo(() => {
    const result = {};
    forEach(alertTypes.silence, (item) => {
      result[`${item.value}-${item.unit.key}`] = item.unit;
    });
    return result;
  }, [alertTypes.silence]);
  const operatorMap = React.useMemo(() => {
    const result = {};
    forEach(alertTypes.operators, (item) => {
      result[item.key] = item.display;
    });
    return result;
  }, [alertTypes.operators]);
  const aggregatorMap = React.useMemo(() => {
    const result = {};
    forEach(alertTypes.aggregator, (item) => {
      result[item.key] = item.display;
    });
    return result;
  }, [alertTypes.aggregator]);
  const [alertTypeRuleMap, allRuleFieldMap, allRuleMap, allRules] = React.useMemo(() => {
    const _alertTypeRuleMap = {};
    const _allRuleMap = {};
    const _allRuleFieldMap = {};
    let _allRules: any[] = [];
    forEach(alertTypes.alertTypeRules, ({ alertType, rules }) => {
      _alertTypeRuleMap[alertType.key] = rules;
      forEach(rules, item => {
        _allRuleMap[item.alertIndex.key] = item.alertIndex.display;
        forEach(item.functions, subItem => {
          _allRuleFieldMap[subItem.field.key] = subItem.field.display;
        });
      });
      _allRules = _allRules.concat(
        map(rules, ({ alertIndex, functions, ...rest }) => ({
          alertIndex: alertIndex.key,
          functions: map(functions, ({ field, ...subRest }) => ({ field: field.key, ...subRest })),
          ...rest,
        }))
      );
    });
    return [_alertTypeRuleMap, _allRuleFieldMap, _allRuleMap, _allRules];
  }, [alertTypes.alertTypeRules]);

  const getFunctionsValueElement = (item: any, functionIndex: number, key: string) => {
    let functionsValueElement = null;
    switch (typeof item.value) {
      case 'boolean':
        functionsValueElement = (
          <Switch
            checkedChildren="true"
            unCheckedChildren="false"
            defaultChecked={item.value}
            onClick={(v: boolean) => { handleEditEditingRuleField(key, functionIndex, { key: 'value', value: v }); }}
          />
        );
        break;
      case 'string':
        functionsValueElement = (
          <Input
            className="value"
            defaultValue={item.value}
            onChange={(e: any) => { handleEditEditingRuleField(key, functionIndex, { key: 'value', value: e.target.value }); }}
          />
        );
        break;
      case 'number':
        functionsValueElement = (
          <InputNumber
            className="value"
            min={0}
            defaultValue={item.value}
            onChange={(v: string | number | undefined) => { handleEditEditingRuleField(key, functionIndex, { key: 'value', value: Number(v) }); }}
          />
        );
        break;
      default:
        break;
    }
    return functionsValueElement;
  };

  const columns: Array<ColumnProps<COMMON_STRATEGY_NOTIFY.IFormRule>> = [
    {
      title: i18n.t('org:rule name'),
      dataIndex: 'alertIndex',
      render: (value: string, { key }) => (
        <Select
          value={value}
          onSelect={(alertIndex: any) => {
            const rules = cloneDeep(state.editingRules);
            const rule = find(allRules, { alertIndex });
            const index = findIndex(rules, { key });
            fill(rules, { key, ...rule }, index, index + 1);
            updater.editingRules(rules);
          }}
        >
          {map(allRules, ({ alertIndex }) => <Select.Option key={alertIndex} value={alertIndex}>{allRuleMap[alertIndex]}</Select.Option>)}
        </Select>
      ),
    },
    {
      title: `${i18n.t('org:duration')}(min)`,
      dataIndex: 'window',
      width: 130,
      render: (value: number, { key }: COMMON_STRATEGY_NOTIFY.IFormRule) => (
        <Select
          value={value}
          onSelect={(window: any) => handleEditEditingRule(key, { key: 'window', value: Number(window) })}
        >
          {map(windows, item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
        </Select>
      ),
    },
    {
      title: i18n.t('org:aggregation rules'),
      dataIndex: 'functions',
      width: 410,
      render: (functions: any[], { key }: COMMON_STRATEGY_NOTIFY.IFormRule) => (
        <div className="function-list">
          {
            map(functions, (item, index) => (
              <div className="function-item flex-box" key={item.field}>
                <Tooltip title={allRuleFieldMap[item.field]}>
                  <span className="field-name mr8 nowrap">{allRuleFieldMap[item.field]}</span>
                </Tooltip>
                <span className="aggregator mr8">{aggregatorMap[item.aggregator]}</span>
                {/* <Select
                  className="aggregator mr8"
                  defaultValue={item.aggregator}
                  disabled
                >
                  {map(aggregatorMap, (name, _key) => (<Select.Option key={_key} value={_key}>{name}</Select.Option>))}
                </Select> */}
                <Select
                  className="operator mr8"
                  defaultValue={item.operator}
                  onSelect={(value: any) => { handleEditEditingRuleField(key, index, { key: 'operator', value: String(value) }); }}
                >
                  {map(operatorMap, (name, _key) => (<Select.Option key={_key} value={_key}>{name}</Select.Option>))}
                </Select>
                {getFunctionsValueElement(item, index, key)}
              </div>
            ))
          }
        </div>
      ),
    },
    // {
    //   title: i18n.t('org:alarm after recovery'),
    //   dataIndex: 'isRecover',
    //   width: 105,
    //   render: (isRecover: boolean, { key }: COMMON_STRATEGY_NOTIFY.IFormRule) => <Switch checked={isRecover} onChange={checked => handleEditEditingRule(key, { key: 'isRecover', value: checked })} />,
    // },
    {
      title: i18n.t('operate'),
      width: 65,
      render: (record: COMMON_STRATEGY_NOTIFY.IFormRule) => {
        return (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => { handleRemoveEditingRule(record.key); }}>{i18n.t('delete')}</span>
          </div>
        );
      },
    },
  ];

  let fieldsList = [
    {
      label: i18n.t('org:alarm name'),
      name: 'name',
      itemProps: {
        disabled: !isEmpty(state.editingFormRule),
        maxLength: 50,
      },
      initialValue: state.editingFormRule.name,
    },
    {
      label: i18n.t('org:alarm rule'),
      name: 'expressions',
      required: false,
      getComp: () => (
        <>
          <div className="opportunity-header mb8">
            <Popover
              placement="bottomLeft"
              trigger="click"
              content={
                <div className="alarm-rule-collection">
                  {
                    map(alertTypes.alertTypeRules, item => (
                      <div
                        className="collection-item hover-active-bg"
                        key={item.alertType.key}
                        onClick={() => { handleClickAlertType(item.alertType.key); }}
                      >
                        {item.alertType.display}
                      </div>
                    ))
                  }
                </div>
              }
            >
              <Button className="mr8">{i18n.t('org:type template')}</Button>
            </Popover>
            <Button type="primary" ghost onClick={handleAddEditingRule}>
              {i18n.t('org:add rule')}
            </Button>
          </div>
          <Table
            bordered
            rowKey="key"
            className="opportunity-table"
            dataSource={state.editingRules}
            columns={columns}
          />
        </>
      ),
    },
    {
      label: i18n.t('org:silence period'),
      name: 'silence',
      initialValue: state.editingFormRule.notifies ? `${state.editingFormRule.notifies[0].silence.value}-${state.editingFormRule.notifies[0].silence.unit}` : undefined,
      type: 'select',
      options: map(silenceMap, ({ display }, value) => ({ name: `${value.split('-')[0]}${display}`, value })),
    },
    {
      label: i18n.t('silence period policy'),
      name: 'silencePolicy',
      initialValue: state.editingFormRule.notifies ? `${state.editingFormRule.notifies[0].silence.policy}` : SilencePeriodType.FIXED,
      type: 'radioGroup',
      options: map(SILENCE_PERIOD_POLICY_MAP, (name, value) => ({ name, value })),
    },
    {
      label: i18n.t('org:select group'),
      name: 'groupId',
      initialValue: state.activedGroupId,
      config: {
        valuePropType: 'array',
      },
      getComp: ({ form }: { form: WrappedFormUtils }) => {
        return (
          <Select
            onSelect={(id: any) => {
              form.setFieldsValue({ groupType: [], groupId: id });
              updater.activedGroupId(id);
            }}
            dropdownRender={menu => (
              <div>
                {menu}
                <Divider className="my4" />
                <div
                  className="fz12 px8 py4 color-text-desc"
                  onMouseDown={e => e.preventDefault()}
                >
                  <WithAuth pass={addNotificationGroupAuth} >
                    <span className="hover-active" onClick={() => { goTo(notifyGroupPage[scopeType], { projectId: scopeId }); }}>{i18n.t('org:add more notification groups')}</span>
                  </WithAuth>
                </div>
              </div>
            )}
          >
            {map(notifyGroups, ({ id, name }) => <Select.Option key={id} value={id}>{name}</Select.Option>)}
          </Select>
        );
      },
    },
  ];

  if (scopeType === ScopeType.ORG) {
    fieldsList.splice(1, 0, {
      label: i18n.t('org:alarm cluster'),
      name: 'clusterName',
      type: 'select',
      initialValue: state.editingFormRule.clusterName,
      options: map(alarmScopeMap, (name, id) => ({ name, value: id })),
      itemProps: {
        mode: 'multiple',
      },
    });
  }

  if (scopeType === ScopeType.PROJECT) {
    fieldsList.splice(1, 0, {
      label: i18n.t('application'),
      name: 'appId',
      type: 'select',
      initialValue: state.editingFormRule.appId,
      options: map(alarmScopeMap, (name, id) => ({ name, value: id })),
      itemProps: {
        mode: 'multiple',
      },
    },);
  }

  if (state.activedGroupId) {
    const activedGroup = find(notifyGroups, ({ id }) => id === state.activedGroupId);

    fieldsList = [...fieldsList, {
      name: 'groupType',
      label: i18n.t('application:method to inform'),
      required: true,
      type: 'select',
      initialValue: state.editingFormRule.notifies ? state.editingFormRule.notifies[0].groupType.split(',') : [],
      options: (activedGroup && notifyChannelMap[activedGroup.targets[0].type]) || [],
      itemProps: {
        mode: 'multiple',
      },
    }];
  }

  // 添加集合的规则
  const handleClickAlertType = (val: string) => {
    const formRules: COMMON_STRATEGY_NOTIFY.IFormRule[] = map(alertTypeRuleMap[val], (rule: COMMON_STRATEGY_NOTIFY.IDataExpression) => ({
      key: uniqueId(),
      alertIndex: rule.alertIndex.key,
      window: rule.window,
      functions: map(rule.functions, ({ field, ...rest }) => ({
        field: field.key,
        ...rest,
      })),
      isRecover: rule.isRecover,
    }));
    updater.editingRules([
      ...formRules,
      ...state.editingRules,
    ]);
  };

  // 添加单条规则
  const handleAddEditingRule = () => {
    updater.editingRules([
      {
        key: uniqueId(),
        ...allRules[0],
      },
      ...state.editingRules,
    ]);
  };

  // 移除表格编辑中的规则
  const handleRemoveEditingRule = (key: string) => {
    updater.editingRules(filter(state.editingRules, item => item.key !== key));
  };

  // 编辑单条规则
  const handleEditEditingRule = (key: string, item: { key: string; value: any; }) => {
    const rules = cloneDeep(state.editingRules);
    const rule = find(rules, { key });
    const index = findIndex(rules, { key });

    fill(rules, { key, ...rule, [item.key]: item.value }, index, index + 1);
    updater.editingRules(rules);
  };

  // 编辑单条规则下的指标
  const handleEditEditingRuleField = (key: string, index: number, item: { key: string; value: any; }) => {
    const rules = cloneDeep(state.editingRules);
    const { functions } = find(rules, { key });
    const functionItem = functions[index];

    fill(functions, { ...functionItem, [item.key]: item.value }, index, index + 1);
    handleEditEditingRule(key, { key: 'functions', value: functions });
  };

  const handleDeleteAlarm = (id: number) => {
    confirm({
      title: i18n.t('application:are you sure you want to delete this item?'),
      content: i18n.t('application:the notification will be permanently deleted'),
      onOk() {
        deleteAlert(id);
      },
    });
  };

  const handleEditALarm = (id: number) => {
    openModal();
    getAlertDetail(id).then(({ name, clusterNames, appIds, rules, notifies }: any) => {
      updater.editingFormRule({
        id,
        name,
        clusterName: clusterNames || [],
        appId: appIds || [],
        notifies,
      });
      updater.editingRules(map(rules, rule => ({ key: uniqueId(), ...rule })));
      updater.activedGroupId(notifies[0].groupId);
    });
  };

  const handleAddAlarm = (param: any) => {
    const { name, clusterName, appId, groupId, groupType, silence, silencePolicy } = param;
    const payload: COMMON_STRATEGY_NOTIFY.IAlertBody = {
      name,
      clusterNames: clusterName,
      appIds: appId,
      domain: location.origin,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rules: map(state.editingRules, ({ key, ...rest }) => rest),
      notifies: [
        {
          silence: { value: Number(silence.split('-')[0]), unit: silenceMap[silence].key, policy: silencePolicy },
          type: 'notify_group',
          groupId,
          groupType: groupType.join(','),
        },
      ],
    };
    if (!isEmpty(state.editingFormRule)) {
      editAlert({ body: payload, id: state.editingFormRule.id });
    } else {
      createAlert(payload);
    }
    handleCloseModal();
  };

  const beforeSubmit = async (param: any) => {
    if (isEmpty(state.editingRules)) {
      warning({
        title: i18n.t('org:create at least one rule'),
      });
      return null;
    }
    const isLegalFunctions = every(state.editingRules, ({ functions }) => {
      return every(functions, ({ value }) => {
        return !(isNull(value) || value === '');
      });
    });
    if (!isLegalFunctions) {
      warning({
        title: i18n.t('org:rule value cannot be empty'),
      });
      return null;
    }
    return param;
  };

  const handlePageChange = (no: number) => {
    getAlerts({ pageNo: no });
  };

  const handleCloseModal = () => {
    update({
      editingRules: [],
      editingFormRule: {},
      activedGroupId: undefined,
    });
    closeModal();
  };

  const alartListColumns: Array<ColumnProps<COMMON_STRATEGY_NOTIFY.IAlert>> = [
    {
      title: i18n.t('org:alarm name'),
      dataIndex: 'name',
    },
    ...insertWhen(scopeType === ScopeType.ORG, [{
      title: i18n.t('org:cluster'),
      dataIndex: 'clusterNames',
      width: 200,
      render: (clusterNames: string[]) => map(clusterNames, clusterName => (alarmScopeMap[clusterName])).join(),
    }]),
    ...insertWhen(scopeType === ScopeType.PROJECT, [{
      title: i18n.t('application'),
      dataIndex: 'appIds',
      width: 200,
      render: (appIds: string[]) => map(appIds, appId => (alarmScopeMap[appId])).join(),
    }]),
    {
      title: i18n.t('default:notification target'),
      dataIndex: 'notifies[0].notifyGroup',
      width: 250,
      className: 'notify-info',
      render: (notifyGroup: COMMON_STRATEGY_NOTIFY.INotifyGroup) => {
        const tips = i18n.t('org:notification group does not exist or has been removed, replaceable notification group');
        return (
          <div className="flex-box">
            {
              isEmpty(notifyGroup) ? <Tooltip title={tips}><span className="color-text-sub">{tips}</span></Tooltip> : <ListTargets targets={notifyGroup.targets} roleMap={roleMap} />
            }
          </div>
        );
      },
    },
    {
      title: i18n.t('default:create time'),
      dataIndex: 'createTime',
      width: 180,
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('default:operation'),
      dataIndex: 'id',
      width: 150,
      render: (_text, record) => {
        return (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => handleEditALarm(record.id)}>{i18n.t('application:edit')}</span>
            <span className="table-operations-btn" onClick={() => { handleDeleteAlarm(record.id); }}>{i18n.t('application:delete')}</span>
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
        <Button type="primary" onClick={() => { openModal(); }}>{i18n.t('org:new strategy')}</Button>
        <FormModal
          loading={getAlertDetailLoading}
          width={1000}
          visible={modalVisible}
          onCancel={handleCloseModal}
          title={isEmpty(state.editingFormRule) ? i18n.t('org:new strategy') : i18n.t('org:edit strategy')}
          fieldsList={fieldsList}
          modalProps={{ destroyOnClose: true }}
          onOk={handleAddAlarm}
          beforeSubmit={beforeSubmit}
        />
      </div>
      <Spin spinning={getAlertsLoading || toggleAlertLoading}>
        <Table
          tableKey="alarm-strategy"
          rowKey='id'
          columns={alartListColumns}
          dataSource={alertList}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            onChange: handlePageChange,
          }}
        />
      </Spin>
    </div>
  );
};
