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

import { Spin } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { fromNow } from 'common/utils';
import GotoCommit from 'application/common/components/goto-commit';
import * as React from 'react';
import { useEffectOnce } from 'react-use';
import { useLoading } from 'app/common/stores/loading';
import repoStore from 'application/stores/repo';

import './repo-tag.scss';

const RepoTag = () => {
  const list = repoStore.useStore((s) => s.tag);
  const [isFetching] = useLoading(repoStore, ['getListByType']);
  const { getListByType } = repoStore.effects;
  const { clearListByType } = repoStore.reducers;
  useEffectOnce(() => {
    getListByType({
      type: 'tag',
    });
    return () => {
      clearListByType('tag');
    };
  });
  if (!list.length) {
    return null;
  }

  return (
    <Spin spinning={isFetching}>
      <div className="repo-tags">
        {list.map((item) => {
          return (
            <div key={item} className="tag-item">
              <div>
                <CustomIcon type="tag" /> {item.name}
              </div>
              <div>
                <GotoCommit commitId={item.id} length={6} /> · {item.message} · {fromNow(item.tagger.when)}
              </div>
            </div>
          );
        })}
      </div>
    </Spin>
  );
};

export default RepoTag;
