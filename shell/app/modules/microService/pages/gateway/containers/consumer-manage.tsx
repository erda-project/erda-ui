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
import { Button, Modal, Drawer, Table, Select, Popover, Spin, Tabs } from 'app/nusi';
import { cloneDeep, isEmpty } from 'lodash';
import { mergeSearch, goTo } from 'common/utils';
import { PagingTable, FormModal, useUpdate, Icon as CustomIcon } from 'common';
import {
  HTTP_PREFIX, KEY_AUTH_COLS, OAUTH_COLS, HMAC_AUTH_COLS, OPENAPI_CONSUMER_COLS, ALI_CLOUD_APP_COLS,
  getOpenApiConsumerFields, KEY_AUTH_FIELDS, OAUTH_FIELDS, SIGN_AUTH_COLS, HMAC_AUTH_FIELDS, SIGN_AUTH_FIELDS, CONSUMER_AUTH_PACKAGE_COLS,
} from '../config';
import i18n from 'i18n';

import './consumer-manage.scss';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';
import { PAGINATION } from 'app/constants';

const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;

const KEY_AUTH = 'key-auth';
const OAUTH = 'oauth2';
const HMAC_AUTH = 'hmac-auth';
const SIGN_AUTH = 'sign-auth';

type IOpenApiConsumer = GATEWAY.ConsumersName;

