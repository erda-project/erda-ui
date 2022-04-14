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
import { ISSUE_TYPE, ISSUE_TYPE_MAP } from 'project/common/components/issue/issue-config';
import DiceConfigPage from 'app/config-page';
import { useSwitch, useUpdate } from 'common/use-hooks';
import { insertWhen, mergeSearch } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import { Badge, ErdaIcon } from 'common';
import { usePerm } from 'app/user/common';
import { Button, Dropdown, Menu } from 'antd';
import routeInfoStore from 'core/stores/route';
import issueFieldStore from 'org/stores/issue-field';
import ImportExport from './import-export';
import { useMount } from 'react-use';
import i18n from 'i18n';

interface IProps {
  issueType: ISSUE_TYPE;
}

const IssueProtocol = ({ issueType }: IProps) => {
  const [{ projectId, iterationId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const { id: queryId, iterationID: queryIterationID, type: _queryType, tab } = query;
  const orgID = orgStore.getState((s) => s.currentOrg.id);
  const queryType = _queryType && _queryType.toUpperCase();
  const [{ filterObj, chosenIssueType, chosenIssueId, chosenIteration }, updater, update] = useUpdate({
    filterObj: {},
    chosenIssueId: queryId,
    chosenIteration: +queryIterationID || 0,
    chosenIssueType: queryType as undefined | ISSUE_TYPE,
    pageNo: 1,
    viewType: '',
    viewGroup: '',
  });
  useMount(() => {
    issueFieldStore.effects.getFieldsByIssue({
      propertyIssueType: issueType,
      orgID,
    });
  });

  const issuePerm = usePerm((s) => s.project.requirement);

  const reloadRef = React.useRef<{ reload: () => void }>(null);
  const filterObjRef = React.useRef<Obj>(null);

  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(!!queryId || false);

  const inParams = {
    fixedIteration: iterationId,
    fixedIssueType: issueType,
    projectId,
  };

  const reloadData = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  React.useEffect(() => {
    filterObjRef.current = filterObj;
  }, [filterObj]);

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

  const onCreate = (curType?: ISSUE_TYPE) => {
    const filterIterationIDs = filterObj?.values?.iterationIDs || [];
    // 当前选中唯一迭代，创建的时候默认为这个迭代，否则，迭代为0
    update({
      chosenIteration: iterationId || (filterIterationIDs.length === 1 ? filterIterationIDs[0] : 0),
      chosenIssueType: curType || issueType,
    });
    openDrawer();
  };

  const dropdownMenu = (
    <Menu
      onClick={(e) => {
        e.domEvent.stopPropagation();
        onCreate(e.key);
      }}
    >
      {[ISSUE_TYPE_MAP.REQUIREMENT, ISSUE_TYPE_MAP.TASK, ISSUE_TYPE_MAP.BUG].map((mItem) => {
        return <Menu.Item key={mItem.value}>{mItem.iconLabel}</Menu.Item>;
      })}
    </Menu>
  );

  const pageData = reloadRef.current?.getPageConfig();
  const useableFilterObj = pageData?.protocol?.state?.IssuePagingRequest || {};

  const tabs = [
    {
      key: 'export',
      text: i18n.t('Export'),
      disabled: !issuePerm.export.pass,
      tip: issuePerm.export.pass ? '' : i18n.t('common:no permission to operate'),
    },
    ...insertWhen(issueType !== ISSUE_TYPE.ALL, [
      {
        key: 'import',
        text: i18n.t('Import'),
        disabled: !issuePerm.import.pass,
        tip: issuePerm.import.pass ? '' : i18n.t('common:no permission to operate'),
      },
    ]),
    {
      key: 'record',
      text: i18n.t('Records'),
      disabled: false,
    },
  ];

  return (
    <div className="pb-4">
      <div className="top-button-group flex">
        <ImportExport tabs={tabs} queryObj={useableFilterObj} issueType={issueType} projectId={projectId} />

        {issueType === ISSUE_TYPE.ALL ? (
          <Dropdown overlay={dropdownMenu} placement="bottomRight">
            <Button type="primary" className="flex-h-center">
              {i18n.t('Add')}
              <ErdaIcon type="caret-down" size="18" className="ml-1" />
            </Button>
          </Dropdown>
        ) : (
          <Button type={'primary'} onClick={() => onCreate(issueType)}>
            {i18n.t('Add')}
          </Button>
        )}
      </div>
      <DiceConfigPage
        scenarioKey="issue-manage"
        scenarioType="issue-manage"
        showLoading
        inParams={inParams}
        forceUpdateKey={['inParams']}
        fullHeight={false}
        ref={reloadRef}
        customProps={{
          issueManage: {
            props: { spaceSize: 'none' },
          },
          issueFilter: {
            op: {
              // filter: 改变url
              onFilterChange: (val: Obj) => {
                updater.filterObj(val);
              },
            },
            props: {
              processField: (field: CP_CONFIGURABLE_FILTER.Condition) => {
                if (field.key === 'priorities') {
                  return {
                    ...field,
                    options: field.options?.map((item) => ({
                      ...item,
                      icon: `ISSUE_ICON.priority.${item.value}`,
                    })),
                  };
                } else if (field.key === 'severities') {
                  return {
                    ...field,
                    options: field.options?.map((item) => ({
                      ...item,
                      icon: `ISSUE_ICON.severity.${item.value}`,
                    })),
                  };
                } else {
                  return field;
                }
              },
            },
          },
          issueTable: {
            props: {
              tableKey: 'issue-table',
              menuItemRender: (item: { text: string; status: string }) => (
                <Badge text={item.text} status={item.status} showDot={false} />
              ),
            },
            op: {
              clickTableItem: (_data: ISSUE.Issue) => {
                onChosenIssue(_data);
              },
            },
          },
          issueImport: () => null,
          issueExport: () => null,
        }}
      />

      {chosenIssueType ? (
        <EditIssueDrawer
          iterationID={chosenIteration}
          id={chosenIssueId}
          issueType={chosenIssueType as ISSUE_TYPE}
          shareLink={`${location.href.split('?')[0]}?${mergeSearch(
            { id: chosenIssueId, iterationID: chosenIteration, tab, type: chosenIssueType },
            true,
          )}`}
          visible={drawerVisible}
          closeDrawer={onCloseDrawer}
        />
      ) : null}
    </div>
  );
};

export default IssueProtocol;
