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
import { Modal, Table, Popover } from 'app/nusi';
import { goTo, insertWhen, notify, setSearch } from 'common/utils';
import { map, get, find } from 'lodash';
import AddMachineModal from 'app/modules/cmp/common/components/machine-form-modal';
import AddCloudMachineModal from './cloud-machine-form-modal';
import { useUpdate, Icon as CustomIcon, Copy } from 'common';
import machineStore from 'app/modules/cmp/stores/machine';
import clusterStore from 'app/modules/cmp/stores/cluster';
import i18n from 'i18n';
import { ClusterLog } from './cluster-log';
import DeleteClusterModal from './delete-cluster-modal';
import { getClusterOperationHistory } from 'app/modules/cmp/services/machine';
import { ColumnProps } from 'core/common/interface';
import orgStore from 'app/org-home/stores/org';
import { Button, Drawer, Input, Spin } from 'core/nusi';
import { bgColorClsMap } from 'app/common/utils/style-constants';
import { useLoading } from 'core/stores/loading';
import { useInstanceOperation } from 'cmp/common/components/instance-operation';
import routeStore from 'core/stores/route';

import './cluster-list.scss';

interface IProps {
  dataSource: any[];
  onEdit: (record: any) => void;
}

const statusMap = {
  online: ['green', i18n.t('cmp:online')],
  offline: ['red', i18n.t('cmp:offline')],
  initializing: ['yellow', i18n.t('runtime:initializing')],
  'initialize error': ['red', i18n.t('cmp:initialization failed')],
  pending: ['gray', i18n.t('application:pending')],
  unknown: ['red', i18n.t('dcos:unknown')],
};

const manageTypeMap = {
  agent: i18n.t('cmp:agent registration'),
  create: i18n.t('establish'),
  import: i18n.t('import'),
};

const clusterTypeMap = {
  kubernetes: 'Kubernetes',
  edas: 'EDAS',
};

