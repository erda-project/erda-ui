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
import { Button, Modal, message } from 'antd';
import ReleaseForm from './form';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { getReleaseDetail, formalRelease } from 'project/services/release';

const ReleaseProjectDetail = () => {
  const { params } = routeInfoStore.getState((s) => s);
  const { releaseID } = params;
  const releaseDetail = getReleaseDetail.useData() || ({} as RELEASE.ReleaseDetail);
  const { isFormal, releaseName } = releaseDetail;

  const getDetail = React.useCallback(async () => {
    if (releaseID) {
      await getReleaseDetail.fetch({ releaseID });
    }
  }, [releaseID]);

  React.useEffect(() => {
    getDetail();
  }, [getDetail]);

  const submit = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: releaseName,
        interpolation: { escapeValue: false },
      }),
      onOk: async () => {
        await formalRelease({
          releaseID,
          $options: { successMsg: i18n.t('{action} successfully', { action: i18n.t('dop:be formal') }) },
        });
        getDetail();
      },
    });
  };

  return (
    <div>
      <ReleaseForm readyOnly />
      <div className="mb-2">
        {!isFormal ? (
          <Button className="mr-3 bg-default" type="primary" onClick={submit}>
            {i18n.t('dop:be formal')}
          </Button>
        ) : null}

        <Button className="bg-default-06 border-default-06" onClick={() => goTo(goTo.pages.projectReleaseList)}>
          {i18n.t('return to previous page')}
        </Button>
      </div>
    </div>
  );
};

export default ReleaseProjectDetail;
