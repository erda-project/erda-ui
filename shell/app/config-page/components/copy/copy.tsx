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

import { Button } from 'antd';
import { Copy as CopyComp } from 'common';
import i18n from 'i18n';
import React from 'react';
import { uniqueId } from 'lodash';
import { Copy as IconCopy } from '@icon-park/react';

const Copy = (props: CP_COPY.Props) => {
  const { props: configProps, children } = props;
  const { copyText, disabled, copyTip, renderType = 'button' } = configProps || {};

  const idRef = React.useRef(uniqueId('cp-copy-'));

  if (disabled) return children;

  const defaultChildren =
    renderType === 'button' ? (
      <Button type="primary">{i18n.t('copy')}</Button>
    ) : (
      <IconCopy className="hover:text-primary" size={16} />
    );

  return (
    <>
      <span className={`${idRef.current} cursor-copy`} data-clipboard-tip={copyTip} data-clipboard-text={copyText}>
        {children ?? defaultChildren}
      </span>
      <CopyComp selector={idRef.current} />
    </>
  );
};

export default Copy;
