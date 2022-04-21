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
import DiceConfigPage, { useMock } from 'app/config-page';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import { getAvatarChars, mergeSearch } from 'common/utils';
import { Badge, Ellipsis } from 'common';
import { useUserMap } from 'core/stores/userMap';
import ImportExport from '../import-export';
import { useUpdate, useSwitch } from 'common/use-hooks';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import routeInfoStore from 'core/stores/route';
import { Avatar } from 'antd';
import { usePerm } from 'app/user/common';
import moment from 'moment';
import { max } from 'lodash';
import i18n from 'i18n';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import { useMount } from 'react-use';
import './index.scss';

interface IBarProps {
  task: CP_GANTT.IGanttData;
  isHover?: boolean;
}
const BarContentRender = (props: IBarProps) => {
  const { task, isHover } = props;
  const barRef = React.useRef<HTMLDivElement>(null);
  const nameRef = React.useRef<HTMLDivElement>(null);
  const [linearPercent, setLinearPercent] = React.useState(100);

  const barWidth = barRef.current?.offsetWidth || 40;
  const nameWidth = nameRef.current?.offsetWidth || 40;
  React.useLayoutEffect(() => {
    setLinearPercent(((barWidth - 8) / nameWidth) * 100);
  }, [barWidth, nameWidth]);

  return (
    <div className={'relative h-full'} ref={barRef}>
      <div className={`flex items-center h-full w-full`}>
        <div style={{ flex: `0 0 ${max([barWidth, nameWidth])}px` }} className={` ml-2 `}>
          <span
            ref={nameRef}
            className="text-xs whitespace-nowrap"
            style={{
              padding: '14px 0',
              WebkitMaskImage: `linear-gradient(90deg, rgba(48,38,71,0.80) ${linearPercent}%, rgba(48,38,71,0.32) ${linearPercent}%)`,
            }}
          >
            {task.name}
          </span>
        </div>
        <div className={` ml-1 whitespace-nowrap text-sub text-xs ${isHover ? 'visible' : 'invisible'}`}>
          {moment(task.start).format('MM-DD')} ~ {moment(task.end).format('MM-DD')}
        </div>
      </div>
    </div>
  );
};

const TaskListHeader = (props: { headerHeight: number; rowWidth: number }) => {
  const { headerHeight, rowWidth } = props;
  // const [value, setValue] = React.useState('issue');
  return (
    <div
      className="erda-task-list-header"
      style={{ height: headerHeight, width: rowWidth, lineHeight: `${headerHeight}px` }}
    >
      {/* remove the demand selector temporarily, and keep the demand tree height */}
      {/* <Select
        className="erda-task-list-header-selector"
        dropdownClassName="py-0"
        suffixIcon={<ErdaIcon size={16} color="currentColor" type="caret-down" />}
        value={value}
        onChange={(v) => setValue(v)}
      >
        <Select.Option value="issue">{i18n.t('dop:display on demand')}</Select.Option>
      </Select> */}
    </div>
  );
};

interface ITreeNodeProps {
  node: CP_GANTT.IGanttData;
  clickNode?: (params: Obj) => void;
}

