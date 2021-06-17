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

import * as React from 'react';
import { Button, Select, Input, Table, Tooltip } from 'app/nusi';
import { isEmpty, pick } from 'lodash';
import { HTTP_METHODS } from '../config';
import { AppServiceFilter } from './app-service-filter';
import i18n from 'i18n';

import './api-import.scss';
import gatewayStore from 'microService/stores/gateway';
import { useUnmount } from 'react-use';
import { PAGINATION } from 'app/constants';
// import loadingStore from 'common/stores/loading';

const { Option } = Select;

interface IProps {
  importApiParams: { apis: any[]; routePrefix: string; diceApp?: string; diceService?: string };
  updateImportParams: ({
    apis,
    routePrefix,
    diceApp,
    diceService,
  }: {
    apis?: any[];
    routePrefix?: string;
    diceApp?: string;
    diceService?: string;
  }) => void;
}

const apiColumns = [
  {
    title: i18n.t('microService:api path'),
    dataIndex: 'apiPath',
    key: 'apiPath',
    width: 300,
    render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
  },
  {
    title: i18n.t('microService:method'),
    dataIndex: 'method',
    key: 'method',
    width: 80,
  },
  {
    title: i18n.t('microService:description'),
    dataIndex: 'description',
    key: 'description',
    width: 180,
  },
];

export const ApiImport = ({ updateImportParams, importApiParams }: IProps) => {
  const [filter, setFilter] = React.useState({} as any);
  const { method, apiPath } = filter;
  const [importableApis] = gatewayStore.useStore((s) => [s.importableApis]);
  const { getImportableApiList } = gatewayStore.effects;
  const { clearImportableApis } = gatewayStore.reducers;
  // const isFetching = loadingStore.useSpace(gatewayStore).getImportableApiList
  const { apis: originApis, routePrefix: originPrefix } = importableApis; // 可被导入的api
  const { apis: selectedApis, routePrefix, diceApp, diceService } = importApiParams; // 已经被导入的api

  React.useEffect(() => {
    !isEmpty(importableApis) &&
      diceApp &&
      diceService &&
      updateImportParams({
        apis: originApis.filter((api) => api.selected).map((api) => api.apiId),
        routePrefix: originPrefix,
      });
  }, [diceApp, diceService, importableApis, originApis, originPrefix, updateImportParams]);

  useUnmount(() => {
    clearImportableApis();
  });

  const onSearch = () => {
    getImportableApiList({ diceApp, diceService, method, apiPath });
  };

  const updateAppService = (updateObj: any) => {
    updateImportParams({ ...updateObj });
  };

  const onChangePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateImportParams({ routePrefix: event.target.value });
  };

  const onSelectChange = (selectedKeys: string[] | number[]) => {
    updateImportParams({ apis: selectedKeys });
  };

  const rowSelection = {
    selectedRowKeys: selectedApis,
    onChange: onSelectChange,
    hideDefaultSelections: true,
    getCheckboxProps({ selected }: any) {
      if (selected) {
        return {
          value: true,
          disabled: true,
        };
      }
      return {};
    },
    selections: [
      {
        key: 'all-data',
        text: i18n.t('microService:select all apis'),
        onSelect: () => {
          updateImportParams({ apis: originApis.map((api) => api.apiId) });
        },
      },
      {
        key: 'invert-all-data',
        text: i18n.t('microService:inverse selection of all apis'),
        onSelect: () => {
          updateImportParams({ apis: originApis.filter((api) => api.selected).map((api) => api.apiId) });
        },
      },
    ],
  };

  return (
    <div className="api-import">
      <div className="mb16 api-filter flex-box">
        <div>
          <AppServiceFilter
            updateField={updateAppService}
            dataSource={pick(importApiParams, ['diceApp', 'diceService'])}
          />
          <Select
            placeholder={i18n.t('microService:method')}
            value={method}
            onChange={(value: string) => setFilter({ ...filter, method: value })}
            className="filter-select mr16"
          >
            {HTTP_METHODS.map(({ name, value }: { name: string; value: string }) => (
              <Option key={value} value={value}>
                {name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder={i18n.t('microService:search by API')}
            value={apiPath}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFilter({ ...filter, apiPath: event.target.value })
            }
            className="filter-input"
          />
        </div>
        <Button type="primary" ghost onClick={onSearch} disabled={!diceApp || !diceService}>
          {i18n.t('search')}
        </Button>
      </div>
      <div className="mb16 v-align">
        <span>{i18n.t('microService:service routing prefix')}:</span>
        <Input value={routePrefix} onChange={onChangePrefix} className="prefix-input ml16" />
      </div>
      <Table
        dataSource={diceApp && diceService ? originApis : []}
        columns={apiColumns}
        rowKey="apiId"
        rowSelection={rowSelection}
        pagination={{
          pageSize: PAGINATION.pageSize,
        }}
      />
    </div>
  );
};
