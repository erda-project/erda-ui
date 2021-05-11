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
import { Icon as CustomIcon, IF } from 'common';
import { ossImg } from 'common/utils';
import { isFunction } from 'lodash';
import './menu-head.scss';
import devops_svg from 'app/images/devops.svg';
import glht_svg from 'app/images/glht.svg';
import qyzx_svg from 'app/images/qyzx.svg';
import wfwzl_svg from 'app/images/wfwzl.svg';
import ksj_svg from 'app/images/ksj.svg';
import fwsc_svg from 'app/images/fwsc.svg';
import edge_svg from 'app/images/edge.svg';
import org_svg from 'app/images/glzx.svg';

interface IProps {
  siderInfo: Record<string, any>;
  routeMarks: string[];
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
    case 'workBench':
      sideIcon = <img className="big-icon" src={devops_svg} />;
      break;
    case 'sysAdmin':
      sideIcon = <img className="big-icon" src={glht_svg} />;
      break;
    case 'dataCenter':
      sideIcon = <img className="big-icon" src={qyzx_svg} />;
      break;
    case 'orgCenter':
      sideIcon = <img className="big-icon" src={org_svg} />;
      break;
    case 'microService':
      sideIcon = <img className="big-icon" src={wfwzl_svg} />;
      break;
    case 'fdp':
      sideIcon = <img className="big-icon" src={ksj_svg} />;
      break;
    case 'apiManage':
      sideIcon = <img className="big-icon" src={fwsc_svg} />;
      break;
    case 'edge':
      sideIcon = <img className="big-icon" src={edge_svg} />;
      break;
    default:
      sideIcon = <CustomIcon color type={detail.icon || 'yy'} />;
      break;
  }
  return (
    <div className="sidebar-info-block">
      <IF check={!!logo}>
        <img key={logo} className={logoClassName} src={ossImg(logo, { w: 120 })} alt="logo" />
        <IF.ELSE />
        {sideIcon}
      </IF>
      {
      isFunction(getHeadName)
        ? getHeadName()
        : <span className="nowrap name">{displayName || name}</span>
      }
    </div>
  );
};

export default MenuHead;
