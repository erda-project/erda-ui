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
import { Gantt } from './components/gantt/gantt';
import { convertDataForGantt } from './utils';
import { ErdaIcon, EmptyHolder } from 'common';
import { groupBy, findIndex } from 'lodash';
import moment from 'moment';
import './gantt.scss';

const getTreeLine = (task: CP_GANTT.IGanttData, tasksGroup: Obj<CP_GANTT.IGanttData[]>, rowHeight = 38) => {
  const { level, id, project } = task;
  const indentWidth = 16;
  const indentHeight = rowHeight;

  const curGroup = project && tasksGroup[project] ? tasksGroup[project] : [];
  let isLast = false;
  if (curGroup?.length && findIndex(curGroup, (item) => item.id === id) === curGroup.length - 1) {
    isLast = true;
  }

  const LineComp: React.ReactNode[] = new Array(level > 1 ? level - 1 : 0)
    .fill('')
    .map((_, idx) => (
      <div key={`${idx}`} className="erda-tree-indent-full" style={{ width: indentWidth, height: indentHeight }} />
    ));
  if (LineComp.length)
    LineComp.unshift(<div key={`${id}-holder`} style={{ width: indentWidth / 2 }} className="h-full" />);
  if (level !== 0) {
    const indentMargin = LineComp.length ? 0 : indentWidth / 2;
    LineComp.push(
      <div key={`${id}-left`} className="h-full" style={{ width: indentWidth }}>
        <div
          className={`erda-tree-indent-left ${isLast ? 'last-item' : ''}`}
          style={{
            width: indentWidth / 2,
            height: indentHeight / 2,
            marginLeft: indentMargin,
          }}
        />
        {!isLast ? (
          <div
            className="erda-tree-indent-left-bottom"
            style={{ width: 1, height: indentHeight / 2, marginLeft: indentMargin }}
          />
        ) : null}
      </div>,
    );
  }

  if (tasksGroup[id]) {
    // has children
    LineComp.push(
      <div
        key={`${id}-right`}
        style={{ height: indentHeight / 4, width: 1, right: -9, bottom: 0 }}
        className="absolute erda-tree-indent-right"
      />,
    );
  }

  if (LineComp.length) {
    return <div className="flex erda-tree-indent relative h-full">{LineComp}</div>;
  }
  return null;
};

interface ITaskTreeProps {
  tasks: CP_GANTT.IGanttData[];
  rowHeight: number;
  rowWidth: number;
  onExpanderClick: (task: CP_GANTT.IGanttData) => void;
  TreeNodeRender?: React.FC<{ node: CP_GANTT.IGanttData; nodeList: CP_GANTT.IGanttData[] }>;
}

const TaskTree = (props: ITaskTreeProps) => {
  const { tasks, rowHeight, rowWidth, onExpanderClick, TreeNodeRender } = props;
  const tasksGroup = groupBy(tasks || [], 'project');
  return (
    <div style={{ width: rowWidth }} className="erda-tree">
      {tasks.map((item) => {
        const { extra, isLeaf, level, name } = item;
        const LineComp = getTreeLine(item, tasksGroup);
        return (
          <div
            style={{ height: rowHeight }}
            key={item.id}
            className={`relative flex items-center justify-center cursor-pointer hover:bg-hover-gray-bg pr-2 hover-active erda-tree-level${level}`}
            onClick={() => !isLeaf && onExpanderClick(item)}
          >
            {LineComp}
            {!isLeaf ? <ErdaIcon type="caret-down" size={'16px'} /> : null}
            {TreeNodeRender ? (
              <div className="flex-1 w-0">
                <TreeNodeRender node={item} nodeList={tasks} />
              </div>
            ) : (
              <div>{name}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const oneDaySec = 1000 * 60 * 60 * 24;
const CP_Gantt = (props: CP_GANTT.Props) => {
  const { data, operations, execOperation, props: pProps } = props;
  const { BarContentRender, TreeNodeRender, TaskListHeader, listCellWidth = '320px' } = pProps;

  const [list, setList] = React.useState<CP_GANTT.IGanttData[]>([]);

  React.useEffect(() => {
    setList((prevList) => convertDataForGantt(data, prevList));
  }, [data]);

  const handleTaskChange = (t: any) => {
    setList((prevList) => {
      return prevList.map((item) => {
        if (item.id === t.id) {
          const { start, end } = t;
          const reStart =
            moment(start).startOf('dates').valueOf() + oneDaySec / 2 > moment(start).valueOf()
              ? moment(start).startOf('dates')
              : moment(start).endOf('dates').valueOf() + 1;

          let reEnd =
            moment(end).startOf('dates').valueOf() + oneDaySec / 2 > moment(end).valueOf()
              ? moment(end).startOf('dates').valueOf() - 1
              : moment(end).endOf('dates');
          moment(reStart).valueOf() >= moment(reEnd).valueOf() && (reEnd = moment(reEnd).valueOf() + oneDaySec);
          return {
            ...t,
            start: new Date(reStart),
            end: new Date(reEnd),
          };
        }
        return item;
      });
    });
  };
  const handleExpanderClick = (_task: CP_GANTT.IGanttData) => {
    setList((prev) => prev.map((item) => (item.id === _task.id ? _task : item)));
  };

  return list.length ? (
    <Gantt
      tasks={list}
      rowHeight={40}
      barFill={50}
      ganttHeight={500}
      onDateChange={handleTaskChange}
      BarContentRender={BarContentRender}
      onExpanderClick={handleExpanderClick}
      TaskListHeader={TaskListHeader}
      listCellWidth={listCellWidth}
      TaskListTable={(p) => <TaskTree {...p} TreeNodeRender={TreeNodeRender} />}
    />
  ) : (
    <EmptyHolder relative />
  );
};

export default CP_Gantt;
