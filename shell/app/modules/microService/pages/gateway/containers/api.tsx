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
import { reduce, map, keys, isEqual, isEmpty, get, find } from 'lodash';
import { PagingTable, IF, DeleteConfirm, connectCube } from 'common';
import { notify, goTo, qs } from 'common/utils';
import { Select, Button, Input, Modal } from 'app/nusi';
import { apiCols, HTTP_METHODS, SORT_FIELDS, SORT_TYPES } from '../config';
import { DomainChecker } from '../components/domain-checker';
import SwaggerDoc from 'microService/pages/gateway/containers/api-doc';
import apiMonitorFilterStore from 'api-insight/stores/filter';
import i18n from 'i18n';
import AddApiModal from 'microService/pages/gateway/components/add-api-modal';
import './api.scss';
import gatewayStore from 'microService/stores/gateway';
import microServiceStore from 'microService/stores/micro-service';
import routeInfoStore from 'common/stores/route';

const { updateSearchFields } = apiMonitorFilterStore.reducers;
const { Option } = Select;
const { confirm } = Modal;

interface IProps {
  params: any;
  query: any;
  filters: GATEWAY.ApiFilter;
  consumer: { endpoint: any };
  apiList: any,
  registerApps: any[],
  apiDomain: { domainPrefix: string, domainSuffix: string };
  isK8S: boolean;
  runtimeEntryData: { diceApp: string, services: any[] };
  getServiceRuntime: typeof gatewayStore.effects.getServiceRuntime;
  getList: typeof gatewayStore.effects.getAPIList;
  clearList: typeof gatewayStore.reducers.cleanAPIList;
  getDeployedBranches: typeof gatewayStore.effects.getDeployedBranches;
  getConsumer: typeof gatewayStore.effects.getConsumer;
  getPolicyList: typeof gatewayStore.effects.getPolicyList;
  deleteAPI: typeof gatewayStore.effects.deleteAPI;
  updateFilters: typeof gatewayStore.effects.updateFilters;
  getRuntimeDetail: typeof gatewayStore.effects.getRuntimeDetail;
  getGatewayAddonInfo: typeof gatewayStore.effects.getGatewayAddonInfo;
  getApiDomain: typeof gatewayStore.effects.getApiDomain;
  saveApiDomain: typeof gatewayStore.effects.saveApiDomain;
  clearApiFilter: typeof gatewayStore.reducers.clearApiFilter;
}
interface IState {
  modalVisible: boolean;
  serviceAddressMap: {};
  apiPathPrefix: string;
  currentService: string | undefined;
  serviceList: string[];
  diceApp: string | undefined;
  isRuntimeEntry: boolean;
  customDomain: string;
  prevProps: IProps;
  runtimeList: any[];
  chosenRuntimeId: string;
  apiDocVisible: boolean;
  swagger: Record<string, any>;
  dataSource: any;
  hash: ReturnType<typeof qs>;
}

const extractServiceList = ({ services }: any) => {
  return reduce(services, (result, value, key) => {
    // eslint-disable-next-line no-param-reassign
    result[key] = value.addrs[0] || '';
    return result;
  }, {});
};

