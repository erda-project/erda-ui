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

/**
 * Created by 含光<jiankang.pjk@alibaba-inc.com> on 2021/1/22 14:35.
 */
import React from 'react';
import { Icon as CustomIcon } from 'common';
import { Title as NusiTitle, Tooltip } from 'app/nusi';
import ERDA_LOGO from 'app/images/Erda.svg';
import './title.scss'

const Title = (props: CP_TITLE.Props) => {
  const { props: configProps } = props;
  const { title, level, tips, prefixIcon = '', prefixImg = '', prefixImgSize = 'normal', showDivider = false, visible = true, titleStyles = {}, subtitle = '', noMarginBottom = false, isPureTitle = true } = configProps || {};

  const titleComp = tips ? (
    <div className='left-flex-box dice-cp-title-detail v-align' style={{ ...titleStyles }}>
      {prefixIcon ? <CustomIcon type={prefixIcon} className='mr4' /> : null}
      {prefixImg ? <img src={prefixImg} className={`${prefixImgSize} pre-image`} /> : null}
      {
        !isPureTitle && !prefixIcon && !prefixImg ?
          <img src={ERDA_LOGO} className='erda-logo mr4' /> : null
      }
      {title}
      <Tooltip title={tips}>
        <CustomIcon type='help' className='ml4 fz14' />
      </Tooltip>
      {
        subtitle ? <span className="subtitle">{subtitle}</span > : null
      }
    </div>
  ) :
    (
      <div className="dice-cp-title-detail v-align" style={{ ...titleStyles }}>
        {prefixIcon ? <CustomIcon type={prefixIcon} /> : null}
        {prefixImg ? <img src={prefixImg} className={`${prefixImgSize} pre-image`} /> : null}
        {
          !isPureTitle && !prefixIcon && !prefixImg ?
            <img src={ERDA_LOGO} className='erda-logo mr4' /> : null
        }
        {title}
        {subtitle ?
          <span className="subtitle">
            {subtitle}
          </span >
          : null}
      </div>
    );
  return (
    visible ?
      <div className='dice-cp-title'>
        <NusiTitle title={titleComp} level={level}
          showDivider={showDivider} className={`${noMarginBottom ? 'no-margin-bottom' : ''}`} />
      </div>
      : null
  );
};

export default Title;
