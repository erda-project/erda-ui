import * as React from 'react';
import { useMount } from 'react-use';
import { Select } from 'antd';
import { ErdaIcon, ContractiveFilter } from 'common';
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

interface IProps {}

const TaskListHeader = (props: any) => {
  // console.log('------header', props);
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
  console.log('------', props);
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
const currentDate = new Date();

let key = 1;

const IssuePlan = (props: IProps) => {
  const tasks: any[] = [
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 10),
      name: 'Task 0',
      id: 'Task 0',
      type: 'project',
      progress: 65,
      // isDisabled: true,
      // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 1',
      id: 'Task 1',
      type: 'task',
      progress: 45,
      // dependencies: ['Task 0'],
      project: 'Task 0',
      // isDisabled: true,
      // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 2',
      id: 'Task 2',
      type: 'task',

      // dependencies: ['Task 0'],
      project: 'Task 0',
      progress: 45,

      // // isDisabled: true,
      // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 3',
      id: 'Task 3',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 4',
      id: 'Task 4',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 5',
      id: 'Task 5',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 6',
      id: 'Task 6',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 7',
      id: 'Task 7',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 8',
      id: 'Task 8',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Task 9',
      id: 'Task 9',
      type: 'task',
      progress: 45,
      // isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
  ];
  const [task, setTask] = React.useState(tasks);

  const keyRef = React.useRef(1);
  useMount(() => {
    setTimeout(() => {
      setTask([
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 15),
          name: 111,
          id: 'Task 0',
          type: 'project',
          progress: 65,
          // isDisabled: true,
          // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 1',
          id: 'Task 1',
          type: 'task',
          progress: 45,
          // dependencies: ['Task 0'],
          project: 'Task 0',
          // isDisabled: true,
          // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 2',
          id: 'Task 2',
          type: 'task',

          // dependencies: ['Task 0'],
          project: 'Task 0',
          progress: 45,

          // // isDisabled: true,
          // styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 3',
          id: 'Task 3',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 4',
          id: 'Task 4',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 5',
          id: 'Task 5',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 6',
          id: 'Task 6',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 7',
          id: 'Task 7',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 8',
          id: 'Task 8',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
        {
          start: new Date(2020, 1, 1),
          end: new Date(2020, 1, 2),
          name: 'Task 9',
          id: 'Task 9',
          type: 'task',
          progress: 45,
          // isDisabled: true,
          styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
        },
      ]);
    }, 3000);
  });

  const handleTaskChange = (t) => {
    console.log('------', t);
  };

  const conditionsFilter = [
    {
      type: 'select',
      key: 'clusterName',
      label: 'ss',
      haveFilter: true,
      fixed: true,
      options: [{ label: '222', value: '23' }],
    },
  ];

  return (
    <div>
      <ContractiveFilter
        delay={1000}
        conditions={conditionsFilter}
        onChange={(values) => {
          const curVal = {
            ...values,
            ownerIds: values.ownerIds || [],
            projectIds: values.projectIds || [],
          };
          update(curVal);
        }}
      />
      <Gantt
        tasks={task}
        ganttHeight={300}
        onDateChange={handleTaskChange}
        TaskListHeader={TaskListHeader}
        TaskListTable={(p) => <TaskListTable {...p} setTask={setTask} />}
      />
    </div>
  );
};

export default IssuePlan;
