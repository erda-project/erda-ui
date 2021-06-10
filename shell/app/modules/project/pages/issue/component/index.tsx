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
import { useUpdate, IF, useSwitch } from 'common';
import IssueHeader, { ViewTypeMap } from './header';
import TableView from './table-view';
import KanbanView from './kanban-view';
import CreateButton from './create-button';
import { mergeSearch } from 'app/common/utils';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import routeInfoStore from 'common/stores/route';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

interface IProps {
  issueType: ISSUE_TYPE;
}

export default (props: IProps) => {
  const { issueType } = props;
  const [params, { id: queryId }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [{ filterObj, viewType, viewGroup, chosenIssueId, chosenIteration, chosenIssueType }, updater, update] =
    useUpdate({
      filterObj: undefined as undefined | Obj,
      viewType: '',
      viewGroup: '',
      chosenIssueId: queryId,
      chosenIteration: params.iterationId || 0,
      chosenIssueType: undefined as undefined | ISSUE_TYPE,
    });
  const viewRef = React.useRef(null as any);

  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(queryId || false);

  const onFilter = (val: Obj) => {
    updater.filterObj(val);
  };

  const changeViewType = (val: { viewType: string; viewGroup: string }) => {
    update(val);
  };

  const onCreate = (val: string) => {
    const filterIterationIDs = filterObj?.iterationIDs || [];
    // 当前选中唯一迭代，创建的时候默认为这个迭代，否则，迭代为0
    update({
      chosenIteration: filterIterationIDs.length === 1 ? filterIterationIDs[0] : 0,
      chosenIssueType: val as ISSUE_TYPE,
    });
    openDrawer();
  };

  const reloadData = () => {
    if (viewRef.current && viewRef.current.reloadData) {
      viewRef.current.reloadData();
    }
  };

  const onCloseDrawer = ({ hasEdited, isCreate, isDelete }: CloseDrawerParam) => {
    closeDrawer();
    update({
      chosenIssueId: 0,
      chosenIteration: params.iterationId || 0,
      chosenIssueType: undefined,
    });
    if (hasEdited || isCreate || isDelete) {
      // 有变更再刷新列表
      reloadData();
    }
  };

  const onChosenIssue = (val: ISSUE.Issue) => {
    update({
      chosenIssueId: val.id,
      chosenIteration: val.iterationID,
      chosenIssueType: val.type as ISSUE_TYPE,
    });
    openDrawer();
  };

  return (
    <div className="issue">
      <CreateButton onClick={onCreate} issueType={issueType} />
      <IssueHeader
        reloadData={reloadData}
        onFilter={onFilter}
        changeViewType={changeViewType}
        withPageNo={viewType === ViewTypeMap.table.value}
        issueType={issueType}
      />

      <IF check={viewType === ViewTypeMap.table.value}>
        <TableView
          filterObj={filterObj}
          issueType={issueType}
          viewType={viewType}
          onChosenIssue={onChosenIssue}
          ref={viewRef}
        />
      </IF>
      <IF check={viewType === ViewTypeMap.kanban.value}>
        <KanbanView
          filterObj={filterObj}
          viewGroup={viewGroup}
          issueType={issueType}
          viewType={viewType}
          onChosenIssue={onChosenIssue}
          ref={viewRef}
        />
      </IF>
      {chosenIssueType ? (
        <EditIssueDrawer
          iterationID={chosenIteration}
          id={chosenIssueId}
          issueType={chosenIssueType as ISSUE_TYPE}
          shareLink={`${location.href.split('?')[0]}?${mergeSearch({ id: chosenIssueId }, true)}`}
          visible={drawerVisible}
          closeDrawer={onCloseDrawer}
        />
      ) : null}
    </div>
  );
};
