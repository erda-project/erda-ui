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
import { Input, Button, InputNumber, Collapse, Switch } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { isEmpty } from 'lodash';
import { useUpdate, IF } from 'common';
import { useMount } from 'react-use';
import i18n from 'i18n';
import './gateway-policy.scss';
import routeInfoStore from 'app/common/stores/route';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';

const { Panel } = Collapse;
// @ts-ignore
const { Group: InputGroup, TextArea } = Input;

export const PureBusinessPolicy = () => {
  const query = routeInfoStore.useStore((s) => s.query);
  const hasGlobalSwitch = !!query.apiId;
  const [businessProxyEnable, setBusinessProxyEnable] = React.useState(false);
  const [sslRedirect, setSslRedirect] = React.useState(false);
  const [hostPassthrough, setHostPassthrough] = React.useState();
  const [reqBuffer, setReqBuffer] = React.useState();
  const [respBuffer, setRespBuffer] = React.useState();
  const [clientReqLimit, setClientReqLimit] = React.useState();
  const [clientReqTimeout, setClientReqTimeout] = React.useState();
  const [clientRespTimeout, setClientRespTimeout] = React.useState();
  const [proxyConnTimeout, setProxyConnTimeout] = React.useState();
  const [proxyReqTimeout, setProxyReqTimeout] = React.useState();
  const [proxyRespTimeout, setProxyRespTimeout] = React.useState();
  const [businessCorsEnable, setBusinessCorsEnable] = React.useState(false);
  const [methods, setMethods] = React.useState();
  const [headers, setHeaders] = React.useState();
  const [origin, setOrigin] = React.useState();
  const [credentials, setCredentials] = React.useState();
  const [maxAge, setMaxAge] = React.useState();
  const [businessCustomEnable, setBusinessCustomEnable] = React.useState(false);
  const [config, setConfig] = React.useState();

  const [state, updater] = useUpdate({
    enableGlobalBusinessProxy: false,
    enableGlobalBusinessCors: false,
    enableGlobalBusinessCustom: false,
    globalBusinessProxy: {},
    globalBusinessCors: {},
    globalBusinessCustom: {},
  });

  const {
    enableGlobalBusinessProxy,
    enableGlobalBusinessCors,
    enableGlobalBusinessCustom,
    globalBusinessProxy,
    globalBusinessCors,
    globalBusinessCustom,
  } = state;

  const [businessCors, businessCustom, businessProxy] = gatewayStore.useStore((s) => [
    s.businessCors,
    s.businessCustom,
    s.businessProxy,
  ]);
  const {
    getBusinessCors,
    getBusinessCustom,
    getBusinessProxy,
    saveBusinessCors,
    saveBusinessCustom,
    saveBusinessProxy,
  } = gatewayStore.effects;
  const [isSavingBusinessProxy, isSavingBusinessCors, isSavingBusinessCustom] = useLoading(gatewayStore, [
    'saveBusinessProxy',
    'saveBusinessCors',
    'saveBusinessCustom',
  ]);
  useMount(() => {
    hasGlobalSwitch && getPolicies();
    getGlobalPolicies();
  });

  React.useEffect(() => {
    if (!isEmpty(businessProxy) || !isEmpty(globalBusinessProxy)) {
      const mixed = hasGlobalSwitch
        ? enableGlobalBusinessProxy
          ? { ...businessProxy, ...globalBusinessProxy }
          : businessProxy
        : globalBusinessProxy;
      setBusinessProxyEnable(mixed.switch);
      setHostPassthrough(mixed.hostPassthrough);
      setSslRedirect(mixed.sslRedirect);
      setReqBuffer(mixed.reqBuffer);
      setRespBuffer(mixed.respBuffer);
      setClientReqLimit(mixed.clientReqLimit);
      setClientReqTimeout(mixed.clientReqTimeout);
      setClientRespTimeout(mixed.clientRespTimeout);
      setProxyConnTimeout(mixed.proxyConnTimeout);
      setProxyReqTimeout(mixed.proxyReqTimeout);
      setProxyRespTimeout(mixed.proxyRespTimeout);
    }
  }, [businessProxy, globalBusinessProxy, enableGlobalBusinessProxy, hasGlobalSwitch]);

  React.useEffect(() => {
    if (!isEmpty(businessCors) || !isEmpty(globalBusinessCors)) {
      const mixed = hasGlobalSwitch
        ? enableGlobalBusinessCors
          ? { ...businessCors, ...globalBusinessCors }
          : businessCors
        : globalBusinessCors;
      setBusinessCorsEnable(mixed.switch);
      setMethods(mixed.methods);
      setHeaders(mixed.headers);
      setOrigin(mixed.origin);
      setCredentials(mixed.credentials);
      setMaxAge(mixed.maxAge);
    }
  }, [businessCors, globalBusinessCors, enableGlobalBusinessCors, hasGlobalSwitch]);

  React.useEffect(() => {
    if (!isEmpty(businessCustom) || !isEmpty(globalBusinessCustom)) {
      const mixed = hasGlobalSwitch
        ? enableGlobalBusinessCustom
          ? { ...businessCustom, ...globalBusinessCustom }
          : businessCustom
        : globalBusinessCustom;
      setBusinessCustomEnable(mixed.switch);
      setConfig(mixed.config);
    }
  }, [businessCustom, globalBusinessCustom, enableGlobalBusinessCustom, hasGlobalSwitch]);

  const getPolicies = () => {
    const apiQuery = { apiId: query.apiId };
    getBusinessProxy(apiQuery).then((data) => {
      updater.enableGlobalBusinessProxy(data.global);
    });
    getBusinessCors(apiQuery).then((data) => {
      updater.enableGlobalBusinessCors(data.global);
    });
    getBusinessCustom(apiQuery).then((data) => {
      updater.enableGlobalBusinessCustom(data.global);
    });
  };

  const getGlobalPolicies = () => {
    getBusinessProxy().then((data) => {
      updater.globalBusinessProxy(data);
    });
    getBusinessCors().then((data) => {
      updater.globalBusinessCors(data);
    });
    getBusinessCustom().then((data) => {
      updater.globalBusinessCustom(data);
    });
  };

  const getUpdatePayload = (payload: any) => {
    return { ...payload, apiId: query.apiId };
  };

  const handleUpdateBusinessProxy = () => {
    saveBusinessProxy(
      getUpdatePayload({
        switch: businessProxyEnable,
        sslRedirect,
        hostPassthrough,
        reqBuffer,
        respBuffer,
        clientReqLimit,
        clientReqTimeout,
        clientRespTimeout,
        proxyConnTimeout,
        proxyReqTimeout,
        proxyRespTimeout,
        global: enableGlobalBusinessProxy,
      }),
    );
  };

  const handleUpdateBusinessCors = () => {
    saveBusinessCors(
      getUpdatePayload({
        switch: businessCorsEnable,
        methods,
        headers,
        origin,
        credentials,
        maxAge,
        global: enableGlobalBusinessCors,
      }),
    );
  };

  const handleUpdateBusinessCustom = () => {
    saveBusinessCustom(
      getUpdatePayload({
        switch: businessCustomEnable,
        config,
        global: enableGlobalBusinessCustom,
      }),
    );
  };

  return (
    <div className="gateway-policy-section mb-8">
      <Collapse defaultActiveKey={['proxy', 'cors', 'custom']}>
        <Panel
          header={
            <div className="flex justify-between items-center">
              <span>{i18n.t('microService:traffic receive forwarding')}</span>
              <div className="switch-contaienr flex justify-between items-center">
                <span onClick={(e) => e.stopPropagation()} className=" mr-5">
                  {i18n.t('microService:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalBusinessProxy}
                    checkedChildren={i18n.t('microService:activated')}
                    unCheckedChildren={i18n.t('microService:not activated')}
                    checked={businessProxyEnable}
                    onChange={(checked) => setBusinessProxyEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('microService:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalBusinessProxy}
                      onChange={updater.enableGlobalBusinessProxy}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="proxy"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:force jump to HTTPS')}</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={sslRedirect}
                onChange={(checked: boolean) => setSslRedirect(checked)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:entry domain name passthrough')}</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={hostPassthrough}
                onChange={(checked) => setHostPassthrough(checked)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:open request buffer')}</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={reqBuffer}
                onChange={(checked) => setReqBuffer(checked)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:open response buffer')}</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={respBuffer}
                onChange={(checked) => setRespBuffer(checked)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:client request restrictions')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={clientReqLimit}
                  onChange={setClientReqLimit}
                />
                <span className="unit">MB</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:client request timed out')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={clientReqTimeout}
                  onChange={setClientReqTimeout}
                />
                <span className="unit">{i18n.t('microService:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:client response timed out')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={clientRespTimeout}
                  onChange={setClientRespTimeout}
                />
                <span className="unit">{i18n.t('microService:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          {/* <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:backend build timeout')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  min={0}
                  style={{ width: 150 }}
                  value={proxyConnTimeout}
                  onChange={setProxyConnTimeout}
                />
                <Select style={{ width: '30%' }} value="秒"><Option key="second">秒</Option></Select>
              </InputGroup>
            </div>
          </div> */}
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:backend request timeout')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={proxyReqTimeout}
                  onChange={setProxyReqTimeout}
                />
                <span className="unit">{i18n.t('microService:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:backend response timeout')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessProxy || !businessProxyEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={proxyRespTimeout}
                  onChange={setProxyRespTimeout}
                />
                <span className="unit">{i18n.t('microService:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button
              loading={isSavingBusinessProxy}
              type="primary"
              className="mr-4"
              onClick={() => handleUpdateBusinessProxy()}
            >
              {i18n.t('microService:submit')}
            </Button>
          </div>
        </Panel>
        <Panel
          header={
            <div className="flex justify-between items-center">
              <span>{i18n.t('microService:cross-domain access')}</span>
              <div className="switch-contaienr flex justify-between items-center">
                <span onClick={(e) => e.stopPropagation()} className=" mr-5">
                  {i18n.t('microService:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalBusinessCors}
                    checkedChildren={i18n.t('microService:activated')}
                    unCheckedChildren={i18n.t('microService:not activated')}
                    checked={businessCorsEnable}
                    onChange={(checked) => setBusinessCorsEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('microService:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalBusinessCors}
                      onChange={updater.enableGlobalBusinessCors}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="cors"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">HTTP {i18n.t('microService:method')}</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalBusinessCors || !businessCorsEnable}
                onChange={(e) => setMethods(e.target.value)}
                value={methods}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">HTTP {i18n.t('microService:request header')}</span>
            <div className="policy-content">
              <div className="policy-content">
                <TextArea
                  className="policy-input"
                  disabled={enableGlobalBusinessCors || !businessCorsEnable}
                  rows={4}
                  onChange={(e) => setHeaders(e.target.value)}
                  value={headers}
                />
              </div>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:cross-domain address')}</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalBusinessCors || !businessCorsEnable}
                onChange={(e) => setOrigin(e.target.value)}
                value={origin}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:carry')} cookie</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalBusinessCors || !businessCorsEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={credentials}
                onChange={(checked) => setCredentials(checked)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('microService:cache time')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalBusinessCors || !businessCorsEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={maxAge}
                  onChange={setMaxAge}
                />
                <span className="unit">{i18n.t('microService:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button
              loading={isSavingBusinessCors}
              type="primary"
              className="mr-4"
              onClick={() => handleUpdateBusinessCors()}
            >
              {i18n.t('microService:submit')}
            </Button>
          </div>
        </Panel>
        <Panel
          header={
            <div className="flex justify-between items-center">
              <span>{i18n.t('microService:custom nginx configuration')}</span>
              <div className="switch-contaienr flex justify-between items-center">
                <span onClick={(e) => e.stopPropagation()} className=" mr-5">
                  {i18n.t('microService:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalBusinessCustom}
                    checkedChildren={i18n.t('microService:activated')}
                    unCheckedChildren={i18n.t('microService:not activated')}
                    checked={businessCustomEnable}
                    onChange={(checked) => setBusinessCustomEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('microService:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalBusinessCustom}
                      onChange={updater.enableGlobalBusinessCustom}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="custom"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">nginx {i18n.t('microService:configuration')}</span>
            <div className="policy-content">
              <TextArea
                className="policy-input"
                value={config}
                disabled={enableGlobalBusinessCustom || !businessCustomEnable}
                rows={4}
                placeholder={i18n.t('microService:location block configuration')}
                onChange={(e) => setConfig(e.target.value)}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button
              loading={isSavingBusinessCustom}
              type="primary"
              className="mr-4"
              onClick={() => handleUpdateBusinessCustom()}
            >
              {i18n.t('microService:submit')}
            </Button>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export const BusinessPolicy = PureBusinessPolicy;
