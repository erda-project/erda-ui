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
import { Button, Form, Input, Modal } from 'antd';
import { InputProps } from 'antd/lib/input';
import { produce } from 'immer';
import i18n from 'i18n';
import { FormModal, Table, TopButtonGroup } from 'common';
import { useUpdate } from 'common/use-hooks';
import { insertWhen } from 'common/utils';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { branchNameValidator, branchNameWithoutWildcard, ENV_MAP, FLOW_TYPE, FlowType } from 'project/common/config';
import { queryWorkflow, updateWorkflow, WorkflowHint, WorkflowItem } from 'project/services/project-workflow';

const envArr = Object.keys(ENV_MAP).map((env) => ({ name: ENV_MAP[env], value: env }));

const typeTips = (
  <div>
    <p className="mb-0">{i18n.t('dop:Single branches are suitable for two scenarios')}:</p>
    <p className="mb-0">a) {i18n.t('dop:Single branches scenarios a')}:</p>
    <p className="mb-0">b) {i18n.t('dop:Single branches scenarios b')}:</p>
    <p className="mb-0">{i18n.t('dop:Multiple branches are suitable for two scenarios')}:</p>
    <p className="mb-0">a) {i18n.t('dop:Multiple branches scenarios a')}:</p>
    <p className="mb-0">b) {i18n.t('dop:Multiple branches scenarios b')}:</p>
  </div>
);

interface IProps {
  canOperate: boolean;
  projectID: number;
}

interface IState {
  visible: boolean;
  formData?: WorkflowItem;
  flowType: FlowType;
}

const workflowHints: { place: WorkflowHint['place']; name: string }[] = [
  {
    place: 'TASK',
    name: i18n.t('Task'),
  },
  {
    place: 'BUG',
    name: i18n.t('Bug'),
  },
];

