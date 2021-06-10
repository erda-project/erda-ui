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
import { isEmpty, map, omit } from 'lodash';
import DiceConfigPage from 'app/config-page/index';
import routeInfoStore from 'app/common/stores/route';
import { useUpdate, FilterBarHandle } from 'common';
import userStore from 'app/user/stores';
import { updateSearch } from 'app/common/utils';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

interface IProps {
  filterObj?: Obj;
  viewGroup: string;
  issueType: ISSUE_TYPE;
  viewType?: string;
  onChosenIssue: (val: ISSUE.Issue) => void;
}

const QKey = FilterBarHandle.filterDataKey;

const KanbanView = React.forwardRef((props: IProps, ref: any) => {
  const { filterObj: propsFilter, viewGroup, issueType, viewType, onChosenIssue } = props;
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const loginUserId = userStore.useStore((s) => s.loginUser.id);

  const [{ inParams }, updater] = useUpdate({
    inParams: {},
  });

  const curInParams = React.useMemo(() => {
    const { iterationIDs, pageNo } = propsFilter || {};
    return {
      ...omit(propsFilter, ['viewType', 'viewGroup', QKey]),
      ...(pageNo ? { pageNo: +pageNo } : {}),
      ...(iterationIDs ? { iterationIDs: map(iterationIDs, (i) => +i) } : {}),
      projectID: +projectId,
      boardType: viewGroup,
      userID: loginUserId,
      type:
        issueType === ISSUE_TYPE.ALL
          ? [ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG, ISSUE_TYPE.EPIC]
          : [issueType],
    };
  }, [propsFilter, issueType, loginUserId, projectId, viewGroup]);

  React.useEffect(() => {
    updater.inParams(curInParams);
  }, [curInParams, updater]);

  React.useEffect(() => {
    if (ref) {
      // eslint-disable-next-line no-param-reassign
      ref.current = {
        // 通过改变inParams触发重新请求，避免重刷
        reloadData: () => updater.inParams({ ...curInParams }),
      };
    }
  }, [curInParams, ref, updater]);

  React.useEffect(() => {
    // 把_Q_的放路由最后
    updateSearch(
      { ...propsFilter, viewType, viewGroup },
      {
        sort: (a: string, b: string) => (a === QKey ? 1 : b === QKey ? -1 : 0),
      },
    );
  }, [propsFilter, viewType, viewGroup]);

  if (isEmpty(inParams)) {
    return null;
  }

  const customProps = {
    ...props,
    clickNode: (val: ISSUE.Issue) => {
      onChosenIssue(val);
    },
  };

  return (
    <DiceConfigPage
      scenarioType=""
      inParams={inParams}
      scenarioKey={'issueKanban'}
      customProps={customProps}
      showLoading
      forceUpdateKey={['inParams']}
    />
  );
});

export default KanbanView;
