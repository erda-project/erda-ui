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
import { useUpdate, CRUDStoreTable } from 'common';
import { Input, Select, Menu, Dropdown, Button } from 'app/nusi';
import { map } from 'lodash';
import { useMount } from 'react-use';
import cloudOSSStore from 'app/modules/dataCenter/stores/storage';
import i18n from 'i18n';
import cloudCommonStore from 'app/modules/dataCenter/stores/cloud-common';
import { addAuthTooltipTitle } from 'app/modules/dataCenter/common/cloud-common';
import { SetTagForm } from 'dataCenter/common/components/set-tag-form';
import {
  getCloudResourceTagsCol,
  getCloudResourceTimeCol,
  getCloudResourceRegionCol,
} from 'dataCenter/common/components/table-col';
import { DownOne as IconDownOne } from '@icon-park/react';

const { Option } = Select;

const ACL_CONST = [
  {
    name: i18n.t('dataCenter:private'),
    value: 'private',
  },
  {
    name: i18n.t('dataCenter:public read'),
    value: 'public-read',
  },
  {
    name: i18n.t('dataCenter:public read write'),
    value: 'public-read-write',
  },
];

export default () => {
  const { getCloudRegion } = cloudCommonStore;
  const [regions, cloudAccountExist] = cloudCommonStore.useStore((s) => [s.regions, s.cloudAccountExist]);
  const { addItem } = cloudOSSStore.effects;

  const [{ tagFormVis, items, ifSelected, stateChangeKey }, updater, update] = useUpdate({
    tagFormVis: false,
    items: [] as CLOUD.TagItem[],
    ifSelected: false,
    stateChangeKey: 1,
  });

  useMount(() => {
    getCloudRegion();
  });

  const getColumns = () => {
    return [
      {
        title: `Bucket ${i18n.t('name')}`,
        dataIndex: 'name',
      },
      getCloudResourceRegionCol('location'),
      getCloudResourceTagsCol(),
      getCloudResourceTimeCol(i18n.t('create time'), 'createDate'),
    ];
  };

  const getFieldsList = () => {
    return [
      {
        name: 'name',
        label: `Bucket ${i18n.t('name')}`,
      },
      {
        name: 'acl',
        label: i18n.t('dataCenter:read and write permissions'),
        type: 'select',
        options: ACL_CONST,
      },
      {
        name: 'region',
        label: i18n.t('region'),
        type: 'select',
        options: map(regions, ({ regionID, localName }) => ({ value: regionID, name: `${localName} (${regionID})` })),
      },
      {
        name: 'vendor',
        label: i18n.t('vender'),
        type: 'select',
        options: [{ name: i18n.t('aliyun'), value: 'aliyun' }],
      },
    ];
  };

  const checkSelect = (selectedRows: STORAGE.OSS[]) => {
    const newIfSelected = !!selectedRows.length;
    const newItems = selectedRows.map(({ vendor, location, name, tags }: STORAGE.OSS) => {
      const regionID = location;
      const currentVendor = vendor || 'alicloud';
      return {
        vendor: currentVendor,
        region: regionID,
        resourceID: name,
        oldTags: Object.keys(tags || {}),
      };
    });

    update({
      items: newItems,
      ifSelected: newIfSelected,
    });
    return newIfSelected;
  };
  const handleSelect = (selectedRowKeys: string, selectedRows: STORAGE.OSS[]) => {
    checkSelect(selectedRows);
  };

  const resetTable = () => {
    updater.stateChangeKey(stateChangeKey + 1);
    checkSelect([]);
  };
  const afterTagFormSubmit = () => {
    resetTable();
  };

  const filterConfig = React.useMemo(
    () => [
      {
        type: Input,
        name: 'name',
        customProps: {
          placeholder: i18n.t('dataCenter:please enter bucket name'),
          allowClear: true,
        },
      },
      {
        type: Select,
        name: 'vendor',
        customProps: {
          placeholder: i18n.t('dataCenter:please choose vendor'),
          options: [
            <Option key="aliyun" value="aliyun">
              {i18n.t('aliyun')}
            </Option>,
          ],
        },
      },
    ],
    [],
  );

  const handleFormSubmit = (data: STORAGE.OSS) => {
    const { name, acl, ...rest } = data;
    const requestData = { ...rest, buckets: [{ acl, name }], source: 'resource' };
    return addItem(requestData);
  };

  const operationButtons = [
    {
      name: `${i18n.t('set tags')}`,
      cb: () => updater.tagFormVis(true),
      ifDisabled: false,
    },
  ];

  const menu = (
    <Menu>
      {operationButtons.map((button) => (
        <Menu.Item disabled={button.ifDisabled} key={button.name} onClick={button.cb}>
          {button.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const extraOperation = () => (
    <Dropdown disabled={!ifSelected} overlay={menu}>
      <Button type="primary">
        {i18n.t('batch setting')}
        <IconDownOne className="ml4" theme="filled" size="16px" />
      </Button>
    </Dropdown>
  );

  return (
    <>
      <CRUDStoreTable<CLOUD_ACCOUNTS.Account>
        key={stateChangeKey}
        rowKey="name"
        name={i18n.t('storage')}
        getColumns={getColumns}
        store={cloudOSSStore}
        showTopAdd
        extraOperation={extraOperation}
        hasAddAuth={cloudAccountExist}
        addAuthTooltipTitle={addAuthTooltipTitle}
        handleFormSubmit={handleFormSubmit}
        getFieldsList={getFieldsList}
        filterConfig={filterConfig}
        tableProps={{
          rowSelection: {
            onChange: handleSelect,
          },
        }}
      />
      <SetTagForm
        items={items}
        visible={tagFormVis}
        resourceType="OSS"
        showProjectLabel
        showClustertLabel={false}
        onCancel={() => updater.tagFormVis(false)}
        afterSubmit={afterTagFormSubmit}
      />
    </>
  );
};
