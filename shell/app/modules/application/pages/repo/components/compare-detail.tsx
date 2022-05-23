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

import { Spin, Tabs } from 'antd';
import React from 'react';
import i18n from 'i18n';
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
}

const CompareDetail = ({ hideComment, disableComment = false }: IProps) => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const [compareDetail, comments, mrDetail] = repoStore.useStore((s) => [s.compareDetail, s.comments, s.mrDetail]);
  const { commits = [], diff, from, to } = compareDetail;
  const [isFetching] = useLoading(repoStore, ['getCompareDetail']);

  return (
    <Spin spinning={isFetching}>
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
                <span className="dice-badge">{comments.length}</span>{' '}
              </span>
            }
          >
            <CommentList comments={comments} />
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
        <TabPane
          key="workflow"
          tab={
            <div className="relative pr-10">
              {i18n.t('dop:workflow')}
              <span className="absolute px-2 rounded-full text-xs text-purple border border-purple border-solid -top-2">
                beta
              </span>
            </div>
          }
        >
          <MrWorkflow id={mrDetail.id} projectID={+projectId} />
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default CompareDetail;
