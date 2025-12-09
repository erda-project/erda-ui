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
import i18n from 'i18n';
import { erdaEnv } from 'app/common/constants';
import { DropdownSelectNew, ErdaIcon } from 'common';
import { goTo } from 'common/utils';
import erdaIcon from 'app/images/icons/Erda.svg';
import fdpIcon from 'app/images/icons/FDP.svg';
import trantorIcon from 'app/images/icons/Trantor.svg';
import './platform-selector.scss';

export const PlatformSelector = () => {
  const options = [
    ...(erdaEnv.TRANTOR_URL
      ? [
          {
            key: 'Trantor',
            label: 'Trantor',
            desc: i18n.t('layout:Software building platform'),
            imgURL: trantorIcon,
            herf: erdaEnv.TRANTOR_URL as string,
          },
        ]
      : []),
    {
      key: 'Erda',
      label: 'Erda',
      desc: i18n.t('layout:Application development management platform'),
      imgURL: erdaIcon,
    },
    {
      key: 'FDP',
      label: 'FDP',
      desc: i18n.t('layout:Data governance platform'),
      imgURL: fdpIcon,
      herf: goTo.resolve.dataAppEntry(),
    },
  ];
  const onChange = (v: string) => {
    const opt = options.find((item) => item.key === v);
    if (opt?.herf) {
      window.open(opt.herf);
    }
  };

  return (
    <DropdownSelectNew
      // {...rest}
      // title={i18n.t('dop:Switch organization')}
      value={'Erda'}
      forceValue
      options={options}
      trigger={['hover']}
      onChange={onChange}
      width={210}
      size={'middle'}
      optionSize={'middle'}
      mode={'simple'}
      noIcon
      required
      align={{ offset: [-46, -38] }}
    >
      <div className="platform-icon-container relative w-9 h-9 rounded-[4px]">
        <img src={erdaIcon} className="absolute icon normal-icon" />
        <ErdaIcon type="application" size={24} className="absolute icon active-icon" />
      </div>
    </DropdownSelectNew>
  );
};
