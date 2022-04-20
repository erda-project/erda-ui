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
import AddonSettings from '..';
import routeInfoStore from 'core/stores/route';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as GoTo from 'common/utils/go-to';

import agent from 'agent';

const { PureAddonSettings } = AddonSettings;

const insId = 123;
const routerData = {
  params: {
    insId,
  },
};
const data = {
  name: 'erda',
};

jest.mock('core/stores/route');
jest.mock('agent');

describe('addon-settings', () => {
  const fn = jest.fn();
  beforeAll(() => {
    jest.mock('common/utils/go-to');
    routeInfoStore.getState = (fn) => {
      return fn(routerData);
    };
    routeInfoStore.useStore = (fn) => {
      return fn(routerData);
    };
    agent.get = jest.fn().mockResolvedValue({
      body: {
        success: true,
        data,
      },
    });
    agent.delete = () => {
      fn.call(null);
      return Promise.resolve({
        body: {
          success: true,
          data,
        },
      });
    };
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('AddonSettings', () => {
    it('should render well', async () => {
      const result = render(<AddonSettings />);
      await waitFor(() => expect(result.baseElement.querySelector('.addon-settings-panel')).toBeInTheDocument());
    });
  });
  describe('PureAddonSettings', () => {
    const goTo = jest.fn();
    goTo.pages = {};
    Object.defineProperty(GoTo, 'goTo', {
      value: goTo,
    });
    const config = {
      name: 'erda',
      org: 'erda.cloud',
    };
    it('should render well', async () => {
      const result = render(<PureAddonSettings insId={insId} />);
      expect(result.container.firstChild).toBeNull();
      result.rerender(<PureAddonSettings insId={insId} addonConfig={{ config, canDel: false }} />);
      expect(result.container).isExist('.param-k', 2);
      expect(result.container).isExist('.settings-delete', 0);
      result.rerender(
        <PureAddonSettings
          insId={insId}
          addonConfig={{ addonName: 'mysql', config: { ...config, MYSQL_HOST: 'MYSQL_HOST' }, canDel: true }}
        />,
      );
      expect(result.container).isExist('.param-k', 1);
      expect(result.container).isExist('.settings-delete', 1);
      fireEvent.click(result.getByText('delete current service'));
      await waitFor(() => expect(result.baseElement.querySelector('.ant-modal')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Ok'));
      await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));
      expect(goTo).toHaveBeenCalled();
    });
  });
});