export const PureConsumerManage = () => {
  const [state, updater] = useUpdate({
    modalVisible: false,
    authParamsVisible: false,
    keyAuthVisible: false,
    oAuthVisible: false,
    hmacAuthVisible: false,
    signAuthVisible: false,
    authPackageVisible: false,
    authDataTouched: false,
    protocol: HTTP_PREFIX,
    currentConsumerId: '0',
    formData: {},
    selectedPackages: [],
  });
  const {
    modalVisible,
    authParamsVisible,
    keyAuthVisible,
    oAuthVisible,
    hmacAuthVisible,
    signAuthVisible,
    authPackageVisible,
    authDataTouched,
    protocol,
    currentConsumerId,
    formData,
    selectedPackages,
  } = state;
  const [openApiConsumerList, paging, consumerAuthPackages, authConfig, aliCloudCredentials] = gatewayStore.useStore(s => [s.openApiConsumerList, s.openApiConsumerListPaging, s.consumerAuthPackages, s.authConfig, s.aliCloudCredentials]);
  const { getOpenApiConsumerList, createOpenApiConsumer, getConsumerAuthPackages, updateConsumerAuthPackages, updateOpenApiConsumer, getConsumerCredentials, updateConsumerCredentials, deleteOpenApiConsumer, generateAliCloudCredentials, getAliCloudCredentials, deleteAliCloudCredentials } = gatewayStore.effects;
  const { clearAliCloudCredentials } = gatewayStore.reducers;
  const [isFetching, isFetchAliAuth, isGenAliAuth, isDelAliAuth, credentialsLoading] = useLoading(gatewayStore, ['getOpenApiConsumerList', 'getAliCloudCredentials', 'generateAliCloudCredentials', 'deleteAliCloudCredentials', 'getConsumerCredentials']);


  React.useEffect(() => {
    getOpenApiConsumerList({ pageNo: 1 });
  }, [getOpenApiConsumerList]);

  React.useEffect(() => {
    updater.selectedPackages(consumerAuthPackages.filter(cp => cp.selected).map(p => p.id));
  }, [consumerAuthPackages, updater]);

  const editForm = (record: IOpenApiConsumer) => {
    updater.formData(record);
    updater.modalVisible(true);
  };

  const onDelete = ({ id }: IOpenApiConsumer) => {
    deleteOpenApiConsumer({ consumerId: id }).then(() => getOpenApiConsumerList({ pageNo: 1 }));
  };

  const handleDeleteAuthRecord = ({ id, key, name }: any, type: string) => {
    confirm({
      title: i18n.t('microService:confirm deletion?'),
      content: `${i18n.t('microService:confirm delete this parameter')}：${key || name}`,
      onOk: () => {
        const configCopy = cloneDeep(authConfig);
        const targetData = configCopy.find(config => config.authType === type) as GATEWAY.IAuthConfig;
        targetData.authData.data = targetData.authData.data.filter((item: any) => item.id !== id);
        updateConsumerCredentials({ consumerId: currentConsumerId, authConfig: { auths: configCopy } });
      },
    });
  };

  const handleDeleteAliCloudCredentials = ({ appKey }: GATEWAY.AliCloudCredentials) => {
    confirm({
      title: i18n.t('microService:confirm deletion?'),
      content: `${i18n.t('microService:confirm delete this parameter')}：${appKey}`,
      onOk: () => {
        deleteAliCloudCredentials({ consumerId: currentConsumerId }).then(() => {
          getAliCloudCredentials({ consumerId: currentConsumerId });
        });
      },
    });
  };

  const authOperation = (type: string) => ({
    title: i18n.t('operations'),
    width: 100,
    dataIndex: 'operations',
    render: (text: any, record: any) => (
      <div className="table-operations">
        <span className="table-operations-btn" onClick={() => handleDeleteAuthRecord(record, type)}>{i18n.t('microService:delete')}</span>
      </div>
    ),
  });

  const handleGenerate = () => {
    generateAliCloudCredentials({ consumerId: currentConsumerId });
  };

  const keyAuthColsWithOperation = [
    ...KEY_AUTH_COLS,
    authOperation(KEY_AUTH),
  ];

  const oAuthColsWithOperation = [
    ...OAUTH_COLS,
    authOperation(OAUTH),
  ];
  const hmacColsWithOperation = [
    ...HMAC_AUTH_COLS,
    authOperation(HMAC_AUTH),
  ];
  const signAuthColsWithOperation = [
    ...SIGN_AUTH_COLS,
    authOperation(SIGN_AUTH),
  ];

  const aliCloudColsWithOperation = [
    ...ALI_CLOUD_APP_COLS,
    {
      title: i18n.t('operations'),
      width: 100,
      dataIndex: 'operations',
      render: (text: any, record: any) => (
        <div className="table-operations">
          <span className="table-operations-btn" onClick={() => handleDeleteAliCloudCredentials(record)}>{i18n.t('microService:delete')}</span>
        </div>
      ),
    },
  ];

  const oauthFields = [
    ...OAUTH_FIELDS,
    {
      label: i18n.t('microService:redirect address'),
      name: 'redirect_uri',
      required: false,
      itemProps: {
        addonBefore: (
          <Select
            defaultValue="http://"
            onChange={(value: string) => { updater.protocol(value); }}
          >
            <Option value="http://">http://</Option>
            <Option value="https://">https://</Option>
          </Select >
        ),
      },
    },
  ];
  const renderAuthParamsContent = () => {
    const keyAuth = authConfig.find(config => config.authType === KEY_AUTH);
    const oAuth = authConfig.find(config => config.authType === OAUTH);
    const hamcAuth = authConfig.find(config => config.authType === HMAC_AUTH);
    const signAuth = authConfig.find(config => config.authType === SIGN_AUTH);

    return (
      <div className="auth-params-content">
        <Tabs defaultActiveKey='1' size='small'>
          <TabPane
            tab={(
              <>
                {i18n.t('microService:key authentication mode')}
                <Popover
                  placement={'top'}
                  content={i18n.t('microService:header-X-App-Key')}
                >
                  <CustomIcon type="questionfill" className="ml8 auth-question-icon" />
                </Popover>
              </>
               )}
            key="1"
          >
            <div className="auth-type-item">
              <h3 className="placeholder" />
              <Button type="primary" ghost className="auth-params-add" onClick={() => updater.keyAuthVisible(true)}>{i18n.t('common:add')}</Button>
              <Table
                dataSource={keyAuth ? keyAuth.authData.data : []}
                columns={keyAuthColsWithOperation}
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>
          <TabPane tab={`OAuth ${i18n.t('microService:mode')}`} key="2">
            <div className="auth-type-item">
              <h3 className="placeholder" />
              <Button type="primary" ghost className="auth-params-add" onClick={() => updater.oAuthVisible(true)}>{i18n.t('common:add')}</Button>
              <Table
                dataSource={oAuth ? oAuth.authData.data : []}
                columns={oAuthColsWithOperation}
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>
          <TabPane tab={`Hmac ${i18n.t('microService:mode')}`} key="3">
            <div className="auth-type-item">
              <h3 className="placeholder" />
              <Button type="primary" ghost className="auth-params-add" onClick={() => updater.hmacAuthVisible(true)}>{i18n.t('common:add')}</Button>
              <Table
                dataSource={hamcAuth ? hamcAuth.authData.data : []}
                columns={hmacColsWithOperation}
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>
          <TabPane
            tab={(
              <>
                {i18n.t('microService:parameter authentication mode')}
                <Popover
                  placement={'top'}
                  content={i18n.t('microService:appKey-field-request-argument')}
                >
                  <CustomIcon type="questionfill" className="ml8 auth-question-icon" />
                </Popover>
              </>
             )}
            key="4"
          >
            <div className="auth-type-item">
              <h3 className="placeholder" />
              <Button type="primary" ghost className="auth-params-add" onClick={() => updater.signAuthVisible(true)}>{i18n.t('common:add')}</Button>
              <Table
                dataSource={signAuth ? signAuth.authData.data : []}
                columns={signAuthColsWithOperation}
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>
          <TabPane tab={`${i18n.t('microService:ali Cloud APP auth')}${i18n.t('microService:mode')}`} key="5">
            <div className="auth-type-item">
              <h3 className="placeholder" />
              <Button type="primary" loading={isGenAliAuth} ghost disabled={!!aliCloudCredentials.length} className="auth-params-add" onClick={handleGenerate}>{i18n.t('microService:generate')}</Button>
              <Table
                loading={isFetchAliAuth || isDelAliAuth}
                dataSource={aliCloudCredentials || []}
                columns={aliCloudColsWithOperation}
                rowKey="id"
                pagination={false}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const handleAddAuth = ({ key, redirect_uri, ...rest }: any, type: string) => {
    const configCopy = cloneDeep(authConfig);
    const targetData = configCopy.find(config => config.authType === type);
    const data = targetData ? targetData.authData.data : [];
    if (type === KEY_AUTH) {
      data.push({ key });
    } else if (type === OAUTH) {
      data.push({
        ...rest,
        redirect_uri: redirect_uri ? `${protocol}${redirect_uri}` : undefined,
      });
    } else if (type === HMAC_AUTH) {
      data.push({ key, ...rest });
    } else {
      data.push({ key, ...rest });
    }
    updateConsumerCredentials({ consumerId: currentConsumerId, authConfig: { auths: configCopy } });
    if (type === KEY_AUTH) {
      updater.keyAuthVisible(false);
    } else if (type === OAUTH) {
      updater.oAuthVisible(false);
    } else if (type === HMAC_AUTH) {
      updater.hmacAuthVisible(false);
    } else {
      updater.signAuthVisible(false);
    }
  };

  const openCredentials = ({ id }: IOpenApiConsumer) => {
    getConsumerCredentials({ consumerId: id });
    getAliCloudCredentials({ consumerId: id });
    updater.currentConsumerId(id);
    updater.authParamsVisible(true);
  };

  const openAuthDrawer = ({ id }: IOpenApiConsumer) => {
    getConsumerAuthPackages({ consumerId: id });
    updater.currentConsumerId(id);
    updater.authPackageVisible(true);
  };

  const columns = [
    ...OPENAPI_CONSUMER_COLS,
    {
      title: i18n.t('operations'),
      width: 240,
      dataIndex: 'operations',
      render: (text: any, record: any) => {
        const { name } = record;
        const auditLink = `./consumer-audit/package-analyze?${mergeSearch({ csmr: name }, true)}`;
        return (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => editForm(record)}>{i18n.t('microService:edit')}</span>
            <span className="table-operations-btn" onClick={() => openCredentials(record)}>{i18n.t('microService:cert')}</span>
            <span className="table-operations-btn" onClick={() => openAuthDrawer(record)}>{i18n.t('microService:authorization')}</span>
            <span className="table-operations-btn" onClick={() => goTo(auditLink)}>{i18n.t('microService:audit')}</span>
            <span
              className="table-operations-btn"
              onClick={() => confirm({
                title: i18n.t('microService:confirm deletion?'),
                onOk: () => onDelete(record),
              })}
            >
              {i18n.t('microService:delete')}
            </span>
          </div>);
      },
    },
  ];

  const closeConsumerModal = () => {
    updater.formData({});
    updater.modalVisible(false);
  };

  const onSubmitForm = (data: any, addMode: any) => {
    if (addMode) {
      createOpenApiConsumer(data).then(() => getOpenApiConsumerList({ pageNo: 1 }));
    } else {
      updateOpenApiConsumer(data).then(() => getOpenApiConsumerList({ pageNo: 1 }));
    }
    closeConsumerModal();
  };

  const onSelectChange = (selectedKeys: string[] | number[]) => {
    updater.selectedPackages(selectedKeys);
    updater.authDataTouched(true);
  };

  const onUpdateAuthPackage = () => {
    updateConsumerAuthPackages({ consumerId: currentConsumerId, packages: selectedPackages });
  };

  const rowSelection = {
    selectedRowKeys: selectedPackages,
    onChange: onSelectChange,
    hideDefaultSelections: true,
    selections: [
      {
        key: 'all-data',
        text: i18n.t('microService:select all endpoints'),
        onSelect: () => {
          updater.selectedPackages(consumerAuthPackages.map(p => p.id));
          updater.authDataTouched(true);
        },
      },
      {
        key: 'invert-all-data',
        text: i18n.t('microService:inverse selection of all endpoints'),
        onSelect: () => {
          updater.selectedPackages([]);
          updater.authDataTouched(true);
        },
      },
    ],
  };

  const closeAuthDrawer = () => {
    updater.authPackageVisible(false);
    updater.authDataTouched(false);
  };

  return (
    <div className="consumer-manage">
      <Spin spinning={isFetching}>
        <div className="mb16">
          <Button type="primary" onClick={() => updater.modalVisible(true)}>{i18n.t('microService:new consumer')}</Button>
        </div>
        <PagingTable
          isForbidInitialFetch
          dataSource={openApiConsumerList}
          total={paging.total}
          columns={columns}
          rowKey="id"
          getList={getOpenApiConsumerList}
        />
      </Spin>
      <FormModal
        width="600px"
        name={i18n.t('microService:consumer')}
        fieldsList={getOpenApiConsumerFields(!isEmpty(formData))}
        visible={modalVisible}
        formData={formData}
        onOk={onSubmitForm}
        onCancel={closeConsumerModal}
      />
      <Drawer
        title={i18n.t('microService:authorization parameters')}
        visible={authParamsVisible}
        onClose={() => { updater.authParamsVisible(false); clearAliCloudCredentials(); }}
        width="50%"
        destroyOnClose
      >
        <Spin spinning={credentialsLoading}>
          {renderAuthParamsContent()}
        </Spin>
      </Drawer>
      <FormModal
        name="appKey"
        fieldsList={KEY_AUTH_FIELDS}
        visible={keyAuthVisible}
        onOk={(data: any) => handleAddAuth(data, KEY_AUTH)}
        onCancel={() => updater.keyAuthVisible(false)}
      />
      <FormModal
        name="OAuth"
        fieldsList={oauthFields}
        visible={oAuthVisible}
        onOk={(data: any) => handleAddAuth(data, OAUTH)}
        onCancel={() => updater.oAuthVisible(false)}
      />
      <FormModal
        name="HMAC_AUTH"
        fieldsList={HMAC_AUTH_FIELDS}
        visible={hmacAuthVisible}
        onOk={(data: any) => handleAddAuth(data, HMAC_AUTH)}
        onCancel={() => updater.hmacAuthVisible(false)}
      />
      <FormModal
        name="SIGN_AUTH"
        fieldsList={SIGN_AUTH_FIELDS}
        visible={signAuthVisible}
        onOk={(data: any) => handleAddAuth(data, SIGN_AUTH)}
        onCancel={() => updater.signAuthVisible(false)}
      />
      <Drawer
        title={i18n.t('microService:endpoint authorize')}
        visible={authPackageVisible}
        onClose={closeAuthDrawer}
        width="50%"
        destroyOnClose
      >
        <Button type="primary" className="mb16" disabled={!authDataTouched} onClick={onUpdateAuthPackage}>{i18n.t('microService:confirm authorization')}</Button>
        <Table
          dataSource={consumerAuthPackages}
          columns={CONSUMER_AUTH_PACKAGE_COLS}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            pageSize: PAGINATION.pageSize,
          }}
        />
      </Drawer>
    </div>
  );
};

export { PureConsumerManage as ConsumerManage };
