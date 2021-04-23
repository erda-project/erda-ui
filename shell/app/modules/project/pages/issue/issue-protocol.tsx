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
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import DiceConfigPage from 'app/config-page';
import { getUrlQuery } from 'config-page/utils';
import { useUpdate, useSwitch } from 'common';
import { get, set, cloneDeep } from 'lodash';
import { qs, mergeSearch, updateSearch } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import routeInfoStore from 'common/stores/route';
import ImportFile from 'project/pages/issue/component/import-file';
import issueFieldStore from 'org/stores/issue-field';
import { useMount } from 'react-use';

interface IProps{
  issueType: ISSUE_TYPE
}

const getRealIssueType = (issueType: ISSUE_TYPE) => {
  if (issueType === ISSUE_TYPE.ALL) return [ISSUE_TYPE.EPIC, ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG];
  return issueType;
};

export default ({ issueType }: IProps) => {
  const [{ projectId, iterationId }, { id: queryId, iterationID: queryItertationID, type: _queryType, ...restQuery }] = routeInfoStore.useStore(s => [s.params, s.query]);
  const orgID = orgStore.getState(s => s.currentOrg.id);
  const queryType = _queryType && _queryType.toUpperCase();
  const [{ importFileVisible, filterObj, chosenIssueType, chosenIssueId, chosenIteration, urlQuery }, updater, update] = useUpdate({
    importFileVisible: false,
    filterObj: {},
    chosenIssueId: queryId,
    chosenIteration: queryItertationID || 0,
    urlQuery: restQuery,
    chosenIssueType: queryType as undefined | ISSUE_TYPE,
    pageNo: 1,
    viewType: '',
    viewGroup: '',
  });
  const { getFieldsByIssue: getCustomFieldsByProject } = issueFieldStore.effects;
  useMount(() => {
    getCustomFieldsByProject({
      propertyIssueType: issueType,
      orgID,
    });
  });

  const reloadRef = React.useRef(null as any);
  const filterObjRef = React.useRef(null as any);

  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(queryId || false);

  const inParams = {
    fixedIteration: iterationId,
    fixedIssueType: issueType,
    projectId,
    ...(urlQuery || {}),
  };

  const getDownloadUrl = (IsDownload = false) => {
    const useableFilterObj = filterObjRef?.current?.issuePagingRequest || {};
    return `/api/issues/actions/export-excel?${qs.stringify({ ...useableFilterObj, pageNo: 1, projectID: projectId, type: getRealIssueType(issueType), IsDownload, orgID }, { arrayFormat: 'none' })}`;
  };

  const reloadData = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  React.useEffect(() => {
    filterObjRef.current = filterObj;
  }, [filterObj]);

  React.useEffect(() => {
    updateSearch({ ...(urlQuery || {}) });
  }, [urlQuery]);

  const onChosenIssue = (val: ISSUE.Issue) => {
    update({
      chosenIssueId: val.id,
      chosenIteration: val.iterationID,
      chosenIssueType: val.type as ISSUE_TYPE,
    });
    openDrawer();
  };

  const onCloseDrawer = ({ hasEdited, isCreate, isDelete }: CloseDrawerParam) => {
    closeDrawer();
    update({
      chosenIssueId: 0,
      chosenIteration: 0,
      chosenIssueType: undefined,
    });
    if (hasEdited || isCreate || isDelete) { // 有变更再刷新列表
      reloadData();
    }
  };

  const onCreate = (val:any) => {
    const filterIterationIDs = filterObj?.iterationIDs || [];
    const createTypeMap = {
      createRequirement: ISSUE_TYPE.REQUIREMENT,
      createTask: ISSUE_TYPE.TASK,
      createBug: ISSUE_TYPE.BUG,
    };
    const curType = createTypeMap[val?.key];
    if (curType) {
      // 当前选中唯一迭代，创建的时候默认为这个迭代，否则，迭代为0
      update({
        chosenIteration: iterationId || (filterIterationIDs.length === 1 ? filterIterationIDs[0] : 0),
        chosenIssueType: curType,
      });
      openDrawer();
    }
  };

  return (
    <>
      <DiceConfigPage
        scenarioKey='issue-manage'
        scenarioType='issue-manage'
        showLoading
        inParams={inParams}
        ref={reloadRef}
        useMock={location.search.includes('useMock') ? useMock : undefined}
        customProps={{ // 后端未对接，由前端接管的事件
          issueAddButton: { // 添加：打开滑窗
            click: onCreate,
          },
          issueFilter: { // filter: 改变url
            onFilterChange: (val: Obj) => {
              updater.filterObj(val);
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
            },
          },
          issueViewGroup: { // 视图切换： 改变url
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              // updater.viewType(val?.value);
              // updater.viewType(val?.childrenValue?.kanban);
            },
          },
          issueTable: { // 表格视图： pageNo改变url，点击item打开滑窗详情
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              // updater.pageNo(val?.pageNo || 1);
            },
            clickTableItem: (_data: ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueKanban: { // 看板：点击单个看板节点，打开滑窗
            clickNode: (_data: ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueGantt: { // 点击单个看板任务：打开滑窗
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              updater.pageNo(val?.pageNo || 1);
            },
            clickTableItem: (_data:ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueImport: { // 导入
            click: () => {
              updater.importFileVisible(true);
            },
          },
          issueExport: { // 导出
            click: () => window.open(getDownloadUrl()),
          },
        }}
      />
      {
        [ISSUE_TYPE.BUG, ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK].includes(issueType) ? (
          <ImportFile
            issueType={issueType}
            download={getDownloadUrl(true)}
            projectID={projectId}
            visible={importFileVisible}
            onClose={() => { updater.importFileVisible(false); }}
            afterImport={() => {
              reloadData();
            }}
          />
        ) : null
      }

      {
        chosenIssueType ? (
          <EditIssueDrawer
            iterationID={chosenIteration}
            id={chosenIssueId}
            issueType={chosenIssueType as ISSUE_TYPE}
            shareLink={`${location.href.split('?')[0]}?${mergeSearch({ id: chosenIssueId, iterationID: chosenIteration, type: chosenIssueType }, true)}`}
            visible={drawerVisible}
            closeDrawer={onCloseDrawer}
          />
        ) : null
      }
    </>
  );
};

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMock(payload));
    }, 100);
  });
};

