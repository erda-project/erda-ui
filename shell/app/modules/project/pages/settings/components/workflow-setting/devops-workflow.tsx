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
import { getBranchPolicy, updateBranchPolicy } from 'project/services/project-workflow';
import { useMount } from 'react-use';
import { Table } from 'common';
import { Button, Modal, Popover } from 'antd';
import { uuid } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { IActions } from 'common/components/table/interface';
import i18n from 'i18n';
import { ENV_MAP } from 'project/common/config';
import { convertPolicyData } from './branch-policy';
import { WithAuth } from 'user/common';
import BranchPolicyCard from './branch-policy-card';
import FlowDrawer from './devops-workflow-drawer';

interface IProps {
  projectId: string;
  editAuth: boolean;
}

interface BranchFlowsData extends DEVOPS_WORKFLOW.BranchFlows {
  id: string;
}

const envArr = Object.keys(ENV_MAP).map((env) => ({ name: ENV_MAP[env], value: env }));

const convertData = (d: DEVOPS_WORKFLOW.BranchFlows[]) =>
  d.map((item) => {
    return {
      ...item,
      id: uuid(),
    };
  });

interface State {
  useData: BranchFlowsData[];
  drawerVis: boolean;
  flowData: null | BranchFlowsData;
}
const DevOpsWorkflow = (props: IProps) => {
  const { editAuth, projectId } = props;
  const [data, loading] = getBranchPolicy.useState();
  const [{ useData, drawerVis, flowData }, updater, update] = useUpdate<State>({
    useData: convertData(data?.flows || []),
    drawerVis: false,
    flowData: null,
  });

  const getData = () => {
    return getBranchPolicy.fetch({ projectID: projectId });
  };

  const deleteData = (_id: string) => {
    updateData(useData.filter((pItem) => pItem.id !== _id));
  };

  const saveData = (d: BranchFlowsData, branchData: DEVOPS_WORKFLOW.BranchPolicy[]) => {
    let curData = [...useData];
    if (d.id) {
      curData = curData.map((item) => (item.id === d.id ? { ...d } : { ...item }));
    } else {
      curData = [...curData, { ...d }];
    }
    updateData(curData, branchData);
  };

  const updateData = (_flows: BranchFlowsData[], branchData?: DEVOPS_WORKFLOW.BranchPolicy[]) => {
    if (data) {
      const reFlows = _flows.map((item) => {
        const { id, ...rest } = item;
        return { ...rest };
      });
      updateBranchPolicy({ id: data.id, flows: reFlows, branchPolicies: branchData || data.branchPolicies }).then(
        () => {
          getData().then(() => {
            closeDrawer();
          });
        },
      );
    }
  };

  React.useEffect(() => {
    updater.useData(convertData(data?.flows || []));
  }, [data]);

  useMount(() => {
    getData();
  });

  const closeDrawer = () => {
    update({ drawerVis: false, flowData: null });
  };

  const columns = [
    {
      title: i18n.t('Name'),
      dataIndex: 'name',
    },
    {
      title: i18n.s('Branch policy', 'dop'),
      dataIndex: 'targetBranch',
      render: (_v: string) => {
        const curPolicy = (data?.branchPolicies || []).find((item) => item.branch === _v);
        const policyObj = (curPolicy ? convertPolicyData([curPolicy]) : [])[0];
        return (
          <Popover
            content={
              <div className="mt-2">
                {curPolicy ? (
                  <div>
                    <div className="flex-h-center">
                      <span className="text-default-6">{i18n.s('Branch policy', 'dop')}</span>
                    </div>
                    <BranchPolicyCard data={policyObj} />
                  </div>
                ) : (
                  <span className="text-default-6">
                    {i18n.s(
                      'Could not found the policy of the branch, it may be deleted or modified, please select again.',
                      'dop',
                    )}
                  </span>
                )}
              </div>
            }
          >
            {_v}
          </Popover>
        );
      },
    },
    {
      title: i18n.t('dop:Deployment environment'),
      dataIndex: 'environment',
      render: (_v: string) => envArr?.find((item) => item.value === _v)?.name || _v,
    },
    {
      title: i18n.t('dop:Artifact type'),
      dataIndex: 'artifact',
    },
  ];
  const tableActions: IActions<BranchFlowsData> | undefined = editAuth
    ? {
        render: (record: BranchFlowsData) => {
          return [
            {
              title: i18n.t('Edit'),
              onClick: () => {
                update({ flowData: record, drawerVis: true });
              },
            },
            {
              title: i18n.t('Delete'),
              onClick: () => {
                Modal.confirm({
                  title: i18n.t('common:confirm to delete {name} ?', { name: i18n.t('dop:workflow') }),
                  onOk: () => {
                    deleteData(record.id);
                  },
                });
              },
            },
          ];
        },
      }
    : undefined;

  return (
    <div>
      <div className="flex justify-end mb-2">
        <WithAuth pass={editAuth}>
          <Button type="primary" onClick={() => updater.drawerVis(true)}>
            {i18n.t('Add')}
          </Button>
        </WithAuth>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={useData}
        columns={columns}
        actions={tableActions}
        onReload={() => {
          getData();
        }}
      />
      <FlowDrawer
        fullData={useData}
        visible={drawerVis}
        projectId={projectId}
        branchData={data?.branchPolicies || []}
        onSubmit={saveData}
        onClose={closeDrawer}
        flowData={flowData}
      />
    </div>
  );
};

export default DevOpsWorkflow;
