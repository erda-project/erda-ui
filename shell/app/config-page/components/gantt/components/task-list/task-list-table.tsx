import React, { useMemo } from 'react';
import { Task } from '../../types/public-types';
import './task-list-table.scss';

const localeDateStringCache = {};
const toLocaleDateStringFactory = (locale: string) => (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
  const key = date.toString();
  let lds = localeDateStringCache[key];
  if (!lds) {
    lds = date.toLocaleDateString(locale, dateTimeOptions);
    localeDateStringCache[key] = lds;
  }
  return lds;
};
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
}> = ({ rowHeight, rowWidth, tasks, fontFamily, fontSize, locale, onExpanderClick }) => {
  const toLocaleDateString = useMemo(() => toLocaleDateStringFactory(locale), [locale]);

  return (
    <div
      className={'erda-gantt-task-list-wrapper'}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = '';
        if (t.hideChildren === false) {
          expanderSymbol = '▼';
        } else if (t.hideChildren === true) {
          expanderSymbol = '▶';
        }

        return (
          <div className={'erda-gantt-task-list-table-row'} style={{ height: rowHeight }} key={`${t.id}row`}>
            <div
              className={'erda-gantt-task-list-cell'}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={t.name}
            >
              <div className={'erda-gantt-task-list-name-wrapper'}>
                <div
                  className={expanderSymbol ? 'erda-gantt-task-list-expander' : 'erda-gantt-task-list-empty-expander'}
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div>{t.name}</div>
              </div>
            </div>
            <div
              className={'erda-gantt-task-list-cell'}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.start, dateTimeOptions)}
            </div>
            <div
              className={'erda-gantt-task-list-cell'}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.end, dateTimeOptions)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
