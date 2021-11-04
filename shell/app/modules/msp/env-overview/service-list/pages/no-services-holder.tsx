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
import { Intro } from 'common';
import i18n from 'i18n';
import { goTo } from 'common/utils';

const NoServicesHolder = () => {
  return (
    <Intro
      content={i18n.t('msp:no service is connected currently, click the button below to access the service')}
      action={i18n.t('msp:quick access service')}
      onAction={() => {
        goTo(goTo.pages.mspConfigurationPage);
      }}
    />
  );
};

export default NoServicesHolder;
