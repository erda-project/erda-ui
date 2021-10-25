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

import React, { useEffect } from 'react';
import { map, forEach, reduce, isEmpty } from 'lodash';
import i18n from 'i18n';
import { Icon as CustomIcon, Holder } from 'common';
import { useUpdate } from 'common/use-hooks';
import { useMount } from 'react-use';
import { Card, InputNumber, Button, Modal, Spin, message } from 'antd';
import { useLoading } from 'core/stores/loading';
import routeInfoStore from 'core/stores/route';
import zkproxyStore from '../../stores/zkproxy';

import './governance.scss';

const { confirm } = Modal;

const ENVS_MAP = {
  DEFAULT: i18n.t('common:default config'),
  DEV: i18n.t('dev environment'),
  TEST: i18n.t('test environment'),
  STAGING: i18n.t('staging environment'),
  PROD: i18n.t('prod environment'),
};

const Governance = () => {
  const [branchesRule, branches, appDetail] = zkproxyStore.useStore((s) => [s.branchesRule, s.branches, s.appDetail]);
  const { env } = routeInfoStore.useStore((s) => s.params);
  const { getBranches, getBranchesRule, updateBranchesRule, getAppDetail, clearBranchesRule } = zkproxyStore.effects;
  const [getAppDetailLoading, getBranchesLoading, getBranchesRuleLoading] = useLoading(zkproxyStore, [
    'getAppDetail',
    'getBranches',
    'getBranchesRule',
  ]);

  const [state, updater, update] = useUpdate({
    ruleMap: {},
    count: 0,
  });

  useMount(() => {
    getAppDetail();
    getBranchesRule();
  });

  useEffect(() => {
    if (appDetail.gitRepoAbbrev) {
      getBranches();
    }
  }, [appDetail.gitRepoAbbrev, getBranches]);

  useEffect(() => {
    if (!isEmpty(branchesRule)) {
      const ruleMap = {};
      forEach(branchesRule, ({ branch, weight }) => {
        ruleMap[branch] = weight;
      });
      updater.ruleMap(ruleMap);
    } else {
      updater.ruleMap({});
    }
  }, [branchesRule, updater]);

  const handleChange = (value: number | string | undefined, name: string) => {
    update({
      ruleMap: { ...state.ruleMap, [name]: +(value || 0) },
    });
  };

  const handleUpdateBranchesRule = () => {
    const count = reduce(state.ruleMap, (result, v) => result + v, 0);
    if (count !== 100) {
      message.warning({
        title: i18n.t('msp:please check and submit'),
        content: `${i18n.t('msp:sum-weights')} ${count}%`,
      });
      return;
    }
    updateBranchesRule({
      body: { rule: map(state.ruleMap, (v, k) => ({ branch: k, weight: v })) },
    });
  };

  const handleClearBranchesRule = () => {
    confirm({
      title: i18n.t('common:double confirm'),
      content: `${i18n.t('common:confirm this action')}？`,
      onOk() {
        clearBranchesRule();
      },
      okText: i18n.t('common:confirm'),
      cancelText: i18n.t('common:cancel'),
    });
  };

  return (
    <Spin spinning={getAppDetailLoading || getBranchesLoading || getBranchesRuleLoading}>
      <Holder when={isEmpty(appDetail) || branches.length < 2}>
        <Card title={i18n.t('msp:branch call control')}>
          <p className="font-medium text-base mb-4">{i18n.t('msp:basic information')}</p>
          <div className="base-info mb-6 px-4">
            <p className="mb-2">{`${i18n.t('msp:application name')}：${appDetail.name}`}</p>
            <p className="mb-2">{`${i18n.t('msp:application id')}：${appDetail.id}`}</p>
            <p className="mb-2">{`${i18n.t('msp:environments')}：${ENVS_MAP[env]}`}</p>
          </div>
          <p className="font-medium text-base mb-4">{i18n.t('msp:weight configuration')}</p>
          <ul className="branches-rule-list px-4 mb-6">
            {map(branches, (name) => (
              <li className="branches-rule-item py-3 flex justify-between items-center border-bottom" key={name}>
                <div className="flex justify-between items-center text-base">
                  <CustomIcon type="fz" />
                  <span className="branch-name">{name}</span>
                </div>
                <InputNumber
                  value={state.ruleMap[name] || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => (value ? +value.replace('%', '') : 0)}
                  onChange={(value) => {
                    handleChange(value, name);
                  }}
                  precision={0}
                />
              </li>
            ))}
          </ul>
          {/* <h3 className="text-right">{state.count}</h3> */}
          <div className="branches-rule-action text-right">
            <Button className="mr-4" onClick={handleClearBranchesRule}>
              {i18n.t('msp:clear configuration')}
            </Button>
            <Button type="primary" className="mr-4" onClick={handleUpdateBranchesRule}>
              {i18n.t('msp:update configuration')}
            </Button>
          </div>
        </Card>
      </Holder>
    </Spin>
  );
};

export default Governance;
