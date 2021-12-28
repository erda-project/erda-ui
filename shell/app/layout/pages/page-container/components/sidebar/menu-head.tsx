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
import { IF, ErdaIcon } from 'common';
import { ossImg } from 'common/utils';
import { isFunction } from 'lodash';
import ecpSvg from 'app/images/ecp.svg';
import orgCenterSvg from 'app/images/glzx.svg';
import './menu-head.scss';

interface IProps {
  siderInfo: Record<string, any>;
  routeMarks: readonly string[];
}

const defaultDetail = {
  name: '',
  displayName: '',
  logo: undefined,
  icon: '',
  logoClassName: '',
};

const MenuHead = ({ siderInfo, routeMarks }: IProps) => {
  const { detail = defaultDetail, getHeadName } = siderInfo || {};
  const { name, displayName, logo, logoClassName = '' } = detail;
  let sideIcon: React.ReactNode = null;
  switch (routeMarks[routeMarks.length - 2]) {
    case 'dop':
      sideIcon = <ErdaIcon size={36} type="devops-3n59bi9j" />;
      break;
    case 'sysAdmin':
      sideIcon = <img className="big-icon" src={orgCenterSvg} />;
      break;
    case 'cmp':
      sideIcon = <ErdaIcon size={36} type="duoyun" />;
      break;
    case 'orgCenter':
      sideIcon = <ErdaIcon size={36} type="guanlizhongxin-3n59bian" />;
      break;
    case 'msp':
      sideIcon = <ErdaIcon size={36} type="weifuwu" />;
      break;
    case 'fdp':
      sideIcon = <ErdaIcon size={36} type="kuaishuju" />;
      break;
    case 'ecp':
      sideIcon = <img className="big-icon" src={ecpSvg} />;
      break;
    default:
      sideIcon = <ErdaIcon type={detail.icon || 'yy'} />;
      break;
  }
  return (
    <div className={`flex sidebar-info-block px-4 py-3 mb-3 rounded-sm`}>
      <IF check={!!logo}>
        <img key={logo} className={logoClassName} src={ossImg(logo, { w: 36 })} alt="logo" />
        <IF.ELSE />
        {sideIcon}
      </IF>
      {isFunction(getHeadName) ? getHeadName() : <span className="nowrap name">{displayName || name}</span>}
    </div>
  );
};

export default MenuHead;
