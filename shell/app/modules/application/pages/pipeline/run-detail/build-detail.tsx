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

import { map, isEmpty, pick, isEqual, find, get } from 'lodash';
import moment from 'moment';
import * as React from 'react';
import cronstrue from 'cronstrue/i18n';
import { Spin, Badge, Icon, Modal, Popover, Table, Row, Col, Tooltip, Menu, Dropdown, Alert, Input } from 'app/nusi';
import { EmptyHolder, Icon as CustomIcon, DeleteConfirm, Avatar, IF, NoAuthTip, useUpdate } from 'common';
import { goTo, secondsToTime, replaceEmoji, updateSearch } from 'common/utils';
import GotoCommit from 'application/common/components/goto-commit';
import { ColumnProps } from 'core/common/interface';
import { BuildLog } from './build-log';
import PipelineChart from './pipeline-chart';
import { ciStatusMap, ciBuildStatusSet } from './config';
import { usePerm } from 'app/user/common';
import i18n, { isZh } from 'i18n';
import buildStore from 'application/stores/build';
import { useUpdateEffect, useEffectOnce } from 'react-use';
import routeInfoStore from 'app/common/stores/route';
import appStore from 'application/stores/application';
import { useLoading } from 'app/common/stores/loading';
import PipelineLog from './pipeline-log';
import './build-detail.scss';
import orgStore from 'app/org-home/stores/org';
import deployStore from 'application/stores/deploy';

const { TextArea } = Input;
const { ELSE } = IF;
const { confirm } = Modal;

const noop = () => { };

const evnBlockMap: { [key in APPLICATION.Workspace]: string } = {
  DEV: 'blockDev',
  TEST: 'blockTest',
  STAGING: 'blockStage',
  PROD: 'blockProd',
};

interface IProps {
  branch: string;
  source: string;
  ymlName: string;
  pagingYmlNames: string[];
}

const extractData = (data: any) => pick(data, ['source', 'branch', 'ymlName']);