class API extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      modalVisible: false,
      dataSource: {},
      serviceAddressMap: {},
      currentService: undefined,
      diceApp: undefined,
      apiPathPrefix: '',
      isRuntimeEntry: false,
      serviceList: [],
      customDomain: '',
      prevProps: {} as any,
      runtimeList: [] as any[],
      chosenRuntimeId: undefined,
      apiDocVisible: false,
      swagger: {} as Record<string, any>,
      hash: qs.parse(location.hash),
    };
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const nextState = { ...prevState, prevProps: nextProps };
    if (!isEqual(nextProps.apiDomain, prevState.prevProps.apiDomain)) {
      nextState.customDomain = nextProps.apiDomain.domainPrefix;
    }
    if (!isEqual(prevState.prevProps.runtimeEntryData, nextProps.runtimeEntryData)) {
      const { diceApp, services } = nextProps.runtimeEntryData;
      const serviceAddressMap = extractServiceList({ services });
      nextState.diceApp = diceApp;
      nextState.serviceAddressMap = serviceAddressMap;
      nextState.currentService = keys(serviceAddressMap)[0];
      nextState.serviceList = keys(serviceAddressMap);
    }
    return nextState;
  }

  componentDidMount = () => {
    const { getConsumer, query, runtimeEntryData } = this.props;
    const { runtimeId, appId } = query;
    if (runtimeId && appId) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isRuntimeEntry: true, chosenRuntimeId: runtimeId }, () => {
        if (!isEmpty(runtimeEntryData)) {
          const { diceApp, services } = runtimeEntryData;
          const serviceAddressMap = extractServiceList({ services });
          const nextState = { diceApp, serviceAddressMap, currentService: keys(serviceAddressMap)[0], serviceList: keys(serviceAddressMap) };
          this.setState({ ...nextState }, () => {
            this.queryApis();
            this.getRuntimes();
          });
          // getApiDomain({ diceApp, diceService: keys(serviceAddressMap)[0] });
        }
      });
    } else {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isRuntimeEntry: false }, () => this.queryApis());
    }

    getConsumer().then(() => this.initApiData(this.props));
    this.handleQueryJump();
  };

  async componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { runtimeEntryData } = this.props;
    const { currentService } = this.state;
    if (!isEmpty(runtimeEntryData) && !isEqual(runtimeEntryData, prevProps.runtimeEntryData)) {
      this.queryApis();
      // getApiDomain({ diceApp, diceService: keys(serviceAddressMap)[0] });
    }
    const preCurrentService = prevState.currentService;
    if (preCurrentService !== currentService) {
      await this.getRuntimes();
      this.queryApis();
    }
  }

  initApiData = (props: IProps) => {
    const { getPolicyList } = props;

    setTimeout(() => {
      getPolicyList({ category: 'trafficControl' });
      getPolicyList({ category: 'auth' });
    }, 100);
  };

  handleQueryJump = () => {
    const { hash } = this.state;
    if (hash.redirectApp && hash.redirectService && hash.redirectRuntimeId) {
      this.toggleModal();
      this.setState({
        diceApp: hash.redirectApp,
        currentService: hash.redirectService,
        chosenRuntimeId: hash.redirectRuntimeId,
      });
      this.setApp(hash.redirectApp);
      this.setService(hash.redirectService);
      this.setRuntime(hash.redirectRuntimeId);
      goTo(goTo.pages.apiManage, { ...this.props.params, replace: true });
    }
  };

  queryApis = (params?: { isReset?: boolean; pageNo?: any; pageSize?: any; }) => {
    const { getList, filters, isK8S } = this.props;
    const { diceApp, currentService, chosenRuntimeId } = this.state;
    const { isReset, pageNo = 1, pageSize = 10 } = params || {};
    if ((isK8S && diceApp && currentService && chosenRuntimeId) || !isK8S) {
      // @ts-ignore
      getList({
        filters: isReset ? {} : filters,
        diceService: currentService,
        diceApp,
        runtimeId: chosenRuntimeId,
        pageNo,
        pageSize,
        // from: isRuntimeEntry ? 'runtime' : 'platform',
      });
    }
  };

  onDelete = ({ apiId }: any) => {
    const { currentService, diceApp } = this.state;
    let payload: any = { apiId };
    if (currentService && diceApp) {
      payload = { ...payload, diceApp, diceService: currentService };
    }
    this.props.deleteAPI(payload).then(() => this.queryApis());
  };

  toggleModal = (data?: any) => {
    this.setState({
      modalVisible: !this.state.modalVisible,
      dataSource: data,
    });
    // 新建 API 获取 API path 前缀
    // if (!this.state.modalVisible && !data) {
    // const { currentService, diceApp } = this.state;
    // const { getGatewayAddonInfo, apiDomain } = this.props;
    // getGatewayAddonInfo().then(({ projectName }) => {
    //   this.setState({
    //     apiPathPrefix: apiDomain.domainPrefix ? '/' : diceApp && currentService && isRuntimeEntry ? `/${projectName}/${diceApp}/${currentService}/` : `/${projectName}/`,
    //   });
    // });
    // }
  };

  setRegisterType = (type: string) => {
    const { updateFilters, filters } = this.props;
    updateFilters({ ...filters, registerType: type });
  };

  // setNetType = (type: string) => {
  //   const { updateFilters, filters } = this.props;
  //   updateFilters({ ...filters, netType: type });
  // }

  setMethod = (method: string) => {
    const { updateFilters, filters } = this.props;
    updateFilters({ ...filters, method });
  };

  setSortBy = (type = '') => {
    const { updateFilters, filters } = this.props;
    const [sortField, sortType] = type.split('-');
    updateFilters({ ...filters, sortField, sortType });
  };

  setQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updateFilters, filters } = this.props;
    updateFilters({ ...filters, apiPath: e.target.value });
  };

  resetConditions = () => {
    const { updateFilters, clearList, isK8S } = this.props;
    updateFilters({
      registerType: undefined,
      netType: undefined,
      apiPath: undefined,
      method: undefined,
      sortField: undefined,
      sortType: undefined,
    });

    if (isK8S) {
      this.setState({ // k8s的时候，只重置以下两个参数，不充值diceApp（查询必要条件）
        currentService: undefined,
        chosenRuntimeId: undefined,
      } as any, () => this.queryApis({ isReset: true }));
      return;
    }
    clearList();
    this.setState({
      currentService: undefined,
      diceApp: undefined,
      chosenRuntimeId: undefined,
    } as any, () => this.queryApis({ isReset: true }));
  };

  getRuntimes = async () => {
    const { getServiceRuntime } = this.props;
    const { diceApp, currentService, chosenRuntimeId } = this.state;
    diceApp && currentService && await getServiceRuntime({ app: diceApp, service: currentService }).then((res) => {
      let reRuntime = '';
      if (chosenRuntimeId && find(res, { runtime_id: chosenRuntimeId })) {
        reRuntime = chosenRuntimeId as any as string;
      } else {
        reRuntime = get(res, '[0].runtime_id');
      }
      this.setState({ runtimeList: res, chosenRuntimeId: reRuntime });
    });
  };

  searchApis = () => {
    this.queryApis();
  };

  setRuntime = (runtimeId: string) => {
    this.setState({ chosenRuntimeId: runtimeId }, this.queryApis);
  };

  setService = (service: string) => {
    this.setState({ currentService: service });
    // this.props.getApiDomain({ diceApp: this.state.diceApp, diceService: service });
  };

  setApp = (app: string) => {
    const currentApp = this.props.registerApps.find(rApp => rApp.name === app);
    this.setState({ diceApp: app, serviceList: currentApp.services, currentService: currentApp.services[0] });
  };

  checkDomainInput = () => {
    const { customDomain } = this.state;
    const regex = /^([a-z0-9*]+[.-]?)+[a-z0-9*]$/g;
    return customDomain.match(regex);
  };

  onChangeDomain = (value: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ customDomain: value.target.value });
  };

  onSaveDomain = () => {
    if (!this.checkDomainInput()) {
      notify('error', i18n.t('microService:a domain name can only contain numbers, lowercase letters, *, -'));
      return;
    }

    const { diceApp, currentService } = this.state;
    const { saveApiDomain, apiDomain } = this.props;
    saveApiDomain({
      domainSuffix: apiDomain.domainSuffix,
      domainPrefix: this.state.customDomain,
      diceApp,
      diceService: currentService,
    }).then(() => this.queryApis());
  };

  onJumpToAnalysis = (record: any) => {
    const { diceApp, currentService } = this.state;
    const { params, query } = this.props;
    const { monitorPath, method } = record;
    updateSearchFields({ filter_dapp: diceApp, filter_dsrv: currentService, filter_mthd: method, filter_api: monitorPath });
    goTo(goTo.pages.monitorAPIOverview, { ...params, ...query });
  };

  showDoc = ({ swagger }: {swagger: Record<string, any>}) => {
    this.setState({
      swagger,
      apiDocVisible: true,
    });
  };

  closeDoc = () => {
    this.setState({
      swagger: {},
      apiDocVisible: false,
    });
  };

  filterAppOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  renderSearchConditions = () => {
    const { filters, registerApps, apiDomain, isK8S } = this.props;
    const { isRuntimeEntry, diceApp, currentService, serviceList, customDomain, runtimeList, chosenRuntimeId } = this.state;
    const { registerType, apiPath, method, sortType, sortField } = filters;
    const appSource = registerApps.map(app => app.name);
    const { domainSuffix, domainPrefix } = apiDomain;

    return (
      <div className="condition-nav flex-box">
        <div className="app-services-container mb16">
          <div className={`mr16 ${isRuntimeEntry ? 'hide' : ''}`}>
            <span>{i18n.t('microService:switch app')}：</span>
            <Select className="api-select" placeholder={i18n.t('microService:filter by application')} value={diceApp} onChange={this.setApp} showSearch filterOption={this.filterAppOption} style={{ width: 200 }}>
              {map(appSource, (appName, key) => <Option key={key} value={appName} title={appName}>{appName}</Option>)}
            </Select>
          </div>
          <div className="mr20">
            <span>{i18n.t('microService:switch service')}：</span>
            <Select className="api-select" placeholder={i18n.t('microService:filter by service')} value={currentService} onChange={this.setService} showSearch>
              {map(serviceList, (serviceName, key) => <Option key={key} value={serviceName}>{serviceName}</Option>)}
            </Select>
          </div>
          <div className="mr20">
            <span>{i18n.t('microService:switch deployed branch')}：</span>
            <Select className="api-select" placeholder={i18n.t('microService:filter by branch')} value={chosenRuntimeId} onChange={this.setRuntime}>
              {map(runtimeList, ({ runtime_name, runtime_id }) => <Option key={runtime_id} value={runtime_id}>{runtime_name}</Option>)}
            </Select>
          </div>
          <IF check={isK8S && currentService}>
            <div className={`${domainSuffix ? '' : 'hide'}`}>
              <span>{i18n.t('microService:custom domain name')}：</span>
              <Input className="address-input mr4" spellCheck={false} value={customDomain} onChange={this.onChangeDomain} />
              <span>{domainSuffix}</span>
              <IF check={domainPrefix && domainPrefix !== customDomain}>
                <DeleteConfirm title={i18n.t('microService:ok update operation')} secondTitle={`${i18n.t('microService:will the current service domain name')}: ${domainPrefix} 修改为：${customDomain}`} onConfirm={this.onSaveDomain}>
                  <Button className="ml12" type="primary" disabled={!customDomain}>{i18n.t('microService:determine')}</Button>
                </DeleteConfirm>
                <IF.ELSE />
                <Button className="ml12" type="primary" disabled={!customDomain || domainPrefix === customDomain} onClick={this.onSaveDomain}>{i18n.t('microService:determine')}</Button>
              </IF>
            </div>
          </IF>
        </div>
        <div className="flex-box mb16">
          <div className="search-fields flex-box">
            <Select allowClear className="api-select mr20" placeholder={i18n.t('microService:filter by registration type')} value={registerType} onChange={this.setRegisterType}>
              <Option value="auto">{i18n.t('microService:automatic registration')}</Option>
              <Option value="manual">{i18n.t('microService:manual registration')}</Option>
            </Select>
            {/* <Select allowClear className="api-select mr20" placeholder={i18n.t('microService:filter by network type')} value={netType} onChange={this.setNetType}>
              <Option value="inner">{i18n.t('microService:internal network')}</Option>
              <Option value="outer">{i18n.t('microService:external network')}</Option>
            </Select> */}
            <Select allowClear className="api-select mr20" placeholder={i18n.t('microService:filter by calling method')} value={method} onChange={this.setMethod}>
              {HTTP_METHODS.map(item => <Option key={item.name} value={item.value}>{item.name}</Option>)}
            </Select>
            <Select
              allowClear
              className="api-select mr20"
              placeholder={i18n.t('microService:select sort by')}
              value={sortField && sortType ? `${sortField}-${sortType}` : undefined}
              onChange={this.setSortBy}
            >
              {
                SORT_FIELDS.map((field) => {
                  return SORT_TYPES.map((type) => {
                    return (
                      <Option key={field.value} value={`${field.value}-${type.value}`}>
                        {`${field.name}-${type.name}`}
                      </Option>
                    );
                  });
                })
              }
            </Select>
            <Input allowClear className="api-search-input" placeholder={i18n.t('microService:please enter api lookup')} value={apiPath} onChange={this.setQuery} />
          </div>
          <span className="api-btn-group ml20">
            <Button className="mr8" onClick={this.resetConditions}>{i18n.t('microService:reset')}</Button>
            <Button type="primary" ghost onClick={this.searchApis}>{i18n.t('search')}</Button>
          </span>
        </div>
      </div>
    );
  };

  componentWillUnmount(): void {
    this.props.clearApiFilter();
  }

  render() {
    const { apiList, consumer: { endpoint }, isK8S } = this.props;
    const { modalVisible, serviceAddressMap, currentService, isRuntimeEntry, apiPathPrefix, apiDocVisible, swagger } = this.state;
    const { result: dataSource, page: { totalNum: total } } = apiList;

    // const monitorPage = runtimeId ? goTo.pages.monitorAPIOverviewWithApp : goTo.pages.monitorAPIOverview;
    const columns = [
      ...apiCols,
      {
        title: i18n.t('operations'),
        width: 170,
        render: (record: any) => (
          <div className="table-operations">
            {/* <span
              className="table-operations-btn"
              onClick={() => goTo(
                monitorPage,
                {
                  runtimeId,
                  appId,
                  path: record.path,
                  method: record.method,
                  env: params.env,
                  projectId: params.projectId,
                  instanceId: params.insId,
                }
              )}
            >
              监控
            </span> */}
            <span className="table-operations-btn" onClick={() => this.toggleModal(record)}>{i18n.t('microService:edit')}</span>
            <span
              className="table-operations-btn"
              onClick={() => confirm({
                title: i18n.t('microService:confirm deletion?'),
                onOk: () => this.onDelete(record),
              })}
            >
              {i18n.t('microService:delete')}
            </span>
            <span className="table-operations-btn" onClick={() => this.onJumpToAnalysis(record)}>{i18n.t('microService:analysis')}</span>
            {
              record.swagger ? <span className="table-operations-btn" onClick={() => this.showDoc(record)}>{i18n.t('microService:document')}</span> : null
            }
          </div>
        ),
      },
    ];

    return (
      <>
        <div className="top-button-group">
          { !isK8S ? <DomainChecker {...endpoint} /> : null }
          <Button
            type="primary"
            className="add-btn"
            disabled={isK8S && !this.state.chosenRuntimeId}
            onClick={() => this.toggleModal()}
          >
            {i18n.t('microService:add {scope} API', { scope: i18n.t('microService:service') })}
          </Button>
        </div>
        {this.renderSearchConditions()}
        <PagingTable
          {...this.props}
          isForbidInitialFetch
          dataSource={dataSource}
          total={total}
          columns={columns}
          rowKey="apiId"
          getList={this.queryApis}
        />

        <AddApiModal
          key={String(modalVisible)}
          apiPathPrefix={apiPathPrefix}
          currentService={currentService}
          diceApp={this.state.diceApp}
          chosenRuntimeId={this.state.chosenRuntimeId}
          dataSource={this.state.dataSource}
          modalVisible={modalVisible}
          isRuntimeEntry={isRuntimeEntry}
          serviceAddressMap={serviceAddressMap}
          onCancel={this.toggleModal}
          afterSubmit={this.queryApis}
        />
        <SwaggerDoc visible={apiDocVisible} data={swagger} onClose={this.closeDoc} />
      </>
    );
  }
}

const mapper = () => {
  const [consumer, apiList, filters, registerApps, apiDomain, runtimeEntryData] = gatewayStore.useStore(s => [s.consumer, s.apiList, s.filters, s.registerApps, s.apiDomain, s.runtimeEntryData]);
  const isK8S = microServiceStore.useStore(s => s.isK8S);
  const [params, query] = routeInfoStore.useStore(s => [s.params, s.query]);
  const { getServiceRuntime, getConsumer, getPolicyList, getAPIList: getList, getRuntimeDetail, deleteAPI, updateFilters, getGatewayAddonInfo, getApiDomain, saveApiDomain, getDeployedBranches } = gatewayStore.effects;
  const { cleanAPIList: clearList, clearApiFilter } = gatewayStore.reducers;
  return {
    consumer,
    apiList,
    filters,
    registerApps,
    apiDomain,
    runtimeEntryData,
    isK8S,
    params,
    query,
    getServiceRuntime,
    getConsumer,
    getPolicyList,
    getList,
    getRuntimeDetail,
    deleteAPI,
    updateFilters,
    getGatewayAddonInfo,
    getApiDomain,
    saveApiDomain,
    getDeployedBranches,
    clearList,
    clearApiFilter,
  };
};

export default connectCube(API, mapper);

