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
import { getBranchPolicy } from 'project/services/project-workflow';
import { ErdaIcon, EditField } from 'common';
import { Button, Select, Drawer, Divider } from 'antd';
import { goTo } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import i18n from 'i18n';
import { ENV_MAP } from 'project/common/config';
import { convertPolicyData } from './branch-policy';
import BranchPolicyCard from './branch-policy-card';
import { Link } from 'react-router-dom';

interface BranchFlowsData extends DEVOPS_WORKFLOW.BranchFlows {
  id: string;
}

const envArr = Object.keys(ENV_MAP).map((env) => ({ name: ENV_MAP[env], value: env }));

interface FlowDrawerProps {
  visible: boolean;
  fullData: BranchFlowsData[];
  branchData?: DEVOPS_WORKFLOW.BranchPolicy[];
  flowData: BranchFlowsData | null;
  projectId: string;
  onSubmit: (val: BranchFlowsData, branchData: DEVOPS_WORKFLOW.BranchPolicy[]) => void;
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
    branchData: DEVOPS_WORKFLOW.BranchPolicy[];
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
          updater.editData((prev: DEVOPS_WORKFLOW.BranchFlows) => ({ ...prev, name: e.target.value }));
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
          updater.editData((prev: DEVOPS_WORKFLOW.BranchFlows) => ({ ...prev, artifact: v }));
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
          updater.editData((prev: DEVOPS_WORKFLOW.BranchFlows) => ({ ...prev, environment: v }));
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
                updater.editData((prev: DEVOPS_WORKFLOW.BranchFlows) => ({ ...prev, targetBranch: v }));
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

export default FlowDrawer;
