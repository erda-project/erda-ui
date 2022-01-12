import * as React from 'react';
import { map } from 'lodash';
import './index.scss';

interface IProps {
  tabs: Array<{ key: string; text: string }>;
  onSelect: (key: string) => void;
  value: string;
  className?: string;
  theme?: 'light' | 'dark';
}

const SimpleTabs = (props: IProps) => {
  const { tabs, onSelect, value, className = '', theme = 'light' } = props;
  return (
    <div className={`common-simple-tabs flex-h-center ${className} theme-${theme}`}>
      {map(tabs, (item) => {
        return (
          <div
            key={item.key}
            className={`mr-6 common-simple-tabs-item cursor-pointer ${value === item.key ? 'selected' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

export default SimpleTabs;
