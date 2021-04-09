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
import { Tabs, Button, Table, Alert, Icon, Tooltip } from 'nusi';
import { useUpdate, FormModal } from 'common';
import { useEffectOnce } from 'react-use';
import { map } from 'lodash';
import { getCloudResourceTimeCol, getRemarkCol, getCloudResourceTagsCol } from 'dataCenter/common/components/table-col';
import i18n from 'i18n';
import { SetTagForm } from 'dataCenter/common/components/set-tag-form';
import cloudServiceStore from 'dcos/stores/cloud-service';
import routeInfoStore from 'common/stores/route';
import { useLoading } from 'common/stores/loading';

const { TabPane } = Tabs;

const Group = () => {
  const MQGroupList = cloudServiceStore.useStore(s => s.MQGroupList);
  const { getMQGroupList, addMQGroup } = cloudServiceStore.effects;
  const { clearMQGroupList } = cloudServiceStore.reducers;
  const [mqID, query] = routeInfoStore.useStore(s => [s.params.mqID, s.query]);
  const [isFetching] = useLoading(cloudServiceStore, ['getMQGroupList']);

  const [{
    formVisible,
    setTagDisabled,
    tagFormVis,
    items,
    tagFormData,
    stateChangeKey,
    groupType,
  }, updater, update] = useUpdate({
    formVisible: false,
    setTagDisabled: true,
    tagFormVis: false,
    tagFormData: null,
    items: [] as CLOUD.TagItem[],
    stateChangeKey: 0,
    groupType: 'tcp',
  });

  useEffectOnce(() => {
    getList();
    return () => clearMQGroupList();
  });

  const getList = (_q: Obj = {}) => {
    getMQGroupList({
      ...query,
      instanceID: mqID,
      groupType,
      ..._q,
    });
  };

  const handleChangeTabs = (activeKey: string) => {
    updater.groupType(activeKey);
    getList({ groupType: activeKey });
  };

  const columns = [
    {
      title: 'Group ID',
      dataIndex: 'groupId',
      tip: true,
    },
    getCloudResourceTagsCol(),
    getCloudResourceTimeCol(),
    getRemarkCol(),
    {
      title: i18n.t('application:operation'),
      dataIndex: 'op',
      width: 100,
      render: (_v: any, record: CLOUD_SERVICE.IMQGroup) => {
        return (
          <div className="table-operations">
            <span
              className="table-operations-btn"
              onClick={() => {
                const { tags, groupId } = record;
                update({
                  tagFormVis: true,
                  tagFormData: {
                    projects: Object.keys(tags),
                  },
                  items: [{
                    vendor: 'alicloud',
                    region: query.region,
                    resourceID: groupId,
                    oldTags: Object.keys(tags),
                  }],
                });
              }}
            >
              {i18n.t('set tags')}
            </span>
          </div>
        );
      },
    },
  ];

  const allName = map(MQGroupList, 'groupId');
  const fieldsList = [
    {
      getComp: () => (
        <Alert
          message={
            <ul>
              <li>1. {i18n.t('dcos:group-ID-used-for')}</li>
              <li>2. {i18n.t('dcos:Group-ID-TCP-HTTP')}</li>
            </ul>
          }
          type="normal"
        />),
    },
    {
      label: (
        <span>
          Group ID&nbsp;
          <Tooltip title={i18n.t('dcos:GroupID-cannot-modified')}>
            <Icon type="question-circle-o" />
          </Tooltip>
        </span>
      ),
      name: 'groupID',
      initialValue: 'GID_',
      itemProps: {
        maxLength: 64,
      },
      rules: [
        { min: 7, max: 64, message: i18n.t('length is {min}~{max}', { min: 3, max: 64 }) },
        { pattern: /^[a-zA-z0-9_-]+$/, message: i18n.t('can only contain alphanumeric underscores and underscores') },
        {
          validator: (rule: any, value: string, callback: Function) => {
            if (allName.includes(value)) {
              callback(i18n.t('{name} already exist', { name: 'groupID' }));
            } else if (value.startsWith('GID_') || value.startsWith('GID-')) {
              callback();
            } else {
              callback(`${i18n.t('dcos:start-GID-or-GID')}`);
            }
          },
        },
      ],
    },
    {
      label: i18n.t('type'),
      name: 'groupType',
      type: 'select',
      initialValue: groupType,
      options: [
        { name: 'tcp', value: 'tcp' },
        { name: 'http', value: 'http' },
      ],
    },
    {
      label: i18n.t('application:remark'),
      name: 'remark',
      type: 'textArea',
      required: false,
      itemProps: {
        placeholder: i18n.t('please enter a description'),
        maxLength: 128,
        rows: 2,
      },
    },
  ];

  const checkSelect = (selectedRows: CLOUD_SERVICE.IMQGroup[]) => {
    selectedRows.length > 0 ? updater.setTagDisabled(false) : updater.setTagDisabled(true);

    const newItems = selectedRows.map(({ tags, groupId }): CLOUD.TagItem => {
      return {
        vendor: 'alicloud',
        region: query.region,
        resourceID: groupId,
        oldTags: Object.keys(tags),
      };
    });
    updater.items(newItems);
  };

  const handleSelect = (_: string[] | number[], selectedRows: CLOUD_SERVICE.IMQGroup[]) => {
    checkSelect(selectedRows);
  };

  const resetTable = () => {
    getList();
    updater.stateChangeKey(stateChangeKey + 1);
    checkSelect([]);
  };

  const afterTagFormSubmit = () => {
    resetTable();
  };

  const handleCreateGroup = (formRes: any) => {
    const form = {
      region: query.region,
      vendor: 'alicloud',
      instanceID: mqID,
      source: 'resource',
      groups: [formRes],
    };
    return addMQGroup(form).then(() => {
      getList();
      updater.formVisible(false);
    });
  };

  return (
    <div>
      <div className="text-right mb12">
        <Button type="primary" onClick={() => updater.formVisible(true)} className="mr8">
          {i18n.t('dcos:create Group ID')}
        </Button>
        <Button type="primary" disabled={setTagDisabled} onClick={() => updater.tagFormVis(true)}>
          {i18n.t('batch labeling')}
        </Button>
      </div>
      <Tabs
        defaultActiveKey="tcp"
        type="line"
        onChange={handleChangeTabs}
      >
        <TabPane tab={i18n.t('tcp protocol')} key="tcp" />
        <TabPane tab={i18n.t('microService:http protocol')} key="http" />
      </Tabs>
      <Table
        key={stateChangeKey}
        loading={isFetching}
        columns={columns}
        dataSource={MQGroupList}
        rowKey="groupId"
        tableKey="group-manage"
        rowSelection={{
          onChange: handleSelect,
        }}
      />
      <SetTagForm
        items={items}
        visible={tagFormVis}
        formData={tagFormData as any}
        showClustertLabel={false}
        showProjectLabel
        resourceType='ONS_GROUP'
        instanceID={mqID}
        onCancel={() => update({ tagFormVis: false, tagFormData: null })}
        afterSubmit={afterTagFormSubmit}
      />
      <FormModal
        title={i18n.t('dcos:create Group ID')}
        visible={formVisible}
        fieldsList={fieldsList}
        onCancel={() => updater.formVisible(false)}
        onOk={handleCreateGroup}
      />
    </div>
  );
};

export default Group;
