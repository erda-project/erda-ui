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
import ErdaIcon from 'common/components/erda-icon';
import mspStore from 'msp/stores/micro-service';

interface IProps {
  onClick: () => void;
}

const AlarmDetailTitle: React.FC<IProps> = ({ onClick }) => {
  const title = mspStore.useStore((s) => s.alarmTitle);
  return (
    <div className="flex items-center">
      <ErdaIcon type="arrow-left" size="18" className="cursor-pointer text-gray mr-2" onClick={onClick} />
      <span className="font-bold text-lg">{title}</span>
    </div>
  );
};

export default AlarmDetailTitle;
