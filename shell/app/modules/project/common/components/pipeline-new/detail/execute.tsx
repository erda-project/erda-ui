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
import { isEmpty, get } from 'lodash';
import { Spin, Modal, Tooltip, Menu, Dropdown, Input, Button } from 'antd';
import { EmptyHolder, Icon as CustomIcon, DeleteConfirm, ErdaIcon, ErdaAlert } from 'common';
import { useUpdate } from 'common/use-hooks';
import { goTo } from 'common/utils';
import { BuildLog } from './build-log';
import { defaultPipelineYml } from 'yml-chart/config';
import PipelineChart from './pipeline-chart';
import { ciBuildStatusSet, getIsInApp } from '../config';
import { WithAuth } from 'app/user/common';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import FileContainer from 'application/common/components/file-container';
import { useUpdateEffect, useEffectOnce } from 'react-use';
import { useLoading } from 'core/stores/loading';
import { rerunFailedPipeline, runPipeline, rerunPipeline, cancelPipeline } from 'project/services/pipeline';
import Info from './info';
import deployStore from 'application/stores/deploy';
import InParamsForm from './in-params-form';

import './execute.scss';

const { TextArea } = Input;
const { confirm } = Modal;

const noop = () => {};

interface PureExecuteProps {
  appId: string;
  projectId: string;
  pipelineDefinitionID?: string;
  deployAuth: { hasAuth: boolean; authTip?: string };
  editPipeline?: () => void;
  setPipelineId?: (v: string) => void;
  pipelineFileDetail?: TREE.NODE;
  chosenPipelineId: string | number;
  InfoComp?: (extraComp: React.ReactNode) => React.ReactNode;
  title?: string;
}

