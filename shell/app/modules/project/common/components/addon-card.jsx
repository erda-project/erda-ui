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
import { Icon as CustomIcon } from 'common';
import { ossImg } from 'common/utils';
import classnames from 'classnames';
import './addon-card.scss';

const imgOrIcon = url => (url
  ? <img className="addon-card__logo" src={ossImg(url, { w: 80 })} alt="addon" />
  : <CustomIcon style={{ fontSize: '40px' }} type="addon" />);

const AddonCard = ({
  conf, name, version = null, planInfo = null, operation, tag = null,
}) => {
  const cls = classnames({
    'addon-card': true,
    'has-op': !!operation,
  });
  return (
    <div className={cls}>
      {imgOrIcon(conf.iconUrl)}
      <div className="addon-card__name nowrap">{name}</div>
      {planInfo && <div className="addon-card__planInfo"><span>{planInfo}</span></div>}
      {version && <div className="addon-card__planInfo"><span>{version}</span></div>}
      <div className="addon-card__operation">{operation}</div>
      {tag && <div className="addon-card__tag">{tag}</div>}
    </div>
  );
};
export default AddonCard;
