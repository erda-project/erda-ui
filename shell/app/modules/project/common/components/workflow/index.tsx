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
import { DevFlowInfo, DevFlowInfos, getPipelineDetail, PipelineInfo } from 'project/services/project-workflow';
import { ErdaIcon, Ellipsis, EmptyHolder, Badge, MarkdownRender } from 'common';
import i18n from 'i18n';
import { ciStatusMap } from 'project/common/components/pipeline-new/config';
import { Popover, Tooltip } from 'antd';
import { goTo } from 'common/utils';
import { ciNodeStatusSet } from 'project/common/components/pipeline-new/config';
import { produce } from 'immer';
import { decode } from 'js-base64';
import { tempMerge } from 'project/services/project-workflow';

export interface IProps {
  scope: 'ISSUE' | 'MR';
  projectID: number;
  flowInfo: DevFlowInfos;
  getFlowNodeList: () => void;
}

interface IPipelineInfo extends PipelineInfo {
  taskCount?: {
    taskTotal?: number;
    finishTaskTotal?: number;
  };
}

const WorkflowItem: React.FC<
  {
    data: DevFlowInfo;
  } & Omit<IProps, 'flowInfo'>
> = ({ data, scope, getFlowNodeList, projectID }) => {
  const code = ({ index, className }: { index: number; className?: string }) => (
    <CodeCard index={index} data={data} projectID={`${projectID}`} className={className} reload={getFlowNodeList} />
  );
  const merge = ({ index, className }: { index: number; className?: string }) => (
    <MergeCard index={index} data={data} projectID={`${projectID}`} className={className} reload={getFlowNodeList} />
  );
  const pipeline = ({ index, className }: { index: number; className?: string }) => (
    <PipelineCard index={index} data={data} projectID={`${projectID}`} className={className} />
  );
  const split = ({ className }: { className?: string }) => (
    <div className={`w-5 h-[2px] bg-default-1 mt-7 ${className}`} />
  );

  const cardMap = {
    ISSUE: [code, split, merge, split, pipeline],
    MR: [merge, split, pipeline],
  };

  const content = cardMap[scope];

  return (
    <div className="flex overflow-x-auto p-2">
      {content.map((Item, idx) => (
        <Item key={`${idx}`} index={idx / 2 + 1} className="flex-shrink-0" />
      ))}
    </div>
  );
};

const Branch = ({
  branch,
  appId,
  projectId,
  className,
}: {
  branch: string;
  projectId: string | number;
  appId: string | number;
  className?: string;
}) => {
  return (
    <div
      className={`${className} flex-h-center text-xs group jump-out-link`}
      onClick={() => {
        goTo(goTo.pages.repoBranch, { appId, projectId, branch, jumpOut: true });
      }}
    >
      <ErdaIcon type="hebing" className="mr-1 text-default-4 group-hover:text-purple-deep" />
      <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={branch} />
    </div>
  );
};

const Commit = ({
  commitId,
  appId,
  projectId,
  className,
}: {
  commitId: string;
  projectId: string | number;
  appId: string | number;
  className?: string;
}) => {
  return (
    <div
      className={`${className} text-xs group flex-h-center jump-out-link`}
      onClick={() => {
        goTo(goTo.pages.commit, {
          projectId,
          appId,
          commitId,
          jumpOut: true,
        });
      }}
    >
      <ErdaIcon type="commitID" className="mr-1 mt-0.5 text-default-4 group-hover:text-purple-deep" />
      <span className="text-default-8 group-hover:text-purple-deep">{commitId.slice(0, 6)}</span>
    </div>
  );
};

const Status = ({ status, index }: { status: string; index: number }) => {
  const statusMap = {
    success: (
      <div className="bg-green-1 w-6 h-6 rounded-full  flex-all-center ">
        <ErdaIcon type="check" size={'14'} className="text-green" />
      </div>
    ),
    process: <div className="bg-blue text-white w-6 h-6 rounded-full  flex-all-center ">{index}</div>,
    wait: <div className="border border-solid border-black w-6 h-6 rounded-full  flex-all-center ">{index}</div>,
    error: (
      <div className="bg-red-1 w-6 h-6 rounded-full  flex-all-center ">
        <ErdaIcon type="close" size={'14'} className="text-red" />
      </div>
    ),
    warnning: (
      <div className="bg-yellow-1 w-6 h-6 rounded-full  flex-all-center ">
        <span className="text-yellow">!</span>
      </div>
    ),
  };
  return statusMap[status] || null;
};

