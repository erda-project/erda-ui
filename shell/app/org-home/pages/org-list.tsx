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
import DiceConfigPage from 'config-page/index';
import { Card } from 'app/nusi';
import i18n from 'i18n';
import erda_png from 'app/images/Erda.png';
import './org-list.scss';

export const OrgList = () => {
  return (
    <Card className='full-height ma12 auto-overflow'>
      <div className='org-home-info mb20'>
        <div className='info-img'>
          <img src={erda_png} />
        </div>
        <div className='info-text mt20'>
          <span className='desc fz16 bold'>{i18n.t('org:org-intro')}</span>
        </div>
      </div>
      <div className='org-home-list'>
         <DiceConfigPage
          scenarioType='org-list-all'
          scenarioKey='org-list-all'
        />
      </div>
    </Card>
  );
};

