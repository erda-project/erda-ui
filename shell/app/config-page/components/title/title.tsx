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
import { Title as NusiTitle, Tooltip, Button, Popconfirm } from 'app/nusi';
import { OperationAction } from 'config-page/utils';
import imgMap from '../../img-map';
import './title.scss';

const Title = (props: CP_TITLE.Props) => {
  const { props: configProps, execOperation } = props;
  const {
    title,
    level,
    tips,
    size = 'normal',
    prefixIcon = '',
    prefixImg = '',
    showDivider = false,
    visible = true,
    isCircle = false,
    subtitle = '',
    noMarginBottom = false,
    operations = [],
  } = configProps || {};

  const titleComp = tips ? (
    <div className={`flex justify-start items-center flex-wrap dice-cp-title-detail flex items-center ${size}`}>
      {prefixIcon ? <CustomIcon type={prefixIcon} className="mr-1 pre-icon" /> : null}
      {prefixImg ? (
        <img
          src={prefixImg.startsWith('/images') ? imgMap[prefixImg] : prefixImg}
          className={`${isCircle ? 'circle' : ''} pre-image`}
        />
      ) : null}
      {title}
      <Tooltip title={tips}>
        <CustomIcon type="help" className="ml-1 text-sm pre-icon" />
      </Tooltip>
      {subtitle ? <span className="subtitle">{subtitle}</span> : null}
    </div>
  ) : (
    <div className={`dice-cp-title-detail flex items-center ${size}`}>
      {prefixIcon ? <CustomIcon type={prefixIcon} /> : null}
      {prefixImg ? (
        <img
          src={prefixImg.startsWith('/images') ? imgMap[prefixImg] : prefixImg}
          className={`${isCircle ? 'circle' : ''} pre-image`}
        />
      ) : null}
      {title}
      {subtitle ? <span className="subtitle">{subtitle}</span> : null}
    </div>
  );

  const formatOperations = (operations || []).map((x, index) => {
    const { text, visible, disabled, disabledTip, tooltip, confirm, reload, ...rest } = x?.props || {};

    if (!visible) {
      return { title: null };
    }

    const onClick = () => {
      if (x.operations?.click && !disabled) {
        execOperation(x.operations.click);
      }
    };

    const buttonComp = (
      <OperationAction
        operation={{
          confirm,
          key: `${index}`,
          reload,
          disabledTip,
          disabled,
        }}
        onClick={onClick}
      >
        <Button type="link" {...rest}>
          {text}
        </Button>
      </OperationAction>
    );

    const comp = tooltip ? (
      <Tooltip key={`${index}`} title={tooltip}>
        {buttonComp}
      </Tooltip>
    ) : (
      <React.Fragment key={`${index}`}>{buttonComp}</React.Fragment>
    );

    return {
      title: comp,
    };
  });

  return visible ? (
    <div className="dice-cp-title">
      <NusiTitle
        title={titleComp}
        level={level}
        showDivider={showDivider}
        className={`${noMarginBottom ? 'no-margin-bottom' : ''}`}
        operations={formatOperations}
      />
    </div>
  ) : null;
};

export default Title;
