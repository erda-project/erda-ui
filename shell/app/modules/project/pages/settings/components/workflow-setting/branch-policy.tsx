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
import { EmptyHolder } from 'common';
import { Button, message, Spin } from 'antd';
import { uuid } from 'common/utils';
import { compact } from 'lodash';
import { FlowType } from 'project/common/config';
import { branchNameValidator, branchNameWithoutWildcard } from 'project/common/config';
import { WithAuth } from 'user/common';
import BranchPlicyCard from './branch-policy-card';
import i18n from 'i18n';

interface IProps {
  projectId: string;
  editAuth: boolean;
}

interface BranchPolicyData extends DEVOPS_WORKFLOW.BranchPolicy {
  id: string;
  openTempMerge: boolean;
}

export const convertPolicyData = (d: DEVOPS_WORKFLOW.BranchPolicy[]) =>
  d.map((item) => {
    return {
      ...item,
      id: uuid(),
      openTempMerge: !!item?.policy?.tempBranch,
      policy: item.policy && {
        ...item.policy,
        targetBranch: item.policy.targetBranch && {
          ...item.policy.targetBranch,
          cherryPick: item.policy.targetBranch.cherryPick || undefined,
        },
      },
    };
  });

const emptyId = uuid();
const emptyData = {
  id: emptyId,
  branch: '',
  openTempMerge: false,
  branchType: FlowType.SINGLE_BRANCH,
  policy: null,
};
const BranchPolicyList = ({ projectId, editAuth }: IProps) => {
  const [data, loading] = getBranchPolicy.useState();
  const [useData, setUseData] = React.useState<BranchPolicyData[]>(convertPolicyData(data?.branchPolicies || []));
  const [editData, setEditData] = React.useState<BranchPolicyData | null>(null);
  const fullDataRef = React.useRef(useData);
  const getData = () => {
    return getBranchPolicy.fetch({ projectID: projectId });
  };

  React.useImperativeHandle(fullDataRef, () => useData, [useData]);

  useMount(() => {
    getData();
  });

  const deleteData = (_id: string) => {
    updateData(useData.filter((pItem) => pItem.id !== _id));
  };

  const saveData = (d: BranchPolicyData) => {
    updateData(useData.map((item) => (item.id === d.id ? { ...d } : { ...item })));
  };

  const updateData = (policies: BranchPolicyData[]) => {
    if (data) {
      const rePolicies = policies.map((item) => {
        const { id, openTempMerge, ...rest } = item;
        return { ...rest };
      });
      updateBranchPolicy({ id: data.id, flows: data.flows, branchPolicies: rePolicies }).then(() => {
        getData().then(() => {
          message.success(i18n.t('updated successfully'));
          setEditData(null);
        });
      });
    }
  };

  React.useEffect(() => {
    setUseData(convertPolicyData(data?.branchPolicies || []));
  }, [data]);

  const validData = (d: BranchPolicyData) => {
    const validMap = getValid(
      d,
      (fullDataRef.current || []).filter((item) => item.id !== d.id),
    );
    const validStrArr = Object.keys(validMap);
    return validStrArr
      .filter((item) => !!validMap[item])
      .map((item) => {
        const v = validMap[item];
        const [l, t] = v.split(tipSplit);
        return { label: l, tip: t, key: item };
      });
  };

  const deleteCurData = (d: BranchPolicyData) => {
    setUseData((prev) => prev.filter((pItem) => pItem.id !== d.id));
  };
  const editCurData = (d: BranchPolicyData) => {
    setUseData((prev) => prev.map((pItem) => (pItem.id === d.id ? d : pItem)));
  };

  return (
    <Spin spinning={loading}>
      <div className="flex justify-end">
        <WithAuth pass={editAuth}>
          <Button
            type="primary"
            disabled={!!editData}
            onClick={() => {
              setUseData((prev) => [emptyData, ...prev]);
              setEditData({ ...emptyData });
            }}
          >
            {i18n.t('Add')}
          </Button>
        </WithAuth>
      </div>
      {useData.map((item) => {
        return (
          <BranchPlicyCard
            key={item.id}
            editAuth={editAuth}
            validData={validData}
            data={item}
            editId={editData?.id || ''}
            onEdit={() => setEditData({ ...item })}
            cancelEdit={() => {
              item.id === emptyId ? deleteCurData(item) : editData && editCurData(editData);
              setEditData(null);
            }}
            onDelete={() => deleteData(item.id)}
            onSave={saveData}
          />
        );
      })}
      {!useData.length ? <EmptyHolder relative /> : null}
    </Spin>
  );
};

const tipSplit = '_label_tip_';
const getValid = (policyData: BranchPolicyData, fullData: BranchPolicyData[]) => {
  const branchValidFun = (_label: string, _v?: string) => {
    let t = '';
    if (_v) {
      const [pass, tips] = branchNameValidator(_v);
      if (!pass) t = `${tips}`;
      if (!t && fullData.find((item) => item.branch === _v)) {
        t = `${_v} ${i18n.t('{name} already exists', { name: '' })}`;
      }
      return t ? `${_label}${tipSplit} ${t}` : '';
    }
    return `${_label}${tipSplit} ${i18n.t('can not be empty')}`;
  };
  const normalBranch = (_label: string, _v?: string, required?: boolean) => {
    let t = '';
    if (_v) {
      const [pass, tips] = branchNameWithoutWildcard(_v, false);
      t = !pass ? `${tips}` : '';
    } else if (required) {
      t = i18n.t('can not be empty');
    }
    return t ? `${_label}${tipSplit} ${t}` : '';
  };
  const rules = {
    sourceBranch: normalBranch,
    currentBranch: branchValidFun,
    branch: branchValidFun,
    tempBranch: (_label: string, _val?: string) => normalBranch(_label, _val, true),
    mergeRequest: normalBranch,
    cherryPick: (_label: string, _v?: string) => {
      let t = '';
      if (_v) {
        const [pass, tips] = branchNameWithoutWildcard(_v, true);
        t = !pass ? `${tips}` : '';
      }
      return t ? `${_label}${tipSplit} ${t}` : '';
    },
  };

  return {
    sourceBranch: rules.sourceBranch(
      i18n.s('source branch', 'dop'),
      policyData?.policy?.sourceBranch,
      policyData.branchType === FlowType.MULTI_BRANCH,
    ),
    // currentBranch: branchValid rules.currentBranch('当前分支', policyData?.policy?.currentBranch),
    branch: rules.branch(i18n.t('dop:branch'), policyData?.branch),
    tempBranch: policyData?.openTempMerge
      ? rules.tempBranch(i18n.s('temporary branch', 'dop'), policyData?.policy?.tempBranch)
      : '',
    mergeRequest: rules.mergeRequest(
      i18n.t('dop:target branch'),
      policyData?.policy?.targetBranch?.mergeRequest,
      policyData.branchType === FlowType.MULTI_BRANCH,
    ),
    cherryPick: rules.cherryPick(`pick ${i18n.t('dop:branch')}`, policyData?.policy?.targetBranch?.cherryPick),
  };
};

export default BranchPolicyList;
