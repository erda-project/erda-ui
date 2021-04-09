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

import { EmptyListHolder, Icon } from 'common';
import { useMount } from 'react-use';
import { isEmpty, map } from 'lodash';
import { Affix } from 'nusi';
import * as React from 'react';
import './affix-collapse.scss';


interface Group {
  key: string
  list: any[]
}

interface IProps {
  data: Group[],
  children: JSX.Element[],
  defaultActiveKeys?: string[],
  headerRender(groupKey: string, expand: boolean): void,
  itemRender(item: any, groupKey: string): void
}
export const AffixCollapse = ({ data, children, defaultActiveKeys, headerRender, itemRender }: IProps) => {
  const contentRef = React.useRef(null);
  const [expandMap, setExpandMap] = React.useState({});

  useMount(() => {
    const temp = {};
    map(defaultActiveKeys, k => {
      temp[k] = true;
    });
    setExpandMap(temp);
  });

  const handleClickHeader = (group: any) => {
    setExpandMap((prev: Obj) => ({ ...prev, [group.key]: !prev[group.key] }));
  };

  return (
    <div className='affix-collapse column-flex-box flex-start'>
      {children}
      <div className="content" ref={contentRef}>
        {
          map(data, (group, i) => {
            const expand = expandMap[group.key];
            return (
              <React.Fragment key={group.key}>
                <Affix offsetTop={42 * Number(i)} offsetBottom={Number(i) === data.length - 1 ? 0 : undefined} target={() => contentRef.current}>
                  <div className='group-header flex-box' onClick={() => handleClickHeader(group)}>
                    <Icon type={`chevronright expand-icon ${expand ? 'rotate' : ''}`} />
                    {headerRender(group.key, expand)}
                  </div>
                </Affix>
                <div className={expand ? '' : 'collapse'}>
                  {!isEmpty(group.list)
                    ? map(group.list, item => itemRender(item, group.key))
                    : <EmptyListHolder />
                  }
                </div>
              </React.Fragment>
            );
          })
        }
      </div>
    </div>
  );
};
