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
import { ISSUE_TYPE, ISSUE_PRIORITY_MAP } from 'project/common/components/issue/issue-config';
import DiceConfigPage, { useMock } from 'app/config-page';
import { getUrlQuery } from 'config-page/utils';
import { useSwitch, useUpdate } from 'common/use-hooks';
import { qs, mergeSearch, updateSearch, setApiWithOrg, ossImg, getAvatarChars } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import routeInfoStore from 'core/stores/route';
import ImportFile from 'project/pages/issue/component/import-file';
import issueFieldStore from 'org/stores/issue-field';
import { useMount, useUpdateEffect } from 'react-use';
import { Tooltip, Avatar } from 'antd';
import { ErdaIcon } from 'common';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import { useUserMap } from 'core/stores/userMap';
import i18n from 'i18n';

import './board.scss';

const CardRender = (props: { data: Obj }) => {
  // TODO: multiple text overflow
  // const titleMaxLength = 36;
  const userMap = useUserMap();
  const { data } = props || {};
  const { title, extra } = data || {};
  const { type, priority, assigneeID } = extra || {};
  const assigneeObj = userMap[assigneeID] || {};
  // const isTitleExceeds = typeof title === 'string' && title.length > titleMaxLength;
  return (
    <>
      <div className={'flex justify-between items-start mb-1 text-normal break-word'}>
        {title}
        {/* <Tooltip
          destroyTooltipOnHide
          title={isTitleExceeds ? title : ''}
          className="flex-1 text-sm text-default break-word w-64"
        >
          {isTitleExceeds ? `${title.slice(0, titleMaxLength)}...` : title}
        </Tooltip> */}
      </div>

      <div className="cp-kanban-info mt-1 flex flex-col text-desc">
        <div className="flex justify-between items-center mt-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center mr-2">
              <IssueIcon type={type} size="16px" />
            </span>

            <span className="w-20 mr-1">
              {priority && (
                <span className="flex items-center">
                  <IssueIcon type={priority} iconMap="PRIORITY" size="16px" />
                  <span className="ml-1">{ISSUE_PRIORITY_MAP[priority].label}</span>
                </span>
              )}
            </span>
          </div>
          {Object.keys(assigneeObj).length > 0 ? (
            <span>
              <Avatar src={assigneeObj.avatar ? ossImg(assigneeObj.avatar, { w: 24 }) : undefined} size={24}>
                {getAvatarChars(assigneeObj.nick || assigneeObj.name)}
              </Avatar>
            </span>
          ) : (
            <ErdaIcon size={24} type="morentouxiang" />
          )}
        </div>
      </div>
    </>
  );
};

const compareObject = (sourceObj: object, targetObj: object) => {
  if (Object.keys(sourceObj).length === Object.keys(targetObj).length) {
    return Object.keys(sourceObj).filter((key) => sourceObj[key] !== targetObj[key]).length === 0;
  } else {
    return false;
  }
};

