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

import * as React from 'react';
import BuildDetail from './build-detail';
import fileTreeStore from 'common/stores/file-tree';
import { get } from 'lodash';
import { EmptyHolder } from 'common';
import { getBranchPath } from 'application/pages/pipeline/config';

const RunDetail = () => {
  const [caseDetail] = fileTreeStore.useStore(s => [s.curNodeDetail]);
  const fileName = caseDetail.name;
  const { branch } = getBranchPath(caseDetail);
  const snippet_config = get(caseDetail, 'meta.snippetAction.snippet_config');
  // 获取ymlNames用于请求历史记录的参数；
  const pagingYmlNames = [] as string[];
  if (snippet_config?.labels?.projectAppYmlNames) {
    pagingYmlNames.push(snippet_config?.labels?.projectAppYmlNames);
  }
  if (snippet_config?.name) {
    pagingYmlNames.push(snippet_config.name);
  }
  return branch ? (
    <BuildDetail
      ymlName={fileName}
      source={'dice'}
      branch={branch as string}
      pagingYmlNames={pagingYmlNames}
    />
  ) : <EmptyHolder relative />;
};

export default RunDetail;
