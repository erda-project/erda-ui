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
import {
  createFlow,
  CreateFlowNode,
  getBranches,
  queryWorkflow,
  WorkflowHint,
} from 'project/services/project-workflow';
import { IBaseProps } from './base-step';
import i18n from 'i18n';
import { FlowType } from 'project/common/config';

interface IProps extends IBaseProps {
  onAdd: () => void;
  metaData: {
    iteration: ITERATION.Detail;
    issue: Obj;
  };
  type: WorkflowHint['place'];
}

const AddFlow: React.FC<IProps> = ({ onAdd, type, metaData = {} }) => {
  const [form] = Form.useForm<Omit<CreateFlowNode, 'issueID'>>();
  const allBranch = getBranches.useData();
  const { id: projectId, name: projectName } = projectStore.useStore((s) => s.info);
  const [visible, setVisible] = React.useState(false);
  const apps = getJoinedApps.useData();
  const metaWorkflow = queryWorkflow.useData();
  const workflow = metaWorkflow?.flows ?? [];
  const branches = workflow.filter((item) => item.flowType === FlowType.TWO_BRANCH);
  const { iteration, issue } = metaData;

  React.useEffect(() => {
    getJoinedApps.fetch({
      projectId,
      pageNo: 1,
      pageSize: 200,
    });
    queryWorkflow.fetch({ projectID: projectId });
  }, [projectId]);
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
    const list = [
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
            getBranches.fetch({
              projectName,
              appName: name,
            });
            form.setFieldsValue({ sourceBranch: undefined, targetBranch: undefined });
          },
        },
      },
      {
        label: i18n.t('dop:target branch'),
        type: 'select',
        name: 'targetBranch',
        options: branches?.map((branch) => ({ name: branch.targetBranch, value: branch.targetBranch })),
        itemProps: {
          onChange: (v: string) => {
            const hintItem = branches.find((item) => item.targetBranch === v);
            if (hintItem && hintItem.flowType !== FlowType.SINGLE_BRANCH) {
              const { changeBranchRule } = hintItem.startWorkflowHints.find((t) => t.place === type)!;
              const branch = changeBranchRule.replace('*', issue.id);
              form.setFieldsValue({ sourceBranch: branch });
            }
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
