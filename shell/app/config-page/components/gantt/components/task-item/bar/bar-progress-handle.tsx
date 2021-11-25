import React from 'react';
import './bar.scss';

type BarProgressHandleProps = {
  progressPoint: string;
  onMouseDown: (event: React.MouseEvent<SVGPolygonElement, MouseEvent>) => void;
};
export const BarProgressHandle: React.FC<BarProgressHandleProps> = ({ progressPoint, onMouseDown }) => {
  return <polygon className={'erda-gantt-bar-handle'} points={progressPoint} onMouseDown={onMouseDown} />;
};
