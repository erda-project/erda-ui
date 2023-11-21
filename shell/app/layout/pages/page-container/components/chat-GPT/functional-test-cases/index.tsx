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

import React, { useState, useEffect } from 'react';
import i18n from 'i18n';
import { Input } from 'antd';
import { ErdaIcon } from 'common';
import RequirementsList from './requirements-list';
import DescList from './desc-list';
import { CaseTree } from 'project/pages/test-manage/components';
import { IRow, getSystemPrompt } from 'layout/services/ai-test';

const FunctionalTestCases = () => {
  const caseRef = React.useRef(null as any);
  const [rows, setRows] = useState<IRow[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [testSetID, setTestSetID] = useState(0);
  const [content, setContent] = useState('');

  const tableSelect = (rows: IRow[]) => {
    setRows(rows);
  };

  useEffect(() => {
    getPrompt();
  }, []);

  const getPrompt = async () => {
    const res = await getSystemPrompt();
    if (res.success) {
      setContent(res.data);
    }
  };

  return (
    <div className="flex gap-x-2 h-full functional-test-cases">
      <div className="flex-[1] bg-white rounded-[4px] overflow-y-auto">
        <div className="bg-table-head-bg font-medium test-base p-4">{i18n.t('dop:Test set')}</div>
        <CaseTree
          ref={(e) => {
            caseRef.current = e;
          }}
          needBreadcrumb
          needRecycled
          mode="testCase"
          onSelect={(test) => setTestSetID(test.testSetID)}
          readOnly
        />
      </div>
      <div className="bg-white rounded-[4px] w-0 overflow-auto relative" style={expanded ? { flex: 1 } : { flex: 2 }}>
        <div className="bg-table-head-bg font-medium test-base p-4">{i18n.t('common:requirements list')}</div>
        <RequirementsList onSelect={tableSelect} onExpand={setExpanded} expanded={expanded} />
      </div>
      {expanded ? (
        <div className="flex-[1] bg-white rounded-[4px] relative overflow-y-auto">
          <div className="bg-table-head-bg font-medium test-base p-4">{i18n.t('system prompt word')}</div>
          <Input.TextArea
            className="h-[calc(100%-54px)] resize-none border-none outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div
            className="absolute right-0 top-2 bg-blue-light py-1 pl-4 rounded-l-2xl flex-h-center text-blue-deep border-blue-mid border-solid border cursor-pointer pr-2"
            onClick={() => setExpanded(false)}
          >
            <span className="mr-1">{i18n.t('fold')}</span>
            <ErdaIcon type="unfold" />
          </div>
        </div>
      ) : (
        ''
      )}
      <div className={`bg-card rounded-[4px]`} style={{ flex: 3 }}>
        <DescList rows={rows} testSetID={testSetID} systemPrompt={content} />
      </div>
    </div>
  );
};

export default FunctionalTestCases;
