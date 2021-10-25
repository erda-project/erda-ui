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
import { map, find, isEmpty, without, get } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { Card } from './card/card';
import { Input, Button, Popconfirm, Tooltip } from 'antd';
import { notify } from 'common/utils';
import { WithAuth } from 'user/common';
import { Delete as IconDelete, Plus as IconPlus } from '@icon-park/react';
import { useUserMap } from 'core/stores/userMap';
import projectLabelStore from 'project/stores/label';
import { ISSUE_TYPE, ISSUE_PRIORITY_MAP, ISSUE_ICON } from 'project/common/components/issue/issue-config';
import { useDrop } from 'react-dnd';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import classnames from 'classnames';
import './issue-kanban.scss';

interface IData {
  key: string;
  label: string;
  labelKey: string;
  total: number;
  pageNo: number;
  pageSize: number;
  list: any[];
  operations: Obj;
}

const issueScopeMap = {
  [ISSUE_TYPE.REQUIREMENT]: {
    titleIcon: ISSUE_ICON.issue.REQUIREMENT,
    titleIconMap: ISSUE_PRIORITY_MAP,
  },
  [ISSUE_TYPE.TASK]: {
    titleIcon: ISSUE_ICON.issue.TASK,
    titleIconMap: ISSUE_PRIORITY_MAP,
  },
  [ISSUE_TYPE.BUG]: {
    titleIcon: ISSUE_ICON.issue.BUG,
    titleIconMap: ISSUE_PRIORITY_MAP,
  },
  [ISSUE_TYPE.EPIC]: {
    titleIcon: ISSUE_ICON.issue.EPIC,
    titleIconMap: ISSUE_PRIORITY_MAP,
  },
};

export interface IProps extends CONFIG_PAGE.ICommonProps {
  data: { board: IData[]; refreshBoard?: boolean };
  props: {
    visible: boolean;
    isLoadMore: boolean;
  };
}
const noop = () => {};
const IssueKanban = (props: IProps) => {
  const { state, data, props: configProps, operations, execOperation = noop, updateState = noop } = props || {};

  const { visible = true, isLoadMore = false } = configProps || {};
  const [board, setBoard] = React.useState(data?.board || []);
  const [{ showAdd, addValue }, updater, update] = useUpdate({
    showAdd: false,
    addValue: '',
  });

  React.useEffect(() => {
    if (!isLoadMore || data?.refreshBoard) {
      setBoard(data?.board || []);
    } else {
      setBoard((prev) =>
        map(prev, (item) => {
          const curNewData = find(data?.board, (newItem) => newItem.labelKey === item.labelKey);
          return curNewData || item;
        }),
      );
    }
  }, [data, isLoadMore]);

  const hideAdd = () => {
    update({ addValue: '', showAdd: false });
  };
  const doAdd = () => {
    const existKanban = find(board || [], { label: addValue });
    if (existKanban) {
      notify('error', i18n.t('{name} already exists', { name: addValue }));
      return;
    }
    execOperation({ key: 'CreateCustom', ...(operations?.CreateCustom || {}) }, { panelName: addValue });
    hideAdd();
  };

  const labelList = map(board || [], 'label');
  if (!visible) return null;
  return (
    <div className="dice-cp issue-kanban">
      {map(board || [], (item) => {
        return item ? (
          <Kanban
            {...props}
            exitLabel={labelList}
            refreshBoard={data?.refreshBoard}
            data={item}
            key={item.key || item.label}
            isLoadMore={isLoadMore}
          />
        ) : null;
      })}
      {operations?.CreateCustom ? (
        <div className="issue-kanban-col add-item">
          {showAdd ? (
            <div className="mt-5">
              <Input
                value={addValue}
                className="mb-2"
                onChange={(e) => updater.addValue(e.target.value)}
                placeholder={i18n.t('project:input custom board name')}
                onPressEnter={doAdd}
              />
              <div className="flex justify-between items-center">
                <Button onClick={hideAdd} className="mr-2">
                  {i18n.t('cancel')}
                </Button>
                <Button onClick={doAdd} type="primary">
                  {i18n.t('ok')}
                </Button>
              </div>
            </div>
          ) : operations?.CreateCustom?.disabled ? (
            <Tooltip title={operations?.CreateCustom?.disabledTip}>
              <IconPlus className="cursor-pointer add-icon not-allowed" />
            </Tooltip>
          ) : (
            <IconPlus className="cursor-pointer add-icon" onClick={() => updater.showAdd(true)} />
          )}
        </div>
      ) : null}
      {isEmpty(data?.board || []) ? <EmptyHolder relative className="w-full" /> : null}
    </div>
  );
};

interface IKanbanProps extends CONFIG_PAGE.ICommonProps {
  data: IData;
  isLoadMore: boolean;
  exitLabel: string[];
  refreshBoard?: boolean;
}

