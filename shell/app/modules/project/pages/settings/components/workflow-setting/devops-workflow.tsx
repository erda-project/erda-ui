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
import { getBranchPolicy, updateBranchPolicy, BranchFlows, BranchPolicy } from 'project/services/project-workflow';
import { useMount } from 'react-use';
import { ErdaIcon, Table, EditField } from 'common';
import { Button, Select, Drawer, Modal, Divider, Popover } from 'antd';
import { uuid, goTo } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { IActions } from 'common/components/table/interface';
import i18n from 'i18n';
import { ENV_MAP } from 'project/common/config';
import { BranchPolicyItem, convertPolicyData } from './branch-policy';
import { WithAuth } from 'user/common';
import { Link } from 'react-router-dom';

interface IProps {
  projectId: string;
  editAuth: boolean;
}

interface BranchFlowsData extends BranchFlows {
  id: string;
}

const envArr = Object.keys(ENV_MAP).map((env) => ({ name: ENV_MAP[env], value: env }));

const convertData = (d: BranchFlows[]) =>
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

  const saveData = (d: BranchFlowsData, branchData: BranchPolicy[]) => {
    let curData = [...useData];
    if (d.id) {
      curData = curData.map((item) => (item.id === d.id ? { ...d } : { ...item }));
    } else {
      curData = [...curData, { ...d }];
    }
    updateData(curData, branchData);
  };

  const updateData = (_flows: BranchFlowsData[], branchData?: BranchPolicy[]) => {
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
                    <BranchPolicyItem data={policyObj} />
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
    <div className="">
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

interface FlowDrawerProps {
  visible: boolean;
  fullData: BranchFlowsData[];
  branchData?: BranchPolicy[];
  flowData: BranchFlowsData | null;
  projectId: string;
  onSubmit: (val: BranchFlowsData, branchData: BranchPolicy[]) => void;
  onClose: () => void;
}
const FlowDrawer = ({
  visible,
  flowData,
  onClose,
  onSubmit,
  fullData,
  projectId,
  branchData: propsBranchData,
}: FlowDrawerProps) => {
  const [{ editData, nameValid, branchData }, updater, update] = useUpdate<{
    editData: BranchFlowsData | null;
    nameValid: string;
    branchData: BranchPolicy[];
  }>({
    editData: flowData,
    nameValid: '',
    branchData: propsBranchData || [],
  });

  React.useEffect(() => {
    if (!visible) {
      update({ editData: null, nameValid: '' });
    } else {
      getBranchPolicy({ projectID: projectId }).then((res) => {
        updater.branchData(res?.data?.branchPolicies || []);
      });
    }
  }, [visible, projectId]);

  React.useEffect(() => {}, []);

  React.useEffect(() => {
    update({ editData: flowData });
  }, [flowData, propsBranchData]);

  const extraData = fullData.filter((item) => item.id !== editData?.id);

  const title = `${
    flowData
      ? `${i18n.t('edit {name}', { name: i18n.t('dop:workflow') })}`
      : `${i18n.t('add {name}', { name: i18n.t('dop:workflow') })}`
  }`;
  const curPolicy = branchData.find((item) => item.branch === editData?.targetBranch);
  const policyObj = (curPolicy ? convertPolicyData([curPolicy]) : [])[0];
  const policyComp = editData?.targetBranch ? (
    <div className="ml-[116px] mt-2">
      {curPolicy ? (
        <div>
          <div className="flex-h-center">
            <span className="text-default-6">{i18n.s('Branch policy', 'dop')}</span>
          </div>
          <BranchPolicyItem data={policyObj} />
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
  ) : null;

  const fieldsList = [
    {
      label: i18n.t('Name'),
      type: 'input',
      icon: 'lc',
      showRequiredMark: true,
      name: 'name',
      itemProps: {
        className: 'px-2 bg-default-06 w-[300px]',
        placeholder: i18n.t('dop:within {num} characters', { num: 36 }),
        maxLength: 36,

        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const curVal = e.target.value;
          updater.nameValid(
            !curVal
              ? i18n.t('{label} can not be empty', { label: i18n.t('Name') })
              : extraData.find((item) => item.name === curVal)
              ? i18n.t('{name} already exists', { name: i18n.t('Name') })
              : '',
          );
          updater.editData((prev: BranchFlows) => ({ ...prev, name: e.target.value }));
        },
      },
      suffix: nameValid ? <div className="text-red ml-2">{nameValid}</div> : null,
    },

    {
      label: i18n.t('dop:Artifact type'),
      type: 'select',
      icon: 'components',
      showRequiredMark: true,
      name: 'artifact',
      itemProps: {
        className: 'bg-default-06 !w-[300px]',
        allowClear: false,
        onChange: (v: string) => {
          updater.editData((prev: BranchFlows) => ({ ...prev, artifact: v }));
        },
        options: ['alpha', 'beta', 'stable', 'rc'].map((item) => (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        )),
        placeholder: i18n.t('please select the {name}', { name: i18n.t('dop:Artifact type') }),
      },
    },
    {
      label: i18n.t('dop:Deployment environment'),
      type: 'select',
      showRequiredMark: true,
      name: 'environment',
      icon: 'huanjing',
      itemProps: {
        allowClear: false,
        className: 'bg-default-06 !w-[300px]',
        onChange: (v: string) => {
          updater.editData((prev: BranchFlows) => ({ ...prev, environment: v }));
        },
        options: envArr.map((item) => (
          <Select.Option key={item.value} value={item.value}>
            {item.name}
          </Select.Option>
        )),
        placeholder: i18n.t('please select the {name}', { name: i18n.t('Environments') }),
      },
    },
    {
      label: i18n.s('Branch policy', 'dop'),
      showRequiredMark: true,
      name: 'targetBranch',
      icon: 'daimafenzhi',
      type: 'custom',
      getComp: ({ value }: { value: string }) => {
        return (
          <div>
            <Select
              bordered={false}
              className="bg-default-06 w-[300px]"
              value={value}
              placeholder={i18n.t('please select the {name}', { name: '分支' })}
              suffixIcon={<ErdaIcon type="caret-down" className="text-default-3" />}
              onChange={(v) => {
                updater.editData((prev: BranchFlows) => ({ ...prev, targetBranch: v }));
              }}
              onDropdownVisibleChange={(vis: boolean) => {
                if (vis) {
                  getBranchPolicy({ projectID: projectId }).then((res) => {
                    updater.branchData(res?.data?.branchPolicies || []);
                  });
                }
              }}
              dropdownRender={(menu: React.ReactNode) => (
                <div>
                  {menu}
                  <Divider className="my-1" />
                  <Link
                    to={`${goTo.resolve.projectSetting()}?tabKey=branchPolicy`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(goTo.resolve.projectSetting(), { jumpOut: true, query: { tabKey: 'branchPolicy' } });
                    }}
                  >
                    <div className="mx-3 text-purple-deep">
                      {i18n.t('edit {name}', { name: i18n.t('dop:branch policy') })}
                    </div>
                  </Link>
                </div>
              )}
            >
              {(branchData || []).map((item) => (
                <Select.Option key={item.branch} value={item.branch}>
                  {item.branch}
                </Select.Option>
              ))}
            </Select>
          </div>
        );
      },
      extraContent: policyComp,
    },
  ];

  const submitAble =
    !nameValid && editData?.name && editData?.targetBranch && editData?.artifact && editData?.environment;

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      width={'80%'}
      footer={
        <div>
          <Button
            type="primary"
            disabled={!submitAble}
            className="mr-2"
            onClick={() => {
              editData && onSubmit({ ...editData }, branchData);
            }}
          >
            {i18n.t('Save')}
          </Button>
          <Button onClick={onClose}>{i18n.t('Cancel')}</Button>
        </div>
      }
    >
      <div className="px-8">
        {fieldsList.map((item) => {
          return <EditField key={item.name} {...item} data={editData} className="flex-1 mt-6" />;
        })}
      </div>
    </Drawer>
  );
};

export default DevOpsWorkflow;
