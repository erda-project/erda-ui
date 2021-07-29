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
import { Button } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import i18n from 'i18n';
import { CaseStatus } from './status-toggle';
import './pass-and-next.scss';

interface IProps {
  hasNext: boolean;
  current?: keyof typeof CaseStatus;
  onClick: (k: keyof typeof CaseStatus) => any;
}

export const PassAndNext = ({ hasNext, current, onClick }: IProps) => {
  return (
    <div className="pass-and-next">
      <Button onClick={() => onClick(CaseStatus.INIT)} disabled={current === CaseStatus.INIT}>
        <CustomIcon className="bg-color-icon" type="wh" />
        {i18n.t('project:not performed')}
      </Button>
      <Button
        className="border-green"
        onClick={() => onClick(CaseStatus.PASSED)}
        disabled={current === CaseStatus.PASSED}
      >
        <CustomIcon className="bg-color-icon green" type="tg" />
        {i18n.t('project:pass')}
      </Button>
      <Button
        className="border-yellow"
        onClick={() => onClick(CaseStatus.BLOCK)}
        disabled={current === CaseStatus.BLOCK}
      >
        <CustomIcon className="bg-color-icon yellow" type="zs" />
        {i18n.t('project:blocking')}
      </Button>
      <Button className="border-red" onClick={() => onClick(CaseStatus.FAIL)} disabled={current === CaseStatus.FAIL}>
        <CustomIcon className="bg-color-icon red" type="wtg" />
        {i18n.t('project:not passed')}
      </Button>
      {hasNext ? <span className="ml-1">{i18n.t('project:and next')}</span> : null}
    </div>
  );
};
