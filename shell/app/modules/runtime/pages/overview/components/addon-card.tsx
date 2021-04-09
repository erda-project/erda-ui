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

import React, { ReactNode } from 'react';
import { Badge, Tooltip } from 'nusi';
import { ossImg } from 'common/utils';
import { PlanName } from 'app/modules/addonPlatform/pages/common/configs';
import addon_png from 'app/images/resources/addon.png';
import './addon-card.scss';
import i18n from 'i18n';
import { getTranslateAddonName } from 'app/locales/utils';

const withTip = (tip: string) => (Comp: ReactNode) => <Tooltip title={tip}>{Comp}</Tooltip>;

const addonStatusMap = {
  ATTACHING: { status: 'processing', text: i18n.t('runtime:publishing') },
  // ATTACHED: { status: 'success', text: '运行中' },
  ATTACHFAILED: { status: 'error', text: i18n.t('runtime:publish failed') },
  PENDING: { status: 'default', text: i18n.t('runtime:prepublish') },
  UNKNOWN: { status: 'default', text: i18n.t('runtime:unknown') },
};

interface IProps {
  [prop: string]: any;
  name: string;
  status: string;
  logoUrl: string;
  instanceId: string;
  plan: string;
  version?: string;
}

const AddonCard = (props: IProps) => {
  const { name, status, logoUrl, plan, version, className, onClick } = props;
  const curAddonStatus = addonStatusMap[status]; // || addonStatusMap.UNKNOWN;
  // 在状态为success的时候，不透出
  const statusBadge = curAddonStatus ? withTip(curAddonStatus.text)(<Badge status={curAddonStatus.status} />) : null;
  const showName = getTranslateAddonName(name);
  const [imgSrc, setImgSrc] = React.useState(ossImg(logoUrl, { w: 80 }));
  const onError = () => {
    setImgSrc(addon_png);
  };

  return (
    <div className={`addon-card mb20 ${className}`} onClick={onClick}>
      <div className="addon-card-icon-wrapper">
        <img className="logo" src={imgSrc} style={{ width: '40px' }} alt="addon-image" onError={onError} />
      </div>
      <div className="addon-card-text mr8">
        <Tooltip title={showName}><div className="name nowrap">{showName}</div></Tooltip>
        <div className="sub-info">
          <span>{PlanName[plan]}</span>
          <span className="ml8">{version}</span>
        </div>
      </div>
      <div className="addon-card-info">
        {statusBadge}
      </div>
    </div>
  );
};
export default AddonCard;
