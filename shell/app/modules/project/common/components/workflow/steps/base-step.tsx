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
import './base-step.scss';

export interface IBaseProps {
  enable?: boolean;
}

const BaseStep: React.FC<{
  className?: string;
  title: string;
  extra?: React.ReactNode;
}> = ({ className, title, children, extra }) => {
  return (
    <div className={`workflow-step bg-white rounded-sm w-[280px] shadow-card flex-shrink-0 mx-2 ${className}`}>
      <div className="px-2 rounded-t-sm bg-default-02 h-8 flex items-center justify-between mb-0">
        <span className="font-medium">{title}</span>
        <div>{extra}</div>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
};

export const BaseStepSimple: React.FC<{
  icon: 'code' | 'pipeline' | 'branch-one';
}> = ({ icon, children }) => {
  return (
    <div className="workflow-step-simple relative mx-2">
      <div className="flex justify-start items-center h-full w-full">
        <div className="mx-2 flex justify-start items-center text-default-6">
          <ErdaIcon type={icon} size={20} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default BaseStep;