const getMock = (payload: any) => {
  const _mock = cloneDeep(mock);
  if (get(payload, 'protocol.components.issueViewGroup.state.value') === 'kanban') {
    set(_mock, 'protocol.hierarchy.structure.content', ['issueKanban']);
    set(_mock, 'protocol.components.issueKanban', issueKanban);
    set(_mock, 'protocol.components.issueViewGroup.state.value', 'kanban');
  } else if (get(payload, 'protocol.components.issueViewGroup.state.value') === 'gantt') {
    set(_mock, 'protocol.hierarchy.structure.content', ['issueGantt']);
    set(_mock, 'protocol.components.issueGantt', issueGantt);
    set(_mock, 'protocol.components.issueViewGroup.state.value', 'gantt');
  } else {
    set(_mock, 'protocol.hierarchy.structure.content', ['issueTable']);
    set(_mock, 'protocol.components.issueTable', issueTable);
    set(_mock, 'protocol.components.issueViewGroup.state.value', 'table');
  }

  const curConditions = get(payload, 'protocol.components.issueFilter.state.conditions');
  if (curConditions) {
    set(_mock, 'protocol.components.issueFilter.state.conditions', curConditions);
  }
  const curConditionsValue = get(payload, 'protocol.components.issueFilter.state.values');
  if (curConditionsValue) {
    set(_mock, 'protocol.components.issueFilter.state.values', curConditionsValue);
  }

  return _mock;
};

