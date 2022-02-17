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

import { RadioTabs } from 'common';
import i18n from 'i18n';
import React from 'react';
import CodeQuality from '.';
import TestList from '../test/test-list';
import { ProblemList } from '../problem/problem-list';

const AppQuality = () => {
  const tabs = [
    { value: 'quality', label: i18n.t('dop:quality reports'), Comp: CodeQuality },
    { value: 'issues', label: i18n.t('dop:app-issues'), Comp: ProblemList },
    { value: 'test', label: i18n.t('dop:lists'), Comp: TestList },
  ];
  const [tab, setTab] = React.useState(tabs[0]);
  const Content = tab.Comp;

  return (
    <>
      <RadioTabs
        options={tabs}
        value={tab.value}
        onChange={(_, newTab) => {
          setTab(newTab as typeof tabs[0]);
        }}
        className="mb-2"
      />
      <Content />
    </>
  );
};

export default AppQuality;
