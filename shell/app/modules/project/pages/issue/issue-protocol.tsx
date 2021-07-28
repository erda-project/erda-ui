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
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import DiceConfigPage from 'app/config-page';
import { getUrlQuery } from 'config-page/utils';
import { useUpdate, useSwitch } from 'common';
import { qs, mergeSearch, updateSearch, setApiWithOrg } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import routeInfoStore from 'core/stores/route';
import ImportFile from 'project/pages/issue/component/import-file';
import issueFieldStore from 'org/stores/issue-field';
import { useMount } from 'react-use';

interface IProps {
  issueType: ISSUE_TYPE;
}

const getRealIssueType = (issueType: ISSUE_TYPE) => {
  if (issueType === ISSUE_TYPE.ALL) return [ISSUE_TYPE.EPIC, ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG];
  return issueType;
};

export default ({ issueType }: IProps) => {
  const [{ projectId, iterationId }, { id: queryId, iterationID: queryItertationID, type: _queryType, ...restQuery }] =
    routeInfoStore.useStore((s) => [s.params, s.query]);
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const queryType = _queryType && _queryType.toUpperCase();
  const [{ importFileVisible, filterObj, chosenIssueType, chosenIssueId, chosenIteration, urlQuery }, updater, update] =
    useUpdate({
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
    return setApiWithOrg(
      `/api/issues/actions/export-excel?${qs.stringify(
        { ...useableFilterObj, pageNo: 1, projectID: projectId, type: getRealIssueType(issueType), IsDownload, orgID },
        { arrayFormat: 'none' },
      )}`,
    );
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
    if (hasEdited || isCreate || isDelete) {
      // 有变更再刷新列表
      reloadData();
    }
  };

  const onCreate = (val: any) => {
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
        scenarioKey="issue-manage"
        scenarioType="issue-manage"
        showLoading
        inParams={inParams}
        ref={reloadRef}
        customProps={{
          // 后端未对接，由前端接管的事件
          issueAddButton: {
            // 添加：打开滑窗
            click: onCreate,
          },
          issueFilter: {
            // filter: 改变url
            onFilterChange: (val: Obj) => {
              updater.filterObj(val);
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
            },
          },
          issueViewGroup: {
            // 视图切换： 改变url
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              // updater.viewType(val?.value);
              // updater.viewType(val?.childrenValue?.kanban);
            },
          },
          issueTable: {
            // 表格视图： pageNo改变url，点击item打开滑窗详情
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              // updater.pageNo(val?.pageNo || 1);
            },
            clickTableItem: (_data: ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueKanban: {
            // 看板：点击单个看板节点，打开滑窗
            clickNode: (_data: ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueGantt: {
            // 点击单个看板任务：打开滑窗
            onStateChange: (val: Obj) => {
              updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
              updater.pageNo(val?.pageNo || 1);
            },
            clickTableItem: (_data: ISSUE.Issue) => {
              onChosenIssue(_data);
            },
          },
          issueImport: {
            // 导入
            click: () => {
              updater.importFileVisible(true);
            },
          },
          issueExport: {
            // 导出
            click: () => window.open(getDownloadUrl()),
          },
        }}
      />
      {[ISSUE_TYPE.BUG, ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK].includes(issueType) ? (
        <ImportFile
          issueType={issueType}
          download={getDownloadUrl(true)}
          projectID={projectId}
          visible={importFileVisible}
          onClose={() => {
            updater.importFileVisible(false);
          }}
          afterImport={() => {
            reloadData();
          }}
        />
      ) : null}

      {chosenIssueType ? (
        <EditIssueDrawer
          iterationID={chosenIteration}
          id={chosenIssueId}
          issueType={chosenIssueType as ISSUE_TYPE}
          shareLink={`${location.href.split('?')[0]}?${mergeSearch(
            { id: chosenIssueId, iterationID: chosenIteration, type: chosenIssueType },
            true,
          )}`}
          visible={drawerVisible}
          closeDrawer={onCloseDrawer}
        />
      ) : null}
    </>
  );
};