const issueKanban = {
  version: '',
  type: 'IssueKanban',
  name: '',
  props: null,
  data: {
    board: [
      {
        label: '紧急',
        labelKey: 'URGENT',
        total: 0,
        list: null,
        operations: null,
      },
      {
        label: '高',
        labelKey: 'HIGH',
        total: 0,
        list: null,
        operations: null,
      },
      {
        label: '中',
        labelKey: 'NORMAL',
        total: 5,
        list: [
          {
            id: 746,
            createdAt: '2021-01-09T14:30:24+08:00',
            updatedAt: '2021-01-09T14:30:24+08:00',
            planStartedAt: null,
            planFinishedAt: null,
            projectID: 11,
            iterationID: 9,
            appID: null,
            requirementID: null,
            requirementTitle: '',
            type: 'REQUIREMENT',
            title: '22',
            content: '',
            state: 4349,
            priority: 'NORMAL',
            complexity: 'NORMAL',
            severity: 'NORMAL',
            creator: '2',
            assignee: '2',
            issueButton: [
              {
                stateID: 4349,
                stateName: '待处理',
                stateBelong: 'OPEN',
                permission: false,
              },
              {
                stateID: 4350,
                stateName: '进行中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4351,
                stateName: '测试中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4352,
                stateName: '已完成',
                stateBelong: 'DONE',
                permission: true,
              },
            ],
            issueSummary: null,
            labels: [

            ],
            issueManHour: {
              estimateTime: 0,
              thisElapsedTime: 0,
              elapsedTime: 0,
              remainingTime: 0,
              startTime: '',
              workContent: '',
              isModifiedRemainingTime: false,
            },
            source: '',
            taskType: '',
            bugStage: '',
            owner: '',
            testPlanCaseRels: null,
            operations: {
              MoveOut: {
                text: '移出迭代',
                hasAuth: true,
                confirm: '确认移出迭代',
                reload: true,
                meta: {
                  ID: 746,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityHIGH: {
                text: '转移至复杂度高',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 746,
                  issueAssignee: '',
                  issuePriority: 'HIGH',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityLOW: {
                text: '转移至复杂度低',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 746,
                  issueAssignee: '',
                  issuePriority: 'LOW',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityURGENT: {
                text: '转移至复杂度紧急',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 746,
                  issueAssignee: '',
                  issuePriority: 'URGENT',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              drag: {
                meta: {
                  ID: 746,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
                reload: true,
                targetKeys: {
                  HIGH: true,
                  LOW: true,
                  NORMAL: true,
                  URGENT: true,
                },
              },
            },
          },
          {
            id: 745,
            createdAt: '2021-01-09T14:29:45+08:00',
            updatedAt: '2021-01-09T14:29:45+08:00',
            planStartedAt: null,
            planFinishedAt: null,
            projectID: 11,
            iterationID: 9,
            appID: null,
            requirementID: null,
            requirementTitle: '',
            type: 'REQUIREMENT',
            title: '333',
            content: '',
            state: 4349,
            priority: 'NORMAL',
            complexity: 'NORMAL',
            severity: 'NORMAL',
            creator: '2',
            assignee: '2',
            issueButton: [
              {
                stateID: 4349,
                stateName: '待处理',
                stateBelong: 'OPEN',
                permission: false,
              },
              {
                stateID: 4350,
                stateName: '进行中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4351,
                stateName: '测试中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4352,
                stateName: '已完成',
                stateBelong: 'DONE',
                permission: true,
              },
            ],
            issueSummary: null,
            labels: [
              'a',
            ],
            issueManHour: {
              estimateTime: 0,
              thisElapsedTime: 0,
              elapsedTime: 0,
              remainingTime: 0,
              startTime: '',
              workContent: '',
              isModifiedRemainingTime: false,
            },
            source: '',
            taskType: '',
            bugStage: '',
            owner: '',
            testPlanCaseRels: null,
            operations: {
              MoveOut: {
                text: '移出迭代',
                hasAuth: true,
                confirm: '确认移出迭代',
                reload: true,
                meta: {
                  ID: 745,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityHIGH: {
                text: '转移至复杂度高',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 745,
                  issueAssignee: '',
                  issuePriority: 'HIGH',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityLOW: {
                text: '转移至复杂度低',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 745,
                  issueAssignee: '',
                  issuePriority: 'LOW',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityURGENT: {
                text: '转移至复杂度紧急',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 745,
                  issueAssignee: '',
                  issuePriority: 'URGENT',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              drag: {
                meta: {
                  ID: 745,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
                reload: true,
                targetKeys: {
                  HIGH: true,
                  LOW: true,
                  NORMAL: true,
                  URGENT: true,
                },
              },
            },
          },
          {
            id: 728,
            createdAt: '2021-01-08T15:09:55+08:00',
            updatedAt: '2021-01-08T15:10:06+08:00',
            planStartedAt: null,
            planFinishedAt: null,
            projectID: 11,
            iterationID: -1,
            appID: null,
            requirementID: null,
            requirementTitle: '',
            type: 'REQUIREMENT',
            title: '12阿佛奥无佛奥委会佛奥委会南宫OA我IG嗷呜红日A后噢浓浓发哦我把否为报复保温服',
            content: '',
            state: 4349,
            priority: 'NORMAL',
            complexity: '',
            severity: '',
            creator: '2',
            assignee: '2',
            issueButton: [
              {
                stateID: 4349,
                stateName: '待处理',
                stateBelong: 'OPEN',
                permission: false,
              },
              {
                stateID: 4350,
                stateName: '进行中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4351,
                stateName: '测试中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4352,
                stateName: '已完成',
                stateBelong: 'DONE',
                permission: true,
              },
            ],
            issueSummary: null,
            labels: [

            ],
            issueManHour: {
              estimateTime: 0,
              thisElapsedTime: 0,
              elapsedTime: 0,
              remainingTime: 0,
              startTime: '',
              workContent: '',
              isModifiedRemainingTime: false,
            },
            source: '',
            taskType: '',
            bugStage: '',
            owner: '',
            testPlanCaseRels: null,
            operations: {
              MoveToPriorityHIGH: {
                text: '转移至复杂度高',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 728,
                  issueAssignee: '',
                  issuePriority: 'HIGH',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityLOW: {
                text: '转移至复杂度低',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 728,
                  issueAssignee: '',
                  issuePriority: 'LOW',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityURGENT: {
                text: '转移至复杂度紧急',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 728,
                  issueAssignee: '',
                  issuePriority: 'URGENT',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              drag: {
                meta: {
                  ID: 728,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
                reload: true,
                targetKeys: {
                  HIGH: true,
                  LOW: true,
                  NORMAL: true,
                  URGENT: true,
                },
              },
            },
          },
          {
            id: 706,
            createdAt: '2021-01-07T15:27:13+08:00',
            updatedAt: '2021-01-08T12:02:49+08:00',
            planStartedAt: '2021-01-08T00:00:00+08:00',
            planFinishedAt: '2021-01-30T00:00:00+08:00',
            projectID: 11,
            iterationID: 9,
            appID: null,
            requirementID: null,
            requirementTitle: '',
            type: 'REQUIREMENT',
            title: '234234',
            content: 'ewf',
            state: 4352,
            priority: 'NORMAL',
            complexity: 'NORMAL',
            severity: 'NORMAL',
            creator: '2',
            assignee: '2',
            issueButton: [
              {
                stateID: 4349,
                stateName: '待处理',
                stateBelong: 'OPEN',
                permission: true,
              },
              {
                stateID: 4350,
                stateName: '进行中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4351,
                stateName: '测试中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4352,
                stateName: '已完成',
                stateBelong: 'DONE',
                permission: false,
              },
            ],
            issueSummary: null,
            labels: [
              'a',
            ],
            issueManHour: {
              estimateTime: 180,
              thisElapsedTime: 0,
              elapsedTime: 120,
              remainingTime: 60,
              startTime: '',
              workContent: '',
              isModifiedRemainingTime: true,
            },
            source: '',
            taskType: '',
            bugStage: '',
            owner: '',
            testPlanCaseRels: null,
            operations: {
              MoveOut: {
                text: '移出迭代',
                hasAuth: true,
                confirm: '确认移出迭代',
                reload: true,
                meta: {
                  ID: 706,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityHIGH: {
                text: '转移至复杂度高',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 706,
                  issueAssignee: '',
                  issuePriority: 'HIGH',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityLOW: {
                text: '转移至复杂度低',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 706,
                  issueAssignee: '',
                  issuePriority: 'LOW',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityURGENT: {
                text: '转移至复杂度紧急',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 706,
                  issueAssignee: '',
                  issuePriority: 'URGENT',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              drag: {
                meta: {
                  ID: 706,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
                reload: true,
                targetKeys: {
                  HIGH: true,
                  LOW: true,
                  NORMAL: true,
                  URGENT: true,
                },
              },
            },
          },
          {
            id: 662,
            createdAt: '2021-01-05T16:09:06+08:00',
            updatedAt: '2021-01-08T00:05:40+08:00',
            planStartedAt: null,
            planFinishedAt: null,
            projectID: 11,
            iterationID: 9,
            appID: null,
            requirementID: null,
            requirementTitle: '',
            type: 'REQUIREMENT',
            title: 'Good Day',
            content: '',
            state: 4352,
            priority: 'NORMAL',
            complexity: 'NORMAL',
            severity: 'NORMAL',
            creator: '2',
            assignee: '1000002',
            issueButton: [
              {
                stateID: 4349,
                stateName: '待处理',
                stateBelong: 'OPEN',
                permission: true,
              },
              {
                stateID: 4350,
                stateName: '进行中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4351,
                stateName: '测试中',
                stateBelong: 'WORKING',
                permission: true,
              },
              {
                stateID: 4352,
                stateName: '已完成',
                stateBelong: 'DONE',
                permission: false,
              },
            ],
            issueSummary: null,
            labels: [

            ],
            issueManHour: {
              estimateTime: 0,
              thisElapsedTime: 0,
              elapsedTime: 0,
              remainingTime: 0,
              startTime: '',
              workContent: '',
              isModifiedRemainingTime: false,
            },
            source: '',
            taskType: '',
            bugStage: '',
            owner: '',
            testPlanCaseRels: null,
            operations: {
              MoveOut: {
                text: '移出迭代',
                hasAuth: true,
                confirm: '确认移出迭代',
                reload: true,
                meta: {
                  ID: 662,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityHIGH: {
                text: '转移至复杂度高',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 662,
                  issueAssignee: '',
                  issuePriority: 'HIGH',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityLOW: {
                text: '转移至复杂度低',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 662,
                  issueAssignee: '',
                  issuePriority: 'LOW',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              MoveToPriorityURGENT: {
                text: '转移至复杂度紧急',
                hasAuth: true,
                reload: true,
                meta: {
                  ID: 662,
                  issueAssignee: '',
                  issuePriority: 'URGENT',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
              },
              drag: {
                meta: {
                  ID: 662,
                  issueAssignee: '',
                  issuePriority: '',
                  stateID: 0,
                  projectID: 0,
                  panelName: '',
                  panelID: 0,
                },
                reload: true,
                targetKeys: {
                  HIGH: true,
                  LOW: true,
                  NORMAL: true,
                  URGENT: true,
                },
              },
            },
          },
        ],
        operations: null,
      },
      {
        label: '低',
        labelKey: 'LOW',
        total: 0,
        list: null,
        operations: null,
      },
    ],
  },
  state: {

  },
  operations: {

  },
};

const issueTable = {
  type: 'Table',
  state: {
    total: 20,
    pageSize: 10,
    pageNo: 1, // 这里注意，如果filter组件里有数据变化，这里的pageNo要重置为1，就是用户改变查询参数后，要从第一页开始
  },
  operations: { // 当用户翻页的时候，我会先把上面state的pageNo改掉，然后再告诉你我执行了这个operation
    changePageNo: {
      key: 'changePageNo',
      reload: true,
    },
  },
  props: {
    rowKey: 'id',
    columns: [
      { title: '标题', dataIndex: 'title' },
      { title: '进度', dataIndex: 'progress', width: 100 },
      { title: '严重程度', dataIndex: 'severity', width: 100 },
      { title: '优先级', dataIndex: 'priority', width: 120 },
      { title: '状态', dataIndex: 'state', width: 120 },
      { title: '处理人', dataIndex: 'assignee', width: 120 },
      { title: '截止日期', dataIndex: 'deadline', width: 160 },
    ],
  },
  data: {
    list: [
      {
        id: '1111', // 唯一key
        type: 'REQUIREMENT',
        iterationID: 9,
        title: { renderType: 'textWithTags', prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT', value: '111111', tags: [{ tag: 'tag1', color: 'red' }, { tag: 'tag2', color: 'blue' }, { tag: 'tag3', color: 'green' }] },
        progress: { renderType: 'progress', value: '30' },
        severity: {
          renderType: 'operationsDropdownMenu',
          value: '严重',
          prefixIcon: 'ISSUE_ICON.severity.XX',
          operations: {
            changePriorityTo1: { // 这个key后端定，
              key: 'changePriorityTo1', // 这个key一定要有
              reload: true,
              disabled: true, // 根据实际情况
              text: '严重',
              prefixIcon: 'ISSUE_ICON.severity.HIGH',
              meta: { id: '事件id:1111', severity: '1' },
            },
          },
        },
        priority: {
          renderType: 'operationsDropdownMenu',
          value: '高',
          prefixIcon: 'ISSUE_ICON.priority.HIGH',
          operations: {
            changePriorityTo1: { // 这个key后端定，
              key: 'changePriorityTo1', // 这个key一定要有
              reload: true,
              // disabled: true, // 根据实际情况
              text: '高',
              prefixIcon: 'ISSUE_ICON.priority.HIGH',
              meta: { id: '事件id:1111', priority: '1' },
            },
            changePriorityTo2: {
              key: 'changePriorityTo2', // 这个key一定要有
              reload: true,
              text: '中',
              disabled: true, // 根据实际情况
              disabledTip: '不能转移',
              prefixIcon: 'ISSUE_ICON.priority.NORMAL',
              meta: { id: '事件id:1111', priority: '' },
            },
          },
        },
        state: {
          renderType: 'operationsDropdownMenu',
          value: '进行中',
          prefixIcon: 'ISSUE_ICON.state.WORKING',
          disabled: true,
          disabledTip: '没权限',
          operations: {
            changePriorityTo1: { // 这个key后端定，
              key: 'changePriorityTo1', // 这个key一定要有
              reload: true,
              text: '待处理',
              prefixIcon: 'ISSUE_ICON.state.OPEN',
              meta: { id: '事件id:1111', state: 'z' },
            },
            changePriorityTo2: {
              key: 'changePriorityTo2', // 这个key一定要有
              reload: true,
              text: '进行中',
              prefixIcon: 'ISSUE_ICON.state.WORKING',
              meta: { id: '事件id:1111', priority: '2' },
            },
            changePriorityTo3: {
              key: 'changePriorityTo3', // 这个key一定要有
              reload: true,
              text: '已完成',
              prefixIcon: 'ISSUE_ICON.state.DONE',
              meta: { id: '事件id:1111', priority: '3' },
            },
          },
        },
        assignee: {
          value: '2',
          renderType: 'memberSelector',
          scope: 'project',
          operations: {
            onChange: {
              key: 'updateAssignee',
              reload: true,
              // disabled: true,
              disabledTip: '',
              fillMeta: 'assignee',
              meta: { id: '事件id', assignee: '' },
            },
          },
        },
        deadline: {
          renderType: 'datePicker',
          value: '2021-01-31T00:00:00+08:00',
          textAlign: 'right',
          displayTip: { text: '截止今日', color: 'red' },
          operations: {
            onChange: {
              key: 'changeDeadline',
              reload: true,
              disabled: true,
              disabledTip: 'xx',
              fillMeta: 'deadlineValue', // 修改后把值塞入meta中的对应字段
              meta: { id: '事件id', deadlineValue: '' },
            },
          },
        },
      },
    ],
  },
};

const issueGantt = {
  type: 'Table',
  state: {
    total: 20,
    pageSize: 10,
    pageNo: 1, // 这里注意，如果filter组件里有数据变化，这里的pageNo要重置为1，就是用户改变查询参数后，要从第一页开始
  },
  operations: { // 当用户翻页的时候，我会先把上面state的pageNo改掉，然后再告诉你我执行了这个operation
    changePageNo: {
      reload: true,
    },
  },
  data: {
    list: [
      {
        id: 1,
        user: {
          renderType: 'memberAvatar',
          avatar: '',
          id: 2,
          name: 'dice',
          nick: 'dice',
        },
        issues: {
          renderType: 'string-list',
          value: [
            { text: '任务C', id: '3', type: 'REQUIREMENT', iterationID: 2 },
          ],
        },
        dateRange: { renderType: 'gantt',
          value: [
            { tooltip: '任务A', restTime: 5, offset: 0, delay: 0, actualTime: 13 },
          ] },
      },
      {
        id: 2,
        user: {
          renderType: 'memberAvatar',
          avatar: '',
          id: 1,
          name: '端点',
          nick: '端点',
        },
        issues: { renderType: 'string-list',
          value: [
            { text: '接口测试计划中引入测试用例，测试用例比较多的时候一个个的引入效率太低', id: '1', type: 'TASK', iterationID: 2, linkStyle: true },
          ] },
        dateRange:
          {
            renderType: 'gantt',
            value: [
              { tooltip: '接口测试计划中引入测试用例，测试用例比较多的时候一个个的引入效率太低', restTime: 0, offset: 1, delay: 1, actualTime: 5 },
            ],
          },
        deadline: {
          renderType: 'datePicker',
          value: '2021-01-31T00:00:00+08:00',
          noBorder: true, // 去除边框
          disabledBefor: 'xxx', // 在这个日期前的不可选
          disabledAfter: 'xxx', // 这个日期后的不可选
          operations: {
            onChange: {
              key: 'changeDeadline',
              reload: true,
              disabled: true,
              disabledTip: 'xx',
              fillMeta: 'deadlineValue', // 修改后把值塞入meta中的对应字段
              meta: { id: '事件id', deadlineValue: '' },
            },
          },
        },
      },
    ],
  },
  props: {
    rowKey: 'id',
    columns: [
      { title: '成员', dataIndex: 'user', width: 100 },
      { title: '时间', dataIndex: 'deadline', width: 140 },
      {
        title: '任务名',
        dataIndex: 'issues',
        titleTip: [
          '事项的甘特图只有确保正确输入截止日期、预计时间才能正常显示',
          '#gray#灰色#>gray#：代表事项截止日期的剩余时间段',
          '#blue#蓝色#>blue#：代表从开始到现在的时间段',
          '#red#红色#>red#：代表截止到目前的超时时间段',
        ],
      },
      { title: '甘特图',
        dataIndex: 'dateRange',
        titleRenderType: 'gantt',
        width: 800,
        data: [
          {
            month: 12,
            date: ['30', '31'],
          },
          {
            month: 1,
            date: ['1', '2', 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          },
        ] },
    ],
  },
};

const filter = {
  type: 'ContractiveFilter',
  props: {
    delay: 1000,
  },
  state: {
    conditions: [
      {
        key: 'iterationIDs',
        label: '迭代',
        emptyText: '全部',
        fixed: true,
        showIndex: 1,
        haveFilter: true,
        type: 'select' as const,
        placeholder: '选择迭代',
        options: [
          {
            label: '迭代 1',
            value: 1,
            icon: '',
          },
          {
            label: '迭代 2',
            value: 2,
            icon: '',
          },
          {
            label: '迭代 3',
            value: 3,
            icon: '',
          },
          {
            label: '迭代 4',
            value: 4,
            icon: '',
          },
          {
            label: '迭代 5',
            value: 5,
            icon: '',
          },
          {
            label: '迭代 66666666666666666666666666666666666666',
            value: 6,
            icon: '',
          },
          {
            label: '迭代 7',
            value: 7,
            icon: '',
          },
          {
            label: '迭代 8',
            value: 8,
            icon: '',
          },
          {
            label: '迭代 9',
            value: 9,
            icon: '',
          },
        ],
      },
      {
        key: 'title',
        label: '标题',
        emptyText: '全部',
        fixed: true,
        showIndex: 2,
        placeholder: '请输入标题',
        type: 'input' as const,
      },
      {
        key: 'state',
        label: '状态',
        emptyText: '全部',
        fixed: true,
        showIndex: 4,
        type: 'select' as const,
        options: [
          {
            label: '待处理',
            value: 'OPEN',
            icon: '',
          },
          {
            label: '重新打开',
            value: 'REOPEN',
            icon: '',
          },
          {
            label: '已解决',
            value: 'RESOLVED',
            icon: '',
          },
          {
            label: '不修复',
            value: 'WONTFIX',
            icon: '',
          },
          {
            label: '不修复，重复提交',
            value: 'DUP',
            icon: '',
          },
          {
            label: '已关闭',
            value: 'CLOSED',
            icon: '',
          },
        ],
      },
      {
        key: 'label',
        label: '标签',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        haveFilter: true,
        type: 'select' as const,
        placeholder: '选择标签',
        options: [
          {
            label: '客户需求',
            value: 22,
            icon: '',
          },
          {
            label: '内部需求',
            value: 33,
            icon: '',
          },
        ],
      },
      {
        key: 'priority',
        label: '优先级',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        type: 'select' as const,
        placeholder: '选择优先级',
        options: [
          {
            label: '紧急',
            value: 'URGENT',
            icon: '',
          },
          {
            label: '高',
            value: 'HIGH',
            icon: '',
          },
          {
            label: '中',
            value: 'NORMAL',
            icon: '',
          },
          {
            label: '低',
            value: 'LOW',
            icon: '',
          },
        ],
      },
      {
        key: 'severity',
        label: '严重程度',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        type: 'select' as const,
        placeholder: '选择优先级',
        options: [
          {
            label: '致命',
            value: 'FATAL',
            icon: '',
          },
          {
            label: '严重',
            value: 'SERIOUS',
            icon: '',
          },
          {
            label: '一般',
            value: 'NORMAL',
            icon: '',
          },
          {
            label: '轻微',
            value: 'SLIGHT',
            icon: '',
          },
          {
            label: '建议',
            value: 'SUGGEST',
            icon: '',
          },
        ],
      },
      {
        key: 'creator',
        label: '创建人',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        haveFilter: true,
        type: 'select' as const,
        quickSelect: {
          label: '选择自己',
          operationKey: 'selectMe',
        },
        options: [
          {
            label: '张三',
            value: 1,
            icon: '',
          },
          {
            label: '李四',
            value: 2,
            icon: '',
          },
        ],
      },
      {
        key: 'assignee',
        label: '处理人',
        emptyText: '全部',
        fixed: false,
        showIndex: 3,
        haveFilter: true,
        type: 'select' as const,
        options: [
          {
            label: '张三',
            value: 1,
            icon: '',
          },
          {
            label: '李四',
            value: 2,
            icon: '',
          },
        ],
      },
      {
        key: 'owner',
        label: '责任人',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        haveFilter: true,
        type: 'select' as const,
        options: [
          {
            label: '张三',
            value: 1,
            icon: '',
          },
          {
            label: '李四',
            value: 2,
            icon: '',
          },
        ],
      },
      {
        key: 'bugStage',
        label: '引入源',
        emptyText: '全部',
        fixed: false,
        showIndex: 0,
        type: 'select' as const,
        options: [
          {
            label: '需求设计',
            value: 'demandDesign',
            icon: '',
          },
          {
            label: '架构设计',
            value: 'architectureDesign',
            icon: '',
          },
          {
            label: '代码研发',
            value: 'codeDevelopment',
            icon: '',
          },
        ],
      },
      {
        key: 'startCreatedAt,endCreatedAt',
        label: '创建日期',
        fixed: false,
        emptyText: '全部',
        showIndex: 5,
        haveFilter: false,
        type: 'dateRange' as const,
        customProps: {
          borderTime: true,
        },
      },
      {
        key: 'startFinishedAt,endFinishedAt',
        label: '截止日期',
        fixed: false,
        showIndex: 0,
        haveFilter: false,
        type: 'dateRange' as const,
        customProps: {
          borderTime: true,
        },
      },
    ],
    values: {
      iterationIDs: [1, 2],
      title: 'test',
      assignee: [1],
      'startCreatedAt,endCreatedAt': [1609430400000, 1609862400000],
    },
  },
  operations: {
    filter: {
      key: 'filter',
      reload: true,
      partial: true,
    },
    selectMe: {
      key: 'selectMe',
      reload: true,
      partial: true,
    },
  },
};

const mock = {
  scenario: {
    scenarioKey: 'issue-manage',
    scenarioType: 'issue-manage',
  },
  protocol: {
    hierarchy: {
      root: 'issueManage',
      structure: {
        issueManage: ['topHead', 'head', 'content'],
        topHead: ['issueAddButton'],
        head: { left: 'issueFilter', right: 'issueOperations' },
        issueOperations: ['issueViewGroup', 'issueExport', 'issueImport'],
        content: ['issueTable'], // 'kanban'
      },
    },
    components: {
      issueManage: { type: 'Container' },
      head: { type: 'LRContainer', props: { whiteBg: true } },
      content: { type: 'Container', props: { whiteBg: true } },
      topHead: { type: 'RowContainer', props: { isTopHead: true } },
      issueOperations: { type: 'RowContainer' },
      issueFilter: filter,
      issueExport: {
        type: 'Button',
        props: {
          prefixIcon: 'export',
          tooltip: '导出',
          size: 'small',
        },
        operations: {
          click: {
            reload: false, // 这期未对接导出，
            confirm: '是否确认导出',
            // disabled: true,
            // disabledTip: '无权限',
          },
        },
      },
      issueImport: {
        type: 'Button',
        name: 'issueImport',
        props: {
          prefixIcon: 'import',
          tooltip: '导入',
          size: 'small',
        },
        operations: {
          click: {
            reload: false, // 这期未对接导出，
          },
        },
      },
      issueViewGroup: {
        type: 'Radio',
        props: {
          radioType: 'button',
          buttonStyle: 'solid',
          size: 'small',
          options: [
            { text: '表格', tooltip: '', prefixIcon: 'default-list', key: 'table' },
            {
              text: '看板',
              tooltip: '看板视图',
              prefixIcon: 'data-matrix',
              suffixIcon: 'di',
              key: 'kanban',
              children: [
                { text: '优先级', key: 'priority' },
                { text: '处理人', key: 'assignee' },
                { text: '截止日期', key: 'deadline' },
                { text: '自定义', key: 'custom' },
                { text: '状态', key: 'status' },
              ],
            },
            { text: '甘特图', prefixIcon: 'data-matrix', key: 'gantt' },
          ],
        },
        state: {
          value: 'table',
          childrenValue: { kanban: 'deadline' },
        },
        operations: {
          onChange: {
            key: 'changeViewType',
            reload: true,

          },
        },
      },
      issueAddButton: {
        type: 'Button',
        props: {
          menu: [
            {
              text: '需求',
              key: 'requirement',
              prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
              disabled: true,
              disabledTip: '无权限',
              operations: { // 这次未将创建滑窗接入，暂不reload
                click: { key: 'createRequirement', reload: false },
              },
            },
            {
              text: '任务',
              prefixIcon: 'ISSUE_ICON.issue.TASK',
              key: 'task',
              operations: {
                click: { key: 'createTask', reload: false },
              },
            },
            {
              text: '缺陷',
              key: 'bug',
              prefixIcon: 'ISSUE_ICON.issue.BUG',
              operations: {
                click: { reload: false },
              },
            },
          ],
          text: '新建事项',
          type: 'primary',
          suffixIcon: 'di',
        },
      },
    },
  },
};
