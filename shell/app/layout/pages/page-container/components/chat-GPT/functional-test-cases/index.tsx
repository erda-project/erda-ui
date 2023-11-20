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
import i18n from 'i18n';
import { ErdaIcon, MarkdownRender } from 'common';
import RequirementsList from './requirements-list';
import DescList from './desc-list';
import { CaseTree } from 'project/pages/test-manage/components';
import { IRow } from 'layout/services/ai-test';

const FunctionalTestCases = () => {
  const caseRef = React.useRef(null as any);
  const [rows, setRows] = useState<IRow[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [testSetID, setTestSetID] = useState(0);

  const tableSelect = (rows: IRow[]) => {
    setRows(rows);
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
          <MarkdownRender value={content} />
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
        <DescList rows={rows} testSetID={testSetID} />
      </div>
    </div>
  );
};

const content = `
你是一名高级测试专家。你需要根据输入的功能点（Function Point），生成高质量的功能测试用例，包括各种边界条件。
测试用例格式:
  1. 前置条件: 例如：用户是否需要登录？用户是否需要有特定的权限？需要打开哪个界面？
  2. 操作步骤及期望结果: 可以有多个步骤，每个步骤代表一种场景；如果有多个边界条件，则每个边界条件是一个步骤；结果是期望的结果。
要求：
  - 使用中文返回
  - 每次只能生成一个测试用例
  - 尽可能多的给出操作步骤和对应的期望结果
`;

export default FunctionalTestCases;
