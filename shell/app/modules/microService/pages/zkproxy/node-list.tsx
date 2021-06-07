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
import { Card, Button, Table, Modal } from 'app/nusi';
import { isEmpty, map, find, get } from 'lodash';
import { useMount } from 'react-use';
import classnames from 'classnames';
import { Holder, useUpdate, useFormModal } from 'common';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';
import zkproxyStore from '../../stores/zkproxy';
import microServiceInfoStore from 'app/modules/microService/stores/info';
import { PAGINATION } from 'app/constants';

import './node-list.scss';

const columns: Array<ColumnProps<object>> = [
  {
    title: i18n.t('microService:interface name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: i18n.t('microService:weight'),
    dataIndex: 'weight',
    key: 'weight',
    width: 200,
  },
];

const batchOptionsMap = {
  half: i18n.t('microService:batch half weight'),
  custom: i18n.t('microService:batch custom weight'),
  off: i18n.t('microService:batch disable weight'),
  on: i18n.t('microService:batch full weight'),
};

const fieldsList = [
  {
    label: i18n.t('microService:weight'),
    name: 'weight',
    type: 'inputNumber',
    itemProps: {
      min: 0,
      max: 100,
      precision: 0,
    },
  },
];

const NodeList = () => {
  const nodeData = zkproxyStore.useStore((s) => s.nodeData);
  const infoList = microServiceInfoStore.useStore((s) => s.infoList);
  const { getNodeList, updateNodeRule } = zkproxyStore.effects;
  const { getMSComponentInfo } = microServiceInfoStore.effects;
  const [state, updater, update] = useUpdate({
    activeNode: '',
    selectedRowKeys: [],
    tenantid: undefined,
  });
  const dataSource = (find(nodeData.node, ({ address }) => state.activeNode === address) || {}).rule;
  const withSelectKeysDataSource = map(dataSource, (item) => ({ ...item, key: item.name }));
  const isSelected = !isEmpty(state.selectedRowKeys);
  const [FormModal, toggle] = useFormModal();

  useMount(() => {
    getNodeList();
    getMSComponentInfo();
  });

  React.useEffect(() => {
    if (!state.activeNode && !isEmpty(nodeData.node)) {
      updater.activeNode(nodeData.node[0].address);
    }
  }, [nodeData, state.activeNode, updater]);

  React.useEffect(() => {
    const info = find(infoList, (item) => item.addonName === 'registercenter');
    if (info && get(info, 'config.DUBBO_TENANT_ID')) {
      updater.tenantid(get(info, 'config.DUBBO_TENANT_ID'));
    }
  }, [infoList, updater]);

  const handleToggleNode = (node: string) => {
    update({
      activeNode: node,
      selectedRowKeys: [],
    });
  };

  const handleBatchOption = (type: string) => {
    let weight = 0;

    if (type === 'custom') {
      toggle(true);
      return;
    }

    switch (type) {
      case 'half':
        weight = 50;
        break;
      case 'off':
        weight = 0;
        break;
      case 'on':
        weight = 100;
        break;
      case 'custom':
        weight = 1;
        break;
      default:
        break;
    }

    Modal.confirm({
      title: batchOptionsMap[type],
      content: `${i18n.t('microService:The selected interface weight will be set to')} ${weight}`,
      onOk: () => { handleUpdateNodeRule({ weight }); },
    });
  };

  const handleUpdateNodeRule = ({ weight }: { weight: number }) => {
    updateNodeRule({
      host: state.activeNode,
      ruleData: {
        address: state.activeNode,
        rule: map(state.selectedRowKeys, (name) => ({
          name,
          weight,
        })),
      },
      tenantid: state.tenantid,
    });
    toggle(false);
    getNodeList();
  };

  const handleSelectChange = (selectedRowKeys: any[]) => {
    updater.selectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: state.selectedRowKeys,
    onChange: handleSelectChange,
    hideDefaultSelections: true,
    selections: [
      {
        key: 'all-data',
        text: i18n.t('microService:select all'),
        onSelect: () => {
          updater.selectedRowKeys(map(withSelectKeysDataSource, ({ key }) => key));
        },
      },
      {
        key: 'all-no-data',
        text: i18n.t('microService:cancel all'),
        onSelect: () => {
          updater.selectedRowKeys([]);
        },
      },
    ],
  };

  return (
    <div className="node-list-container">
      <div className="host-list mr16">
        <Card>
          <p className="mb12 bold-500">{i18n.t('microService:node list')}</p>
          <div className="host-list-content">
            <Holder when={isEmpty(nodeData.node)}>
              {
                map(nodeData.node, (node) => (
                  <div
                    className={classnames({
                      'node-item': true,
                      py4: true,
                      px12: true,
                      mb12: true,
                      'hover-active-bg': true,
                      active: state.activeNode === node.address,
                    })}
                    key={node.address}
                    onClick={() => { handleToggleNode(node.address); }}
                  >
                    {node.address}
                  </div>
                ))
              }
            </Holder>
          </div>
        </Card>
      </div>
      <div className="host-detail">
        <div className="batch-actions mb16">
          { map(batchOptionsMap, (name, type) => <Button key={type} disabled={!isSelected || nodeData.node.length < 2} className="mr8" onClick={() => { handleBatchOption(type); }}>{name}</Button>) }
          <FormModal
            title={i18n.t('microService:batch custom weight')}
            width={400}
            fieldsList={fieldsList}
            modalProps={{ destroyOnClose: true }}
            onOk={handleUpdateNodeRule}
          />
        </div>
        <Card>
          <Table
            columns={columns}
            dataSource={withSelectKeysDataSource}
            pagination={{ pageSize: PAGINATION.pageSize }}
            rowSelection={rowSelection}
          />
        </Card>
      </div>
    </div>
  );
};

export default NodeList;