const StartWorkflowHints = ({
  value: originValue,
  onChange,
  ...rest
}: { value?: WorkflowHint[]; onChange?: (value: WorkflowHint[]) => void } & Omit<InputProps, 'value' | 'onChange'>) => {
  const [value, setValue] = React.useState<WorkflowHint[]>(originValue || []);
  const handleChange = (place: WorkflowHint['place'], v: string) => {
    const newValue = produce(originValue || value, (draft) => {
      const index = draft.findIndex((item) => item.place === place);
      const hint = {
        place,
        changeBranchRule: v,
      };
      if (index === -1) {
        draft.push(hint);
      } else {
        draft.splice(index, 1, hint);
      }
    });
    if (!originValue) {
      setValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <>
      {workflowHints.map((hint, index) => {
        const v = (originValue || value).find((t) => t.place === hint.place)?.changeBranchRule;
        return (
          <div key={hint.place} className={index === 0 ? '' : 'mt-2'}>
            <Input
              {...rest}
              addonBefore={hint.name}
              placeholder={i18n.t('start with letters and can contain')}
              value={v}
              onChange={(e) => {
                handleChange(hint.place, e.target.value);
              }}
            />
          </div>
        );
      })}
    </>
  );
};

const ProjectWorkflow: React.FC<IProps> = ({ canOperate, projectID }) => {
  const [form] = Form.useForm();
  const [data, loading] = queryWorkflow.useState();
  const [{ visible, formData, flowType }, updater, update] = useUpdate<IState>({
    visible: false,
    formData: undefined,
    flowType: FlowType.SINGLE_BRANCH,
  });
  const workflows = data?.flows ?? [];
  const originWorkflow = React.useRef<WorkflowItem>();

  const getWorkflows = React.useCallback(() => queryWorkflow.fetch({ projectID }), [projectID]);

  React.useEffect(() => {
    getWorkflows();
  }, [getWorkflows]);

  const updateWorkflows = async (action: 'edit' | 'create' | 'delete', workflow: WorkflowItem) => {
    const successMsg = {
      edit: i18n.t('edited successfully'),
      create: i18n.t('added successfully'),
      delete: i18n.t('deleted successfully'),
    }[action];
    const newWorkflows = produce(workflows, (draft) => {
      const index = draft.findIndex((item) => item.name === originWorkflow.current?.name);
      const newFlow = workflow.flowType !== FlowType.SINGLE_BRANCH ? { enableAutoMerge: false, ...workflow } : workflow;
      if (action === 'create') {
        draft.push(newFlow);
      } else if (action === 'edit') {
        draft.splice(index, 1, newFlow);
      } else {
        draft.splice(index, 1);
      }
    });
    await updateWorkflow.fetch({
      id: data!.id,
      flows: newWorkflows,
      $options: {
        successMsg,
      },
    });
    if (['edit', 'create'].includes(action)) {
      closeModal();
    }
    originWorkflow.current = undefined;
    getWorkflows();
  };

  const closeModal = () => {
    update({
      visible: false,
      formData: undefined,
      flowType: FlowType.SINGLE_BRANCH,
    });
  };

  const handleOk = async (workflow: WorkflowItem, isAddMode: boolean) => {
    await updateWorkflows(isAddMode ? 'create' : 'edit', workflow);
  };

  const columns: Array<ColumnProps<WorkflowItem>> = [
    {
      title: i18n.t('Name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('dop:target branch'),
      dataIndex: 'targetBranch',
    },
    {
      title: i18n.t('dop:source branch'),
      dataIndex: 'changeFromBranch',
    },
    {
      title: i18n.t('dop:temporary branch'),
      dataIndex: 'autoMergeBranch',
    },
    {
      title: i18n.t('dop:Change branch'),
      dataIndex: 'changeBranch',
    },
    {
      title: i18n.t('dop:Part change branch'),
      dataIndex: 'startWorkflowHints',
      render: (value?: WorkflowHint[]) => {
        return value?.map((item) => {
          const name = workflowHints.find((hint) => item.place === hint.place)?.name;
          return (
            <div key={item.place}>
              <span>{name}</span>: <span>{item.changeBranchRule}</span>
            </div>
          );
        });
      },
    },
    {
      title: i18n.t('dop:Environment'),
      dataIndex: 'environment',
      render: (value) => ENV_MAP[value],
    },
    {
      title: i18n.t('dop:Artifact type'),
      dataIndex: 'artifact',
    },
  ];

  const tableActions: IActions<WorkflowItem> | undefined = canOperate
    ? {
        render: (record: WorkflowItem) => {
          return [
            {
              title: i18n.t('Edit'),
              onClick: () => {
                originWorkflow.current = record;
                update({
                  visible: true,
                  formData: record,
                  flowType: record.flowType,
                });
              },
            },
            {
              title: i18n.t('Delete'),
              onClick: () => {
                Modal.confirm({
                  title: i18n.t('common:confirm to delete {name} ?', { name: i18n.t('dop:workflow') }),
                  onOk: () => {
                    originWorkflow.current = record;
                    updateWorkflows('delete', record);
                  },
                });
              },
            },
          ];
        },
      }
    : undefined;

  const fieldList = [
    {
      label: i18n.t('Name'),
      type: 'input',
      required: true,
      name: 'name',
      itemProps: {
        placeholder: i18n.t('dop:within {num} characters', { num: 36 }),
        maxLength: 36,
      },
    },
    {
      label: i18n.t('Type'),
      labelTip: typeTips,
      type: 'select',
      required: true,
      options: Object.keys(FLOW_TYPE).map((value) => ({ value, name: FLOW_TYPE[value] })),
      name: 'flowType',
      itemProps: {
        placeholder: i18n.t('please select the {name}', { name: i18n.t('Type') }),
        onChange: (flow_type: FlowType) => {
          updater.flowType(flow_type);
        },
      },
    },
    {
      label: i18n.t('dop:target branch'),
      type: 'input',
      labelTip: i18n.t('dop:Create a change branch based on that branch'),
      required: true,
      name: 'targetBranch',
      rules: [
        {
          validator: (_rule: any, value: string, callback: Function) => {
            const [pass, tips] = branchNameWithoutWildcard(value);
            !value || pass ? callback() : callback(tips);
          },
        },
      ],
      itemProps: {
        placeholder: i18n.t('separated by comma, start with letters and can contain characters that are not wildcard'),
      },
    },
    ...insertWhen([FlowType.MULTI_BRANCH].includes(flowType), [
      {
        label: i18n.t('dop:source branch'),
        labelTip: i18n.t('dop:Merge change branch'),
        type: 'input',
        required: true,
        name: 'changeFromBranch',
        rules: [
          {
            validator: (_rule: any, value: string, callback: Function) => {
              const [pass, tips] = branchNameWithoutWildcard(value, false);
              !value || pass ? callback() : callback(tips);
            },
          },
        ],
        itemProps: {
          placeholder: i18n.t('start with letters and can contain characters that are not wildcard'),
        },
      },
      {
        label: i18n.s('temporary branch', 'dop'),
        labelTip: '',
        type: 'input',
        required: false,
        name: 'autoMergeBranch',
        rules: [
          {
            validator: (_rule: any, value: string, callback: Function) => {
              const [pass, tips] = branchNameWithoutWildcard(value, false);
              !value || pass ? callback() : callback(tips);
            },
          },
        ],
        itemProps: {
          placeholder: i18n.t('start with letters and can contain characters that are not wildcard'),
        },
      },
      {
        label: i18n.t('dop:Change branch'),
        labelTip: i18n.t('dop:A branch for feature development'),
        type: 'input',
        required: true,
        name: 'changeBranch',
        rules: [
          {
            validator: (_rule: any, value: string, callback: Function) => {
              const [pass, tips] = branchNameValidator(value);
              !value || pass ? callback() : callback(tips);
            },
          },
        ],
        itemProps: {
          placeholder: i18n.t('separated by comma, start with letters and can contain'),
        },
      },
      {
        label: i18n.t('dop:Part change branch'),
        required: true,
        name: 'startWorkflowHints',
        getComp: () => {
          return <StartWorkflowHints />;
        },
        rules: [
          {
            validator: (_rule: any, value: WorkflowHint[], callback: Function) => {
              let pass;
              let tips;
              for (let i = 0; i < value?.length; i++) {
                const [p, t] = branchNameValidator(value[i].changeBranchRule, false);
                pass = p;
                tips = t;
                if (!p) {
                  break;
                }
              }
              !value || pass ? callback() : callback(tips);
            },
          },
        ],
      },
      // {
      //   label: i18n.t('auto merge'),
      //   name: 'enableAutoMerge',
      //   type: 'switch',
      //   required: true,
      //   initialValue: false,
      //   itemProps: {
      //     checkedChildren: i18n.t('common:Yes'),
      //     unCheckedChildren: i18n.t('common:No'),
      //   },
      // },
    ]),
    {
      label: i18n.t('dop:Artifact type'),
      type: 'select',
      required: true,
      name: 'artifact',
      options: ['alpha', 'beta', 'stable', 'rc'].map((item) => ({ name: item, value: item })),
      itemProps: {
        placeholder: i18n.t('please select the {name}', { name: i18n.t('dop:Artifact type') }),
      },
    },
    {
      label: i18n.t('dop:Environment'),
      type: 'select',
      required: true,
      options: envArr,
      name: 'environment',
      itemProps: {
        placeholder: i18n.t('please select the {name}', { name: i18n.t('Environments') }),
      },
    },
  ];

  return (
    <div className="project-workflow">
      {canOperate ? (
        <TopButtonGroup>
          <Button
            onClick={() => {
              updater.visible(true);
            }}
            type="primary"
          >
            {i18n.t('Add {name}', { name: i18n.t('dop:R&D Stage'), interpolation: { escapeValue: false } })}
          </Button>
        </TopButtonGroup>
      ) : null}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={workflows ?? []}
        columns={columns}
        actions={tableActions}
        onReload={() => {
          getWorkflows();
        }}
      />
      <FormModal
        form={form}
        fieldsList={fieldList}
        visible={visible}
        name={i18n.t('dop:R&D Stage')}
        formData={formData}
        onCancel={closeModal}
        onOk={handleOk}
        modalProps={{
          destroyOnClose: true,
        }}
      />
    </div>
  );
};

export default ProjectWorkflow;
