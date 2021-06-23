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

import * as React from 'react';
import { Popover, Button, Tooltip } from 'app/nusi';
import { Copy } from 'common';
import i18n from 'i18n';

interface IProps {
  innerAddr: string;
  innerTips: string;
  outerAddr: string;
}

export const DomainChecker = ({ innerAddr, innerTips, outerAddr }: IProps) => {
  return (
    <Popover
      title={<h2 className="domain-title">{i18n.t('microService:domain information')}</h2>}
      trigger="click"
      placement="bottomRight"
      content={
        <div className="domain-content">
          <div className="mb-2 domain-addr">
            {i18n.t('microService:external network address')}
            <Copy className="cursor-copy" data-clipboard-tip={i18n.t('microService:external network address')}>
              : {outerAddr}
            </Copy>
          </div>
          <Tooltip title={innerTips}>
            <div className="domain-addr">
              {i18n.t('microService:internal network address')}
              <Copy className="cursor-copy" data-clipboard-tip={i18n.t('microService:internal network address')}>
                : {innerAddr}
              </Copy>
            </div>
          </Tooltip>
        </div>
      }
    >
      <Button ghost type="primary">
        {i18n.t('microService:view cluster domain name')}
      </Button>
    </Popover>
  );
};