interface CardProps {
  data: DevFlowInfo;
  className?: string;
  index: number;
  projectID: string;
  reload?: () => void;
}
const CodeCard = (props: CardProps) => {
  const { data, projectID, reload, index, className } = props;
  const { canJoin, commit, sourceBranch, appID, mergeID, tempBranch } = data.devFlowNode || {};
  return (
    <div className={`hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded ${className} `}>
      <Status status="success" index={index} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center justify-between">
          <div className="flex-h-center">
            <span>{i18n.t('dop:Code')}</span>
            <Tooltip title={i18n.s('All development code of this task is managed in this branch', 'dop')}>
              <ErdaIcon type="help" className="text-default-3 ml-1" />
            </Tooltip>
          </div>
          <Tooltip
            title={!tempBranch ? i18n.s('The temporary merge is not enabled, please set it before merging', 'dop') : ''}
          >
            <div
              onClick={() => {
                tempBranch &&
                  canJoin &&
                  tempMerge({ mergeId: mergeID, enable: true }).then(() => {
                    reload?.();
                  });
              }}
              className={`px-3 rounded cursor-pointer ${
                canJoin && tempBranch ? ' bg-purple-deep text-white' : 'bg-default-08 text-default-4'
              }`}
            >
              {canJoin ? i18n.s('Merge into temporary branch', 'dop') : i18n.s('Merged into temporary branch', 'dop')}
            </div>
          </Tooltip>
        </div>
        <Branch className="mb-2" appId={appID} projectId={projectID} branch={sourceBranch} />
        <div className="flex-h-center text-xs">
          {commit ? (
            <>
              <Commit commitId={commit.id} appId={appID} projectId={projectID} />
              <ErdaIcon type="caret-down" size="12" className="ml-1 text-default-4 -rotate-90" />
              <Ellipsis className="flex-1 text-default-8" title={commit.commitMessage} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const MergeCard = (props: CardProps) => {
  const { data, projectID, index, className, reload } = props;
  const { isJoinTempBranch, baseCommit, tempBranch, appID, commit, mergeID } = data.devFlowNode || {};
  const status = data.changeBranch?.find((item) => item.commit.id === commit?.id) ? 'success' : 'process';
  const ChangeList = (
    <div className="w-[344px]">
      <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">{i18n.t('dop:Change list')}</p>
      {data?.changeBranch?.map((item, idx) => {
        return (
          <div key={idx} className="flex-h-center p-2 hover:bg-default-06 overflow-hidden">
            <Branch
              className="w-[120px] mr-2 flex-shrink-0"
              branch={item.branchName}
              appId={appID}
              projectId={projectID}
            />
            <Commit
              className="w-[60px] mr-2  flex-shrink-0"
              commitId={item.commit.id}
              appId={`${appID}`}
              projectId={projectID}
            />
            <div className="flex-h-center w-[140px] text-xs  flex-shrink-0">
              <ErdaIcon type="caret-down" size="12" className="ml-1 text-default-4 -rotate-90" />
              <Ellipsis className="flex-1 text-default-8" title={item.commit.commitMessage} />
            </div>
          </div>
        );
      })}
      {!data?.changeBranch?.length ? <EmptyHolder style={{ height: 100 }} relative /> : null}
    </div>
  );

  return (
    <div className={`hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded ${className}`}>
      <Status index={index} status={status} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center justify-between">
          <div className="flex-h-center">
            <span>{i18n.s('Temporary merge', 'dop')}</span>
            <Tooltip
              title={i18n.s(
                'Code branches of different tasks can be temporarily merged and deployed to the corresponding environment',
                'dop',
              )}
            >
              <ErdaIcon type="help" className="text-default-3 ml-1" />
            </Tooltip>
          </div>
          {tempBranch && isJoinTempBranch ? (
            <div
              onClick={() => {
                tempMerge({ mergeId: mergeID, enable: false }).then(() => {
                  reload?.();
                });
              }}
              className={`px-3 rounded ${
                isJoinTempBranch ? 'cursor-pointer bg-purple-deep text-white' : 'bg-default-08 text-default-4'
              }`}
            >
              {i18n.s('Revoke temporary merge', 'dop')}
            </div>
          ) : null}
        </div>
        {tempBranch ? (
          <>
            <div className="flex-h-center mb-2 text-xs">
              <Branch appId={appID} projectId={projectID} branch={tempBranch} className="overflow-hidden" />
              <Popover content={ChangeList}>
                <span className="text-purple-deep cursor-pointer ml-2 whitespace-nowrap">
                  {i18n.s('More merger information', 'dop')}
                </span>
              </Popover>
            </div>
            <div className="flex-h-center text-xs">
              {baseCommit ? (
                <>
                  <Commit commitId={baseCommit.id} appId={appID} projectId={projectID} />
                  <ErdaIcon type="caret-down" size="12" className="ml-1 text-default-4 -rotate-90" />
                  <Ellipsis className="flex-1 text-default-8" title={baseCommit.commitMessage} />
                </>
              ) : (
                <>
                  <ErdaIcon type="commitID" className="mr-1 text-default-4" />
                  <Ellipsis
                    className="flex-1 text-default-8"
                    title={i18n.s('This task branch has no content merged', 'dop')}
                  />
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-xs text-default-8">
            <span>{i18n.s('The temporary merge function is not currently enabled, please go to', 'dop')}</span>
            &nbsp;
            <span
              className="text-purple-deep cursor-pointer"
              onClick={() => {
                goTo(goTo.pages.projectSetting, { jumpOut: true, query: { tabKey: 'workflow' } });
              }}
            >
              {i18n.t('dop:R&D Workflow')}
            </span>
            &nbsp;
            <span>{i18n.s('to set', 'dop')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PipelineCard = (props: CardProps) => {
  const { data, projectID, className, index } = props;
  const { pipelineStepInfos, devFlowNode, inode, hasOnPushBranch } = data;
  const [pipelineInfo, setPipelineInfo] = React.useState<IPipelineInfo[]>(pipelineStepInfos);
  const { commit, tempBranch } = data.devFlowNode || {};

  const getStepStatus = () => {
    const colorMap = {
      red: 'error',
      blue: 'process',
      green: 'success',
      orange: 'warnning',
      gray: 'process',
    };
    return pipelineStepInfos?.[0]?.status
      ? colorMap[ciStatusMap[pipelineStepInfos?.[0]?.status]?.color || 'process']
      : 'process';
  };
  const stepStatus = data.changeBranch?.find((item) => item.commit.id === commit?.id) ? getStepStatus() : 'wait';

  React.useEffect(() => {
    setPipelineInfo(pipelineStepInfos);
    const queryQueue = (pipelineStepInfos ?? [])
      .filter((item) => !!item.pipelineID)
      .map((item) => getPipelineDetail({ pipelineID: item.pipelineID }).then((res) => res.data));
    Promise.all(queryQueue ?? []).then((pipelineDetails) => {
      const taskMap = {};
      pipelineDetails.forEach((pipelineDetail) => {
        if (pipelineDetail) {
          const { pipelineStages } = pipelineDetail;
          const taskTotal = pipelineStages.reduce((prev, curr) => prev + curr.pipelineTasks?.length ?? 0, 0);
          const finishTaskTotal = pipelineStages.reduce(
            (prev, curr) =>
              prev + curr.pipelineTasks?.filter((t) => ciNodeStatusSet.taskFinalStatus.includes(t.status)).length,
            0,
          );
          taskMap[pipelineDetail.id] = {
            finishTaskTotal,
            taskTotal,
          };
        }
      });
      const newInfo = produce(pipelineStepInfos ?? [], (draft) =>
        draft.map((item) => {
          return {
            ...item,
            taskCount: taskMap[item.pipelineID],
          };
        }),
      );
      setPipelineInfo(newInfo);
    });
  }, [pipelineStepInfos]);

  const pipeline = pipelineInfo[0]; // || { status: 'Running', pipelineID: '121212', ymlName: 'pipeline.yml' };

  const genGuideCode = `
  \`\`\`yml
  on:
    push:
      branches:
        - ${tempBranch}
  \`\`\`
  `;

  const { status, text } = ciStatusMap[pipeline?.status || 'Initializing'];

  let subContent: JSX.Element | null = null;
  if (!tempBranch) {
    subContent = (
      <div className="text-xs text-default-8">
        {i18n.s('The temporary merge is not enabled, and there is no pipeline', 'dop')}
      </div>
    );
  } else if (!inode) {
    subContent = (
      <div className="text-xs text-default-8">
        {i18n.s('There is no pipeline for the temporary branch, please contact the administrator to create', 'dop')}
      </div>
    );
  } else if (!hasOnPushBranch) {
    const pipelineName = decode(inode).split('/').pop();
    subContent = (
      <>
        <div
          className="flex-h-center text-xs group jump-out-link"
          onClick={() => {
            goTo(goTo.pages.pipelineRoot, {
              jumpOut: true,
              projectId: projectID,
              appId: devFlowNode.appID,
              query: { nodeId: inode },
            });
          }}
        >
          <ErdaIcon type="liushuixian-5i55l85f" className="mr-1 text-default-4 group-hover:text-purple-deep" />
          <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={pipelineName} />
        </div>
        <div className="text-xs mt-2 text-default-8">
          <span>{i18n.s('The pipeline is not configured with triggers yet.', 'dop')}</span>
          <Popover
            content={
              <div>
                <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">
                  <Ellipsis title={i18n.t('dop:Add the following configuration to the pipeline file')} />
                </p>
                <MarkdownRender className="p-0" value={genGuideCode} />
              </div>
            }
          >
            <span className="text-purple-deep cursor-pointer">{i18n.s('How to configure?', 'dop')}</span>
          </Popover>
        </div>
      </>
    );
  } else if (pipeline) {
    subContent = (
      <>
        <div
          className="flex-h-center text-xs group jump-out-link"
          onClick={() => {
            goTo(goTo.pages.pipelineRoot, {
              jumpOut: true,
              projectId: projectID,
              appId: devFlowNode.appID,
              query: { pipelineID: pipeline.pipelineID },
            });
          }}
        >
          <ErdaIcon type="liushuixian-5i55l85f" className="mr-1 text-default-4 group-hover:text-purple-deep" />
          <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={pipeline.ymlName} />
        </div>
        <div>
          <Badge status={status} text={text} onlyText size={'small'} />
        </div>
      </>
    );
  }

  return (
    <div className={`hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded ${className}`}>
      <Status status={stepStatus} index={index} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center">
          <span>{i18n.t('Pipeline')}</span>
          <Tooltip
            title={i18n.s(
              'This is a temporary merge pipeline. If you need to modify it, please contact the application administrator',
              'dop',
            )}
          >
            <ErdaIcon type="help" className="text-default-3 ml-1" />
          </Tooltip>
        </div>
        {subContent}
      </div>
    </div>
  );
};

const Workflow: React.FC<IProps> = ({ scope, projectID, getFlowNodeList, flowInfo }) => {
  const { devFlowInfos } = flowInfo ?? {};

  return (
    <>
      {devFlowInfos?.map((item, idx) => {
        const { hasPermission } = item;
        const appName = item.devFlowNode?.appName || '';

        return (
          <div key={idx} className="border-all rounded mb-2">
            <div className="px-4 py-2 flex-h-center border-bottom bg-default-02 justify-between ">
              <div className="flex-h-center">
                <ErdaIcon size={16} className="text-default-4" type="yingyongmingcheng" />
                <span className="ml-2 font-medium text-default">{appName}</span>
              </div>
              <ErdaIcon
                onClick={() => {
                  getFlowNodeList();
                }}
                size={18}
                type="shuaxin"
                className=" font-medium cursor-pointer text-default-6 hover:text-default-8"
              />
            </div>
            <div className="p-2">
              {!hasPermission ? (
                <div className="text-center flex-1 text-sub">
                  {i18n.t(
                    'dop:No permission to access the current application {name}, Contact the application administrator to add permission',
                    { name: item.devFlowNode.appName },
                  )}
                </div>
              ) : (
                <WorkflowItem data={item} scope={scope} projectID={projectID} getFlowNodeList={getFlowNodeList} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Workflow;