const ClusterList = ({ dataSource, onEdit }: IProps) => {
  const { addCloudMachine } = machineStore.effects;
  const { upgradeCluster, deleteCluster, getClusterNewDetail, getRegisterCommand, clusterInitRetry } =
    clusterStore.effects;
  const [curCluster, setCurCluster] = React.useState<ORG_CLUSTER.ICluster | null>(null);
  const [registerCommand, setRegisterCommand] = React.useState('');
  const [loading] = useLoading(clusterStore, ['getRegisterCommand']);
  const [loadingDetail, loadingList] = useLoading(clusterStore, ['getClusterNewDetail', 'getClusterList']);

  const orgId = orgStore.getState((s) => s.currentOrg.id);
  const [state, updater] = useUpdate({
    modalVisibleRow: null,
    popoverVisible: false,
    popoverVisibleRow: null,
    afterAdd: null,
    cloudModalVis: false,
    deleteModalVis: false,
    curDeleteCluster: null as null | ORG_CLUSTER.ICluster,
    clusterDetailList: [],
    registerCommandVisible: false,
  });

  React.useEffect(() => {
    getClusterNewDetail({ clusterName: map(dataSource, 'name').join(',') }).then((res: any) => {
      updater.clusterDetailList(res);
    });
  }, [dataSource, getClusterNewDetail, updater]);

  const toggleAddCloudMachine = (cluster?: ORG_CLUSTER.ICluster) => {
    if (cluster) {
      setCurCluster(cluster);
      updater.cloudModalVis(true);
    } else {
      setCurCluster(null);
      updater.cloudModalVis(false);
    }
  };
  const onAddCloudMachine = (postData: ORG_MACHINE.IAddCloudMachineBody) => {
    toggleAddCloudMachine();
    addCloudMachine(postData).then((res) => {
      updater.afterAdd({ ...res });
    });
  };

  const checkClusterUpdate = (cluster: ORG_CLUSTER.ICluster) => {
    upgradeCluster({ clusterName: cluster.name, precheck: true }).then(
      ({ status, precheckHint }: { status: number; precheckHint: string }) => {
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
      },
    );
  };

  const toggleDeleteModal = (item?: ORG_CLUSTER.ICluster) => {
    if (item) {
      updater.curDeleteCluster(item);
      updater.deleteModalVis(true);
    } else {
      updater.curDeleteCluster(null);
      updater.deleteModalVis(false);
    }
  };

  const submitDelete = ({ clusterName }: { clusterName: string }) => {
    // 删除后根据recordID查看操作纪录接口中的详情作为提示
    deleteCluster({ clusterName }).then((deleteRes: any) => {
      const { recordID: deleteRecordID } = deleteRes || {};
      deleteRecordID &&
        getClusterOperationHistory({ recordIDs: deleteRecordID } as any).then((listRes: any) => {
          const curRecord = get(listRes, 'data.list[0]') || ({} as any);
          if (curRecord && curRecord.status === 'failed') {
            notify('error', curRecord.detail);
          }
        });
    });
    toggleDeleteModal();
  };

  const getClusterDetail = (name: string) => {
    const curDetail = find(state.clusterDetailList, (item) => get(item, 'basic.clusterName.value') === name) || {};
    return curDetail;
  };

  const showCommand = React.useCallback(
    async (clusterName: string) => {
      updater.registerCommandVisible(true);
      const command = await getRegisterCommand({ clusterName });
      const { orgName } = routeStore.getState((s) => s.params);
      setRegisterCommand(
        `${command.replace('$REQUEST_PREFIX', `${window.location.origin}/api/${orgName}/cluster/init-command`)}`,
      );
    },
    [getRegisterCommand, updater],
  );

  const renderMenu = (record: ORG_CLUSTER.ICluster) => {
    const clusterDetail = getClusterDetail(record.name);
    const isEdgeCluster = get(clusterDetail, 'basic.edgeCluster.value', true);
    const {
      addMachine,
      addCloudMachines,
      edit,
      upgrade,
      deleteCluster: deleteClusterCall,
      showRegisterCommand,
      retryInit,
    } = {
      addMachine: {
        title: i18n.t('org:add machine'),
        onClick: () => {
          updater.modalVisibleRow(record);
        },
      },
      addCloudMachines: {
        title: i18n.t('org:add alibaba cloud machine'),
        onClick: () => toggleAddCloudMachine(record),
      },
      edit: { title: i18n.t('common:change setting'), onClick: () => onEdit({ ...record, isEdgeCluster }) },
      upgrade: { title: i18n.t('org:cluster upgrade'), onClick: () => checkClusterUpdate(record) },
      deleteCluster: {
        title: i18n.t('org:cluster offline'),
        onClick: () => {
          toggleDeleteModal(record);
        },
      },
      showRegisterCommand: {
        title: i18n.t('cmp:register command'),
        onClick: () => {
          showCommand(record.name);
        },
      },
      retryInit: {
        title: i18n.t('cmp:initialize retry'),
        onClick: () => {
          clusterInitRetry({ clusterName: record.name });
        },
      },
    };
    const clusterOpsMap = {
      dcos: [addMachine, edit, deleteClusterCall],
      edas: [edit, deleteClusterCall],
      k8s: [
        addMachine,
        addCloudMachines,
        edit,
        upgrade,
        deleteClusterCall,
        ...insertWhen(get(clusterDetail, 'basic.manageType.value') === 'agent', [showRegisterCommand]),
        ...insertWhen(get(clusterDetail, 'basic.clusterStatus.value') === 'initialize error', [retryInit]),
      ],
      'alicloud-cs': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
      'alicloud-cs-managed': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
      'alicloud-ecs': [addMachine, addCloudMachines, edit, upgrade, deleteClusterCall],
    };

    const operateList = (clusterOpsMap[record.cloudVendor || record.type] || []).map(
      (op: { title: string; onClick: () => void }) => {
        return (
          <span className="fake-link mr4" key={op.title} onClick={op.onClick}>
            {op.title}
          </span>
        );
      },
    );

    return (
      <span className="operate-list">
        {operateList.length > 3 ? (
          <>
            {operateList.slice(0, 3)}
            <Popover
              content={operateList.slice(3)}
              getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
            >
              <CustomIcon className="fake-link ml4" type="more" />
            </Popover>
          </>
        ) : (
          operateList
        )}
      </span>
    );
  };

  const columns: Array<ColumnProps<ORG_CLUSTER.ICluster>> = [
    {
      title: i18n.t('org:cluster name'),
      dataIndex: 'displayName',
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <span
          className="hover-active"
          onClick={() => {
            goTo(`./${record.name}/detail`);
          }}
        >
          {text || record.name}
        </span>
      ),
    },
    {
      title: i18n.t('application:status'),
      dataIndex: 'clusterStatus',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        const status = get(clusterDetail, 'basic.clusterStatus.value') as keyof typeof statusMap;
        const hasLog = !!get(clusterDetail, 'basic.clusterInitContainerID.value') && status !== 'online';
        return (
          <div className="flex items-center">
            <div className={`${bgColorClsMap[statusMap[status]?.[0]]} w-2 h-2 rounded-full`} />
            <div className="mx-2">{`${statusMap[status]?.[1] ?? '-'}`}</div>
            <If condition={hasLog}>{renderOp(record)}</If>
          </div>
        );
      },
    },
    {
      title: i18n.t('default:description'),
      dataIndex: 'description',
      render: (text) => text || '_',
    },
    {
      title: i18n.t('application:type'),
      dataIndex: 'clusterType',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        const clusterType: keyof typeof clusterTypeMap = get(clusterDetail, 'basic.clusterType.value');
        return (
          <If condition={!!clusterType}>
            <div className="flex items-center">
              <CustomIcon type={`${clusterType === 'edas' ? 'aliyun' : 'k8s'}`} color className="h-4 w-4 mr-2" />
              <span>{clusterTypeMap[clusterType] ?? ''}</span>
            </div>
          </If>
        );
      },
    },
    {
      title: i18n.t('cmp:management method'),
      dataIndex: 'manageType',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        const manageType = get(clusterDetail, 'basic.manageType.value');
        return manageTypeMap[manageType] ?? '';
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
      title: i18n.t('machines'),
      dataIndex: 'nodeCount',
      render: (_text, record) => {
        const clusterDetail = getClusterDetail(record.name);
        return get(clusterDetail, 'basic.nodeCount.value', '-');
      },
    },
    {
      title: i18n.t('default:operation'),
      dataIndex: 'operation',
      render: (_text, record: ORG_CLUSTER.ICluster) => {
        return renderMenu(record);
      },
      width: 280,
    },
  ];

  const [renderOp, drawer] = useInstanceOperation<ORG_CLUSTER.ICluster>({
    log: true,
    getProps(_, record) {
      const clusterDetail = getClusterDetail(record.name);
      return {
        fetchApi: '/api/orgCenter/logs',
        extraQuery: {
          clusterName: get(clusterDetail, 'basic.initJobClusterName.value'),
          id: get(clusterDetail, 'basic.clusterInitContainerID.value'),
        },
        sourceType: 'container',
      };
    },
  });

  const query = routeStore.useStore((s) => s.query);
  React.useEffect(() => {
    if (query.autoOpenCmd) {
      showCommand(query.clusterName);
      setSearch({}, [], true);
    }
  }, [query, showCommand]);

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
      <ClusterLog recordID={state.afterAdd && state.afterAdd.recordID} onClose={() => updater.afterAdd(null)} />
      <DeleteClusterModal
        visible={state.deleteModalVis}
        onCancel={() => toggleDeleteModal()}
        onSubmit={submitDelete}
        curCluster={state.curDeleteCluster}
      />
      <Drawer
        visible={state.registerCommandVisible}
        destroyOnClose
        title={i18n.t('cmp:cluster registration command')}
        width="800"
        onClose={() => updater.registerCommandVisible(false)}
      >
        <Spin spinning={loading} wrapperClassName="full-spin-height">
          <div className="flex flex-col items-end h-full">
            <Input.TextArea id="command-script" readOnly value={registerCommand} className="min-h-3/5" />
            <Button
              type="ghost"
              className="btn-to-copy mt-4"
              data-clipboard-target="#command-script"
              disabled={!registerCommand.length}
            >
              {i18n.t('cmp:copy command')}
            </Button>
            <Copy selector=".btn-to-copy" />
          </div>
        </Spin>
      </Drawer>
      {drawer}
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey="id"
          loading={loadingList || loadingDetail}
        />
      </div>
    </>
  );
};

export default ClusterList;
