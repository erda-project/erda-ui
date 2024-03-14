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
import { TopButtonGroup } from 'common';
import { Button, Modal, Input, message, Spin } from 'antd';
import moment from 'moment';
import { getLicense, importLicense, License } from 'org/services/license';

const licensesTypeMap = {
  SUBSCRIPTION: i18n.t('subscription'),
  SELF_HOSTED: i18n.t('privatization'),
};

const LicenseInfo = () => {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [info, setInfo] = React.useState<License>();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    setLoading(true);
    const res = await getLicense();
    if (res.success) {
      setInfo(res.data.data);
      setLoading(false);
    }
  };

  const openImportLicense = () => {
    setValue('');
    setVisible(true);
  };

  const importInfo = async () => {
    const res = await importLicense(value);
    if (res.success) {
      message.success(i18n.t('imported successfully'));
      setVisible(false);
      getInfo();
    }
  };

  return (
    <div>
      <TopButtonGroup>
        <Button type="primary" onClick={openImportLicense}>
          {i18n.t('Import')}
        </Button>
      </TopButtonGroup>

      <div className="flex justify-between items-center font-medium text-lg leading-[48px] mb-2">
        {i18n.t('License')}
      </div>

      <Spin spinning={loading}>
        <div>
          <div className="text-sub pb-2">{i18n.t('license type')}</div>
          <div className="mb-4">{(info?.licenseType && licensesTypeMap[info?.licenseType]) || ''}</div>

          <div className="text-sub pb-2">{i18n.t('expiration time')}</div>
          <div className="mb-4">
            {(info?.expiryTimestamp && moment(info?.expiryTimestamp).format('YYYY-MM-DD HH:mm:ss')) || ''}
          </div>

          <div className="text-sub  pb-2">{i18n.t('function')}</div>
          <div className="mb-4 ml-1">
            {info?.features?.map((feature) => (
              <div>{feature}</div>
            ))}
          </div>
        </div>
      </Spin>

      <Modal title={i18n.t('import license')} visible={visible} onCancel={() => setVisible(false)} onOk={importInfo}>
        <Input.TextArea rows={5} value={value} onChange={(e) => setValue(e.target.value)} />
      </Modal>
    </div>
  );
};

export default LicenseInfo;
