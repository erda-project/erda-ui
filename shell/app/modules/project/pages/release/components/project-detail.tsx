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
import { Button, Modal, Tabs } from 'antd';
import ReleaseForm from './form';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { getReleaseDetail, formalRelease } from 'project/services/release';
import AddonInfo from './addon';

const { TabPane } = Tabs;

const ReleaseProjectDetail = () => {
  const { params } = routeInfoStore.getState((s) => s);
  const { releaseID } = params;
  const releaseDetail = getReleaseDetail.useData();
  const { isFormal, version: releaseName, addons, addonYaml } = releaseDetail || {};

  const submit = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: releaseName,
        interpolation: { escapeValue: false },
      }),
      onOk: async () => {
        await formalRelease({
          releaseID,
          $options: { successMsg: i18n.t('{action} successfully', { action: i18n.t('dop:To Formal') }) },
        });
        getReleaseDetail.fetch({ releaseID });
      },
    });
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" className="h-full">
        <TabPane tab={i18n.t('dop:basic information')} key="1">
          <ReleaseForm readyOnly />
        </TabPane>

        {addons || addonYaml ? (
          <TabPane tab="Addons" key="2">
            <AddonInfo addons={addons} addonYaml={addonYaml} />
          </TabPane>
        ) : null}
      </Tabs>
      <div className="mb-2">
        {!isFormal ? (
          <Button className="mr-3 bg-default" type="primary" onClick={submit}>
            {i18n.t('dop:To Formal')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ReleaseProjectDetail;