const BuildDetail = (props: IProps) => {
  const [params, query] = routeInfoStore.useStore(s => [s.params, s.query]);
  const [state, updater] = useUpdate({
    startStatus: 'unstart', // unstart-未开始，ready-准备开始，start-已开始,end:执行完成或取消
    logVisible: false,
    logProps: {},
    selectedRowId: null as null | number,
    hasAuth: false,
    isHistoryBuild: false,
    isExpand: false,
    isBlocked: false,
    chosenPipelineId: query.pipelineID || '' as string | number,
  });
  const permMap = usePerm(s => s.app.pipeline);
  const { startStatus, logProps, logVisible, selectedRowId, hasAuth, isHistoryBuild, isExpand, isBlocked } = state;
  const toggleContainer: React.RefObject<HTMLDivElement> = React.useRef(null);
  const commitMsgRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const cronMsgRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  // const { getPipelines, getExecuteRecordsByPageNo, activeItem, pipelineId } = props;
  const { branch: propsBranch, source, pagingYmlNames } = props;
  const currentBranch = propsBranch;
  const [
    pipelineDetail,
    executeRecords,
    recordPaging,
    changeType,
  ] = buildStore.useStore(s => [
    s.pipelineDetail,
    s.executeRecords,
    s.recordPaging,
    s.changeType,
  ]);

  const branchInfo = appStore.useStore(s => s.branchInfo);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  
  const { blockStatus } = appStore.useStore(s => s.detail);
  const appBlocked = blockStatus !== 'unblocked';
  const { blockoutConfig } = currentOrg;
  const rejectRef = React.useRef(null);

  const {
    cancelBuild: cancelBuildCall,
    startBuildCron: startBuildCronCall,
    cancelBuildCron: cancelBuildCronCall,
    runBuild: runBuildCall,
    reRunFailed,
    reRunEntire,
    getBuildRuntimeDetail,
    updateTaskEnv,
    getPipelineDetail,
    getExecuteRecords,
  } = buildStore.effects;
  const { updateApproval } = deployStore.effects;
  const { clearPipelineDetail, clearExecuteRecords } = buildStore.reducers;

  const [getExecuteRecordsLoading, getPipelineDetailLoading, addPipelineLoading] = useLoading(buildStore, ['getExecuteRecords', 'getPipelineDetail', 'addPipeline']);
  React.useEffect(() => {
    const curWorkspace = get(find(branchInfo, { name: currentBranch }), 'workspace') as APPLICATION.Workspace;
    const envBlocked = get(blockoutConfig, evnBlockMap[curWorkspace], false);
    updater.isBlocked(envBlocked && appBlocked);
  }, [appBlocked, blockoutConfig, branchInfo, currentBranch, updater]);

  React.useEffect(() => {
    state.chosenPipelineId && getPipelineDetail({ pipelineID: +state.chosenPipelineId });
    updateSearch({ pipelineID: state.chosenPipelineId });
  }, [getPipelineDetail, state.chosenPipelineId]);

  const getRecordList = (p?: any) => {
    return getExecuteRecords({ pageNo: 1, branch: currentBranch, source, pagingYmlNames, ...p });
  };

  useUpdateEffect(() => {
    if (pipelineDetail) {
      const isProtectBranch = get(find(branchInfo, { name: pipelineDetail.branch }), 'isProtect');
      const curAuth = isProtectBranch ? permMap.executeProtected.pass : permMap.executeNormal.pass;
      updater.hasAuth(curAuth);

      updater.selectedRowId(pipelineDetail.id);
      updater.isExpand(false);
      updater.isHistoryBuild(false);
      if (!isEmpty(executeRecords)) {
        const [firstRecord] = executeRecords;
        updater.isHistoryBuild(isEqual(extractData(firstRecord), extractData(pipelineDetail))
          && firstRecord.id !== pipelineDetail.id);
      }
    }
  }, [executeRecords, pipelineDetail]);

  React.useEffect(() => {
    if (!state.chosenPipelineId && !isEmpty(executeRecords)) {
      updater.chosenPipelineId(get(executeRecords, '[0].id'));
    }
  }, [state.chosenPipelineId, executeRecords, updater]);

  const curStatus = (pipelineDetail && pipelineDetail.status) || '';
  useUpdateEffect(() => {
    if (curStatus) {
      updater.startStatus(ciBuildStatusSet.beforeRunningStatus.includes(curStatus) ? 'unstart' : 'start');
    }
  }, [curStatus]);

  useEffectOnce(() => {
    getRecordList();
    return () => {
      clearPipelineDetail();
      clearExecuteRecords();
      window.removeEventListener('click', onClickOutsideHandler);
    };
  });

  const toggleExpandInfo = (event: any) => {
    event.stopPropagation();
    updater.isExpand(!isExpand);
  };

  const onClickOutsideHandler = React.useCallback((event: any) => {
    if (toggleContainer.current && !toggleContainer.current.contains(event.target)) {
      updater.isExpand(false);
    }
  }, [updater]);

  React.useEffect(() => {
    if (!isExpand) {
      window.removeEventListener('click', onClickOutsideHandler);
    } else {
      window.addEventListener('click', onClickOutsideHandler);
    }
  }, [isExpand, onClickOutsideHandler]);

  if (!pipelineDetail) {
    return <EmptyHolder relative style={{ justifyContent: 'start' }} />;
  }

  const { appId, projectId } = params;
  const { id: pipelineID, env, branch, pipelineButton, pipelineCron, costTimeSec = -1, extra, commit, commitDetail } = pipelineDetail;

  const initBuildDetail = (id: number, detailType?: BUILD.IActiveItem) => {
    if (+id !== +state.chosenPipelineId) {
      updater.chosenPipelineId(id);
    } else {
      getPipelineDetail({ pipelineID: id });
    }
    getRecordList({ pageNo: 1 });
  };

  const cancelBuildCron = (cronID: number) => {
    cancelBuildCronCall({ cronID }).then(() => {
      initBuildDetail(pipelineID);
    });
  };

  const startBuildCron = (cronID: number) => {
    startBuildCronCall({ cronID }).then(() => {
      initBuildDetail(pipelineID);
    });
  };

  const runBuild = () => {
    updater.startStatus('ready');
    runBuildCall({ pipelineID }).then((result) => {
      if (result.success) {
        updater.startStatus('start');
      } else {
        updater.startStatus('unstart');
      }
    }).catch(() => updater.startStatus('unstart'));
  };

  const reRunPipeline = (isEntire: boolean) => {
    updater.startStatus('padding');
    const reRunFunc = !isEntire ? reRunFailed : reRunEntire;
    reRunFunc({ pipelineID }).then((result) => {
      const _detail = {
        source: result.source,
        branch: result.branch,
        ymlName: result.ymlName,
        workspace: result.extra.diceWorkspace,
      };
      initBuildDetail(result.id, _detail);
      updater.startStatus('start');
    }).catch(() => updater.startStatus('unstart'));
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
      content: i18n.t('application:whether {action} task {name}', {
        action: disabled ? i18n.t('open') : i18n.t('close'),
        name: node.name,
      }),
      onOk: () => updateEnv({ id: node.id, disabled: !disabled }),
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
        });
        updater.logVisible(true);
        break;
      case 'link': {
        const target = node.findInMeta((item: BUILD.MetaData) => item.name === 'runtimeID');
        if (target) {
          getBuildRuntimeDetail({ runtimeId: +target.value }).then((result) => {
            !isEmpty(result) && goTo(`../deploy/runtimes/${target.value}/overview`);
          });
        }
        break;
      }
      case 'sonar-link':
        // 跳转到代码质量页
        // goTo(`./quality/${pipelineDetail.commitId}`);
        break;
      case 'release-link': {
        const target = node.findInMeta((item: BUILD.MetaData) => item.name === 'releaseID');
        if (target) {
          goTo(goTo.pages.release, { ...params, q: target.value });
        }
        break;
      }
      case 'publisher-link': {
        const publishItemIDTarget = node.findInMeta((item: BUILD.MetaData) => item.name === 'publishItemID');
        const typeTarget = node.findInMeta((item: BUILD.MetaData) => item.name === 'type') || {} as any;
        if (publishItemIDTarget) {
          // 跳转到发布内容
          goTo(goTo.pages.publisherContent, { type: typeTarget.value || 'MOBILE', publisherItemId: publishItemIDTarget.value });
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
        if (!hasStarted && pipelineDetail && pipelineDetail.status === 'Analyzed' && hasAuth) {
          nodeClickConfirm(node);
        }
      }
    }
  };

  const onClickConfigLink = () => {
    goTo(goTo.pages.buildDetailConfig, { projectId, appId, branch: encodeURIComponent(branch), env });
  };

  const onClickTestLink = (node: BUILD.PipelineNode) => {
    const qaID = node.findInMeta((item: BUILD.MetaData) => item.name === 'qaID');
    if (qaID) {
      goTo(`../test/${qaID.value}`);
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
        title: i18n.t('Reason for reject'),
        content: (
          <TextArea ref={rejectRef}>ss</TextArea>
        ),
        onOk() {
          updateApproval({
            id: +reviewIdObj.value,
            reject: true,
            reason: (rejectRef.current as any) && (rejectRef.current as any).state.value,
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

  const updateEnv = (info: { id: number, disabled: boolean }) => {
    const { id, disabled } = info;
    updateTaskEnv({ taskID: id, disabled, pipelineID: pipelineDetail.id }).then(() => {
      getPipelineDetail({ pipelineID: +pipelineID });
    });
  };

  const renderRunBtn = () => {
    const [firstRecord] = executeRecords || [];
    const showCorn = !isEmpty(firstRecord) && firstRecord.id === pipelineID && pipelineCron.cronExpr;
    const { canStartCron, canStopCron } = pipelineButton;
    return showCorn && (canStartCron || canStopCron)
      ? renderCronRunBtn()
      : renderOnceRunBtn({ execTitle: i18n.t('execute') });
  };

  const renderCronRunBtn = () => {
    const { canStartCron, canStopCron } = pipelineButton;
    const { id: cronID } = pipelineCron;
    const cronRunBtn = (
      <div className="build-operator">
        <IF check={hasAuth}>
          <Tooltip title={i18n.t('application:start cron')}>
            <CustomIcon type="js" onClick={() => { startBuildCron(cronID); }} />
          </Tooltip>
          <ELSE />
          <NoAuthTip>
            <CustomIcon type="js" />
          </NoAuthTip>
        </IF>
      </div>
    );

    return (
      <div className="cron-btn">
        <IF check={canStopCron}>
          <IF check={hasAuth}>
            <DeleteConfirm title={`${i18n.t('application:confirm cancel cron build')}?`} secondTitle="" onConfirm={() => { cancelBuildCron(cronID); }}>
              <div className="build-operator">
                <Tooltip title={i18n.t('application:cancel cron build')}>
                  <CustomIcon type="qxjs" />
                </Tooltip>
              </div>
            </DeleteConfirm>
            <ELSE />
            <NoAuthTip>
              <div className="build-operator">
                <CustomIcon type="qxjs" />
              </div>
            </NoAuthTip>
          </IF>
          <ELSE />
          <IF check={canStartCron}>
            {cronRunBtn}
          </IF>
        </IF>
        {renderOnceRunBtn({ execTitle: i18n.t('application:execute at once') })}
      </div>
    );
  };

  const renderReRunMenu = () => {
    const { canRerunFailed, canRerun } = pipelineButton;
    return (
      <Menu>
        {canRerunFailed &&
          <Menu.Item>
            <span className={isBlocked ? 'disabled' : ''} onClick={() => { reRunPipeline(false); }}>{`${i18n.t('application:rerun failed node')}(${i18n.t('application:commit unchanged')})`}</span>
          </Menu.Item>}
        {canRerun &&
          <Menu.Item>
            <span className={isBlocked ? 'disabled' : ''} onClick={() => { reRunPipeline(true); }}>{`${i18n.t('application:rerun whole pipeline')}(${i18n.t('application:commit unchanged')})`}</span>
          </Menu.Item>}
      </Menu>);
  };

  const renderOnceRunBtn = ({ execTitle }: { execTitle: string }) => {
    const { canCancel, canManualRun, canRerun, canRerunFailed } = pipelineButton;
    const paddingEle = (
      <div className="build-operator">
        <Tooltip title={i18n.t('preparing')}>
          <Icon type="loading" />
        </Tooltip>
      </div>
    );

    return (
      <IF check={canManualRun}>
        <IF check={startStatus !== 'unstart'} >
          {paddingEle}
          <ELSE />
          <div className="build-operator">
            <IF check={hasAuth}>
              <Tooltip title={execTitle}>
                {isBlocked ? <CustomIcon className="disabled" type="play1" /> : <CustomIcon onClick={() => { runBuild(); }} type="play1" />}
              </Tooltip>
              <ELSE />
              <NoAuthTip>
                <CustomIcon type="play1" />
              </NoAuthTip>
            </IF>
          </div>
        </IF>
        <ELSE />
        <IF check={canCancel}>
          <IF check={hasAuth}>
            <DeleteConfirm title={`${i18n.t('application:confirm cancel current build')}?`} secondTitle="" onConfirm={() => { cancelBuild(); }}>
              <div className="build-operator">
                <Tooltip title={i18n.t('application:cancel build')}>
                  <CustomIcon type="pause" />
                </Tooltip>
              </div>
            </DeleteConfirm>
            <ELSE />
            <NoAuthTip>
              <div className="build-operator">
                <CustomIcon type="pause" />
              </div>
            </NoAuthTip>
          </IF>
        </IF>
        <ELSE />
        <div className="build-operator">
          {/* 现需求为“从失败处重试+全部重试” or “全部重试”，分别对应 Dropdown 和 icon 来操作 */}
          <IF check={startStatus === 'padding'}>
            {paddingEle}
            <ELSE />
            <IF check={canRerunFailed}>
              <IF check={hasAuth}>
                <Dropdown overlay={renderReRunMenu()} placement="bottomCenter">
                  <CustomIcon className={isBlocked ? 'disabled' : ''} type="refresh" />
                </Dropdown>
                <ELSE />
                <NoAuthTip>
                  <CustomIcon type="refresh" />
                </NoAuthTip>
              </IF>
              <ELSE />
              <IF check={canRerun}>
                <IF check={hasAuth}>
                  <Tooltip title={`${i18n.t('application:rerun whole pipeline')}(commit ${i18n.t('unchanged')})`}>
                    {
                      isBlocked
                        ? <CustomIcon className="disabled" type="refresh" />
                        : <CustomIcon onClick={() => { reRunPipeline(true); }} type="refresh" />
                    }
                  </Tooltip>
                  <ELSE />
                  <NoAuthTip>
                    <CustomIcon type="refresh" />
                  </NoAuthTip>
                </IF>
              </IF>
            </IF>
          </IF>
        </div>
      </IF>
    );
  };

  const setRowClassName = (record: any) => {
    return record.id !== selectedRowId ? 'build-history-tr' : 'selected-row bold-500';
  };

  const handleRecordPageChange = (pageNo: number) => {
    getRecordList({ pageNo });
  };

  const renderBuildHistory = () => {
    if (isEmpty(executeRecords)) {
      return <p>{i18n.t('common:no data')}</p>;
    }
    const columns: Array<ColumnProps<any>> = [{
      title: i18n.t('version'),
      dataIndex: 'runIndex',
      width: 80,
      align: 'center',
      render: (runIndex: any, record: any) => (<span className="run-index">{record.triggerMode === 'cron' && <CustomIcon type="clock" />}{runIndex}</span>),
    }, {
      title: 'ID',
      dataIndex: 'id',
      width: 120,
      align: 'center',
    }, {
      title: `${i18n.t('commit')}ID`,
      dataIndex: 'commit',
      width: 100,
      render: (commitText: string) => (<span> {(commitText || '').slice(0, 6)} </span>),
    }, {
      title: i18n.t('status'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <span>
          <span className="nowrap">{ciStatusMap[status].text}</span>
          <Badge className="ml4" status={ciStatusMap[status].status} />
        </span>
      ),
    }, {
      title: i18n.t('trigger time'),
      dataIndex: 'timeCreated',
      width: 200,
      render: (timeCreated: number) => moment(new Date(timeCreated)).format('YYYY-MM-DD HH:mm:ss'),
    }];

    const { total, pageNo, pageSize } = recordPaging;
    const startIndex = total - (pageSize * (pageNo - 1));
    const dataSource = map(executeRecords, (item, index) => {
      return { ...item, runIndex: '#'.concat(String(startIndex - index)) };
    });

    return (
      <div className="build-history-wp">
        <div className="refresh-newest-btn" onClick={() => { getRecordList({ pageNo: 1 }); }}>
          <CustomIcon type="shuaxin" />{i18n.t('fetch latest records')}
        </div>
        <Table
          rowKey="runIndex"
          className="build-history-list"
          columns={columns}
          loading={getExecuteRecordsLoading}
          dataSource={dataSource}
          scroll={{ y: 240 }}
          rowClassName={setRowClassName}
          pagination={{ pageSize, total, current: pageNo, onChange: handleRecordPageChange }}
          onRow={({ id: targetPipelineID }) => ({
            onClick: () => {
              updater.chosenPipelineId(targetPipelineID);
            },
          })}
        />
      </div>
    );
  };

  const getAutoTooltipMsg = (ref: any, text: any) => { // show tooltip only when text overflow
    const { current = {} } = ref;
    if (current != null && current.scrollWidth > current.clientWidth) {
      return (
        <Tooltip title={text}>
          {text}
        </Tooltip>);
    }
    return text;
  };

  const needApproval = get(find(branchInfo, { name: pipelineDetail.branch }), 'needApproval');
  const style = `main-info ${isExpand ? 'main-info-full' : ''}`;
  const { cronExpr } = pipelineCron;
  const cronMsg = cronExpr && cronstrue.toString(cronExpr, { locale: isZh() ? 'zh_CN' : 'en' });
  const { showMessage } = extra;

  return (
    <div className="build-detail">
      <Spin spinning={getPipelineDetailLoading || addPipelineLoading || getExecuteRecordsLoading}>
        <div className="info">
          <div className="info-header">
            <div><span className="bold-500 title">{i18n.t('application:build detail')}</span><span className={`${isHistoryBuild ? 'visible' : 'invisible'} his-build-icon`}>{i18n.t('historical build')}</span></div>
            <div className="info-header-right">
              <Popover
                placement="bottomRight"
                title={i18n.t('application:execute records')}
                content={renderBuildHistory()}
                arrowPointAtCenter
              >
                <CustomIcon type="jsjl" />
              </Popover>
              {renderRunBtn()}
            </div>
          </div>
          {
            needApproval ? (
              <Alert message={i18n.t('application:deploy-approval-pipeline-tip')} className='mt4' type="normal" showIcon />
            ) : null
          }
          <div className="main-info-parent">
            <div className={style} ref={toggleContainer}>
              <Row>
                <Col span={12}>
                  <div className="info-label">{i18n.t('submitter')}：</div>
                  <Avatar name={commitDetail.author} showName className="mb4" size={20} />
                </Col>
                <Col span={12}>
                  <div className="info-label">{i18n.t('application:commit message')}：</div>
                  <div className="nowrap" ref={commitMsgRef} >
                    {getAutoTooltipMsg(commitMsgRef, replaceEmoji(commitDetail.comment))}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <div className="info-label">{i18n.t('commit')} ID：</div>
                  <div className="hover-py"><GotoCommit length={6} commitId={commit} /></div>
                </Col>
                <Col span={12}>
                  <div className="info-label">{i18n.t('commit date')}：</div>
                  {commitDetail.time ? moment(new Date(commitDetail.time)).format('YYYY-MM-DD HH:mm:ss') : null}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <div className="info-label">{i18n.t('duration')}：</div>
                  {costTimeSec !== -1 ? `${i18n.t('application:time cost')} ${secondsToTime(+costTimeSec)}` : ''}
                </Col>
                <Col span={12}>
                  <div className="info-label">{i18n.t('number of executions')}：</div>
                  {recordPaging.total || 0} {i18n.t('times')}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <div className="info-label">{i18n.t('pipeline')} ID：</div>
                  {pipelineID}
                </Col>
                {cronMsg &&
                  <Col span={12}>
                    <div className="info-label">{i18n.t('timing time')}：</div>
                    <div className="nowrap" ref={cronMsgRef} >
                      {getAutoTooltipMsg(cronMsgRef, cronMsg)}
                    </div>
                  </Col>}
              </Row>
              <div className="trigger-btn" onClick={toggleExpandInfo}>
                <Icon type={!isExpand ? 'down' : 'up'} style={{ color: 'rgba(0, 0, 0, .1)' }} />
              </div>
            </div>
          </div>
          <div>
            {
              showMessage && showMessage.msg
                ? (
                  <div className="build-detail-err-msg mb8">
                    <div className="build-err-header"><Icon type="warning" className="build-err-icon" /><pre>{showMessage.msg}</pre></div>
                    <div className="build-err-stack"><ul style={{ listStyle: 'disc' }}>{showMessage.stacks.map((stack, i) => <li key={`${stack}-${String(i)}`}><pre style={{ overflow: 'hidden', whiteSpace: 'pre-wrap' }}>{stack}</pre></li>)}</ul></div>
                  </div>
                ) : null
            }
            <PipelineChart data={pipelineDetail as unknown as PIPELINE.IPipelineDetail} onClickNode={onClickNode} changeType={changeType} />
          </div>
          <PipelineLog resourceId={`${state.chosenPipelineId}`} resourceType='pipeline' isBuilding={ciBuildStatusSet.executeStatus.includes(curStatus)} />
        </div>
      </Spin>
      <BuildLog visible={logVisible} hideLog={hideLog} {...logProps} />
    </div>
  );
};

export default BuildDetail;
