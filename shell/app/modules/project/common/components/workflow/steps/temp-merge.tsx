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
import { Switch } from 'antd';
import { Ellipsis } from 'common';
import { goTo } from 'common/utils';
import i18n from 'i18n';
import { ChangeBranch, DevFlowInfo, restartDeploy, updateDeploy } from 'project/services/project-workflow';
import BaseStep, { IBaseProps } from './base-step';

interface IProps extends IBaseProps {
  data: DevFlowInfo;
  projectID: number;
  afterRebuild?: () => void;
  afterChangeStatus?: (status: boolean) => void;
}

// const MergeFailTips = ({ branch, tempBranch }: { branch: string; tempBranch: string }) => {
//   const tips = [
//     '> git clone xxx',
//     `> git checkout ${tempBranch}`,
//     `> git merge ${branch}`,
//     `# ${i18n.t('dop:resolve conflict manually')}`,
//     `> git push ${tempBranch}`,
//   ];
//   // merge failed, Perform the following operations to resolve the problem
//   return (
//     <div>
//       <p>合并失败，请根据以下操作解决</p>
//       {tips.map((tip) => (
//         <p className="mb-1 text-sub" key={tip}>
//           {tip}
//         </p>
//       ))}
//     </div>
//   );
// };

interface IChangeList {
  list: ChangeBranch[];
  projectId: number;
  appId: number;
  tempBranch: string;
  isJoinTempBranch?: boolean;
}

const ChangeList = ({ list, projectId, appId }: IChangeList) => {
  const handleClick = ({ repoMergeID }: ChangeBranch) => {
    goTo(goTo.pages.appMr, {
      projectId,
      appId,
      mrId: repoMergeID,
      jumpOut: true,
    });
  };
  return (
    <div className="border border-default-1 border-solid p-2">
      <div className="max-h-[80px] overflow-y-auto">
        {list.map((item) => {
          const { branchName, status, commit } = item;
          return (
            <div key={branchName} className="flex justify-between items-center cursor-pointer mb-1">
              <div
                className="max-w-[240px] flex items-center flex-1"
                onClick={() => {
                  handleClick(item);
                }}
              >
                <Ellipsis className="px-2 rounded text-blue-deep bg-blue-light" title={branchName} />
                <a
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 hover:text-purple-deep"
                  href={goTo.resolve.commit({ projectId, appId, commitId: commit })}
                  target="_blank"
                >
                  ({commit.slice(0, 6)})
                </a>
              </div>
              {/* {isJoinTempBranch ? ( */}
              {/*   status === 'success' ? ( */}
              {/*     <span className="text-success">[OK]</span> */}
              {/*   ) : ( */}
              {/*     <Popover content={<MergeFailTips branch={branchName} tempBranch={tempBranch} />}> */}
              {/*       <span className="text-error">[FAIL]</span> */}
              {/*     </Popover> */}
              {/*   ) */}
              {/* ) : null} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TempMerge: React.FC<IProps> = ({ data, afterChangeStatus, afterRebuild, projectID, beta }) => {
  const { mergeID, isJoinTempBranch, appID } = data?.devFlowNode || {};
  const handleReBuild = async () => {
    await restartDeploy.fetch({
      mergeID,
      appID,
    });
    afterRebuild?.();
  };
  const handleChangeJoin = async (enable: boolean) => {
    await updateDeploy.fetch({
      enable,
      mergeID,
      appID,
    });
    afterChangeStatus?.(enable);
  };
  return (
    <BaseStep
      title={i18n.t('dop:{type} node', { type: i18n.t('msp:deployment branch') })}
      beta={beta}
      extra={
        <>
          {isJoinTempBranch ? (
            <>
              <span className="text-danger cursor-pointer ml-2" onClick={handleReBuild}>
                reBuild
              </span>
              <Switch
                checkedChildren="on"
                unCheckedChildren="off"
                checked={isJoinTempBranch}
                onChange={handleChangeJoin}
              />
            </>
          ) : null}
        </>
      }
    >
      <div className="workflow-step-temp-merge">
        <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">{i18n.t('dop:Change list')}</p>
        <ChangeList
          projectId={projectID}
          appId={appID}
          list={data?.changeBranch}
          tempBranch={''}
          isJoinTempBranch={data.devFlowNode.isJoinTempBranch}
        />
      </div>
    </BaseStep>
  );
};

export default TempMerge;