const TreeNodeRender = (props: ITreeNodeProps) => {
  const { node, clickNode } = props;
  const { extra, name } = node;
  const { status, type, user } = extra || {};
  const userMap = useUserMap();
  const curUser = userMap[user];
  const curUserName = curUser ? curUser.nick || curUser.name : user;

  return (
    <div
      className="flex items-center h-full"
      onClick={(e) => {
        e.stopPropagation();
        clickNode?.(node);
      }}
    >
      {<IssueIcon type={type} size={'16px'} />}
      <div className="truncate flex-1 ml-1">
        <Ellipsis title={name} />
      </div>
      <div className="flex items-center ml-2">
        <Avatar src={curUser?.avatar || undefined} size={20}>
          {getAvatarChars(curUserName || '')}
        </Avatar>
        {status ? (
          <div className="ml-1">
            <Badge showDot={false} text={status.text} status={status?.status || 'default'} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const IssuePlan = () => {
  const [{ projectId, iterationId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const { id: queryId, pId: queryParentId, iterationID: queryIterationID, type: _queryType } = query;
  const queryType = _queryType && _queryType.toUpperCase();
  const [drawerVisible, openDrawer, closeDrawer] = useSwitch(false);
  const [
    { filterObj, chosenIssueType, chosenIteration, chosenIssueId, chosenParentId, isFullScreen },
    updater,
    update,
  ] = useUpdate({
    filterObj: {},
    chosenParentId: queryParentId ? Number(queryParentId) : 0,
    chosenIssueId: queryId,
    chosenIteration: queryIterationID || 0,
    chosenIssueType: queryType as undefined | ISSUE_TYPE,
    isFullScreen: false,
  });
  const ganttRef = React.useRef<HTMLDivElement>(null);
  const positionToTodayKey = React.useRef(1);

  const onChosenIssue = (val: Obj) => {
    const { id, extra, pId } = val || {};
    if (id && extra?.iterationID && extra?.type) {
      update({
        chosenParentId: pId,
        chosenIssueId: val.id,
        chosenIteration: extra.iterationID,
        chosenIssueType: extra.type.toUpperCase() as ISSUE_TYPE,
      });
      openDrawer();
    }
  };

  const reloadRef = React.useRef<{ reload: () => void; getPageConfig: () => void }>(null);

  useMount(() => {
    queryId ? openDrawer() : closeDrawer();
  });

  React.useEffect(() => {
    const buttonEle = document.getElementsByClassName('top-button-group');
    if (buttonEle.length > 0) {
      buttonEle[0].style.display = isFullScreen ? 'none' : 'flex';
    }
  }, [isFullScreen]);

  const inParams = { projectId, fixedIteration: iterationId };

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

  const reloadData = (_inParams: Obj = {}) => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload({ inParams: _inParams });
    }
  };

  const onCloseDrawer = ({ hasEdited, isCreate, isDelete }: CloseDrawerParam) => {
    closeDrawer();
    if (hasEdited || isCreate || isDelete) {
      // 有变更再刷新列表
      let reInParams: number[] = [];
      // if create or delete or update task, reload root
      if ((chosenParentId === 0 && (isDelete || isCreate)) || chosenParentId !== 0) {
        reInParams = [chosenParentId];
      } else {
        reInParams = [chosenParentId, +chosenIssueId];
      }
      reloadData({ parentId: reInParams });
    }
    update({
      chosenParentId: 0,
      chosenIssueId: 0,
      chosenIteration: 0,
      chosenIssueType: undefined,
    });
  };

  const handleScreenChange = (value: boolean) => {
    updater.isFullScreen(value);
  };

  const operationCallBack = (config: CONFIG_PAGE.RenderConfig) => {
    const curEvent = config.event;
    if (curEvent?.component === 'filter' && curEvent?.operation === 'filter') {
      positionToTodayKey.current += 1;
    }
  };
  const issuePerm = usePerm((s) => s.project.requirement);
  const TopHeadWrapper = React.useCallback(
    ({ children }: { children: React.ReactElement }) => {
      const tabs = [
        {
          key: 'export',
          text: i18n.t('Export'),
          disabled: !issuePerm.export.pass,
          tip: issuePerm.export.pass ? '' : i18n.t('common:No permission to operate'),
        },

        {
          key: 'record',
          text: i18n.t('Records'),
          disabled: false,
        },
      ];
      const pageData = reloadRef.current?.getPageConfig();
      const useableFilterObj = pageData?.protocol?.components.gantt.state?.values || {};
      return (
        <div>
          <ImportExport tabs={tabs} queryObj={useableFilterObj} issueType={'ALL'} projectId={projectId} />
          {children}
        </div>
      );
    },
    [issuePerm, projectId],
  );

  const FilterWrapper = React.useCallback(({ children }: { children: React.ReactElement }) => {
    return <div className="p-2 bg-default-02">{children}</div>;
  }, []);

  return (
    <div className={`h-full bg-white ${isFullScreen ? 'gantt-fullscreen' : ''}`} ref={ganttRef}>
      <DiceConfigPage
        ref={reloadRef}
        forceUpdateKey={['customProps']}
        scenarioType={'issue-gantt'}
        scenarioKey={'issue-gantt'}
        inParams={inParams}
        operationCallBack={operationCallBack}
        customProps={{
          topHead: {
            props: {
              isTopHead: true,
            },
          },
          ganttContainer: {
            props: { flexHeight: true, className: 'gantt mt-0' },
          },
          page: {
            props: { fullHeight: true, overflowHidden: true },
          },
          gantt: {
            props: {
              BarContentRender,
              TaskListHeader,
              TreeNodeRender: (p) => <TreeNodeRender {...p} clickNode={onChosenIssue} />,
              onScreenChange: handleScreenChange,
              rootWrapper: ganttRef,
              positionToTodayKey: positionToTodayKey.current,
            },
          },
          issueAddButton: {
            props: {
              disabled: false,
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
                  text: i18n.t('Requirement'),
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
                  text: i18n.t('Task'),
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
                  text: i18n.t('Bug'),
                },
              ],
              dropdownProps: {
                placement: 'bottomRight',
              },
              operations: {
                click: {
                  key: '',
                  reload: false,
                },
              },
              suffixIcon: 'di',
              text: i18n.t('Add'),
              type: 'primary',
            },
            op: {
              // 添加：打开滑窗
              click: onCreate,
            },
            Wrapper: TopHeadWrapper,
          },
          filter: {
            op: {
              onFilterChange: (val: Obj) => {
                updater.filterObj(val);
              },
            },
            Wrapper: FilterWrapper,
          },
        }}
      />

      {chosenIssueType ? (
        <EditIssueDrawer
          mountContainer={ganttRef.current}
          iterationID={chosenIteration}
          issueType={chosenIssueType as ISSUE_TYPE}
          visible={drawerVisible}
          closeDrawer={onCloseDrawer}
          id={chosenIssueId}
          shareLink={`${location.href.split('?')[0]}?${mergeSearch(
            { id: chosenIssueId, pId: chosenParentId, iterationID: chosenIteration, type: chosenIssueType },
            true,
          )}`}
        />
      ) : null}
    </div>
  );
};

export default IssuePlan;
