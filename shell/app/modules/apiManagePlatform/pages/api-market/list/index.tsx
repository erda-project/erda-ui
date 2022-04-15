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
import { useDebounce, useUnmount } from 'react-use';
import { ConfigurableFilter, UserInfo, TopButtonGroup } from 'common';
import { useUpdate } from 'common/use-hooks';
import ExportRecord, { specProtocol } from 'apiManagePlatform/pages/api-market/components/export-record';
import ErdaTable from 'common/components/table';
import apiMarketStore from 'app/modules/apiManagePlatform/stores/api-market';
import { useLoading } from 'core/stores/loading';
import { Button, PaginationProps, Tooltip } from 'antd';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import AssetModal, { IMode, IScope } from 'app/modules/apiManagePlatform/pages/api-market/components/asset-modal';
import ApplyModal from 'apiManagePlatform/pages/api-market/components/apply-modal';
import { exportApi } from 'apiManagePlatform/services/api-export';
import routeInfoStore from 'core/stores/route';
import moment from 'moment';
import { ColumnProps, IActions } from 'common/components/table/interface';
import { Field } from 'common/components/configurable-filter';
import './index.scss';

export const assetTabs: Array<{ key: API_MARKET.AssetScope; name: string }> = [
  {
    key: 'mine',
    name: i18n.t('My APIs'),
  },
  {
    key: 'all',
    name: i18n.t('All'),
  },
];

interface IState {
  keyword: string;
  visible: boolean;
  showApplyModal: boolean;
  scope: IScope;
  mode: IMode;
  assetDetail: Partial<API_MARKET.Asset>;
  showExportModal: boolean;
}

const commonQuery: API_MARKET.CommonQueryAssets = {
  hasProject: false,
  paging: true,
  latestVersion: true,
  latestSpec: false,
};

const ApiMarketList = () => {
  const [{ keyword, ...state }, updater, update] = useUpdate<IState>({
    keyword: '',
    visible: false,
    scope: 'asset',
    mode: 'add',
    assetDetail: {},
    showApplyModal: false,
    showExportModal: false,
  });
  const [assetList, assetListPaging] = apiMarketStore.useStore((s) => [s.assetList, s.assetListPaging]);
  const { scope } = routeInfoStore.useStore((s) => s.params) as { scope: API_MARKET.AssetScope };
  const { getAssetList } = apiMarketStore.effects;
  const { resetAssetList } = apiMarketStore.reducers;
  const [isFetchList] = useLoading(apiMarketStore, ['getAssetList']);
  useUnmount(() => {
    resetAssetList();
  });
  const getList = (params: Pick<API_MARKET.QueryAssets, 'keyword' | 'pageNo' | 'scope' | 'pageSize'>) => {
    getAssetList({
      ...commonQuery,
      ...params,
    });
  };
  useDebounce(
    () => {
      getList({ keyword, pageNo: 1, scope });
    },
    200,
    [keyword, scope],
  );

  const reload = () => {
    getList({ keyword, pageNo: 1, scope });
  };

  const filterConfig = React.useMemo(
    (): Field[] => [
      {
        label: '',
        type: 'input',
        outside: true,
        key: 'keyword',
        placeholder: i18n.t('default:Search by keyword'),
        customProps: {
          autoComplete: 'off',
        },
      },
    ],
    [],
  );

  const handleSearch = (query: Record<string, any>) => {
    updater.keyword(query.keyword);
  };

  const handleTableChange = ({ pageSize, current }: PaginationProps) => {
    getList({ keyword, pageNo: current, pageSize, scope });
  };

  const handleManage = ({ assetID }: API_MARKET.Asset) => {
    goTo(goTo.pages.apiManageAssetVersions, { scope, assetID });
  };

  const gotoVersion = ({ asset, latestVersion }: API_MARKET.AssetListItem) => {
    goTo(goTo.pages.apiManageAssetDetail, { assetID: asset.assetID, scope, versionID: latestVersion.id });
  };

  const handleApply = (record: API_MARKET.Asset) => {
    update({
      showApplyModal: true,
      assetDetail: record || {},
    });
  };

  const closeModal = () => {
    update({
      visible: false,
      showApplyModal: false,
      assetDetail: {},
    });
  };

  const showAssetModal = (assetScope: IScope, mode: IMode, record?: API_MARKET.Asset) => {
    update({
      scope: assetScope,
      mode,
      visible: true,
      assetDetail: record || {},
    });
  };

  const toggleExportModal = () => {
    updater.showExportModal((prev: boolean) => !prev);
  };

  const columns: Array<ColumnProps<API_MARKET.AssetListItem>> = [
    {
      title: i18n.t('API name'),
      dataIndex: ['asset', 'assetName'],
      width: 240,
    },
    {
      title: i18n.t('API description'),
      dataIndex: ['asset', 'desc'],
    },
    {
      title: 'API ID',
      dataIndex: ['asset', 'assetID'],
      width: 200,
    },
    {
      title: i18n.t('Update time'),
      dataIndex: ['asset', 'updatedAt'],
      width: 200,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('Creator'),
      dataIndex: ['asset', 'creatorID'],
      width: 160,
      render: (text) => (
        <Tooltip title={<UserInfo id={text} />}>
          <UserInfo.RenderWithAvatar id={text} />
        </Tooltip>
      ),
    },
  ];

  const actions: IActions<API_MARKET.AssetListItem> = {
    render: (record) => {
      const { permission, asset } = record;
      const { manage, addVersion, hasAccess } = permission;
      return [
        {
          title: i18n.t('Export'),
          onClick: () => {
            exportApi
              .fetch({
                versionID: record.latestVersion.id,
                specProtocol,
              })
              .then(() => {
                toggleExportModal();
              });
          },
        },
        {
          title: i18n.t('manage'),
          onClick: () => {
            handleManage(asset);
          },
          show: manage,
        },
        {
          title: i18n.t('add {name}', { name: i18n.t('Version') }),
          onClick: () => {
            showAssetModal('version', 'add', asset);
          },
          show: !!addVersion,
        },
        {
          title: i18n.t('apply to call'),
          onClick: () => {
            handleApply(asset);
          },
          show: hasAccess,
        },
      ];
    },
  };

  return (
    <div className="api-market-list">
      <TopButtonGroup>
        <Button onClick={toggleExportModal}>{i18n.t('Export Records')}</Button>
        <Button
          type="primary"
          onClick={() => {
            showAssetModal('asset', 'add');
          }}
        >
          {i18n.t('default:Add Resource')}
        </Button>
      </TopButtonGroup>
      <ErdaTable
        rowKey="asset.assetID"
        columns={columns}
        dataSource={assetList}
        pagination={{
          ...assetListPaging,
          current: assetListPaging.pageNo,
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              gotoVersion(record);
            },
          };
        }}
        onChange={handleTableChange}
        loading={isFetchList}
        actions={actions}
        slot={<ConfigurableFilter fieldsList={filterConfig} onFilter={handleSearch} />}
      />
      <AssetModal
        visible={state.visible}
        scope={state.scope}
        mode={state.mode}
        formData={state.assetDetail as API_MARKET.Asset}
        onCancel={closeModal}
        afterSubmit={reload}
      />
      <ApplyModal
        visible={state.showApplyModal}
        onCancel={closeModal}
        dataSource={state.assetDetail as API_MARKET.Asset}
      />
      <ExportRecord visible={state.showExportModal} onCancel={toggleExportModal} />
    </div>
  );
};

export default ApiMarketList;
