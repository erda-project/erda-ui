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
import { PureExecute } from './detail/execute';
import { Row, Col, Tooltip } from 'antd';
import { Avatar, ErdaIcon } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useClickAway } from 'react-use';
import buildStore from 'application/stores/build';
import { secondsToTime, replaceEmoji, firstCharToUpper } from 'common/utils';
import cronstrue from 'cronstrue/i18n';
import GotoCommit from 'application/common/components/goto-commit';
import i18n, { isZh } from 'i18n';
import { useUnmount } from 'react-use';
import { useUserMap } from 'core/stores/userMap';
import moment from 'moment';

import './record-detail.scss';

interface IProps {
  appId: string;
  projectId: string;
  pipelineId: string;
  extra?: React.ReactNode;
  editPipeline?: () => void;
}

const Info = ({ appId }: { appId: string }) => {
  const [{ isExpand }, updater] = useUpdate({
    isExpand: false,
  });
  const toggleContainer: React.RefObject<HTMLDivElement> = React.useRef(null);
  const commitMsgRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const cronMsgRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const style = `main-info ${isExpand ? 'main-info-full' : ''}`;

  const [pipelineDetail] = buildStore.useStore((s) => [s.pipelineDetail]);

  const userMap = useUserMap();

  useClickAway(toggleContainer, () => {
    updater.isExpand(false);
  });

  if (!pipelineDetail) return null;
  const { id: pipelineID, pipelineCron, costTimeSec = -1, commit, commitDetail, extra } = pipelineDetail;

  const { cronExpr } = pipelineCron;
  const cronMsg = cronExpr && cronstrue.toString(cronExpr, { locale: isZh() ? 'zh_CN' : 'en' });

  const getAutoTooltipMsg = (ref: any, text: any) => {
    // show tooltip only when text overflow
    const { current = {} } = ref;
    if (current != null && current.scrollWidth > current.clientWidth) {
      return <Tooltip title={text}>{text}</Tooltip>;
    }
    return text;
  };

  const toggleExpandInfo = (event: any) => {
    event.stopPropagation();
    updater.isExpand(!isExpand);
  };

  const ownerObj = extra?.ownerUser?.id ? userMap[extra.ownerUser.id] : null;
  const ownerName = ownerObj?.nick || ownerObj?.name || '';

  return pipelineDetail ? (
    <div className="main-info-parent">
      <div className={style} ref={toggleContainer}>
        <Row className="mb-4">
          <Col span={12}>
            {commitDetail?.author ? <Avatar name={commitDetail.author} showName className="mb-1" size={20} /> : '-'}
            <div className="info-label">{i18n.t('Submitter')}：</div>
          </Col>
          <Col span={12}>
            <div className="nowrap" ref={commitMsgRef}>
              {getAutoTooltipMsg(commitMsgRef, replaceEmoji(commitDetail?.comment || '')) || '-'}
            </div>
            <div className="info-label">{firstCharToUpper(i18n.t('dop:commit message'))}：</div>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col span={12}>
            <div className="hover-py">{commit ? <GotoCommit length={6} commitId={commit} appId={appId} /> : '-'}</div>
            <div className="info-label">{i18n.t('Commit')} ID：</div>
          </Col>
          <Col span={12}>
            {commitDetail?.time ? moment(new Date(commitDetail.time)).format('YYYY-MM-DD HH:mm:ss') : '-'}
            <div className="info-label">{i18n.t('commit date')}：</div>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col span={12}>
            {costTimeSec !== -1 ? `${i18n.t('dop:time cost')} ${secondsToTime(+costTimeSec)}` : '-'}
            <div className="info-label">{i18n.t('Duration')}：</div>
          </Col>
          <Col span={12}>
            {pipelineID || '-'}
            <div className="info-label">{i18n.t('Pipeline')} ID：</div>
          </Col>
        </Row>
        <Row className="mb-4">
          {cronMsg && (
            <Col span={12}>
              <div className="nowrap" ref={cronMsgRef}>
                {getAutoTooltipMsg(cronMsgRef, cronMsg) || '-'}
              </div>
              <div className="info-label">{i18n.t('timing time')}：</div>
            </Col>
          )}
          <Col span={12}>
            {ownerName ? <Avatar name={ownerName} showName className="mb-1" size={20} /> : '-'}
            <div className="info-label">{i18n.s('Owner', 'dop')}：</div>
          </Col>
        </Row>
        <div className="trigger-btn" onClick={toggleExpandInfo}>
          {!isExpand ? (
            <ErdaIcon type="down" size="18px" className="mr-0" />
          ) : (
            <ErdaIcon type="up" size="18px" className="mr-0" />
          )}
        </div>
      </div>
    </div>
  ) : null;
};

const Execute = (props: Merge<IProps, { titleOperation?: React.ReactNode }>) => {
  const { pipelineId, appId, titleOperation = null, editPipeline, extra } = props;
  const { clearPipelineDetail } = buildStore.reducers;
  useUnmount(() => {
    clearPipelineDetail();
  });
  return (
    <div>
      {extra}
      <div className="text-base font-medium text-default-8 flex-h-center justify-between">
        {`${i18n.t('dop:Pipeline Detail')}`}
        {titleOperation}
      </div>
      <Info appId={appId} />
      <PureExecute
        editPipeline={editPipeline}
        title={i18n.t('Pipeline')}
        {...props}
        deployAuth={{ hasAuth: false }}
        chosenPipelineId={pipelineId}
      />
    </div>
  );
};

export default Execute;
