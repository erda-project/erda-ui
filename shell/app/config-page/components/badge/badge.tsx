import * as React from 'react';
import { Badge as PureBadge, Tooltip } from 'core/nusi';
import { colorMap } from 'config-page/utils';
import { RowContainer } from 'config-page/components/container/container';
import './badge.scss';

const Badge = (_props: CP_BADGE.Props) => {
  const { props, data } = _props;
  const list = data?.list;
  return list?.length ? (
    <RowContainer>
      {list.map((item) => (
        <Item key={item.text} {...item} />
      ))}
    </RowContainer>
  ) : (
    <Item {...props} />
  );
};

const Item = (props: Merge<CP_BADGE.IProps, { className?: string }>) => {
  const { color, withBg, tip, ...rest } = props;
  const pColor = color && (colorMap[color] ?? color);
  const cls = `cp-badge rounded-sm ${withBg ? 'with-bg' : ''}`;
  return (
    <Tooltip title={tip}>
      <PureBadge color={pColor} className={cls} {...rest} />
    </Tooltip>
  );
};

export default Badge;