export const PureExecute = (props: PureExecuteProps) => {
  const {
    appId,
    projectId,
    deployAuth,
    editPipeline,
    pipelineDefinitionID,
    chosenPipelineId,
    setPipelineId,
    pipelineFileDetail,
    InfoComp,
    title,
  } = props;
  const isInApp = getIsInApp();
  const [pipelineDetail, changeType] = buildStore.useStore((s) => [s.pipelineDetail, s.changeType]);
  const curStatus = (pipelineDetail && pipelineDetail.status) || '';

  const [{ logVisible, logProps, rerunStartStatus, startStatus }, updater] = useUpdate({
    logVisible: false,
    logProps: {},
    startStatus: curStatus && ciBuildStatusSet.executeStatus.includes(curStatus) ? 'start' : 'unstart', // unstart-未开始，ready-准备开始，start-已开始,end:执行完成或取消
    rerunStartStatus: 'unstart',
  });

  const executeRef = React.useRef<{
    execute: (_ymlStr: string, extra: { pipelineId?: string; pipelineDetail?: BUILD.IPipelineDetail }) => void;
  }>(null);

  useUpdateEffect(() => {
    if (curStatus) {
      updater.startStatus(ciBuildStatusSet.executeStatus.includes(curStatus) ? 'start' : 'unstart');
    }
  }, [curStatus]);

  const rejectContentRef = React.useRef('');

  const { getBuildRuntimeDetail, updateTaskEnv, getPipelineDetail } = buildStore.effects;

  const { updateApproval } = deployStore.effects;

  const [getPipelineDetailLoading, addPipelineLoading] = useLoading(buildStore, ['getPipelineDetail', 'addPipeline']);

  // set a timer to loop get status, until websocket push is available
  const timer = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    if (pipelineDetail && ciBuildStatusSet.executeStatus.includes(pipelineDetail.status)) {
      timer.current && clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        chosenPipelineId && getPipelineDetail({ pipelineID: +chosenPipelineId });
      }, 30000);
    } else {
      timer.current && clearTimeout(timer.current);
    }
  }, [getPipelineDetail, pipelineDetail, chosenPipelineId]);

  React.useEffect(() => {
    chosenPipelineId &&
      `${chosenPipelineId}` !== `${pipelineDetail?.id}` &&
      getPipelineDetail({ pipelineID: +chosenPipelineId });
  }, [getPipelineDetail, chosenPipelineId]);

  useEffectOnce(() => {
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  });

  if (!pipelineDetail) {
    return <EmptyHolder relative style={{ justifyContent: 'start' }} />;
  }

  const { id: pipelineID, env, branch, extra, needApproval, pipelineButton } = pipelineDetail;

  const runBuild = (v?: Obj) => {
    updater.startStatus('pending');
    pipelineDefinitionID &&
      runPipeline({ pipelineDefinitionID, projectID: +projectId, ...v })
        .then((res) => {
          if (res.success) {
            updater.startStatus('start');
            res.data?.pipeline?.id && setPipelineId?.(res.data.pipeline.id);
          } else {
            updater.startStatus('unstart');
          }
        })
        .catch(() => {
          updater.startStatus('unstart');
        });
  };

  const nodeClickConfirm = (node: BUILD.PipelineNode) => {
    const disabled = node.status === 'Disabled';
    confirm({
      title: i18n.t('OK'),
      className: 'node-click-confirm',
      content: i18n.t('dop:whether {action} task {name}', {
        action: disabled ? i18n.t('Enable-open') : i18n.t('close'),
        name: node.name,
      }),
      onOk: () => updateEnv({ taskID: node.id, taskAlias: node.name, disabled: !disabled }),
      onCancel: noop,
    });
  };

  const onClickNode = (node: BUILD.PipelineNode, mark: string) => {
    const { id: taskID } = node;
    switch (mark) {
      case 'log':
        updater.logProps({
          taskID,
          pipelineID,
          logId: node.extra.uuid,
          taskContainers: node.extra.taskContainers,
        });
        updater.logVisible(true);
        break;
      case 'link': {
        const target = node.findInMeta((item: BUILD.MetaData) => item.name === 'runtimeID');
        if (target) {
          getBuildRuntimeDetail({ runtimeId: +target.value }).then((result) => {
            const params = {
              runtimeId: target.value,
              appId: result?.extra?.applicationId,
              workspace: result?.extra?.workspace,
            };
            !isEmpty(result) &&
              goTo(isInApp ? goTo.resolve.appDeployRuntime(params) : goTo.resolve.projectDeployRuntime(params), {
                jumpOut: true,
              });
          });
        }
        break;
      }
      case 'sonar-link':
        // 跳转到代码质量页
        // goTo(`./quality/${pipelineDetail.commitId}`);
        break;
      case 'release-link': {
        const linkMap = {
          'project-artifacts': goTo.pages.projectReleaseDetail,
          'release-ui': goTo.pages.applicationReleaseDetail,
        };
        const target = node.findInMeta((item: BUILD.MetaData) => item.name === 'releaseID');
        if (target) {
          goTo(linkMap[node.name] || goTo.pages.applicationReleaseDetail, {
            projectId,
            releaseId: target.value,
            jumpOut: true,
          });
        }
        break;
      }
      case 'publisher-link': {
        const publishItemIDTarget = node.findInMeta((item: BUILD.MetaData) => item.name === 'publishItemID');
        const typeTarget = node.findInMeta((item: BUILD.MetaData) => item.name === 'type') || ({} as any);
        if (publishItemIDTarget) {
          // 跳转到发布内容
          goTo(goTo.pages.publisherContent, {
            type: typeTarget.value || 'MOBILE',
            publisherItemId: publishItemIDTarget.value,
            jumpOut: true,
          });
        }
        break;
      }
      case 'pipeline-link': {
        const target = node.findInMeta((item: BUILD.MetaData) => item.name === 'pipelineID');
        if (target) {
          getPipelineDetail({ pipelineID: +target.value }).then((res) => {
            const curAppId = get(res, 'data.applicationID');
            goTo(goTo.pages.pipeline, { projectId, pipelineID: target.value, appId: curAppId, jumpOut: true });
          });
        }
        break;
      }
      case 'config-link':
        onClickConfigLink();
        break;
      case 'test-link':
        onClickTestLink(node);
        break;
      case 'accept':
        onAccept(node);
        break;
      case 'reject':
        onReject(node);
        break;
      default: {
        const hasStarted = startStatus !== 'unstart';
        if (!hasStarted && pipelineDetail && pipelineDetail.status === 'Analyzed' && deployAuth.hasAuth) {
          nodeClickConfirm(node);
        }
      }
    }
  };

  const onClickConfigLink = () => {
    goTo(goTo.pages.buildDetailConfig, { projectId, appId, branch: encodeURIComponent(branch), env, jumpOut: true });
  };

  const onClickTestLink = (node: BUILD.PipelineNode) => {
    const qaID = node.findInMeta((item: BUILD.MetaData) => item.name === 'qaID');
    if (qaID) {
      goTo(`../test/${qaID.value}`, { jumpOut: true });
    }
  };

  const onAccept = (node: BUILD.PipelineNode) => {
    const reviewIdObj = node.findInMeta((item: BUILD.MetaData) => item.name === 'review_id');
    if (reviewIdObj) {
      updateApproval({
        id: +reviewIdObj.value,
        reject: false,
      }).then(() => {
        getPipelineDetail({ pipelineID: pipelineDetail.id });
      });
    }
  };

  const onReject = (node: BUILD.PipelineNode) => {
    const reviewIdObj = node.findInMeta((item: BUILD.MetaData) => item.name === 'review_id');
    if (reviewIdObj) {
      confirm({
        title: i18n.t('reason for rejection'),
        content: (
          <TextArea
            onChange={(v) => {
              rejectContentRef.current = v.target.value;
            }}
          />
        ),
        onOk() {
          updateApproval({
            id: +reviewIdObj.value,
            reject: true,
            reason: rejectContentRef.current,
          }).then(() => {
            getPipelineDetail({ pipelineID: pipelineDetail.id });
          });
        },
      });
    }
  };

  const refreshPipeline = () => {
    getPipelineDetail({ pipelineID: +chosenPipelineId });
  };

  const updateEnv = (info: Omit<BUILD.ITaskUpdatePayload, 'pipelineID'>) => {
    updateTaskEnv({ ...info, pipelineID: pipelineDetail.id }).then(() => {
      getPipelineDetail({ pipelineID: +pipelineID });
    });
  };

  const hideLog = () => {
    updater.logVisible(false);
  };

  const cancelBuild = () => {
    pipelineDefinitionID &&
      cancelPipeline({ pipelineDefinitionID, projectID: +projectId }).then(() => {
        getPipelineDetail({ pipelineID });
        setPipelineId?.(`${pipelineID}`);
      });
  };

  const reRunPipeline = (isEntire: boolean) => {
    updater.rerunStartStatus('pending');
    const reRunFunc = !isEntire ? rerunFailedPipeline : rerunPipeline;
    pipelineDefinitionID &&
      reRunFunc({ pipelineDefinitionID, projectID: +projectId })
        .then((result) => {
          result?.data?.pipeline?.id && setPipelineId?.(result.data.pipeline.id);
          updater.rerunStartStatus('start');
        })
        .catch(() => updater.rerunStartStatus('unstart'));
  };

  const renderReRunMenu = () => {
    const { canRerunFailed, canRerun } = pipelineButton;
    return (
      <Menu>
        {canRerunFailed && (
          <Menu.Item>
            <span
              className={`${!deployAuth.hasAuth ? 'disabled' : ''}`}
              onClick={() => {
                reRunPipeline(false);
              }}
            >{`${i18n.t('dop:rerun failed node')}(${i18n.t('dop:commit unchanged')})`}</span>
          </Menu.Item>
        )}
        {canRerun && (
          <Menu.Item>
            <span
              className={!deployAuth.hasAuth ? 'disabled' : ''}
              onClick={() => {
                reRunPipeline(true);
              }}
            >{`${i18n.t('dop:rerun whole pipeline')}(${i18n.t('dop:commit unchanged')})`}</span>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const renderOnceRunBtn = ({ execTitle }: { execTitle: string }) => {
    const { canCancel, canRerun, canRerunFailed } = pipelineButton;
    const paddingEle = (
      <Tooltip title={i18n.t('preparing')}>
        <ErdaIcon
          type="loading"
          className="ml-2"
          color="black-4"
          size="20px"
          style={{ transform: 'translateY(0)' }}
          spin
        />
      </Tooltip>
    );
    return (
      <>
        <If condition={startStatus !== 'start' && rerunStartStatus !== 'pending'}>
          <Choose>
            <When condition={startStatus !== 'unstart'}>{paddingEle}</When>
            <Otherwise>
              <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                <Tooltip title={execTitle}>
                  <ErdaIcon
                    size="20"
                    className="ml-2 cursor-pointer"
                    fill="black-4"
                    onClick={() => {
                      const ymlStr = pipelineFileDetail?.meta?.pipelineYml || defaultPipelineYml;
                      executeRef?.current?.execute(ymlStr, { pipelineDetail });
                    }}
                    type="play1"
                  />
                </Tooltip>
              </WithAuth>
            </Otherwise>
          </Choose>
        </If>

        <If condition={canCancel}>
          <DeleteConfirm
            title={`${i18n.t('dop:confirm to cancel the current build')}?`}
            secondTitle=""
            onConfirm={() => {
              cancelBuild();
            }}
          >
            <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
              <Tooltip title={i18n.t('dop:cancel build')}>
                <ErdaIcon className="ml-2 cursor-pointer" fill="black-4" size="20" type="pause" />
              </Tooltip>
            </WithAuth>
          </DeleteConfirm>
        </If>
        {/* 现需求为“从失败处重试+全部重试” or “全部重试”，分别对应 Dropdown 和 icon 来操作 */}
        <If condition={startStatus !== 'pending'}>
          <Choose>
            <When condition={rerunStartStatus === 'pending'}>{paddingEle}</When>
            <Otherwise>
              <Choose>
                <When condition={canRerunFailed}>
                  {deployAuth.hasAuth ? (
                    <Dropdown overlay={renderReRunMenu()} placement="bottomCenter">
                      <ErdaIcon size="20" fill="black-4" type="redo" className="ml-2 cursor-pointer" />
                    </Dropdown>
                  ) : (
                    <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                      <ErdaIcon size="20" fill="black-4" type="redo" className="ml-2" />
                    </WithAuth>
                  )}
                </When>
                <Otherwise>
                  <If condition={canRerun}>
                    <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                      <Tooltip title={`${i18n.t('dop:rerun whole pipeline')}(commit ${i18n.t('unchanged')})`}>
                        <CustomIcon
                          onClick={() => {
                            reRunPipeline(true);
                          }}
                          type="refresh"
                          className="cursor-pointer ml-2"
                        />
                      </Tooltip>
                    </WithAuth>
                  </If>
                </Otherwise>
              </Choose>
            </Otherwise>
          </Choose>
        </If>
      </>
    );
  };

  const { showMessage } = extra;
  if (!pipelineDetail) {
    return <EmptyHolder relative style={{ justifyContent: 'start' }} />;
  }

  return (
    <>
      {InfoComp?.(renderOnceRunBtn({ execTitle: i18n.t('Execute') }))}
      <Spin spinning={getPipelineDetailLoading || addPipelineLoading}>
        <div>
          {needApproval ? (
            <ErdaAlert
              message={i18n.t(
                'dop:There are manual review nodes in this workflow, which need to be reviewed by the project admin.',
              )}
              className="mt-1"
              type="info"
            />
          ) : null}
          <div>
            {showMessage && showMessage.msg ? (
              <div className="build-detail-err-msg mb-2">
                <div className="build-err-header">
                  <ErdaIcon type="tishi" size="18px" className="build-err-icon" />
                  <pre>{showMessage.msg}</pre>
                </div>
                {showMessage.abortRun ? (
                  <div className="build-err-stack">
                    <ul style={{ listStyle: 'disc' }}>
                      {showMessage.stacks.map((stack, i) => (
                        <li key={`${stack}-${String(i)}`}>
                          <pre style={{ overflow: 'hidden', whiteSpace: 'pre-wrap' }}>{stack}</pre>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
            <FileContainer
              className={'pipeline-execute-file-container'}
              name={title}
              showLoading={false}
              ops={
                <div>
                  <Button onClick={refreshPipeline} size="small" className="mr-1">
                    {i18n.t('refresh')}
                  </Button>
                  {editPipeline ? (
                    <Button onClick={editPipeline} size="small">
                      {i18n.t('Edit')}
                    </Button>
                  ) : null}
                </div>
              }
            >
              <PipelineChart
                data={pipelineDetail as unknown as PIPELINE.IPipelineDetail}
                onClickNode={onClickNode}
                changeType={changeType}
              />
            </FileContainer>
          </div>
        </div>
      </Spin>
      <InParamsForm
        ref={executeRef}
        afterExecute={() => updater.startStatus('unstart')}
        beforeExecute={() => updater.startStatus('pending')}
        onExecute={runBuild}
      />
      <BuildLog visible={logVisible} hideLog={hideLog} {...logProps} />
    </>
  );
};

interface IProps {
  appId: string;
  projectId: string;
  pipelineId: string;
  pipelineDefinitionID?: string;
  fileChanged?: boolean;
  deployAuth: { hasAuth: boolean; authTip?: string };

  pipelineFileDetail?: TREE.NODE;
  extraTitle: React.ReactNode;
  pipelineDetail?: BUILD.IPipelineDetail;
  setPipelineId?: (v: string) => void;
  switchToEditor: () => void;
  editPipeline?: () => void;
}

const Execute = (props: IProps) => {
  const { pipelineId, pipelineFileDetail, switchToEditor, fileChanged = false, extraTitle } = props;

  return (
    <div className="pipeline-execute">
      {fileChanged ? (
        <ErdaAlert
          message={
            <div>
              {`${i18n.t('dop:pipeline-changed-tip2')} `}
              <span className="text-purple-deep cursor-pointer" onClick={switchToEditor}>
                {i18n.t('dop:edit to check')}
              </span>
            </div>
          }
          closeable={false}
        />
      ) : null}

      <PureExecute
        {...props}
        chosenPipelineId={pipelineId}
        title={`${i18n.t('Pipeline')} (${i18n.t('dop:the latest execution status')})`}
        InfoComp={(extraComp: React.ReactNode) => {
          return (
            <Info
              info={pipelineFileDetail}
              className="mb-2"
              operations={
                <div className="flex-h-center">
                  {extraComp}
                  {extraTitle}
                </div>
              }
            />
          );
        }}
      />
    </div>
  );
};

export default Execute;
