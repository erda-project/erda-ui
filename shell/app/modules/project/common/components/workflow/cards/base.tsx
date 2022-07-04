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
import { goTo } from 'common/utils';
import { ErdaIcon, Ellipsis } from 'common';

export const Branch = ({
  branch,
  appId,
  projectId,
  className,
}: {
  branch: string;
  projectId: string | number;
  appId: string | number;
  className?: string;
}) => {
  return (
    <div
      className={`${className} flex-h-center text-xs group cursor-pointer`}
      onClick={() => {
        goTo(goTo.pages.repoBranch, { appId, projectId, branch, jumpOut: true });
      }}
    >
      <ErdaIcon type="hebing" className="mr-1 text-default-4 group-hover:text-purple-deep" />
      <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={branch} />
    </div>
  );
};

export const Mr = ({
  mrId,
  appId,
  projectId,
  state,
  className,
  title,
}: {
  mrId: string;
  title: string;
  projectId: string | number;
  appId: string | number;
  state: string;
  className?: string;
}) => {
  return (
    <div
      className={`${className} flex-h-center text-xs group cursor-pointer`}
      onClick={() => {
        goTo(goTo.pages.appMr, { appId, projectId, mrId, state, jumpOut: true });
      }}
    >
      <ErdaIcon type="mr" className="mr-1 text-default-4 group-hover:text-purple-deep" />
      <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={title} />
    </div>
  );
};

export const Commit = ({
  commitId,
  appId,
  projectId,
  className,
}: {
  commitId: string;
  projectId: string | number;
  appId: string | number;
  className?: string;
}) => {
  return (
    <div
      className={`${className} text-xs group flex-h-center cursor-pointer`}
      onClick={() => {
        goTo(goTo.pages.commit, {
          projectId,
          appId,
          commitId,
          jumpOut: true,
        });
      }}
    >
      <ErdaIcon type="commitID" className="mr-1 mt-0.5 text-default-4 group-hover:text-purple-deep" />
      <span className="text-default-8 group-hover:text-purple-deep">{commitId.slice(0, 6)}</span>
    </div>
  );
};

export const Status = ({ status, index }: { status: string; index: number }) => {
  const statusMap = {
    success: (
      <div className="bg-green-1 w-6 h-6 rounded-full  flex-all-center ">
        <ErdaIcon type="check" size={'14'} className="text-green" />
      </div>
    ),
    process: <div className="bg-blue text-white w-6 h-6 rounded-full  flex-all-center ">{index}</div>,
    wait: <div className="border border-solid border-black w-6 h-6 rounded-full  flex-all-center ">{index}</div>,
    error: (
      <div className="bg-red-1 w-6 h-6 rounded-full  flex-all-center ">
        <ErdaIcon type="close" size={'14'} className="text-red" />
      </div>
    ),
    warnning: (
      <div className="bg-yellow-1 w-6 h-6 rounded-full  flex-all-center ">
        <span className="text-yellow">!</span>
      </div>
    ),
  };
  return statusMap[status] || null;
};
