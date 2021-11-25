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
import { Select } from 'antd';
import { ErdaIcon } from 'common';
import { Gantt } from './components/gantt/gantt';

const TaskListHeader = (props: any) => {
  const { headerHeight } = props;
  const [value, setValue] = React.useState('issue');
  return (
    <div style={{ height: headerHeight }}>
      <Select value={value} onChange={(v) => setValue(v)}>
        <Select.Option value="issue">按需求显示</Select.Option>
        <Select.Option value="user">按人员显示</Select.Option>
      </Select>
    </div>
  );
};

const TaskListTable = (props: any) => {
  const { tasks, rowHeight, setTask } = props;
  return (
    <div>
      {tasks.map((item, idx) => {
        return (
          <div style={{ height: rowHeight }} key={item.id} className="flex items-center justify-center">
            {idx === 0 ? <ErdaIcon type="chevron-down" onClick={setTask} /> : null}
            {item.name}
          </div>
        );
      })}
    </div>
  );
};

const oneDaySec = 1000 * 60 * 60 * 24;
const CP_Gantt = (props: CP_GANTT.Props) => {
  const { data, operations, execOperation, props: pProps } = props;

  const [list, setList] = React.useState<CP_GANTT.IData[]>(data?.list || []);

  const handleTaskChange = (t: any) => {
    setList((prevList) => {
      return prevList.map((item) => {
        if (item.id === t.id) {
          const { start, end } = t;
          const timeDistance = Math.abs(end - start);

          const reEnd =
            timeDistance < oneDaySec ? new Date(start.getTime() + oneDaySec - 1) : new Date(end.getTime() - 1);
          console.log('------', start, reEnd);
          return {
            ...t,
            start,
            end: reEnd,
          };
        }
        return item;
      });
    });
  };

  return (
    <Gantt
      tasks={list}
      rowHeight={38}
      barFill={50}
      timeStep={oneDaySec}
      ganttHeight={300}
      barBackgroundColor={'#424CA6'}
      // arrowIndent={10}
      onDateChange={handleTaskChange}
      todayColor={'red'}
      TaskListHeader={TaskListHeader}
      TaskGanttContentRender={TaskGanttContent}
      TaskListTable={(p) => <TaskListTable {...p} setList={setList} />}
    />
  );
};

const TaskGanttContent = (props: any) => {
  const { task } = props;
  console.log('------', task);
  return (
    <div className="flex justify-center items-center" style={{ lineHeight: '20px', fontSize: 12, color: '#fff' }}>
      {task.name}
    </div>
  );
};

export default CP_Gantt;
