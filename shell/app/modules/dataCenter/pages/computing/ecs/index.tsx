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
import { Select, Input, Tooltip, Dropdown, Icon, Menu, Button, Alert } from 'nusi';
import { useMount, useEffectOnce } from 'react-use';
import { map, keys, get } from 'lodash';
import { insertWhen } from 'common/utils';
import cloudECSStore from 'app/modules/dataCenter/stores/computing';
import clusterStore from 'dataCenter/stores/cluster';
import { SetTagForm } from 'dataCenter/common/components/set-tag-form';
import { CRUDStoreTable, TagsColumn, useUpdate } from 'common';
import { EcsCloudOperationForm } from './ecsCloud-operation-form';
import cloudCommonStore from 'app/modules/dataCenter/stores/cloud-common';
import i18n from 'i18n';
import { RUNNING_STATUS_LIST, STOP_STATUS_LIST } from '../../cloud-source/config';
import { chargeTypeMap } from 'dataCenter/pages/cluster-manage/config';
import { customTagColor } from 'dcos/common/config';
import { getCloudResourceStatusCol, getCloudResourceChargeTypeCol, getCloudResourceRegionCol } from 'dataCenter/common/components/table-col';

const { Option } = Select;

const opHint = (operation: string, selectedList: CLOUD.TagItem[]) => {
  const menu = (
    <Menu>
      {
        selectedList.map(item => (
          <Menu.Item key={item.instanceID}>{item.instanceID}</Menu.Item>
        ))
      }
    </Menu>
  );
  return (
    <div>
      <Icon className="mr4 bg-color-icon yellow" type="question-circle" />
      <span>{i18n.t('dataCenter:your chosen')}</span>
      <Dropdown overlay={menu}>
        <a onClick={e => e.preventDefault()}>
          {i18n.t('{num} {type}', { num: selectedList.length, type: i18n.t('instance') })}
          <Icon className="ml4" type="caret-down" />
        </a>
      </Dropdown>
      <span>{i18n.t('dataCenter:will execute {operation} operation', { operation })}，{i18n.t('is it confirmed {action}?', { action: i18n.t('execute') })}</span>
    </div>);
};

