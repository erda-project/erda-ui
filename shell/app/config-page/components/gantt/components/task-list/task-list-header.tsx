import React from 'react';
import './task-list-header.scss';

export const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
  return (
    <div
      className={'erda-gantt-table'}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={'erda-gantt-table-header'}
        style={{
          height: headerHeight - 2,
        }}
      >
        <div
          className={'erda-gantt-table-header-item'}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;Name
        </div>
        <div
          className={'erda-gantt-table-header-separator'}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2,
          }}
        />
        <div
          className={'erda-gantt-table-header-item'}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;From
        </div>
        <div
          className={'erda-gantt-table-header-separator'}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25,
          }}
        />
        <div
          className={'erda-gantt-table-header-item'}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;To
        </div>
      </div>
    </div>
  );
};
