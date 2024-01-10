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
import { ErdaIcon as CustomIcon, MarkdownRender } from 'common';

const GPTItem = ({ message, links }: { message?: React.ReactNode; links?: string[] }) => {
  return (
    <div className="py-6 px-4 border-bottom bg-grey">
      <div className="m-auto flex justify-between">
        <div className="flex-none w-[40px] h-[40px] text-2xl bg-green text-white rounded-sm p-1">
          <CustomIcon type="ai" />
        </div>
        <div className="flex-none w-[calc(100%-60px)] text-black text-left">
          {message ? (
            <MarkdownRender value={message} />
          ) : (
            <div className="flex h-full">
              <CustomIcon type="zhongshi" className="animate-spin mr-1 text-[24px] text-darkgray" />
            </div>
          )}
        </div>
      </div>
      {links ? (
        <div className="text-left w-full mt-4">
          <div>{i18n.t('List of reference documents')}: </div>
          {links.map((link) => (
            <div className="text-blue my-1 cursor-pointer truncate" title={link} key={link}>
              {link}
            </div>
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default GPTItem;
