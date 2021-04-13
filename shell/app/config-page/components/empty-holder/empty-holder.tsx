import React from 'react';
import { Icon as CustomIcon } from 'common';
import classnames from 'classnames';
import i18n from 'i18n';
import './empty-holder.scss';

export const EmptyHolder = (props: CP_EMPTY_HOLDER.Props) => {
  const { props: configProps } = props;
  const {
    icon = 'empty',
    tip = i18n.t('common:no data'),
    relative = false,
    style = {},
    action = null,
    className = '',
  } = configProps || {};

  const cls = classnames({
    'empty-holder': true,
    'multi-line': true,
    relative,
  });

  return (
    <div className={`${cls} ${className}`} style={style}>
      <CustomIcon type={icon} color />
      <span>{tip} <span className="action">{action}</span></span>
    </div>
  );
}

export default EmptyHolder;