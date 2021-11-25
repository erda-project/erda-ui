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

interface Task {}

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
  // const { data, operations, execOperation, props: pProps } = props;
  const [tasks, setTasks] = React.useState(initTasks());
  const handleTaskChange = (task) => {
    console.log('On date change Id:', task);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex((t) => t.id === task.project)];
      if (project.start.getTime() !== start.getTime() || project.end.getTime() !== end.getTime()) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map((t) => (t.id === task.project ? changedProject : t));
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm('Are you sure about ' + task.name + ' ?');
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };
  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log('On progress change Id:' + task.id);
  };
  const handleDblClick = (task: Task) => {
    alert('On Double Click event Id:' + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + ' has ' + (isSelected ? 'selected' : 'unselected'));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log('On expander click Id:' + task.id);
  };

  return (
    <Gantt
      tasks={tasks}
      onDateChange={handleTaskChange}
      onDelete={handleTaskDelete}
      onProgressChange={handleProgressChange}
      onDoubleClick={handleDblClick}
      onSelect={handleSelect}
      onExpanderClick={handleExpanderClick}
      ganttHeight={300}
    />
  );
};

export default CP_Gantt;

function initTasks() {
  const currentDate = new Date();
  const tasks = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: 'Some Project',
      id: 'ProjectSample',
      progress: 25,
      type: 'project',

      hideChildren: false,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2, 12, 28),
      name: 'Idea',
      id: 'Task 0',
      progress: 45,
      type: 'task',
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
      name: 'Research',
      id: 'Task 1',
      progress: 25,
      dependencies: ['Task 0'],
      type: 'task',
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
      name: 'Discussion with team',
      id: 'Task 2',
      progress: 10,
      dependencies: ['Task 1'],
      type: 'task',
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
      name: 'Developing',
      id: 'Task 3',
      progress: 2,
      dependencies: ['Task 2'],
      type: 'task',
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      name: 'Review',
      id: 'Task 4',
      type: 'task',
      progress: 70,
      dependencies: ['Task 2'],
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: 'Release',
      id: 'Task 6',
      progress: currentDate.getMonth(),
      type: 'milestone',
      dependencies: ['Task 4'],
      project: 'ProjectSample',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: 'Party Time',
      id: 'Task 9',
      progress: 0,
      isDisabled: true,
      type: 'task',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: '9',
      id: '9',
      progress: 0,
      type: 'project',
      hideChildren: false,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: '10',
      id: '10',
      progress: 0,
      type: 'project',
      hideChildren: false,
      project: '9',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: '10-1',
      id: '10-1',
      progress: 0,
      type: 'milestone',
      project: '10',
      hideChildren: false,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: '10-1-1',
      id: '10-1-1',
      progress: 0,
      isDisabled: true,
      type: 'task',
      project: '10',
    },
  ];
  return tasks;
}

function getStartEndDateForProject(tasks, projectId: string) {
  const projectTasks = tasks.filter((t) => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}
