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
import { ErdaIcon } from 'common';
import i18n from 'i18n';

const AlarmDetailTitle = () => {
  return (
    <div>
      <ErdaIcon
        type="arrow-left"
        size="18"
        className="cursor-pointer text-gray mr-3"
        onClick={() => window.history.back()}
      />
      <ErdaIcon type="remind" size="18" className="text-white bg-primary p-2 text-bold rounded-sm mr-2" />
      <span className="font-bold text-lg">{i18n.t('cmp:new alarm strategy')}</span>
    </div>
  );
};

export default AlarmDetailTitle;
