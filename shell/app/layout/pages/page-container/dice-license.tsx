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
import { Modal } from 'app/nusi';
import { notify } from 'app/common/utils';
import i18n from 'i18n';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org.tsx';
import gqct_png from 'app/images/gqct.png';


import './dice-license.scss';

export const DiceLicense = () => {
  const licenseInfo = userStore.useStore((s) => s.licenseInfo);
  const orgName = orgStore.useStore((s) => s.currentOrg.name) || '-';
  const { valid, message, expireDate, user, issueDate, maxHostCount, currentHostCount } = licenseInfo;
  const { validateLicense } = userStore.effects;

  React.useEffect(() => {
    if (orgName !== '-') {
      validateLicense().then(({ showAlert }: { valid: boolean; showAlert?: boolean }) => {
        if (showAlert) {
          notify('warning', i18n.t('layout:get license failed'));
        }
      });
    }
  }, [orgName]);

  const rowOneData = [
    {
      label: i18n.t('layout:expire date'),
      value: expireDate ? moment(expireDate).format('YYYY-MM-DD') : '',
    },
    {
      label: i18n.t('layout:signed date'),
      value: issueDate ? moment(issueDate).format('YYYY-MM-DD') : '',
    },
    {
      label: i18n.t('layout:signed user'),
      value: user,
    },
  ];

  const rowTwoData = [
    {
      label: i18n.t('layout:max nodes'),
      value: maxHostCount,
    },
    {
      label: i18n.t('layout:current nodes'),
      value: currentHostCount,
    },
  ];

  return (
    <Modal
      title={i18n.t('layout:license tip')}
      visible={!valid}
      footer={null}
      closable={false}
      width={492}
    >
      <div className="license-container fz14">
        <img className="license-img" src={gqct_png} />
        <div className="color-text mt16 bold-500">{message}</div>
        <div className="row flex-box mt24">
          {rowOneData.map(({ label, value }) => {
            return (
              <div className="row-one-card border-all text-center" key={label}>
                <div className="color-text mt20">{value}</div>
                <div className="color-text-desc mt8">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="row flex-box mt16 mb8">
          {rowTwoData.map(({ label, value }) => {
            return (
              <div className="row-two-card border-all text-center" key={label}>
                <div className="color-text mt20">{value}</div>
                <div className="color-text-desc mt8">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
