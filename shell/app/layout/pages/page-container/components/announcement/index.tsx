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

import { Dropdown } from 'antd';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import layoutStore from 'layout/stores/layout';
import React from 'react';
import { useClickAway } from 'react-use';

export const Announcement = () => {
  const [index, setIndex] = React.useState(1);
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);
  useClickAway(ref, () => {
    setVisible(false);
  });
  const announcementList = layoutStore.useStore((s) => s.announcementList);

  if (!announcementList.length) {
    return null;
  }

  const total = announcementList.length;

  const content = (
    <div ref={ref} style={{ width: 400 }} className="px-4 pb-3 rounded-sm shadow-card-lg bg-default text-white">
      <div className="h-12 flex items-center">
        <ErdaIcon type="tonggao" fill="blue" size={20} />
        <span className="ml-1">{i18n.t('layout:announcement')}</span>
      </div>
      <div className="text-white overflow-auto break-word" style={{ height: 130 }}>
        {announcementList[index - 1].content}
      </div>
      <div className="h-8 flex items-center justify-end select-none">
        <ErdaIcon
          className={`rounded-sm w-8 h-8 text-white-6 hover:text-white hover:bg-white-200 cursor-pointer`}
          type="left"
          size={20}
          onClick={() => setIndex(Math.max(index - 1, 1))}
        />
        <div className="w-12 inline-flex items-center justify-center text-white-6">
          {index} / {announcementList.length}
        </div>
        <ErdaIcon
          className={`rounded-sm w-8 h-8 text-white-6 hover:text-white hover:bg-white-200 cursor-pointer`}
          type="right"
          size={20}
          onClick={() => setIndex(Math.min(index + 1, total))}
        />
      </div>
    </div>
  );

  return (
    <Dropdown overlay={content} placement="bottomRight" visible={visible}>
      <div
        className="flex items-center px-2 h-7 cursor-pointer rounded-full bg-blue text-white"
        onClick={!visible ? () => setVisible(true) : undefined}
      >
        <ErdaIcon type="tonggao" fill="white" size={20} />
        {i18n.t('layout:announcement')}
      </div>
    </Dropdown>
  );
};