const Kanban = (props: IKanbanProps) => {
  const { data, exitLabel, execOperation, isLoadMore, refreshBoard, ...rest } = props;
  const { label, labelKey, list: propsList, total, pageSize, pageNo, operations: boardOp } = data;
  const otherLabel = without(exitLabel, label);
  const userMap = useUserMap();
  const labelList = projectLabelStore.useStore((s) => s.list);
  const [list, setList] = React.useState(propsList || []);
  const [labelVal, setLabelVal] = React.useState(label);
  const [showShadow, setShowShadow] = React.useState(false);
  const cardType = 'kanban-info-card';

  useUpdateEffect(() => {
    if (isLoadMore && !refreshBoard) {
      propsList && setList((prev) => (pageNo > 1 ? prev.concat(propsList) : propsList));
    } else {
      setList(propsList || []);
    }
  }, [propsList, pageNo]);

  const changePageNoOp = boardOp?.changePageNo;
  const hasMore = isLoadMore && changePageNoOp && total > list.length;

  const [{ isOver, isAllowDrop }, drop] = useDrop({
    accept: cardType,
    drop: (item: any) => {
      // same state, do nothing
      const { drag } = item.data;
      if (!drag.targetKeys[labelKey]) {
        return;
      }
      execOperation(drag, { dropTarget: labelKey });
    },
    collect: (monitor) => {
      const item = monitor?.getItem && monitor?.getItem();
      const targetKeys = get(item, 'data.drag.targetKeys') || {};
      let _isAllowDrop = true;
      if (!isEmpty(targetKeys) && !targetKeys[labelKey]) {
        _isAllowDrop = false;
      }

      return {
        isOver: monitor.isOver(),
        isAllowDrop: _isAllowDrop,
      };
    },
  });

  const labelColorMap = {};
  labelList.forEach((l) => {
    labelColorMap[l.name] = l.color;
  });

  const changeData = (item: any) => {
    const { id, title, operations, issueButton, assignee, labels, type, priority, state } = item;
    const assigneeObj = userMap[assignee] || {};
    const { titleIcon } = issueScopeMap[type] || {};
    const curStateObj = find(issueButton, { stateID: state }) as any;
    return {
      ...item,
      _infoData: {
        id,
        title: `${title}`,
        titleIcon,
        // description: content,
        operations,
        extraInfo: (
          <div className="issue-kanban-info mt-2 flex justify-between items-center text-desc">
            <div className="flex justify-between items-center">
              {curStateObj ? (
                <div className="flex items-center mr-2">
                  {ISSUE_ICON.state[curStateObj.stateBelong]}
                  {curStateObj.stateName}
                </div>
              ) : null}
              {priority && ISSUE_PRIORITY_MAP[priority] ? ISSUE_PRIORITY_MAP[priority].iconLabel : null}
            </div>
            {assigneeObj ? <span>{assigneeObj.nick || assigneeObj.name}</span> : null}
          </div>
        ),
        type: label,
      },
    };
  };
  let cls = isOver ? 'drag-over' : '';
  cls = isAllowDrop ? cls : `drop-disable ${cls}`;
  const deleteBoardOp = boardOp?.DeleteCustom;
  const deleteAuth = deleteBoardOp?.disabled !== true;
  const updateBoardOp = boardOp?.UpdateCustom;
  const updateAuth = updateBoardOp?.disabled !== true;

  const doUpdate = () => {
    if (labelVal === label) return;
    if (!labelVal) {
      setLabelVal(label);
      return notify('error', i18n.t('can not be empty'));
    }
    if (otherLabel.includes(labelVal)) {
      setLabelVal(label);
      return notify('error', i18n.t('{name} already exists', { name: labelVal }));
    }
    execOperation(
      { key: 'UpdateCustom', ...(boardOp?.UpdateCustom || {}) },
      { panelName: labelVal, panelID: labelKey },
    );
  };

  const handleScroll = (e: any) => {
    setShowShadow(e.target.scrollTop !== 0);
  };

  const loadMore = () => {
    execOperation(changePageNoOp as CP_COMMON.Operation, { pageNo: pageNo + 1, pageSize });
  };

  return (
    <div
      className={classnames(`issue-kanban-col ${cls}`, { 'issue-kanban-col-special-pdd': updateBoardOp })}
      ref={drop}
    >
      <div
        className={`flex justify-between items-center issue-kanban-col-header ${showShadow ? 'shadow' : ''} ${
          updateBoardOp ? 'inp' : ''
        }`}
      >
        <div className="text-base font-medium flex-1 flex justify-between items-center">
          {updateBoardOp ? (
            updateAuth ? (
              <Input
                className="text-base font-medium issue-kanban-label-input"
                value={labelVal}
                onChange={(e: any) => setLabelVal(e.target.value)}
                onPressEnter={doUpdate}
                onBlur={doUpdate}
              />
            ) : (
              <Tooltip title={updateBoardOp?.disabledTip || i18n.t('common:no permission to operate')}>
                <Input
                  className="text-base font-medium issue-kanban-label-input update-disabled"
                  readOnly
                  value={labelVal}
                />
              </Tooltip>
            )
          ) : (
            label
          )}
          <span className="text-desc ml-3 text-sm">{total}</span>
        </div>
        {deleteBoardOp ? (
          deleteBoardOp?.confirm ? (
            <WithAuth pass={deleteAuth} noAuthTip={deleteBoardOp?.disabledTip}>
              <Popconfirm
                title={deleteBoardOp?.confirm}
                onConfirm={() =>
                  execOperation({ key: 'DeleteCustom', ...boardOp?.DeleteCustom }, { panelID: labelKey })
                }
              >
                <IconDelete className="ml-3 cursor-pointer" />
              </Popconfirm>
            </WithAuth>
          ) : (
            <WithAuth pass={deleteAuth} noAuthTip={deleteBoardOp?.disabledTip}>
              <IconDelete
                className="ml-3 cursor-pointer"
                onClick={() => execOperation({ key: 'DeleteCustom', ...boardOp?.DeleteCustom }, { panelID: labelKey })}
              />
            </WithAuth>
          )
        ) : null}
      </div>
      <div className="issue-kanban-col-content" onScroll={handleScroll}>
        {map(list, (item) => {
          return (
            <Card
              key={item.id}
              execOperation={execOperation}
              props={{ cardType, className: 'list-item', data: changeData(item) }}
              customProps={rest.customProps}
            />
          );
        })}
        {hasMore ? (
          <div className="hover-active py-1 text-center load-more" onClick={() => loadMore()}>
            {i18n.t('load more')}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IssueKanban;
