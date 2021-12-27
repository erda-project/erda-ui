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
import { Button, Spin, Modal } from 'antd';
import ReleaseForm from './form';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import releaseStore from 'project/stores/release';
import { useLoading } from 'core/stores/loading';

import './form.scss';

const ReleaseProjectDetail = () => {
  const { releaseDetail } = releaseStore.getState((s) => s);
  const { isFormal, releaseId, releaseName } = releaseDetail;
  const [loading] = useLoading(releaseStore, ['getReleaseDetail']);
  const { formalRelease, getReleaseDetail } = releaseStore.effects;
  const submit = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: releaseName,
        interpolation: { escapeValue: false },
      }),
      onOk: () => {
        formalRelease({ releaseID: releaseId }).then((res) => {
          if (res.success) {
            getReleaseDetail({ releaseID: releaseId });
          }
        });
      },
    });
  };

  return (
    <div className="release-detail">
      <Spin spinning={loading}>
        <ReleaseForm readyOnly />
        <div className="mb-2">
          {!isFormal ? (
            <Button className="mr-3 bg-default" type="primary" onClick={submit}>
              {i18n.t('dop:be formal')}
            </Button>
          ) : null}

          <Button className="bg-default-06 border-default-06" onClick={() => goTo(goTo.pages.projectRelease)}>
            {i18n.t('return to previous page')}
          </Button>
        </div>
      </Spin>
    </div>
  );
};

export default ReleaseProjectDetail;