export default () => {
  const { getCloudRegion } = cloudCommonStore;
  const { stopCloudECS, startCloudECS, restartCloudECS, renewalCloudECS } = cloudECSStore.effects;
  const regions = cloudCommonStore.useStore(s => s.regions);
  const clusterList = clusterStore.useStore(s => s.list);

  useEffectOnce(() => {
    !clusterList.length && clusterStore.effects.getClusterList();
  });

  const [{
    activeOp,
    ifSetTagFormVisible,
    stateChangeKey,
    selectedList,
    ifSelected,
    ifSelectedAllStop,
    ifSelectedAllRunning,
    ifSelectedAllPrePaid,
    showRenewalTime,
  }, updater, update] = useUpdate({
    activeOp: '',
    ifSetTagFormVisible: false,
    stateChangeKey: 1,
    selectedList: [],
    ifSelected: false,
    ifSelectedAllStop: false,
    ifSelectedAllRunning: false,
    ifSelectedAllPrePaid: false,
    showRenewalTime: false,
  });

  useMount(() => {
    getCloudRegion();
  });

  const getColumns = () => {
    return [
      {
        title: 'IP',
        dataIndex: 'innerIpAddress',
        width: 110,
      },
      { // cup + memory
        title: i18n.t('specification'),
        dataIndex: 'cpu',
        width: 120,
        render: (_v: string, record: COMPUTING.ECS) => (`${_v} ${i18n.t('core')} / ${record.memory}M`),
      },
      {
        title: i18n.t('tag'),
        dataIndex: 'tag',
        align: 'left',
        render: (value: Obj) => {
          const keyArray = keys(value);
          return (<TagsColumn labels={keyArray.map((key) => {
            const label = get(key.split('/'), 1, '');
            return { label, color: customTagColor[label] };
          })}
          />);
        },
      },
      getCloudResourceRegionCol(),
      getCloudResourceStatusCol('ecs'),
      {
        title: i18n.t('vender'),
        dataIndex: 'vendor',
        width: 80,
        render: (value: string) => (value === 'aliyun' ? i18n.t('aliyun') : value),
      },
      {
        title: i18n.t('dataCenter:operating system'),
        dataIndex: 'osName',
        width: 140,
        render: (_v: string) => (
          <Tooltip title={_v}>
            {_v}
          </Tooltip>
        ),
      },
      getCloudResourceChargeTypeCol(),
    ];
  };

  const initButtonSelected = () => {
    update({
      ifSelectedAllPrePaid: true,
      ifSelectedAllRunning: true,
      ifSelectedAllStop: true,
    });
  };
  const checkSelectPrePaid = (select: COMPUTING.ECS) => {
    if (select.chargeType === chargeTypeMap.PrePaid.value) return;
    updater.ifSelectedAllPrePaid(false);
  };
  const checkSelectRunning = (select: COMPUTING.ECS) => {
    const status = select.status?.toLocaleLowerCase();
    const ifRunning = RUNNING_STATUS_LIST.includes(status);
    if (ifRunning) return;
    updater.ifSelectedAllRunning(false);
  };
  const checkSelectStop = (select: COMPUTING.ECS) => {
    const status = select.status?.toLocaleLowerCase();
    const ifStop = STOP_STATUS_LIST.includes(status);
    if (ifStop) return;
    updater.ifSelectedAllStop(false);
  };
  const checkSelect = (selectedRows: COMPUTING.ECS[]) => {
    const newIfSelected = !!selectedRows.length;

    initButtonSelected();
    selectedRows.forEach((select: COMPUTING.ECS) => {
      checkSelectStop(select);
      checkSelectRunning(select);
      checkSelectPrePaid(select);
    });
    const newSelectedList = selectedRows.map((item: COMPUTING.ECS) => ({
      region: item.regionID,
      vendor: item.vendor,
      resourceID: item.id,
      instanceID: item.innerIpAddress,
      oldTags: Object.keys(item.tag),
    } as CLOUD.TagItem));
    update({
      selectedList: newSelectedList,
      ifSelected: newIfSelected,
    });
    return newIfSelected;
  };
  const handleSelect = (selectedRowKeys: string, selectedRows: COMPUTING.ECS[]) => {
    checkSelect(selectedRows);
  };

  const filterConfig = React.useMemo(() => [
    {
      type: Input,
      name: 'innerIpAddress',
      customProps: {
        placeholder: i18n.t('dataCenter:please enter IP'),
        allowClear: true,
      },
    },
    {
      type: Select,
      name: 'region',
      customProps: {
        placeholder: i18n.t('dataCenter:please choose region'),
        options: map(regions, ({ regionID, localName }) => (<Option key={regionID} value={regionID}>{`${localName} (${regionID})`}</Option>)),
      },
    },
    {
      type: Select,
      name: 'vendor',
      customProps: {
        placeholder: i18n.t('dataCenter:please choose vendor'),
        options: [<Option key="aliyun" value="aliyun">{i18n.t('aliyun')}</Option>],
      },
    },
    {
      type: Select,
      name: 'cluster',
      customProps: {
        placeholder: i18n.t('please select labels'),
        allowClear: true,
        options: () => {
          return map(clusterList, item => <Option key={item.name} value={item.name}>{`dice-cluster/${item.name}`}</Option>);
        },
      },
    },
  ], [clusterList, regions]);

  const operationButtons = [{
    name: i18n.t('dataCenter:start up'),
    cb: () => { updater.activeOp('start'); },
    ifDisabled: !ifSelectedAllStop,
  }, {
    name: i18n.t('dataCenter:stop'),
    cb: () => { updater.activeOp('stop'); },
    ifDisabled: !ifSelectedAllRunning,
  }, {
    name: i18n.t('dataCenter:reboot'),
    cb: () => { updater.activeOp('reboot'); },
    ifDisabled: !ifSelectedAllRunning,
  }, {
    name: i18n.t('dataCenter:configure automatic renewal'),
    cb: () => { updater.activeOp('renewal'); },
    ifDisabled: !ifSelectedAllPrePaid,
  }, {
    name: `${i18n.t('set tags')}`,
    cb: () => updater.ifSetTagFormVisible(true),
    ifDisabled: false,
  }];

  const ecsOpStrategies = {
    reboot: {
      operation: i18n.t('{specific} instance', { specific: i18n.t('dataCenter:reboot') }),
      handle: (formData: COMPUTING.ECSActionReq) => {
        restartCloudECS(formData).then(() => {
          resetTable();
        });
        updater.activeOp('');
      },
      close: () => { updater.activeOp(''); },
      fieldList: [
        {
          getComp: () => opHint(i18n.t('dataCenter:reboot'), selectedList),
        },
      ],
    },
    start: {
      operation: i18n.t('{specific} instance', { specific: i18n.t('dataCenter:start up') }),
      handle: (formData: COMPUTING.ECSActionReq) => {
        startCloudECS(formData).then(() => {
          resetTable();
        });
        updater.activeOp('');
      },
      close: () => { updater.activeOp(''); },
      fieldList: [
        {
          getComp: () => opHint(i18n.t('dataCenter:start up'), selectedList),
        },
      ],
    },
    stop: {
      operation: i18n.t('{specific} instance', { specific: i18n.t('dataCenter:stop') }),
      handle: (formData: COMPUTING.ECSActionReq) => {
        stopCloudECS(formData).then(() => {
          resetTable();
        });
        updater.activeOp('');
      },
      close: () => { updater.activeOp(''); },
      fieldList: [
        {
          getComp: () => opHint(i18n.t('dataCenter:stop'), selectedList),
        },
      ],
      content: (<Alert
        message={
          <>
            <p>{i18n.t('dataCenter:instance-stopped-expiration-not-changed')}</p>
            <p>{i18n.t('dataCenter:instance-stopped-still-charged')}</p>
          </>}
        type="warning"
      />),
    },
    renewal: {
      operation: i18n.t('dataCenter:configure automatic renewal'),
      handle: (formData: COMPUTING.ECSActionReq) => {
        renewalCloudECS(formData).then(() => {
          resetTable();
        });
        updater.activeOp('');
      },
      close: () => { updater.activeOp(''); },
      fieldList: [
        {
          getComp: () => (
            <Alert
              message={
                <>
                  <div className="text-left second-title">{i18n.t('dataCenter:tips')}</div>
                  <ul className="text-left bold-400 fz14 pl12">
                    <li>● {i18n.t('dataCenter:after-success-renew')}</li>
                    <li>● {i18n.t('dataCenter:keep-money-enough')}</li>
                    <li>● {i18n.t('dataCenter:artificial-renewal-change-time')}</li>
                    <li>● {i18n.t('dataCenter:support cash and vouchers deduction')}{i18n.t('dataCenter:if you set up automatic renewal today, the automatic deduction will start tomorrow')}{i18n.t('dataCenter:if your instance will expire tomorrow, please choose manual renewal')}</li>
                  </ul>
                </>
              }
              type="normal"
            />),
        },
        {
          label: i18n.t('resource:whether to renew automatically'),
          name: 'switch',
          required: false,
          type: 'switch',
          initialValue: showRenewalTime,
          itemProps: {
            onChange(val: boolean) {
              updater.showRenewalTime(val);
            },
          },
        },
        ...insertWhen(showRenewalTime, [
          {
            label: i18n.t('dataCenter:{action} renewal time', { action: '' }),
            name: 'duration',
            type: 'select',
            required: showRenewalTime,
            itemProps: {
              placeholder: i18n.t('dataCenter:{action} renewal time', { action: i18n.t('please select') }),
            },
            options: [1, 2, 3, 6, 12, 24, 36, 48, 60].map((_v: number) => {
              const time = _v;
              if (time <= 12) {
                return { value: time, name: `${time} ${i18n.t('months')}` };
              }
              const year = time / 12;
              const month = time % 12;
              if (month === 0) {
                return { value: time, name: i18n.t('{num} years', { num: year }) };
              }
              return { value: time, name: i18n.t('{num} months', { num: month }) };
            }),
          },
        ]),
      ],
    },
  };

  const resetTable = () => {
    updater.stateChangeKey(stateChangeKey + 1);
    checkSelect([]);
  };

  const afterTagFormSubmit = () => {
    resetTable();
  };

  const menu = (
    <Menu>
      {
        operationButtons.map(button => (
          <Menu.Item disabled={button.ifDisabled} key={button.name} onClick={button.cb}>{button.name}</Menu.Item>
        ))
      }
    </Menu>
  );

  return (
    <>
      <div className="top-button-group">
        <Dropdown disabled={!ifSelected} overlay={menu}>
          <Button type="primary">
            {i18n.t('batch setting')}
            <Icon className="ml4" type="caret-down" />
          </Button>
        </Dropdown>
      </div>
      <CRUDStoreTable<COMPUTING.ECS>
        key={stateChangeKey}
        rowKey="id"
        filterConfig={filterConfig}
        getColumns={getColumns}
        store={cloudECSStore}
        tableProps={{
          rowSelection: {
            onChange: handleSelect,
          },
        }}
      />
      <EcsCloudOperationForm
        title={ecsOpStrategies[activeOp]?.operation || ''}
        content={ecsOpStrategies[activeOp]?.content}
        formData={{ selectedList }}
        visible={!!activeOp.length}
        fieldList={ecsOpStrategies[activeOp]?.fieldList || []}
        onSubmit={ecsOpStrategies[activeOp]?.handle}
        onClose={ecsOpStrategies[activeOp]?.close}
      />
      <SetTagForm
        visible={ifSetTagFormVisible}
        items={selectedList}
        onCancel={() => updater.ifSetTagFormVisible(false)}
        resourceType="ECS"
        afterSubmit={afterTagFormSubmit}
      />
    </>
  );
};
