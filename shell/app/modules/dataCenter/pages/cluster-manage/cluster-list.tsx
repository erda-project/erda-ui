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
import { Dropdown, Tooltip, Menu, Modal, Table } from 'app/nusi';
import { goTo, notify } from 'common/utils';
import { map, get, find } from 'lodash';
import AddMachineModal from 'app/modules/dataCenter/common/components/machine-form-modal';
import AddCloudMachineModal from './cloud-machine-form-modal';
import { useUpdate, Icon as CustomIcon } from 'common';
import machineStore from 'app/modules/dataCenter/stores/machine';
import clusterStore from 'app/modules/dataCenter/stores/cluster';
import { clusterImgMap } from './config';
import i18n from 'i18n';
import { ClusterLog } from './cluster-log';
import DeleteClusterModal from './delete-cluster-modal';
import { getClusterOperationHistory } from 'app/modules/dataCenter/services/machine';
import { ColumnProps } from 'core/common/interface';
import orgStore from 'app/org-home/stores/org';

import './cluster-list.scss';

interface ICardProps{
  cluster:ORG_CLUSTER.ICluster;
  detail:any;
  toggleAddMachine():void;
  onEdit():void;
  toggleAddCloudMachine():void;
  checkClusterUpdate(): void;
  onDeleteCluster():void;
}

const MenuItem = Menu.Item;
const ClusterCard = (props:ICardProps) => {
  const { cluster, toggleAddCloudMachine, toggleAddMachine, checkClusterUpdate, onEdit, onDeleteCluster, detail } = props;
  const { displayName, description, cloudVendor, type, name } = cluster;
  const { addMachine, addCloudMachine, edit, upgrade, deleteCluster } = {
    addMachine: { title: i18n.t('org:add machine'), onClick: () => toggleAddMachine() },
    addCloudMachine: { title: i18n.t('org:add alibaba cloud machine'), onClick: () => toggleAddCloudMachine() },
    edit: { title: i18n.t('common:change setting'), onClick: () => onEdit() },
    upgrade: { title: i18n.t('org:cluster upgrade'), onClick: () => checkClusterUpdate() },
    deleteCluster: { title: i18n.t('org:cluster offline'), onClick: () => onDeleteCluster() },
  };
  const clusterOpsMap = {
    dcos: [addMachine, edit, deleteCluster],
    edas: [edit, deleteCluster],
    k8s: [addMachine, addCloudMachine, edit, upgrade, deleteCluster],
    'alicloud-cs': [addMachine, addCloudMachine, edit, upgrade, deleteCluster],
    'alicloud-cs-managed': [addMachine, addCloudMachine, edit, upgrade, deleteCluster],
    'alicloud-ecs': [addMachine, addCloudMachine, edit, upgrade, deleteCluster],
  };
  const ops = (
    <Menu>
      {map(clusterOpsMap[cloudVendor || type] || [], (op) => {
        return (
          <MenuItem key={op.title}>
            <a onClick={op.onClick} className="cluster-op-text">{op.title}</a>
          </MenuItem>
        );
      })}
    </Menu>
  );
  const clusterImg = get(clusterImgMap[cloudVendor || type], 'active');
  return (
    <div className="cluster-item-card">
      <div className="cluster-item-container">
        <div className="cluster-logo">
          <img src={clusterImg} />
        </div>
        <div className="cluster-text">
          <div className="name bold-500 nowrap">
            <span className="hover-active" onClick={() => { goTo(`./${cluster.name}/detail`); }}>{displayName || name}</span>
          </div>
          <div className="description">
            <Tooltip title={description}>
              <span>{description || '-'}</span>
            </Tooltip>
          </div>
          <div className="cluster-info-footer flex-box">
            <span className="nowrap">
              <CustomIcon type="jqlx" />
              {get(detail, 'basic.edgeCluster.value', true) ? i18n.t('org:edge cluster') : i18n.t('org:center cluster')}
            </span>
            <span className="nowrap">
              <CustomIcon type="bb1" />
              {i18n.t('version')}: {get(detail, 'basic.clusterVersion.value', '')}
            </span>
            <span className="nowrap">
              <CustomIcon type="IB" />
              lb: {get(detail, 'basic.lbNum.value', '0')}
            </span>
            <span className="nowrap">
              <CustomIcon type="master" />
              master: {get(detail, 'basic.masterNum.value', '0')}
            </span>
          </div>
        </div>
        <div className="cluster-ops">
          <Dropdown overlay={ops} placement="bottomRight" trigger={['click']}>
            <CustomIcon className="fz24 hover-active" type="more" />
          </Dropdown>
        </div>
      </div>

    </div>
  );
};

