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
import { EmptyHolder, Icon as CustomIcon, DeleteConfirm, IF, ErdaIcon, ErdaAlert, Badge } from 'common';
import { useUpdate } from 'common/use-hooks';
import { goTo, updateSearch } from 'common/utils';
import { BuildLog } from 'application/pages/pipeline/run-detail/build-log';
import PipelineChart from 'application/pages/pipeline/run-detail/pipeline-chart';
import { ciBuildStatusSet } from 'application/pages/pipeline/run-detail/config';
import { WithAuth } from 'app/user/common';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import FileContainer from 'application/common/components/file-container';
import { useUpdateEffect, useEffectOnce } from 'react-use';
import { useLoading } from 'core/stores/loading';
import Info from './info';
import deployStore from 'application/stores/deploy';
import './execute.scss';

const { TextArea } = Input;
const { ELSE } = IF;
const { confirm } = Modal;

const noop = () => {};

interface IProps {
  appId: string;
  projectId: string;
  pipelineId: string;
  fileChanged: boolean;
  deployAuth: { hasAuth: boolean; authTip?: string };
  pipelineFileDetail?: TREE.NODE;
  extraTitle: React.ReactNode;
  pipelineDetail?: BUILD.IPipelineDetail;
  editPipeline: () => void;
}

const Execute = (props: IProps) => {
  const { appId, projectId, pipelineId, deployAuth, pipelineFileDetail, editPipeline, fileChanged, extraTitle } = props;

  const [state, updater] = useUpdate({
    startStatus: 'unstart', // unstart-未开始，ready-准备开始，start-已开始,end:执行完成或取消
    logVisible: false,
    logProps: {},
    chosenPipelineId: pipelineId || ('' as string | number),
    recordTableKey: 1,
  });
  const { startStatus, logProps, logVisible } = state;

  const [pipelineDetail, changeType] = buildStore.useStore((s) => [s.pipelineDetail, s.changeType]);

  const rejectContentRef = React.useRef('');

  const {
    cancelBuild: cancelBuildCall,
    runBuild: runBuildCall,
    reRunFailed,
    reRunEntire,
    getBuildRuntimeDetail,
    updateTaskEnv,
    getPipelineDetail,
  } = buildStore.effects;

  const { updateApproval } = deployStore.effects;

  const [getPipelineDetailLoading, addPipelineLoading] = useLoading(buildStore, ['getPipelineDetail', 'addPipeline']);

  // set a timer to loop get status, until websocket push is available
  const timer = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    if (pipelineDetail && ciBuildStatusSet.executeStatus.includes(pipelineDetail.status)) {
      timer.current && clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        state.chosenPipelineId && getPipelineDetail({ pipelineID: +state.chosenPipelineId });
      }, 30000);
    } else {
      timer.current && clearTimeout(timer.current);
    }
  }, [getPipelineDetail, pipelineDetail, state.chosenPipelineId]);

  useUpdateEffect(() => {
    state.chosenPipelineId && getPipelineDetail({ pipelineID: +state.chosenPipelineId });
    updateSearch({ pipelineID: state.chosenPipelineId });
  }, [getPipelineDetail, state.chosenPipelineId]);

  const curStatus = (pipelineDetail && pipelineDetail.status) || '';
  useUpdateEffect(() => {
    if (curStatus) {
      updater.startStatus(ciBuildStatusSet.beforeRunningStatus.includes(curStatus) ? 'unstart' : 'start');
    }
  }, [curStatus]);

  useEffectOnce(() => {
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  });

  if (!pipelineDetail) {
    return <EmptyHolder relative style={{ justifyContent: 'start' }} />;
  }

  const { id: pipelineID, env, branch, pipelineButton, extra, needApproval } = pipelineDetail;

  const initBuildDetail = (id: number, detailType?: BUILD.IActiveItem) => {
    if (+id !== +state.chosenPipelineId) {
      updater.chosenPipelineId(id);
    } else {
      getPipelineDetail({ pipelineID: id });
    }
  };

  const runBuild = () => {
    updater.startStatus('ready');
    runBuildCall({ pipelineID })
      .then((result) => {
        if (result.success) {
          updater.startStatus('start');
        } else {
          updater.startStatus('unstart');
        }
      })
      .catch(() => updater.startStatus('unstart'));
  };

  const reRunPipeline = (isEntire: boolean) => {
    updater.startStatus('padding');
    const reRunFunc = !isEntire ? reRunFailed : reRunEntire;
    reRunFunc({ pipelineID })
      .then((result) => {
        const _detail = {
          source: result.source,
          branch: result.branch,
          ymlName: result.ymlName,
          workspace: result.extra.diceWorkspace,
        };
        initBuildDetail(result.id, _detail);
        updater.startStatus('start');
      })
      .catch(() => updater.startStatus('unstart'));
  };

  const cancelBuild = () => {
    cancelBuildCall({ pipelineID }).then(() => {
      initBuildDetail(pipelineID);
    });
  };

  const nodeClickConfirm = (node: BUILD.PipelineNode) => {
    const disabled = node.status === 'Disabled';
    confirm({
      title: i18n.t('ok'),
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
            !isEmpty(result) &&
              goTo(
                goTo.resolve.projectDeployRuntime({
                  runtimeId: target.value,
                  appId: result.extra?.applicationId,
                  workspace: result.extra?.workspace,
                }),
                {
                  jumpOut: true,
                },
              );
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

  const hideLog = () => {
    updater.logVisible(false);
  };

  const pipelineRunning = pipelineDetail && ciBuildStatusSet.executeStatus.includes(pipelineDetail.status);

  const refreshPipeline = () => {
    getPipelineDetail({ pipelineID: +state.chosenPipelineId });
  };

  const updateEnv = (info: Omit<BUILD.ITaskUpdatePayload, 'pipelineID'>) => {
    updateTaskEnv({ ...info, pipelineID: pipelineDetail.id }).then(() => {
      getPipelineDetail({ pipelineID: +pipelineID });
    });
  };

  const renderRunBtn = () => {
    return renderOnceRunBtn({ execTitle: i18n.t('Execute') });
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
    const { canCancel, canManualRun, canRerun, canRerunFailed } = pipelineButton;
    const paddingEle = (
      <div className="mx-0">
        <Tooltip title={i18n.t('preparing')}>
          <ErdaIcon
            type="loading"
            className="mx-0.5"
            color="black-4"
            size="20px"
            style={{ transform: 'translateY(0)' }}
            spin
          />
        </Tooltip>
      </div>
    );

    return (
      <IF check={canManualRun}>
        <IF check={startStatus !== 'unstart'}>
          {paddingEle}
          <ELSE />
          <div>
            <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
              <Tooltip title={execTitle}>
                <ErdaIcon
                  size="20"
                  className="mr-2 cursor-pointer"
                  fill="black-4"
                  onClick={() => {
                    runBuild();
                  }}
                  type="play1"
                />
              </Tooltip>
            </WithAuth>
          </div>
        </IF>
        <ELSE />
        <IF check={canCancel}>
          <div>
            <DeleteConfirm
              title={`${i18n.t('dop:confirm to cancel the current build')}?`}
              secondTitle=""
              onConfirm={() => {
                cancelBuild();
              }}
            >
              <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                <Tooltip title={i18n.t('dop:cancel build')}>
                  <ErdaIcon className="cursor-pointer" fill="black-4" size="20" type="pause" />
                </Tooltip>
              </WithAuth>
            </DeleteConfirm>
          </div>
        </IF>
        <ELSE />
        <div>
          {/* 现需求为“从失败处重试+全部重试” or “全部重试”，分别对应 Dropdown 和 icon 来操作 */}
          <IF check={startStatus === 'padding'}>
            {paddingEle}
            <ELSE />
            <IF check={canRerunFailed}>
              {deployAuth.hasAuth ? (
                <Dropdown overlay={renderReRunMenu()} placement="bottomCenter">
                  <ErdaIcon size="21" fill="black-4" type="redo" className="mr-1.5 cursor-pointer" />
                </Dropdown>
              ) : (
                <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                  <CustomIcon type="refresh" />
                </WithAuth>
              )}
              <ELSE />
              <IF check={canRerun}>
                <WithAuth pass={deployAuth.hasAuth} noAuthTip={deployAuth.authTip}>
                  <Tooltip title={`${i18n.t('dop:rerun whole pipeline')}(commit ${i18n.t('unchanged')})`}>
                    <CustomIcon
                      onClick={() => {
                        reRunPipeline(true);
                      }}
                      type="refresh"
                      className="cursor-pointer"
                    />
                  </Tooltip>
                </WithAuth>
              </IF>
            </IF>
          </IF>
        </div>
      </IF>
    );
  };

  const { showMessage } = extra;

  return (
    <div className="pipeline-execute">
      {fileChanged ? (
        <ErdaAlert
          message={
            <div>
              {`${i18n.t('dop:pipeline-changed-tip2')} `}
              <span className="text-purple-deep cursor-pointer" onClick={editPipeline}>
                {i18n.t('dop:edit to check')}
              </span>
            </div>
          }
          closeable={false}
        />
      ) : null}
      <Info
        info={pipelineFileDetail}
        className="mb-2"
        operations={
          <div>
            {pipelineRunning ? (
              <Tooltip title={i18n.t('refresh')}>
                <ErdaIcon
                  type="shuaxin"
                  size={20}
                  fill="black-4"
                  className="cursor-pointer mr-1"
                  onClick={refreshPipeline}
                />
              </Tooltip>
            ) : null}
            {extraTitle}
          </div>
        }

        // TODO: execute in editor, need new api;
        // operations={renderRunBtn()}
      />
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
                <div className="build-err-stack">
                  <ul style={{ listStyle: 'disc' }}>
                    {showMessage.stacks.map((stack, i) => (
                      <li key={`${stack}-${String(i)}`}>
                        <pre style={{ overflow: 'hidden', whiteSpace: 'pre-wrap' }}>{stack}</pre>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
            <FileContainer
              className={''}
              name={`${i18n.t('pipeline')} (${i18n.t('dop:the latest execution status')})`}
              showLoading={false}
              ops={
                <Button onClick={editPipeline} size="small">
                  {i18n.t('Edit')}
                </Button>
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
      <BuildLog visible={logVisible} hideLog={hideLog} {...logProps} />
    </div>
  );
};

export default Execute;
