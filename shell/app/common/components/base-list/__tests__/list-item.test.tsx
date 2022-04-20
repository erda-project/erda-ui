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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import * as imgUtil from 'app/config-page/img-map';
import userStore, { IUserInfo } from 'core/stores/userMap';
import { iconMap } from '../../erda-icon';

import ListItem from '../list-item';

describe('ListItem', () => {
  const imgMap = {
    frontImg_default_app_icon: 'frontImg_default_app_icon',
    frontImg_default_project_icon: 'frontImg_default_project_icon',
  };
  const customImg = 'customImg url';
  const userMap: Record<string, Partial<IUserInfo>> = {
    user_1: {
      name: 'user_1_name',
      nick: 'user_1_nick',
      avatar: 'user_1_avatar',
    },
    user_2: {
      name: 'user_2_name',
    },
    user_3: {
      nick: 'user_3_nick',
    },
  };
  const data: ERDA_LIST.ItemProps['data'] = {
    id: 1,
    title: 'item-title',
    titleState: [],
    tags: [],
    logoCircle: true,
    mainState: { text: 'success', status: 'success' },
    columnsInfo: {
      state: { text: 'success status', status: 'error' },
      text: [{ text: 'columnsInfo text', tip: 'tips' }],
      users: ['user'],
      hoverIcons: [{ icon: 'app', tip: 'this is tip' }],
    },
  };
  beforeAll(() => {
    jest.mock('app/config-page/img-map');
    jest.mock('core/stores/userMap');
    Object.defineProperty(imgUtil, 'default', {
      value: imgMap,
    });
    Object.defineProperty(imgUtil, 'getImg', {
      value: (imgKey: string) => {
        if (imgKey && imgMap[imgKey]) {
          return imgMap[imgKey];
        }
        return imgKey;
      },
    });
    userStore.useStore = (fn) => fn({ ...userMap });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should render with logo', () => {
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
        }}
        defaultLogo={imgMap.frontImg_default_app_icon}
        defaultBgImg={imgMap.frontImg_default_project_icon}
      />,
    );
    expect(result.container).isExist('.erda-badge-status-success', 1);
    expect(result.container).isExist('.tags-container', 1);
    expect(result.getByText(data.columnsInfo.text?.[0].text!)).toBeTruthy();
    expect(result.container).isExist('.item-prefix-img img', 1);
    expect(result.getByRole('img')).toHaveAttribute('src', imgMap.frontImg_default_app_icon);
    expect(result.getByRole('img')).toHaveClass('prefix-img-circle');
    result.rerender(
      <ListItem
        key={data.id}
        data={{
          ...data,
          logoCircle: false,
        }}
        defaultLogo={imgMap.frontImg_default_app_icon}
        defaultBgImg={imgMap.frontImg_default_project_icon}
      />,
    );
    expect(result.getByRole('img')).not.toHaveClass('prefix-img-circle');
    result.rerender(
      <ListItem
        key={data.id}
        data={{
          ...data,
          logoCircle: false,
        }}
        defaultLogo={iconMap['api-app']}
        defaultBgImg={iconMap.cluster}
      />,
    );
    expect(result.container).isExist(`[name="${iconMap['api-app']}"]`, 1);
    expect(result.container).isExist(`[style="background-image: url(${iconMap.cluster});"]`, 1);
    result.rerender(
      <ListItem
        key={data.id}
        data={{
          ...data,
          backgroundImg: customImg,
        }}
        defaultLogo={iconMap['api-app']}
        defaultBgImg={iconMap.cluster}
      />,
    );
    expect(result.container).isExistClass(`[name="${iconMap['api-app']}"]`, 'prefix-img-circle');
    result.rerender(
      <ListItem
        key={data.id}
        data={{
          ...data,
          backgroundImg: customImg,
          logoURL: customImg,
        }}
      />,
    );
    expect(result.getByRole('img')).toHaveAttribute('src', customImg);
  });
  it('should render well with columnsInfo user', () => {
    const result = render(
      <ListItem
        key={data.id}
        columnsInfoWidth={{
          user: 100,
        }}
        data={{
          ...data,
          columnsInfo: {
            users: Object.keys(userMap),
          },
        }}
      />,
    );
    expect(result.container).isExist(`[src="${userMap.user_1.avatar}"]`, 1);
    expect(result.getByText(userMap.user_1.nick!)).toBeTruthy();
    expect(result.getByText(userMap.user_2.name!)).toBeTruthy();
    expect(result.getByText(userMap.user_3.nick!)).toBeTruthy();
  });
  it('should render well with columnsInfo state', () => {
    const result = render(
      <ListItem
        key={data.id}
        columnsInfoWidth={{
          state: 100,
        }}
        data={{
          ...data,
          columnsInfo: {
            state: { text: 'success status', status: 'success' },
          },
        }}
      />,
    );
    expect(result.getByText('success status')).toBeTruthy();
  });
  it('should render well with columnsInfo hoverIcon', () => {
    const result = render(
      <ListItem
        key={data.id}
        columnsInfoWidth={{
          state: 100,
        }}
        data={{
          ...data,
          columnsInfo: {
            hoverIcons: [
              {
                icon: 'hoverIcons-error',
                tip: 'hoverIcons-tip-error',
                compWapper: (comp: JSX.Element) => <div className="hoverIcons-compWapper">{comp}</div>,
              },
              { icon: 'hoverIcons-success', tip: 'hoverIcons-tip-success' },
            ],
          },
        }}
      />,
    );
    expect(result.container).isExist('.hoverIcons-compWapper', 1);
    expect(result.container).isExist('[name="hoverIcons-error"]', 1);
    expect(result.container).isExist('[name="hoverIcons-success"]', 1);
  });
  it('should work welll with operations', async () => {
    const clickFn = jest.fn();
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          operations: [
            {
              icon: 'view',
              key: 'view',
              text: 'viewItem',
              compWapper: (comp: JSX.Element) => <div className="operations-compWapper">{comp}</div>,
              onClick: clickFn,
            },
            {
              icon: 'delete',
              key: 'delete',
              text: 'deleteItem',
              onClick: clickFn,
            },
          ],
          moreOperations: [
            {
              icon: 'edit',
              key: 'edit',
              text: 'editItem',
              onClick: clickFn,
            },
          ],
        }}
      />,
    );
    expect(result.container).isExist('.operations-compWapper', 1);
    fireEvent.click(result.container.querySelector('[name="view"]')!);
    expect(clickFn).toHaveBeenCalledTimes(1);
    fireEvent.click(result.container.querySelector('[name="delete"]')!);
    expect(clickFn).toHaveBeenCalledTimes(2);
    userEvent.hover(result.container.querySelector('[name="more"]')!);
    fireEvent.click(result.container.querySelector('[name="more"]')!);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    fireEvent.click(screen.getByText('editItem'));
    expect(clickFn).toHaveBeenCalledTimes(3);
  });
  it('should render well with kvInfos', async () => {
    const kvInfos = [
      {
        key: 'app',
        icon: 'app',
        value: 'app Count',
        compWapper: (comp: JSX.Element) => <div className="kvInfos-compWapper">{comp}</div>,
      },
      {
        key: 'project',
        value: 'project Count',
        tip: 'this is a tip for project',
      },
    ];
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          kvInfos,
        }}
      />,
    );
    expect(result.container).isExist('.kvInfos-compWapper', 1);
    expect(result.container).isExist(`[name="${kvInfos[0].icon}"]`, 1);
    userEvent.hover(result.getByText(kvInfos[1].value));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    expect(screen.getByText(kvInfos[1].tip!)).toBeTruthy();
  });
  it('should render well with titleState', async () => {
    const titleState: ERDA_LIST.IState[] = [
      {
        text: 'title-state-error',
        status: 'error',
      },
      {
        text: 'title-state-success',
        status: 'success',
      },
    ];
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          titleState,
        }}
      />,
    );
    expect(result.getAllByText(/title-state-/)).toHaveLength(titleState.length);
  });
  it('should render well with titleSuffixIcon', async () => {
    const titleSuffixIcon = 'titleSuffixIcon-icon';
    const titleSuffixIconTip = 'this is titleSuffixIcon tip';
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          titleSuffixIcon,
          titleSuffixIconTip,
        }}
      />,
    );
    expect(result.container).isExist(`[name="${titleSuffixIcon}"]`, 1);
    userEvent.hover(result.container.querySelector(`[name="${titleSuffixIcon}"]`)!);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    expect(screen.getByText(titleSuffixIconTip)).toBeTruthy();
  });
  it('should render well with titlePrefixIcon', async () => {
    const titlePrefixIcon = 'titlePrefixIcon';
    const titleSuffixIconTipTip = 'this is titlePrefixIcon tip';
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          titlePrefixIcon,
          titleSuffixIconTipTip,
        }}
      />,
    );
    expect(result.container).isExist(`[name="${titlePrefixIcon}"]`, 1);
  });
  it('should work well with onSelectChange', () => {
    const changeFn = jest.fn();
    const result = render(<ListItem key={data.id} data={data} onSelectChange={changeFn} />);
    fireEvent.click(result.getByRole('checkbox'));
    fireEvent.change(result.getByRole('checkbox'), { target: { checked: true } });
    expect(changeFn).toHaveBeenLastCalledWith(true);
  });
  it('should render well with selectable is false', () => {
    const changeFn = jest.fn();
    const clickFn = jest.fn();
    const result = render(
      <ListItem
        key={data.id}
        data={{
          ...data,
          selectable: false,
          itemProps: {
            onClick: clickFn,
          },
          moreOperations: [
            {
              icon: 'edit',
              key: 'edit',
              text: 'editItem',
              onClick: jest.fn(),
            },
          ],
        }}
        onSelectChange={changeFn}
      />,
    );
    expect(result.getByRole('checkbox').parentNode).toHaveClass('ant-checkbox-disabled');
    expect(result.container).isExist('[name="lock"]', 1);
    fireEvent.click(result.container.querySelector('[name="lock"]')!);
    expect(clickFn).not.toHaveBeenCalled();
    fireEvent.click(result.container.querySelector('.erda-base-list-item')!);
    expect(clickFn).toHaveBeenCalledTimes(1);
  });
  it('should render well with icon', () => {
    const icon = iconMap.cluster;
    const result = render(<ListItem key={data.id} data={{ ...data, icon }} />);
    expect(result.container).isExist(`[name="${icon}"]`, 1);
  });
  it('should render well with titleSummary', () => {
    const titleSummary = 'titleSummary';
    const result = render(<ListItem key={data.id} data={{ ...data, titleSummary }} />);
    expect(result.getByText('titleSummary')).toBeTruthy();
  });
});
