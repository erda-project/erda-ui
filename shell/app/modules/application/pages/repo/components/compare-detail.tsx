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

import { Spin, Tabs, Alert } from 'antd';
import React from 'react';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import { CommitList } from '../repo-commit';
import { CommentList } from './mr-comments';
import FileDiff from './file-diff';
import repoStore from 'application/stores/repo';
import { useLoading } from 'core/stores/loading';
import { allWordsFirstLetterUpper } from 'app/common/utils';
import MrWorkflow from 'project/common/components/workflow/mr-workflow';
import routeInfoStore from 'core/stores/route';

const { TabPane } = Tabs;

interface IProps {
  hideComment?: boolean;
  disableComment?: boolean;
  hideWorkflow?: boolean;
}

const CompareDetail = ({ hideComment, disableComment = false, hideWorkflow = false }: IProps) => {
  const { projectId, mergeId } = routeInfoStore.useStore((s) => s.params);
  const [compareDetail, comments, mrDetail] = repoStore.useStore((s) => [
    s.compareDetail,
    s.comments,
    s.mrDetail,
    s.aiCreatingMRList,
  ]);
  const { getComments } = repoStore.effects;
  const { commits = [], diff, from, to } = compareDetail || {};
  const [isFetching] = useLoading(repoStore, ['getCompareDetail']);
  const actualCommits = comments.filter(
    (commit) => !commit.data?.aiCodeReviewType || commit.data?.aiCodeReviewType === 'MR',
  );
  const [aiCreatingMRList, setAiCreatingMRList] = React.useState(
    window.localStorage.getItem('aiCreatingMRList')?.split(',') || [],
  );

  const isAiMRCRCreating =
    aiCreatingMRList.includes(mergeId) && !comments.find((comment) => comment.data.aiCodeReviewType === 'MR');

  React.useEffect(() => {
    let inter: NodeJS.Timer;
    if (isAiMRCRCreating) {
      inter = setInterval(async () => {
        const comments = await getComments();

        if (comments.find((comment) => comment.data.aiCodeReviewType === 'MR')) {
          clearInterval(inter);
          const newList = aiCreatingMRList.filter((item) => item !== mergeId);
          setAiCreatingMRList(newList);
          window.localStorage.setItem('aiCreatingMRList', newList.join(','));
        }
      }, 5000);
    }
    return () => {
      clearInterval(inter);
    };
  }, [isAiMRCRCreating]);

  return (
    <Spin spinning={isFetching}>
      {isAiMRCRCreating ? (
        <Alert
          message={
            <span className="flex-h-center">
              <ErdaIcon type="zhongshi" className="animate-spin mr-1" />
              {i18n.t('Generating AI review')}
            </span>
          }
          type="warning"
        />
      ) : (
        ''
      )}
      <Tabs
        className="dice-tab"
        defaultActiveKey={!hideComment ? 'comment' : 'commit'}
        tabBarGutter={40}
        destroyInactiveTabPane
      >
        {!hideComment && (
          <TabPane
            key="comment"
            tab={
              <span>
                {allWordsFirstLetterUpper(i18n.t('comment'))}
                <span className="dice-badge">{actualCommits.length}</span>{' '}
              </span>
            }
          >
            <CommentList comments={actualCommits} />
          </TabPane>
        )}
        <TabPane
          key="commit"
          tab={
            <span>
              {i18n.t('Commit')}
              <span className="dice-badge">{commits.length}</span>{' '}
            </span>
          }
        >
          <CommitList commits={commits} />
        </TabPane>
        <TabPane
          key="diff"
          tab={
            <span>
              {allWordsFirstLetterUpper(i18n.t('dop:changed files'))}
              <span className="dice-badge">{diff ? diff.filesChanged : '0'}</span>{' '}
            </span>
          }
        >
          <FileDiff
            key={`${from}-${to}`}
            diff={diff}
            from={from}
            to={to}
            comments={comments}
            mode="compare"
            disableComment={disableComment}
          />
        </TabPane>
        {!hideWorkflow && (
          <TabPane key="workflow" tab={<div className="relative">{i18n.t('dop:workflow')}</div>}>
            <MrWorkflow branch={mrDetail.sourceBranch} appId={mrDetail.appId} projectID={+projectId} />
          </TabPane>
        )}
      </Tabs>
    </Spin>
  );
};

export default CompareDetail;