const IssueProtocol = () => {
  const [{ projectId, iterationId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const { id: queryId, iterationID: queryItertationID, type: _queryType, ...restQuery } = query;
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const queryType = _queryType && _queryType.toUpperCase();
  const [
    {
      importFileVisible,
      filterObj,
      chosenIssueType,
      chosenIssueId,
      chosenIteration,
      urlQuery,
      urlQueryChangeByQuery,
      issueType,
    },
    updater,
    update,
  ] = useUpdate({
    importFileVisible: false,
    filterObj: {},
    chosenIssueId: queryId,
    chosenIteration: queryItertationID || 0,
    urlQuery: restQuery,
    chosenIssueType: queryType as undefined | ISSUE_TYPE,
    pageNo: 1,
    viewType: '',
    viewGroup: '',
    issueType: '',
    urlQueryChangeByQuery: restQuery, // Only used to listen for changes to update the page after url change
  });
  const { getFieldsByIssue: getCustomFieldsByProject } = issueFieldStore.effects;
  React.useEffect(() => {
    issueType &&
      getCustomFieldsByProject({
        propertyIssueType: issueType,
        orgID,
      });
  }, [issueType]);

  const reloadRef = React.useRef(null as any);
  const filterObjRef = React.useRef(null as any);

  const queryRef = React.useRef(restQuery);

  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(queryId || false);

  const inParams = {
    fixedIteration: iterationId,
    projectId,
    ...(urlQuery || {}),
  };

  const getDownloadUrl = (IsDownload = false) => {
    const useableFilterObj = filterObjRef?.current?.issuePagingRequest || {};
    return setApiWithOrg(
      `/api/issues/actions/export-excel?${qs.stringify(
        { ...useableFilterObj, pageNo: 1, projectID: projectId, type: issueType, IsDownload, orgID },
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

  useUpdateEffect(() => {
    const { id: _id, iterationID: _iterationID, type: _type, ..._restQuery } = query;
    queryRef.current = _restQuery;
  }, [query]);

  useUpdateEffect(() => {
    if (!compareObject(urlQuery, queryRef.current)) {
      queryRef.current = urlQuery;
      updateSearch({ ...(urlQuery || {}) });
    }
  }, [urlQuery]);

  useUpdateEffect(() => {
    if (!compareObject(urlQuery, queryRef.current)) {
      // Execute only after url change such as page go back
      update({
        urlQuery: queryRef.current,
        urlQueryChangeByQuery: queryRef.current, // Only used to listen for changes to update the page
      });
    }
  }, [queryRef.current]);

  useUpdateEffect(() => {
    reloadData();
  }, [urlQueryChangeByQuery]);

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

  const onFilterChange = (val: Obj) => {
    updater.filterObj((prev) => ({ ...prev, ...val }));
    updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));
  };

  return (
    <>
      <DiceConfigPage
        scenarioKey="issue-kanban"
        scenarioType="issue-kanban"
        showLoading
        // useMock={useMock}
        // forceMock
        inParams={inParams}
        ref={reloadRef}
        customProps={{
          issueManage: {
            props: { fullHeight: true },
          },
          content: {
            props: { whiteBg: true, className: 'rounded-none p-0 flex-1 h-0' },
          },
          issueTypeSelect: {
            props: {
              buttonStyle: 'solid',
              radioType: 'button',
            },
            op: {
              onStateChange: (val: Obj) => {
                updater.issueType(val.value?.toUpperCase());
              },
            },
          },
          toolbar: { props: { className: 'issue-board-toolbar rounded-none', whiteBg: true } },
          issueAddButton: {
            props: {
              menu: [
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'requirement',
                  operations: {
                    click: {
                      key: 'createRequirement',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.REQUIREMENT',
                  text: i18n.t('requirement'),
                },
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'task',
                  operations: {
                    click: {
                      key: 'createTask',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.TASK',
                  text: i18n.t('task'),
                },
                {
                  disabled: false,
                  disabledTip: '',
                  key: 'bug',
                  operations: {
                    click: {
                      key: 'createBug',
                      reload: false,
                    },
                  },
                  prefixIcon: 'ISSUE_ICON.issue.BUG',
                  text: i18n.t('bug'),
                },
              ],
              operations: {
                click: {
                  key: '',
                  reload: false,
                },
              },
              suffixIcon: 'di',
              text: i18n.t('dop:create issue'),
              type: 'primary',
            },
            op: {
              // 添加：打开滑窗
              click: onCreate,
            },
          },
          inputFilter: {
            props: {
              delay: 2000,
            },
            op: { onFilterChange },
          },
          issueFilter: {
            op: { onFilterChange },
          },
          issueKanbanV2: {
            props: {
              CardRender,
              grayBg: true,
              className: 'mt-0',
            },
            op: {
              clickCard: (_data: ISSUE.Issue) => {
                onChosenIssue(_data);
              },
            },
          },
          issueImport: {
            props: {
              prefixIcon: 'import',
              size: 'small',
              tooltip: '导入',
            },
            op: {
              click: () => {
                updater.importFileVisible(true);
              },
            },
          },
          topHead: {
            props: {
              isTopHead: true,
            },
          },
          issueExport: {
            props: {
              prefixIcon: 'export',
              size: 'small',
              tooltip: '导出',
            },
            op: {
              click: () => window.open(getDownloadUrl()),
            },
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

export default IssueProtocol;
