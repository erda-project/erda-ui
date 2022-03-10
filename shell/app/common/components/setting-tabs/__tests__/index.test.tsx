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
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import routeInfoStore from 'core/stores/route';
import * as utils from 'common/utils/query-string';
import SettingTabs from '..';

describe('SettingTabs', () => {
  const routerData = {
    query: {
      tabKey: 'appMember',
    },
  };
  beforeAll(() => {
    jest.mock('core/stores/route');
    routeInfoStore.useStore = (fn: Function) => {
      return fn(routerData);
    };
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('render with tabGroup', () => {
    jest.useFakeTimers();
    routeInfoStore.useStore = (fn: Function) => {
      return fn(routerData);
    };
    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const spy = jest.spyOn(utils, 'updateSearch').mockImplementation();
    const dataSource = [
      {
        groupTitle: 'common Menu',
        groupKey: 'common',
        tabGroup: [
          {
            tabTitle: 'application information',
            tabKey: 'appInfo',
            content: <div className="application-information" />,
          },
          {
            tabTitle: 'application member',
            tabKey: 'appMember',
            content: <div className="application-member" />,
          },
        ],
      },
    ];
    const result = render(<SettingTabs dataSource={dataSource} className={'class-name'} />);
    jest.runAllTimers();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(screen.getByText('application member').closest('li')).toHaveClass('active');
    expect(result.container).isExit('.group-title', 1);
    expect(result.container).isExit('.tab-title', dataSource[0].tabGroup.length);
    fireEvent.click(result.getByText(dataSource[0].tabGroup[1].tabTitle));
    expect(spy).toHaveBeenCalledWith({ tabKey: dataSource[0].tabGroup[1].tabKey });
  });
  it('render without tabGroup', () => {
    const dataSource = [
      {
        tabTitle: 'application information',
        tabKey: 'appInfo',
        content: <div className="application-information" />,
      },
      {
        tabTitle: 'application member',
        tabKey: 'appMember',
        content: <div className="application-member" />,
      },
    ];
    routeInfoStore.useStore = (fn: Function) => {
      return fn({ query: {} });
    };
    const result = render(<SettingTabs dataSource={dataSource} />);
    expect(result.container).isExit('.tab-title', dataSource.length);
    expect(result.container).isExit('.application-information', 1);
    expect(screen.getByText('application information').closest('li')).toHaveClass('active');
  });
});
