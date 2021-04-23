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
import i18n from 'i18n';
import { Switch, Alert, Row, Col, Spin, Modal } from 'app/nusi';
import { useLoading } from 'app/common/stores/loading';
import orgStore from 'app/org-home/stores/org';
import { find, get } from 'lodash';
import userStore from 'app/user/stores';
import { useUpdate } from 'common';


enum Environment {
  DEV = 'blockDev',
  TEST = 'blockTest',
  STAGING = 'blockStage',
  PROD = 'blockProd',
}

const metaData = [
  { label: i18n.t('default:dev environment'), value: Environment.DEV, disabled: true },
  { label: i18n.t('default:test environment'), value: Environment.TEST, disabled: true },
  { label: i18n.t('default:staging environment'), value: Environment.STAGING, disabled: true },
  { label: i18n.t('default:prod environment'), value: Environment.PROD, disabled: false },
];

const BlockNetwork = () => {
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { updateOrg } = userStore.effects;
  const [isFetch, isUpdate] = useLoading(userStore, ['getJoinedOrgs', 'updateOrg']);
  const [state, updater] = useUpdate({
    blockoutConfig: {},
  });
  React.useEffect(() => {
    updater.blockoutConfig(currentOrg.blockoutConfig);
  }, [currentOrg.blockoutConfig, updater]);
  const toggleBlockNetwork = (isOn: boolean, key: Environment) => {
    Modal.confirm({
      title: isOn ? i18n.t('org:confirm to open the network block') : i18n.t('org:confirm to close the network block'),
      onOk: () => {
        const payload = {
          ...currentOrg,
          blockoutConfig: {
            ...currentOrg.blockoutConfig,
            [key]: isOn,
          },
        };
        updateOrg(payload);
      },
    });
  };

  return (
    <Spin spinning={isFetch || isUpdate}>
      <Alert showIcon type="error" iconType='warning' message={i18n.t('org:after opening, the impact is greater, please confirm carefully before opening')} />
      <Row className="mt16">
        {
          metaData.map(({ value, label, disabled }) => {
            return (
              <Col key={value} span={6}>
                <div className="mb4 color-text-desc">{label}</div>
                <Switch
                  checked={get(state.blockoutConfig, value, false)}
                  checkedChildren={i18n.t('default:on')}
                  unCheckedChildren={i18n.t('default:off')}
                  disabled={disabled}
                  onChange={(isOn) => { toggleBlockNetwork(isOn, value); }}
                />
              </Col>
            );
          })
        }
      </Row>
    </Spin>
  );
};

export default BlockNetwork;
