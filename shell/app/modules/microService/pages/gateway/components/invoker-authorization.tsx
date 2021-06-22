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
import moment from 'moment';
import { Table, Button, Modal, Drawer, Select, Spin, Tooltip } from 'app/nusi';
import { FormModal, Copy, SearchTable } from 'common';
import { keys, values } from 'lodash';
import { DomainChecker } from './domain-checker';
import i18n from 'i18n';
import { SelectValue } from 'core/common/interface';

import './invoker-authorization.scss';
import gatewayStore from 'microService/stores/gateway';

const { confirm } = Modal;
const { Option } = Select;

interface IProps {
  consumer: GATEWAY.Consumer;
  apiList: GATEWAY.ApiResponse;
  needAuthApiList: GATEWAY.ApiListItem[];
  needAuthApiPaging: IPaging;
  consumerList: GATEWAY.IConsumer[];
  trafficControlPolicy: { policyList: GATEWAY.PolicyListItem[] };
  authData: {
    keyAuth: {
      authTips: string;
      authData: GATEWAY.IAuthData_data[];
    };
    oAuth: {
      authData: GATEWAY.IAuthData_data[];
    };
  };
  authConsumer: Record<string, any>;
  isFetching: boolean;
  isFetchingNeedAuthAPIList: boolean;
  getConsumerList: typeof gatewayStore.effects.getConsumerList;
  updateConsumerDetail: typeof gatewayStore.effects.updateConsumerDetail;
  getAPIList: typeof gatewayStore.effects.getAPIList;
  getNeedAuthAPIList: typeof gatewayStore.effects.getNeedAuthAPIList;
  saveConsumerApi: typeof gatewayStore.effects.saveConsumerApi;
  getPolicyList: typeof gatewayStore.effects.getPolicyList;
  saveConsumerApiPolicy: typeof gatewayStore.effects.saveConsumerApiPolicy;
  deleteConsumer: typeof gatewayStore.effects.deleteConsumer;
  createConsumer: typeof gatewayStore.effects.createConsumer;
  getConsumerDetail: typeof gatewayStore.effects.getConsumerDetail;
  getConsumer: typeof gatewayStore.effects.getConsumer;
}

interface IState {
  authParamsVisible: boolean;
  authApiVisible: boolean;
  keyAuthModalVisible: boolean;
  oAuthModalVisible: boolean;
  userModalVisible: boolean;
  selectedConsumerId: string;
  selectedConsumerName: string;
  protocol: string;
  editingConsumer: any;
  authedApiDataSource: any[];
  consumerList: GATEWAY.IConsumer[];
}

class InvokerAuthorization extends React.Component<IProps, IState> {
  invokerAuthCols: any[];

  keyAuthCols: any[];

  oAuthCols: any[];

  keyAuthFieldsList: any[];

  userFormList: any[];

  oAuthFieldsList: any[];

  apiCols: any[];

  userUnAuthApiCols: any[];

  userAuthedApiCols: any[];

  policyList: any;