interface IProps {
  dataSource: any[];
  onEdit(record: any): void;
}
const ClusterList = ({ dataSource, onEdit }: IProps) => {
  const { addCloudMachine } = machineStore.effects;
  const { upgradeCluster, deleteCluster, getClusterNewDetail } = clusterStore.effects;
  const [curCluster, setCurCluster] = React.useState(null as any);

  const orgId = orgStore.getState(s => s.currentOrg.id);
  const [state, updater] = useUpdate({
    modalVisibleRow: null,
    popoverVisible: false,
    popoverVisibleRow: null,
    afterAdd: null,
    cloudModalVis: false,
    deleteModalVis: false,
    curDeleteCluster: null,
    clusterDetailList: [],
  });

  React.useEffect(() => {
    getClusterNewDetail({ clusterName: map(dataSource, 'name').join(',') }).then((res:any) => {
      updater.clusterDetailList(res);
    });
  }, [dataSource, getClusterNewDetail, updater]);

  const toggleAddCloudMachine = (cluster?:ORG_CLUSTER.ICluster) => {
    if (cluster) {
      setCurCluster(cluster);
      updater.cloudModalVis(true);
    } else {
      setCurCluster(null);
      updater.cloudModalVis(false);
    }
  };
  const onAddCloudMachine = (postData:ORG_MACHINE.IAddCloudMachineBody) => {
    toggleAddCloudMachine();
    addCloudMachine(postData).then(res => {
      updater.afterAdd({ ...res });
    });
  };

  const checkClusterUpdate = (cluster:ORG_CLUSTER.ICluster) => {
    upgradeCluster({ clusterName: cluster.name, precheck: true })
      .then(({ status, precheckHint }: { status: number; precheckHint: string; }) => {
        switch (status) {
          case 3:
            Modal.warning({
              title: i18n.t('warning'),
              content: precheckHint,
            });
            break;
          case 2:
            Modal.confirm({
              title: i18n.t('warning'),
              content: precheckHint,
              onOk() {
                upgradeCluster({ clusterName: cluster.name, precheck: false });
                goTo(`./history?clusterName=${cluster.name}`);
              },
            });
            break;
          case 1:
            Modal.confirm({
              title: i18n.t('warning'),
              content: precheckHint,
              onOk() {
                goTo(`./history?clusterName=${cluster.name}`);
              },
            });
            break;
          default:
            break;
        }
      });
  };

  const togglelDeleteModal = (item?:ORG_CLUSTER.ICluster) => {
    if (item) {
      updater.curDeleteCluster(item);
      updater.deleteModalVis(true);
    } else {
      updater.curDeleteCluster(null);
      updater.deleteModalVis(false);
    }
  };
  const submitDelete = ({ clusterName }:{clusterName:string}) => {
    // 删除后根据recordID查看操作纪录接口中的详情作为提示
    deleteCluster({ clusterName }).then((deleteRes:any) => {
      const { recordID: deleteRecordID } = deleteRes || {};
      deleteRecordID && getClusterOperationHistory({ recordIDs: deleteRecordID } as any).then((listRes:any) => {
        const curRecord = get(listRes, 'data.list[0]') || {} as any;
        if (curRecord && curRecord.status === 'failed') {
          notify('error', curRecord.detail);
        }
      });
    });
    togglelDeleteModal();
  };
  const getClusterDetail = (name:string) => {
    const curDetail = find(state.clusterDetailList, item => get(item, 'basic.clusterName.value') === name) || {};
    return curDetail;
  };
  const renderMenu = (record: ORG_CLUSTER.ICluster) => {
    const clusterDetail = getClusterDetail(record.name);
    const isEdgeCluster = get(clusterDetail, 'basic.edgeCluster.value', true);
    const { addMachine, addCloudMachines, edit, upgrade, deleteCluster: deleteClusterCall } = {
      addMachine: { title: i18n.t('org:add machine'), onClick: () => { updater.modalVisibleRow(record); } },
      addCloudMachines: { title: i18n.t('org:add alibaba cloud machine'), onClick: () => toggleAddCloudMachine(record) },
      edit: { title: i18n.t('common:change setting'), onClick: () => onEdit({ ...record, isEdgeCluster }) },
      upgrade: { title: i18n.t('org:cluster upgrade'), onClick: () => checkClusterUpdate(record) },
      deleteCluster: { title: i18n.t('org:cluster offline'), onClick: () => { togglelDeleteModal(record); } },
    };
    const clusterOpsMap = {
      dcos: [addMachine, edit, deleteClusterCall],
      edas: [edit, deleteClusterCall],
      k8s: [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
      'alicloud-cs': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
      'alicloud-cs-managed': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
      'alicloud-ecs': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
    };

    return map(clusterOpsMap[record.cloudVendor || record.type] || [], (op) => {
      return (
        <span
          className='fake-link mr4'
          key={op.title}
          onClick={op.onClick}
        >
          {op.title}
        </span>
      );
    });
  };
  const columns: Array<ColumnProps<ORG_CLUSTER.ICluster>> = [
    {
      title: i18n.t('org:cluster name'),
      dataIndex: 'displayName',
      tip: true,
      render: (text, record) => <span className="hover-active" onClick={() => { goTo(`./${record.name}/detail`); }}>{text || record.name}</span>,
    },
    {
      title: i18n.t('default:description'),
      dataIndex: 'description',
      tip: true,
      render: text => text || '_',
    },
    {
      title: i18n.t('org:cluster type'),
      dataIndex: 'edgeCluster',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        return get(clusterDetail, 'basic.edgeCluster.value', true) ? i18n.t('org:edge cluster') : i18n.t('org:center cluster');
      },
    },
    {
      title: i18n.t('version'),
      dataIndex: 'clusterVersion',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        return get(clusterDetail, 'basic.clusterVersion.value', '');
      },
    },
    {
      title: 'lb',
      dataIndex: 'lbNum',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        return get(clusterDetail, 'basic.lbNum.value', '0');
      },
    },
    {
      title: 'master',
      dataIndex: 'masterNum',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        return get(clusterDetail, 'basic.masterNum.value', '0');
      },
    },
  ];
  const actions = {
    title: i18n.t('default:operation'),
    render: (record: ORG_CLUSTER.ICluster) => {
      return renderMenu(record);
    },
    width: 150,
  };

  return (
    <>
      <AddMachineModal
        visible={!!state.modalVisibleRow}
        cluster={state.modalVisibleRow as ORG_CLUSTER.ICluster}
        onCancel={() => updater.modalVisibleRow(null)}
        onSubmit={(resp: ORG_MACHINE.IClusterOperateRecord) => updater.afterAdd(resp)}
      />
      <AddCloudMachineModal
        visible={state.cloudModalVis}
        cluster={curCluster}
        orgId={orgId}
        onCancel={() => toggleAddCloudMachine()}
        onSubmit={onAddCloudMachine}
      />
      <ClusterLog
        recordID={state.afterAdd && state.afterAdd.recordID}
        onClose={() => updater.afterAdd(null)}
      />
      <DeleteClusterModal
        visible={state.deleteModalVis}
        onCancel={() => togglelDeleteModal()}
        onSubmit={submitDelete}
        curCluster={state.curDeleteCluster}
      />
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey="id"
          rowAction={actions}
        />
      </div>
    </>
  );
};

export default ClusterList;
