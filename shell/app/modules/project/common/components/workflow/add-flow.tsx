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
import { AutoComplete, Button, Form, Popover } from 'antd';
import { ErdaIcon, RenderPureForm } from 'common';
import projectStore from 'project/stores/project';
import { getJoinedApps } from 'user/services/user';
import { createFlow, getBranches, getBranchPolicy } from 'project/services/project-workflow';
import i18n from 'i18n';
import { FlowType } from 'project/common/config';

interface IProps {
  enable?: boolean;
  onAdd: () => void;
  metaData: {
    iteration: ITERATION.Detail;
    issue: Obj;
  };
}

const AddFlow: React.FC<IProps> = ({ onAdd, metaData = {} }) => {
  const [form] = Form.useForm<Omit<DEVOPS_WORKFLOW.CreateFlowNode, 'issueID'>>();
  const allBranch = getBranches.useData();
  const { id: projectId, name: projectName } = projectStore.useStore((s) => s.info);
  const [visible, setVisible] = React.useState(false);
  const [flowName, setFlowName] = React.useState('');
  const apps = getJoinedApps.useData();
  const metaWorkflow = getBranchPolicy.useData();
  const workflow = metaWorkflow?.flows ?? [];
  const branchPolicies = metaWorkflow?.branchPolicies ?? [];
  const branches = workflow.filter((item) => {
    const curBranchType = branchPolicies.find((bItem) => bItem.branch === item.targetBranch)?.branchType;
    return curBranchType !== FlowType.SINGLE_BRANCH;
  });
  const { iteration, issue } = metaData;

  React.useEffect(() => {
    if (projectId) {
      getJoinedApps.fetch({
        projectId,
        pageNo: 1,
        pageSize: 200,
      });
      getBranchPolicy.fetch({ projectID: `${projectId}` });
    }
  }, [projectId]);
  React.useEffect(() => {
    if (!visible) {
      setFlowName('');
    }
  }, [visible]);
  const content = React.useMemo(() => {
    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };
    const handleOk = async () => {
      const formData = await form.validateFields();
      await createFlow.fetch({
        issueID: issue.id,
        ...formData,
      });
      handleCancel();
      onAdd();
    };

    const getBranchInfo = (flowName: string) => {
      const flow = branches.find((item) => item.name === flowName)!;
      let sourceBranch;
      const curPolicy = branchPolicies.find((item) => item.branch === flow.targetBranch);
      if (flow && curPolicy?.branchType !== FlowType.SINGLE_BRANCH) {
        sourceBranch = flow.targetBranch.replace('*', issue.id);
      }
      return {
        targetBranch: curPolicy?.policy?.sourceBranch,
        sourceBranch,
      };
    };

    const list = [
      {
        label: i18n.t('dop:R&D Workflow'),
        type: 'select',
        name: 'flowName',
        options: branches?.map((branch) => ({ name: branch.name, value: branch.name })),
        itemProps: {
          onChange: (v: string) => {
            setFlowName(v);
            if (form.getFieldValue('appID')) {
              const result = getBranchInfo(v);
              form.setFieldsValue(result);
              form.validateFields(['targetBranch']);
            }
          },
        },
      },
      {
        label: i18n.t('App'),
        type: 'select',
        name: 'appID',
        options: apps?.list
          .filter((item) => !item.isExternalRepo)
          .map((app) => ({ name: app.displayName, value: app.id })),
        itemProps: {
          showSearch: true,
          onChange: (v: number) => {
            const { name } = apps?.list?.find((item) => item.id === v)!;
            const result = getBranchInfo(form.getFieldValue('flowName'));
            form.setFieldsValue(result);
            getBranches
              .fetch({
                projectName,
                appName: name,
              })
              .then(() => {
                form.validateFields(['targetBranch']);
              });
          },
        },
      },
      {
        label: i18n.t('dop:source branch'),
        type: 'select',
        name: 'targetBranch',
        options: branches
          ?.filter((item) => item.name === flowName)
          .map((branch) => {
            const curBranch = branchPolicies.find((item) => item.branch === branch.targetBranch)?.policy?.sourceBranch;
            return { name: curBranch, value: curBranch };
          }),
        itemProps: {
          onChange: (v: string) => {
            const { name } = branches.find((item) => item.targetBranch === v)!;
            const { sourceBranch } = getBranchInfo(name);
            form.setFieldsValue({ sourceBranch });
          },
        },
        rules: [
          {
            validator: (_rule: any, value: string) => {
              if (allBranch?.some((item) => item.name === value)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(i18n.t('dop:The branch does not exist, Please create the branch first')));
            },
          },
        ],
      },
      {
        label: i18n.t('dop:Change branch'),
        name: 'sourceBranch',
        getComp: () => <AutoComplete options={allBranch?.map((item) => ({ value: item.name }))} />,
      },
    ];
    return (
      <div className="w-[400px]">
        <RenderPureForm form={form} list={list} />
        <div className="flex justify-end">
          <Button className="mr-4" onClick={handleCancel}>
            {i18n.t('Cancel')}
          </Button>
          <Button type="primary" onClick={handleOk}>
            {i18n.t('OK')}
          </Button>
        </div>
      </div>
    );
  }, [form, apps, branches, iteration]);
  return (
    <Popover trigger={['click']} content={content} visible={visible} onVisibleChange={setVisible}>
      <div
        className="h-7 mr-2 p-1 rounded-sm text-sub hover:text-default hover:bg-default-04 cursor-pointer"
        onClick={() => {
          setVisible(true);
        }}
      >
        <ErdaIcon type="plus" size={20} />
      </div>
    </Popover>
  );
};

export default AddFlow;
