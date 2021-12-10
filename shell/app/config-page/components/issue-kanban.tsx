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
import { Card } from './kanban-card/card';
import { Input, Button, Popconfirm, Tooltip, Avatar } from 'antd';
import { EmptyHolder, Badge, ErdaIcon } from 'common';
import { getAvatarChars } from 'app/common/utils';
import { notify, ossImg } from 'common/utils';
import { WithAuth } from 'user/common';
import { useUserMap } from 'core/stores/userMap';
import projectLabelStore from 'project/stores/label';
import { ISSUE_TYPE, ISSUE_PRIORITY_MAP, ISSUE_ICON } from 'project/common/components/issue/issue-config';
import { useDrop } from 'react-dnd';
import { useUpdateEffect } from 'react-use';
import i18n from 'i18n';
import classnames from 'classnames';
import createScrollingComponent from 'common/utils/create-scroll-component';
import Tags from 'common/components/tags';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import produce from 'immer';
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

interface CardData {
  assignee: string;
  id: number;
  planFinishedAt: string;
  iterationID: number;
  priority: string;
  status: {
    status: string;
    value: string;
  };
  title: string;
  type: string;
}

export interface IProps extends CONFIG_PAGE.ICommonProps {
  data: { board: IData[]; refreshBoard?: boolean };
  props: {
    visible: boolean;
    isLoadMore: boolean;
  };
}
const noop = () => {};
const ScrollingComponent = createScrollingComponent('div');
const IssueKanban = (props: IProps) => {
  const { state, data, props: configProps, operations, execOperation = noop, updateState = noop } = props || {};
  const [isDrag, setIsDrag] = React.useState(false);
  const [currentCard, setCurrentCard] = React.useState(null);
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
    <ScrollingComponent className="dice-cp issue-kanban">
      {map(board || [], (item) => {
        return item ? (
          <Kanban
            {...props}
            setBoard={setBoard}
            exitLabel={labelList}
            refreshBoard={data?.refreshBoard}
            data={item}
            key={item.key || item.label}
            isLoadMore={isLoadMore}
            setIsDrag={setIsDrag}
            isDrag={isDrag}
            setCurrentCard={setCurrentCard}
            currentCard={currentCard}
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
                placeholder={i18n.t('dop:input custom board name')}
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
              <ErdaIcon type="plus" className="cursor-pointer add-icon not-allowed" />
            </Tooltip>
          ) : (
            <ErdaIcon type="plus" className="cursor-pointer add-icon" onClick={() => updater.showAdd(true)} />
          )}
        </div>
      ) : null}
      {isEmpty(data?.board || []) ? <EmptyHolder relative className="w-full" /> : null}
    </ScrollingComponent>
  );
};

interface IKanbanProps extends CONFIG_PAGE.ICommonProps {
  data: IData;
  isLoadMore: boolean;
  setBoard: Function;
  isDrag: boolean;
  setIsDrag: (isDrag: boolean) => void;
  currentCard: CardData | null;
  setCurrentCard: (value: CardData | null) => void;
  exitLabel: string[];
  refreshBoard?: boolean;
}

const Kanban = (props: IKanbanProps) => {
  const {
    data,
    exitLabel,
    execOperation,
    isLoadMore,
    refreshBoard,
    setBoard,
    setIsDrag,
    isDrag,
    setCurrentCard,
    currentCard,
    ...rest
  } = props;
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
      const { drag } = item.data.operations;
      if (!drag.targetKeys[labelKey]) {
        setCurrentCard(null);
        return;
      }
      setCurrentCard(item.data);
      const dragColKey = item.data._infoData.labelKey;
      const dropColKey = labelKey;
      const newTargetKeys = { ...drag.targetKeys };
      if (!newTargetKeys[dragColKey]) {
        newTargetKeys[dragColKey] = true;
      }
      delete newTargetKeys[dropColKey];
      const newItem = produce(item, (draft: { data: IData }) => {
        draft.data.operations.drag.targetKeys = newTargetKeys;
      });
      setBoard((prev: IData[]) => {
        return prev.map((col) => {
          if (col.labelKey === dropColKey) {
            return {
              ...col,
              list: col.list ? [newItem.data, ...col.list] : [newItem.data],
              total: col.total + 1,
            };
          } else if (col.labelKey === dragColKey) {
            return {
              ...col,
              list: col.list?.filter((a) => a.id !== item.data.id),
              total: Math.max(col.total - 1, 0),
            };
          }
          return col;
        });
      });
      execOperation({ ...drag, key: 'drag' }, { dropTarget: labelKey });
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
    const { id, title, operations, assignee, type, priority } = item;
    const assigneeObj = userMap[assignee] || {};
    return {
      ...item,
      _infoData: {
        id,
        title: `${title}`,
        labelKey,
        // description: content,
        operations,
        extraInfo: (
          <div className="issue-kanban-info mt-1 flex flex-col text-desc">
            <div className="flex justify-between items-center mt-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center mr-2">
                  <IssueIcon type={type} size="16px" />
                </span>
                <span className="w-20 mr-1">
                  {priority && (
                    <span className="flex items-center">
                      <IssueIcon type={priority} iconMap="PRIORITY" size="16px" />
                      <span className="ml-1 text-default">{ISSUE_PRIORITY_MAP[priority].label}</span>
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
        ),
        type: label,
      },
    };
  };

  let cls = isOver ? 'drag-over' : '';
  cls = isAllowDrop ? cls : `drop-disable ${cls}`;
  cls = isDrag && !isOver ? `not-drag ${cls}` : cls;
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
        <div className="text-base font-medium text-default-8 flex-1 flex items-center ">
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
          <div className="text-default-8 ml-1 text-sm px-2.5 rounded-lg bg-default-06">{total}</div>
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
                <ErdaIcon type="delete1" className="ml-3 cursor-pointer" />
              </Popconfirm>
            </WithAuth>
          ) : (
            <WithAuth pass={deleteAuth} noAuthTip={deleteBoardOp?.disabledTip}>
              <ErdaIcon
                type="delete1"
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
              props={{
                cardType,
                className: `${isDrag ? 'hidden' : ''} list-item ${currentCard?.id === item.id ? 'dragged-card' : ''}`,
                data: changeData(item),
                setIsDrag,
              }}
              customOp={rest.customOp}
            />
          );
        })}
        {hasMore && !isDrag ? (
          <div className="hover-active py-1 text-center load-more" onClick={() => loadMore()}>
            {i18n.t('load more')}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IssueKanban;