  constructor(props: IProps) {
    super(props);
    this.policyList = [];
    this.invokerAuthCols = [
      {
        title: i18n.t('user'),
        dataIndex: 'consumerName',
        key: 'consumerName',
      },
      {
        title: i18n.t('operations'),
        width: 220,
        render: (record: any) => {
          return (
            <div className="table-operations">
              <span className="table-operations-btn" onClick={() => this.handleClickAuthParams(record)}>
                {i18n.t('microService:authorization parameters')}
              </span>
              <span className="table-operations-btn" onClick={() => this.handleClickAuthApi(record)}>
                {i18n.t('microService:authorization interface')}
              </span>
              <span className="table-operations-btn" onClick={() => this.handleDeleteUser(record)}>
                {i18n.t('microService:delete')}
              </span>
            </div>
          );
        },
      },
    ];
    this.keyAuthCols = [
      {
        title: 'KEY',
        width: 400,
        dataIndex: 'key',
        render: (key: string) => (
          <Tooltip title={key}>
            <Copy className="for-copy" data-clipboard-tip=" KEY ">
              {key}
            </Copy>
          </Tooltip>
        ),
      },
      {
        title: i18n.t('create time'),
        dataIndex: 'created_at',
        render: (createdAt: number) => (createdAt ? moment(createdAt).format('YYYY-MM-DD HH:mm:ss') : '--'),
      },
      {
        title: i18n.t('operations'),
        width: 100,
        render: (record: any) => (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => this.handleDeleteKeyAuth(record)}>
              {i18n.t('microService:delete')}
            </span>
          </div>
        ),
      },
    ];
    this.oAuthCols = [
      {
        title: 'APP Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Client ID',
        dataIndex: 'client_id',
        render: (clientId: string) => (
          <Tooltip title={clientId}>
            <Copy className="for-copy" data-clipboard-tip=" Client ID ">
              {clientId}
            </Copy>
          </Tooltip>
        ),
      },
      {
        title: 'Client Secret',
        dataIndex: 'client_secret',
        render: (clientSecret: string) => (
          <Tooltip title={clientSecret}>
            <Copy className="for-copy" data-clipboard-tip=" Client Secret ">
              {clientSecret}
            </Copy>
          </Tooltip>
        ),
      },
      {
        title: i18n.t('microService:redirect address'),
        dataIndex: 'redirect_uri',
        render: (redirectUris: string) => {
          const redirectUri = redirectUris[0];
          return (
            <Tooltip title={redirectUri}>
              <Copy className="for-copy" data-clipboard-tip={i18n.t('microService:redirect address')}>
                {redirectUri}
              </Copy>
            </Tooltip>
          );
        },
      },
      {
        title: i18n.t('operations'),
        width: 100,
        render: (record: any) => (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => this.handleDeleteOAuth(record)}>
              {i18n.t('microService:delete')}
            </span>
          </div>
        ),
      },
    ];
    this.userFormList = [
      {
        label: i18n.t('microService:username'),
        name: 'consumerName',
      },
    ];
    this.keyAuthFieldsList = [
      {
        label: 'KEY',
        name: 'key',
      },
    ];
    this.oAuthFieldsList = [
      {
        label: 'APP Name',
        name: 'name',
      },
      {
        label: 'Client ID',
        name: 'client_id',
        required: false,
      },
      {
        label: 'Client Secret',
        name: 'client_secret',
        required: false,
      },
      {
        label: i18n.t('microService:redirect address'),
        name: 'redirect_uri',
        required: false,
        itemProps: {
          addonBefore: (
            <Select
              defaultValue="http://"
              onChange={(value: SelectValue) => {
                this.setState({ protocol: value as string });
              }}
            >
              <Option value="http://">http://</Option>
              <Option value="https://">https://</Option>
            </Select>
          ),
        },
      },
    ];
    this.apiCols = [
      {
        title: 'API',
        dataIndex: 'path',
        key: 'path',
        render: (path: string) => (
          <Tooltip title={path}>
            <Copy className="for-copy" data-clipboard-tip={i18n.t('microService:interface')}>
              {path}
            </Copy>
          </Tooltip>
        ),
      },
      {
        title: i18n.t('microService:method'),
        dataIndex: 'method',
        key: 'method',
        width: 100,
      },
      {
        title: i18n.t('microService:description'),
        dataIndex: 'description',
        key: 'description',
      },
    ];
    this.userUnAuthApiCols = [
      ...this.apiCols,
      {
        title: i18n.t('operations'),
        width: 100,
        render: (record: any) => (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => this.handleAddAuthedApi(record)}>
              {i18n.t('microService:authorize')}
            </span>
          </div>
        ),
      },
    ];
    this.userAuthedApiCols = [
      ...this.apiCols,
      {
        title: i18n.t('microService:flow control strategy'),
        width: 150,
        render: (record: any) => {
          const policyId = record.rateLimitPolicy ? record.rateLimitPolicy.policyId : undefined;
          return (
            <div className="operation">
              <Select
                className="option-select"
                style={{ width: '120px' }}
                defaultValue={policyId}
                onChange={(value) => this.handlePolicyChange(record, value as string)}
              >
                {this.policyList
                  ? this.policyList.map((option: { policyId: string; displayName: string }) => (
                      <Option key={option.policyId} value={option.policyId}>
                        {option.displayName}
                      </Option>
                    ))
                  : null}
              </Select>
            </div>
          );
        },
      },
      {
        title: i18n.t('operations'),
        width: 100,
        render: (record: any) => (
          <div className="table-operations">
            <span className="table-operations-btn" onClick={() => this.handleRemoveAuthedApi(record)}>
              {i18n.t('microService:cancel authorization')}
            </span>
          </div>
        ),
      },
    ];

    this.state = {
      authParamsVisible: false,
      authApiVisible: false,
      userModalVisible: false,
      keyAuthModalVisible: false,
      oAuthModalVisible: false,
      selectedConsumerId: '',
      selectedConsumerName: '',
      authedApiDataSource: [],
      protocol: 'http://',
      editingConsumer: {},
      consumerList: [],
    };
  }

  static getDerivedStateFromProps({ consumerList }: IProps) {
    if (consumerList) {
      return { consumerList };
    }
    return null;
  }

  componentDidUpdate(_prevProps: IProps, prevState: IState) {
    if (prevState.consumerList !== this.state.consumerList) {
      this.getAuthedApi(this.state.selectedConsumerName);
    }
  }

  getAuthedApi = (consumerName: string) => {
    const {
      apiList: { result },
      consumerList,
    } = this.props;
    const consumer = consumerList.find((user) => user.consumerName === consumerName);
    if (!consumer || !consumer.consumerApiInfos) {
      this.setState({ authedApiDataSource: [] });
      return;
    }
    const selected = consumer.consumerApiInfos
      .filter((apiInfo) => result.some((api: { apiId: any }) => api.apiId === apiInfo.apiId))
      .map((x) => {
        return { ...x, path: x.apiPath };
      });
    this.setState({ authedApiDataSource: selected });
  };

  handleAddUser = () => {
    this.setState({ userModalVisible: true });
  };

  handleClickAuthParams = ({ consumerId }: GATEWAY.IConsumer) => {
    this.props.getConsumerDetail(consumerId);
    this.setState({
      authParamsVisible: true,
      selectedConsumerId: consumerId,
    });
  };

  handleCancelAuthParams = () => {
    this.setState({
      authParamsVisible: false,
      selectedConsumerId: '',
    });
  };

  handleClickAuthApi = ({ consumerId, consumerName }: GATEWAY.IConsumer) => {
    this.getAuthedApi(consumerName);
    this.setState({
      authApiVisible: true,
      selectedConsumerId: consumerId,
      selectedConsumerName: consumerName,
    });
  };

  handleCancelAuthApi = () => {
    this.setState({
      authApiVisible: false,
      selectedConsumerId: '',
      selectedConsumerName: '',
      authedApiDataSource: [],
    });
  };

  handleDeleteUser = ({ consumerId }: any) => {
    confirm({
      title: i18n.t('microService:confirm deletion'),
      content: i18n.t('microService:If you delete a user, all authorized APIs for that user will be deleted.'),
      onOk: () => this.props.deleteConsumer({ consumerId }),
    });
  };

  handleAddAuthedApi = ({ apiId }: any) => {
    const { authedApiDataSource, selectedConsumerId } = this.state;
    const authedApis = authedApiDataSource.map((item) => item.apiId).concat(apiId);
    const param = {
      consumerId: selectedConsumerId,
      apiList: authedApis,
    };
    this.props.saveConsumerApi(param);
  };

  handleRemoveAuthedApi = ({ apiId }: any) => {
    confirm({
      title: i18n.t('microService:confirm to cancel'),
      content: i18n.t('microService:confirm to cancel the authorization of {path}'),
      onOk: () => {
        const { authedApiDataSource, selectedConsumerId } = this.state;
        const authedApis = authedApiDataSource.map((item) => item.apiId).filter((item) => item !== apiId);
        const param = {
          consumerId: selectedConsumerId,
          apiList: authedApis,
        };
        this.props.saveConsumerApi(param);
      },
    });
  };

  toggleUserModal = () => {
    this.setState({
      userModalVisible: !this.state.userModalVisible,
    });
  };

  toggleKeyAuthModal = () => {
    this.setState({
      keyAuthModalVisible: !this.state.keyAuthModalVisible,
    });
  };

  toggleOAuthModal = () => {
    this.setState({
      oAuthModalVisible: !this.state.oAuthModalVisible,
    });
  };

  handleSaveUser = ({ consumerName }: any) => {
    this.props.createConsumer({ consumerName });
    this.toggleUserModal();
  };

  handleDeleteKeyAuth = ({ id, key }: any) => {
    confirm({
      title: i18n.t('microService:confirm to delete'),
      content: `${i18n.t('microService:confirm to delete this parameter')}：${key}`,
      onOk: () => {
        const { authData } = this.props;
        const keyAuthData = authData.keyAuth.authData.filter((item: any) => item.id !== id);

        this.updateConsumerDetail({ keyAuthData });
      },
    });
  };

  handleAddKeyAuth = ({ key }: any) => {
    const { authData } = this.props;
    const keyAuthData = [...authData.keyAuth.authData, { key }];

    this.updateConsumerDetail({ keyAuthData, callback: this.toggleKeyAuthModal });
  };

  handleDeleteOAuth = ({ id, name }: any) => {
    confirm({
      title: i18n.t('microService:confirm deletion'),
      content: `${i18n.t('microService:confirm to delete this parameter')}：${name}`,
      onOk: () => {
        const { authData } = this.props;
        const oAuthData = authData.oAuth.authData.filter((item: any) => item.id !== id);

        this.updateConsumerDetail({ oAuthData });
      },
    });
  };

  handleAddOAuth = ({ redirect_uri, ...rest }: any) => {
    const { authData } = this.props;
    const oAuthData = [
      ...authData.oAuth.authData,
      {
        ...rest,
        redirect_uri: redirect_uri ? `${this.state.protocol}${redirect_uri}` : undefined,
      },
    ];

    this.updateConsumerDetail({ oAuthData, callback: this.toggleOAuthModal });
  };

  handleSearchUnAuthApi = (query: string): any => {
    const { getNeedAuthAPIList } = this.props;
    if (!query) {
      return getNeedAuthAPIList({ isResetNull: true });
    }
    getNeedAuthAPIList({ filters: { apiPath: query }, pageNo: 1 });
  };

  handleTableChange = (pagination: any) => {
    this.props.getNeedAuthAPIList({ pageNo: pagination.current });
  };

  updateConsumerDetail = ({ keyAuthData, oAuthData, callback }: any) => {
    const { authData, updateConsumerDetail } = this.props;
    const data = {
      authConfig: {
        auths: [
          {
            authType: 'key-auth',
            authData: {
              data: keyAuthData || authData.keyAuth.authData,
            },
          },
          {
            authType: 'oauth2',
            authData: {
              data: oAuthData || authData.oAuth.authData,
            },
          },
        ],
      },
    };

    updateConsumerDetail({ data, consumerId: this.state.selectedConsumerId });
    callback && callback();
  };

  handlePolicyChange = (record: any, value: string) => {
    const { authedApiDataSource } = this.state;
    const params = authedApiDataSource.map((row) => {
      const policy = row.id === record.id ? [value] : null;
      if (policy) {
        return { consumerApiId: row.id, policies: policy };
      } else {
        return { consumerApiId: row.id, policies: row.rateLimitPolicy ? [row.rateLimitPolicy.policyId] : [] };
      }
    });
    this.props.saveConsumerApiPolicy({ list: params });
  };

  renderAuthParamsContent() {
    const { authData } = this.props;
    return (
      <div className="auth-params-content">
        <div className="auth-type-item">
          <div className="flex-box mb12">
            <div className="auth-params-title nowrap flex-1">
              Key-Auth {i18n.t('mode')}
              <span className="fz12">（{authData.keyAuth.authTips}）</span>
            </div>
            <Button type="primary" ghost size="small" onClick={this.toggleKeyAuthModal}>
              {i18n.t('add')}
            </Button>
          </div>
          <Table dataSource={authData.keyAuth.authData} columns={this.keyAuthCols} rowKey="id" pagination={false} />
        </div>
        <div className="auth-type-item">
          <div className="flex-box mb12">
            <div className="auth-params-title flex-1">OAuth {i18n.t('mode')}</div>
            <Button type="primary" ghost size="small" onClick={this.toggleOAuthModal}>
              {i18n.t('add')}
            </Button>
          </div>
          <Table dataSource={authData.oAuth.authData} columns={this.oAuthCols} rowKey="id" pagination={false} />
        </div>
      </div>
    );
  }

  renderAuthApiContent() {
    const { needAuthApiList, needAuthApiPaging, isFetchingNeedAuthAPIList } = this.props;
    const { pageNo, pageSize, total } = needAuthApiPaging;
    return (
      <div className="auth-api-content">
        <div className="auth-type-item">
          <h3 className="auth-params-title">
            {i18n.t('microService:authorized interface (configurable flow control policy)')}
          </h3>
          <Table
            dataSource={this.state.authedApiDataSource}
            columns={this.userAuthedApiCols}
            rowKey="apiId"
            pagination={false}
          />
        </div>
        <div className="auth-type-item">
          <h3 className="auth-params-title">{i18n.t('microService:find the authorization interface')}</h3>
          <SearchTable
            onSearch={this.handleSearchUnAuthApi}
            placeholder={i18n.t('microService:please enter API to search')}
            needDebounce
          >
            <Table
              loading={isFetchingNeedAuthAPIList}
              dataSource={needAuthApiList}
              columns={this.userUnAuthApiCols}
              rowKey="apiId"
              pagination={{
                current: pageNo,
                pageSize,
                total,
              }}
              onChange={this.handleTableChange}
            />
          </SearchTable>
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    // didMount: ['getConsumer', 'getConsumerList', 'getAPIList', 'getPolicyList'],
    this.props.getConsumer();
    this.props.getConsumerList();
    this.props.getAPIList();
    this.props.getPolicyList({ category: 'trafficControl' });
  }

  render() {
    const {
      userModalVisible,
      authParamsVisible,
      authApiVisible,
      keyAuthModalVisible,
      oAuthModalVisible,
      editingConsumer: { config },
      consumerList,
    } = this.state;
    const {
      trafficControlPolicy,
      consumer: { endpoint },
      isFetching,
    } = this.props;
    const { policyList } = trafficControlPolicy;

    this.policyList = [{ displayName: i18n.t('none'), policyId: '' }, ...(policyList || [])];
    let configKey;
    let configValue;
    if (config) {
      const configObj = JSON.parse(config);
      [configKey] = keys(configObj);
      [configValue] = values(configObj);
    }

    return (
      <div className="invoker-auth">
        <Spin spinning={isFetching}>
          <div className="top-button-group">
            <DomainChecker {...endpoint} />
            <Button type="primary" className="add-btn" onClick={this.handleAddUser}>
              {i18n.t('add')}
            </Button>
          </div>
          <Table dataSource={consumerList} columns={this.invokerAuthCols} rowKey="consumerName" />
        </Spin>

        <FormModal
          width="600px"
          name={i18n.t('user')}
          fieldsList={this.userFormList}
          visible={userModalVisible}
          onOk={this.handleSaveUser}
          onCancel={this.toggleUserModal}
        />

        <FormModal
          name=" KEY"
          fieldsList={this.keyAuthFieldsList}
          visible={keyAuthModalVisible}
          onOk={this.handleAddKeyAuth}
          onCancel={this.toggleKeyAuthModal}
        />

        <FormModal
          name=" OAuth"
          fieldsList={this.oAuthFieldsList}
          visible={oAuthModalVisible}
          onOk={this.handleAddOAuth}
          onCancel={this.toggleOAuthModal}
        />

        <Drawer
          title={i18n.t('microService:authorization parameters')}
          visible={authParamsVisible}
          onClose={this.handleCancelAuthParams}
          width="50%"
          destroyOnClose
        >
          {this.renderAuthParamsContent()}
        </Drawer>

        <Drawer
          title={i18n.t('microService:authorization interface')}
          visible={authApiVisible}
          onClose={this.handleCancelAuthApi}
          width="50%"
          destroyOnClose
        >
          {this.renderAuthApiContent()}
        </Drawer>
      </div>
    );
  }
}

export default InvokerAuthorization;
