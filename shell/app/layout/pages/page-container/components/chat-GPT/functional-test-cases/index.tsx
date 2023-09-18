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

import React, { useState } from 'react';
import RequirementsList from './requirements-list';
import DescList from './desc-list';
import { CaseTree } from 'project/pages/test-manage/components';
import { IRow } from 'layout/services/ai-test';

const FunctionalTestCases = () => {
  const caseRef = React.useRef(null as any);
  const [rows, setRows] = useState<IRow[]>([]);

  const tableSelect = (rows: IRow[]) => {
    setRows(rows);
  };
  return (
    <div className="flex gap-x-2 h-full">
      <div className="flex-[2] bg-card rounded-[4px] w-0 overflow-auto">
        <RequirementsList onSelect={tableSelect} />
      </div>
      <div className="flex-[1] bg-card rounded-[4px]">
        <DescList rows={rows} />
      </div>
      <div className="flex-[1] bg-card rounded-[4px]">
        <CaseTree
          ref={(e) => {
            caseRef.current = e;
          }}
          needBreadcrumb
          needRecycled
          mode="testCase"
        />
      </div>
    </div>
  );
};

export default FunctionalTestCases;
