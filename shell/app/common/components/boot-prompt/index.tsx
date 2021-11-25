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

import './index.scss';

interface IProps {
  children: React.ReactNode;
  name: string;
  className?: string;
}

const BootPrompt = ({ children, name, className }: IProps) => {
  const bpList = JSON.parse(localStorage.getItem(`erda-bp-list`) || '{}');
  const [isHidden, setIsHidden] = React.useState(bpList[name]);
  const close = () => {
    setIsHidden('true');
    bpList[name] = 'true';
    localStorage.setItem(`erda-bp-list`, JSON.stringify(bpList));
  };

  return !isHidden ? (
    <div className={`erda-boot-prompt flex justify-between py-2 px-4 ${className || ''}`}>
      <div className="flex">
        <ErdaIcon type="message" className="mr-2" />
        {children}
      </div>
      <ErdaIcon type="close" onClick={close} className="cursor-pointer" />
    </div>
  ) : null;
};

export default BootPrompt;
