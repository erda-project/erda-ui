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
import { Input, Select, Button, InputNumber, Collapse, Switch } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { isEmpty, map } from 'lodash';
import { IF, useUpdate } from 'common';
import { useMount } from 'react-use';
import { HTTP_METHODS } from '../config';
import i18n from 'i18n';
import routeInfoStore from 'app/common/stores/route';
import './gateway-policy.scss';
import gatewayStore from 'msp/stores/gateway';
import { useLoading } from 'app/common/stores/loading';

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { Group: InputGroup } = Input;

export const PureSafetyPolicy = () => {
  const query = routeInfoStore.useStore((s) => s.query);
  const hasGlobalSwitch = !!query.apiId;
  const [safetyWafEnable, setSafetyWafEnable] = React.useState();
  const [wafEnable, setWafEnable] = React.useState();
  const [removeRules, setRemoveRules] = React.useState();
  const [ipEnable, setIPEnable] = React.useState();
  const [ipSource, setIPSource] = React.useState();
  const [ipAclType, setIPAclType] = React.useState();
  const [ipAclList, setIPAclList] = React.useState([] as any[]);
  const [ipMaxConnections, setIPMaxConnections] = React.useState();
  const [ipRate, setIPRate] = React.useState({ rate: undefined, unit: 'qps' });
  const [serverGuardEnable, setServerGuardEnable] = React.useState();
  const [maxTps, setMaxTps] = React.useState();
  const [extraLatency, setExtraLatency] = React.useState();
  const [refuseCode, setRefuseCode] = React.useState();
  const [refuseResponse, setRefuseResponse] = React.useState();
  const [csrfEnable, setCsrfEnable] = React.useState();
  const [userCookie, setUserCookie] = React.useState();
  const [excludedMethod, setExcludedMethod] = React.useState();
  const [tokenName, setTokenName] = React.useState();
  const [tokenDomain, setTokenDomain] = React.useState();
  const [cookieSecure, setCookieSecure] = React.useState();
  const [validTTL, setValidTTL] = React.useState();
  const [refreshTTL, setRefreshTTL] = React.useState();
  const [errStatus, setErrStatus] = React.useState();
  const [errMsg, setErrMsg] = React.useState();

  const [state, updater] = useUpdate({
    globalWaf: {},
    globalIP: {},
    globalServerGuard: {},
    globalSafetyCsrf: {},
    enableGlobalWaf: false,
    enableGlobalIP: false,
    enableGlobalServerGuard: false,
    enableGlobalSafetyCsrf: false,
  });

  const {
    globalWaf,
    globalIP,
    globalServerGuard,
    globalSafetyCsrf,
    enableGlobalWaf,
    enableGlobalIP,
    enableGlobalServerGuard,
    enableGlobalSafetyCsrf,
  } = state;

  const [safetyWaf, safetyIP, safetyServerGuard, safetyCsrf] = gatewayStore.useStore((s) => [
    s.safetyWaf,
    s.safetyIP,
    s.safetyServerGuard,
    s.safetyCsrf,
  ]);
  const {
    getSafetyIP,
    getSafetyServerGuard,
    getSafetyCsrf,
    // saveSafetyWaf,
    saveSafetyIP,
    saveSafetyServerGuard,
    saveSafetyCsrf,
  } = gatewayStore.effects;
  const [isSavingSafetyCsrf, isSavingSafetyServerGuard, isSavingSafetyIP] = useLoading(gatewayStore, [
    'saveSafetyCsrf',
    'saveSafetyServerGuard',
    'saveSafetyIP',
  ]);
  useMount(() => {
    hasGlobalSwitch && getPolicies();
    getGlobalPolicies();
  });

  // 有appId：有全局开关、根据开关合并数据
  // 无appId：无全局开关、只要global数据
  React.useEffect(() => {
    if (!isEmpty(safetyWaf) || !isEmpty(globalWaf)) {
      const mixed = hasGlobalSwitch ? (enableGlobalWaf ? { ...safetyWaf, ...globalWaf } : safetyWaf) : globalWaf;
      setRemoveRules(mixed.removeRules);
      setWafEnable(mixed.wafEnable);
      setSafetyWafEnable(mixed.switch);
    }
  }, [safetyWaf, globalWaf, enableGlobalWaf, hasGlobalSwitch]);

  React.useEffect(() => {
    if (!isEmpty(safetyIP) || !isEmpty(globalIP)) {
      const mixed = hasGlobalSwitch ? (enableGlobalIP ? { ...safetyIP, ...globalIP } : safetyIP) : globalIP;
      setIPEnable(mixed.switch);
      setIPSource(mixed.ipSource);
      setIPAclType(mixed.ipAclType);
      setIPAclList(mixed.ipAclList || []);
      setIPMaxConnections(mixed.ipMaxConnections);
      setIPRate(mixed.ipRate || { rate: undefined, unit: 'qps' });
    }
  }, [safetyIP, globalIP, enableGlobalIP, hasGlobalSwitch]);

  React.useEffect(() => {
    if (!isEmpty(safetyServerGuard) || !isEmpty(globalServerGuard)) {
      const mixed = hasGlobalSwitch
        ? enableGlobalServerGuard
          ? { ...safetyServerGuard, ...globalServerGuard }
          : safetyServerGuard
        : globalServerGuard;
      setServerGuardEnable(mixed.switch);
      setMaxTps(mixed.maxTps);
      setExtraLatency(mixed.extraLatency);
      setRefuseCode(mixed.refuseCode);
      setRefuseResponse(mixed.refuseResponse);
    }
  }, [safetyServerGuard, globalServerGuard, enableGlobalServerGuard, hasGlobalSwitch]);

  React.useEffect(() => {
    if (!isEmpty(safetyCsrf) || !isEmpty(globalSafetyCsrf)) {
      const mixed = hasGlobalSwitch
        ? enableGlobalSafetyCsrf
          ? { ...safetyCsrf, ...globalSafetyCsrf }
          : safetyCsrf
        : globalSafetyCsrf;
      setCsrfEnable(mixed.switch);
      setUserCookie(mixed.userCookie);
      setExcludedMethod(mixed.excludedMethod);
      setTokenName(mixed.tokenName);
      setTokenDomain(mixed.tokenDomain);
      setCookieSecure(mixed.cookieSecure);
      setValidTTL(mixed.validTTL);
      setRefreshTTL(mixed.refreshTTL);
      setErrStatus(mixed.errStatus);
      setErrMsg(mixed.errMsg);
    }
  }, [safetyCsrf, globalSafetyCsrf, enableGlobalSafetyCsrf, hasGlobalSwitch]);

  const getPolicies = () => {
    const apiQuery = { apiId: query.apiId };
    // getSafetyWaf(apiQuery).then(data => {
    //   updater.enableGlobalWaf(data.global);
    // });
    getSafetyIP(apiQuery).then((data) => {
      updater.enableGlobalIP(data.global);
    });
    getSafetyServerGuard(apiQuery).then((data) => {
      updater.enableGlobalServerGuard(data.global);
    });
    getSafetyCsrf(apiQuery).then((data) => {
      updater.enableGlobalSafetyCsrf(data.global);
    });
  };

  const getGlobalPolicies = () => {
    // getSafetyWaf().then(data => {
    //   updater.globalWaf(data);
    // });
    getSafetyIP().then((data) => {
      updater.globalIP(data);
    });
    getSafetyServerGuard().then((data) => {
      updater.globalServerGuard(data);
    });
    getSafetyCsrf().then((data) => {
      updater.globalSafetyCsrf(data);
    });
  };

  const getUpdatePayload = (payload: any) => {
    // return apiPolicyLevel === 'project' ? payload : { ...payload, diceApp, diceService };
    return { ...payload, apiId: query.apiId };
  };

  // const handleUpdateSafetyWaf = () => {
  //   const payload = getUpdatePayload({
  //     wafEnable,
  //     removeRules,
  //     enable: safetyWafEnable,
  //     global: enableGlobalWaf,
  //   });
  //   saveSafetyWaf(payload);
  // };

  const handleUpdateSafetyIP = () => {
    const payload: any = getUpdatePayload({
      ipEnable,
      ipSource,
      ipAclType,
      ipAclList,
      ipMaxConnections,
      global: enableGlobalIP,
    });
    if (ipRate.rate) {
      payload.ipRate = ipRate;
    }
    saveSafetyIP(payload);
  };

  const handleUpdateSafetyServerGuard = () => {
    const payload = getUpdatePayload({
      serverGuardEnable,
      maxTps,
      extraLatency,
      refuseCode,
      refuseResponse,
      global: enableGlobalServerGuard,
    });
    saveSafetyServerGuard(payload);
  };

  const handleUpdateSafetyCsrf = () => {
    const payload = getUpdatePayload({
      csrfEnable,
      errMsg,
      errStatus,
      refreshTTL,
      validTTL,
      cookieSecure,
      userCookie,
      tokenName,
      tokenDomain,
      excludedMethod,
      global: enableGlobalSafetyCsrf,
    });
    saveSafetyCsrf(payload);
  };

  const handleSetIPAclList = (e: any) => {
    const result = e.target.value.replace(/[ |\r\n]+/g, '');
    setIPAclList(result ? result.split(',') : []);
  };

  // const onChangeRemovedRules = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setRemoveRules(event.target.value);
  // };
  return (
    <div className="safety-section mb32">
      <Collapse defaultActiveKey={['waf', 'ip', 'guard', 'csrf']}>
        {/* <Panel
          header={
            <div className="flex-box">
              <span>{i18n.t('msp:abnormal traffic interception')}</span>
              <IF check={hasGlobalSwitch}>
                <span onClick={e => e.stopPropagation()}>
                  {i18n.t('msp:use global strategy')}&nbsp;
                  <Switch
                    checkedChildren={<CustomIcon type="check" />}
                    unCheckedChildren={<CustomIcon type="close" />}
                    checked={enableGlobalWaf}
                    onChange={updater.enableGlobalWaf}
                  />
                </span>
              </IF>
            </div>
          }
          key="waf"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">
              {i18n.t('msp:enable rule')}
            </span>
            <Switch
              disabled={enableGlobalWaf}
              checkedChildren={i18n.t('msp:activated')}
              unCheckedChildren={i18n.t('msp:not activated')}
              checked={safetyWafEnable}
              onChange={checked => setSafetyWafEnable(checked)}
            />
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:traffic intercept switch')}</span>
            <div className="policy-content">
              <Select className="safety-select" disabled={enableGlobalWaf} value={wafEnable} onChange={(option: string) => setWafEnable(option)}>
                <Option key="watch" value="watch">{i18n.t('msp:observation mode')}</Option>
                <Option key="on" value="on">{i18n.t('msp:open')}</Option>
              </Select>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:remove rule')} ID</span>
            <div className="policy-content">
              <Input className="policy-input" disabled={enableGlobalWaf} spellCheck={false} onChange={onChangeRemovedRules} value={removeRules} placeholder={i18n.t('msp:input rule id separated by space')} />
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button
              loading={isSavingSafetyWaf}
              type="primary"
              className="ml12"
              onClick={() => handleUpdateSafetyWaf()}
            >
              {i18n.t('msp:submit')}
            </Button>
          </div>
        </Panel> */}
        <Panel
          header={
            <div className="flex-box">
              <span>{i18n.t('msp:IP blocking')}</span>
              <div className="switch-contaienr flex-box">
                <span onClick={(e) => e.stopPropagation()} className=" mr20">
                  {i18n.t('msp:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalIP}
                    checkedChildren={i18n.t('msp:activated')}
                    unCheckedChildren={i18n.t('msp:not activated')}
                    checked={ipEnable}
                    onChange={(checked) => setIPEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('msp:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalIP}
                      onChange={updater.enableGlobalIP}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="ip"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">
              {i18n.t('user')} IP {i18n.t('msp:source')}
            </span>
            <div className="policy-content">
              <Select
                className="ip-select"
                disabled={enableGlobalIP || !ipEnable}
                value={ipSource}
                onChange={setIPSource}
              >
                <Option key="remoteIp" value="remoteIp">
                  {i18n.t('msp:peer')} IP {i18n.t('msp:address')}
                </Option>
                <Option key="xRealIp" value="xRealIp">
                  {i18n.t('msp:request header')} x-real-ip
                </Option>
                <Option key="xForwardFor" value="xForwardFor">
                  {i18n.t('msp:request header')} x-forwarded-for
                </Option>
              </Select>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">IP {i18n.t('msp:black and white list')}</span>
            <div className="policy-content-group">
              <div className="policy-content mb16">
                <Select
                  className="safety-select"
                  disabled={enableGlobalIP || !ipEnable}
                  value={ipAclType}
                  onChange={setIPAclType}
                >
                  <Option key="black" value="black">
                    {i18n.t('msp:blacklist')}
                  </Option>
                  <Option key="white" value="white">
                    {i18n.t('msp:whitelist')}
                  </Option>
                </Select>
              </div>
              <div className="policy-content">
                <TextArea
                  disabled={enableGlobalIP || !ipEnable}
                  placeholder={i18n.t('msp:enter IP address, separated by comma')}
                  className="policy-input"
                  rows={4}
                  onChange={handleSetIPAclList}
                  value={ipAclList.join()}
                />
              </div>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:maximum concurrency')}</span>
            <div className="policy-content">
              <InputNumber
                disabled={enableGlobalIP || !ipEnable}
                min={0}
                value={ipMaxConnections}
                onChange={setIPMaxConnections}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:request speed limit')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalIP || !ipEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={ipRate.rate}
                  onChange={(rate: any) => {
                    setIPRate({ ...ipRate, rate });
                  }}
                  placeholder={i18n.t('msp:please key in numbers')}
                />
                <Select
                  disabled={enableGlobalIP || !ipEnable}
                  style={{ width: 150 }}
                  value={ipRate.unit}
                  onSelect={(unit: string) => {
                    setIPRate({ ...ipRate, unit });
                  }}
                >
                  <Option value="qps">{i18n.t('msp:times/second')}</Option>
                  <Option value="qpm">{i18n.t('msp:times/minute')}</Option>
                </Select>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button loading={isSavingSafetyIP} type="primary" onClick={() => handleUpdateSafetyIP()}>
              {i18n.t('msp:submit')}
            </Button>
          </div>
        </Panel>
        <Panel
          header={
            <div className="flex-box">
              <span>{i18n.t('msp:service load protection')}</span>
              <div className="switch-contaienr flex-box">
                <span onClick={(e) => e.stopPropagation()} className=" mr20">
                  {i18n.t('msp:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalServerGuard}
                    checkedChildren={i18n.t('msp:activated')}
                    unCheckedChildren={i18n.t('msp:not activated')}
                    checked={serverGuardEnable}
                    onChange={(checked) => setServerGuardEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('msp:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalServerGuard}
                      onChange={updater.enableGlobalServerGuard}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="guard"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:maximum throughput')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalServerGuard || !serverGuardEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={maxTps}
                  onChange={setMaxTps}
                  placeholder={i18n.t('msp:please key in numbers')}
                />
                <span className="unit">{i18n.t('msp:times/second')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:maximum extra delay')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalServerGuard || !serverGuardEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={extraLatency}
                  onChange={setExtraLatency}
                  placeholder={i18n.t('msp:millisecond(s)')}
                />
                <span className="unit">{i18n.t('msp:millisecond(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:reject status code')}</span>
            <div className="policy-content">
              <InputNumber
                disabled={enableGlobalServerGuard || !serverGuardEnable}
                min={0}
                value={refuseCode}
                onChange={setRefuseCode}
                placeholder={i18n.t('msp:please key in numbers')}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:refuse to answer')}</span>
            <div className="policy-content">
              <Input
                disabled={enableGlobalServerGuard || !serverGuardEnable}
                className="policy-input"
                onChange={(e) => setRefuseResponse(e.target.value)}
                value={refuseResponse}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button loading={isSavingSafetyServerGuard} type="primary" onClick={() => handleUpdateSafetyServerGuard()}>
              {i18n.t('msp:submit')}
            </Button>
          </div>
        </Panel>
        <Panel
          header={
            <div className="flex-box">
              <span>{i18n.t('msp:cross-site protection')}</span>
              <div className="switch-contaienr flex-box">
                <span onClick={(e) => e.stopPropagation()} className=" mr20">
                  {i18n.t('msp:enable rule')}&nbsp;
                  <Switch
                    disabled={enableGlobalSafetyCsrf}
                    checkedChildren={i18n.t('msp:activated')}
                    unCheckedChildren={i18n.t('msp:not activated')}
                    checked={csrfEnable}
                    onChange={(checked) => setCsrfEnable(checked)}
                  />
                </span>
                <IF check={hasGlobalSwitch}>
                  <span onClick={(e) => e.stopPropagation()}>
                    {i18n.t('msp:use global strategy')}&nbsp;
                    <Switch
                      checkedChildren={<CustomIcon type="check" />}
                      unCheckedChildren={<CustomIcon type="close" />}
                      checked={enableGlobalSafetyCsrf}
                      onChange={updater.enableGlobalSafetyCsrf}
                    />
                  </span>
                </IF>
              </div>
            </div>
          }
          key="csrf"
        >
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:identification')} cookie</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                onChange={(e) => setUserCookie(e.target.value)}
                value={userCookie}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">secure {i18n.t('msp:switch')}</span>
            <div className="policy-content">
              <Switch
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                checkedChildren={<CustomIcon type="check" />}
                unCheckedChildren={<CustomIcon type="close" />}
                checked={cookieSecure}
                onChange={(checked) => {
                  setCookieSecure(checked);
                }}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">token {i18n.t('msp:name')}</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                onChange={(e) => setTokenName(e.target.value)}
                value={tokenName}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">token {i18n.t('msp:domain name')}</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                onChange={(e) => setTokenDomain(e.target.value)}
                value={tokenDomain}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">token {i18n.t('msp:expire date')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalSafetyCsrf || !csrfEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={validTTL}
                  onChange={setValidTTL}
                  placeholder={i18n.t('msp:please key in numbers')}
                />
                <span className="unit">{i18n.t('msp:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">token {i18n.t('msp:update period')}</span>
            <div className="policy-content">
              <InputGroup compact>
                <InputNumber
                  disabled={enableGlobalSafetyCsrf || !csrfEnable}
                  min={0}
                  style={{ width: 150 }}
                  value={refreshTTL}
                  onChange={setRefreshTTL}
                  placeholder={i18n.t('msp:please key in numbers')}
                />
                <span className="unit">{i18n.t('msp:second(s)')}</span>
              </InputGroup>
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:failure status code')}</span>
            <div className="policy-content">
              <InputNumber
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                min={0}
                value={errStatus}
                onChange={setErrStatus}
                placeholder="请输入数字"
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:failed response')}</span>
            <div className="policy-content">
              <Input
                className="policy-input"
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                onChange={(e) => setErrMsg(e.target.value)}
                value={errMsg}
              />
            </div>
          </div>
          <div className="gateway-policy-item">
            <span className="policy-label">{i18n.t('msp:close verification')}</span>
            <div className="policy-content">
              <Select
                className="safety-select policy-input"
                disabled={enableGlobalSafetyCsrf || !csrfEnable}
                mode="multiple"
                value={excludedMethod}
                onChange={setExcludedMethod}
              >
                {map(HTTP_METHODS, ({ value, name }) => (
                  <Option key={value} value={value}>
                    {name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="gateway-policy-item">
            <Button loading={isSavingSafetyCsrf} type="primary" onClick={() => handleUpdateSafetyCsrf()}>
              {i18n.t('msp:submit')}
            </Button>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export const SafetyPolicy = PureSafetyPolicy;
