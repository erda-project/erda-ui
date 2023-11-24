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

import React, { useEffect, useState } from 'react';
import i18n from 'i18n';
import { Button, Divider, message, Spin } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ErdaIcon } from 'common';
import projectStore from 'project/stores/project';
import userStore from 'app/user/stores';
import { getAddonList, exportXMind, IRow, TestSet } from 'layout/services/ai-test';

import 'project/pages/test-manage/case/case-drawer/index.scss';

const DescList = ({ rows, testSetID, systemPrompt }: { rows: IRow[]; testSetID: number; systemPrompt: string }) => {
  const { id: projectID, name: projectName } = projectStore.useStore((s) => s.info);
  const { id: userId } = userStore.getState((s) => s.loginUser);
  const [sets, setSets] = useState<TestSet[]>([]);
  const [cases, setCases] = useState<Obj[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSets(sets.filter((set) => rows.find((row) => row.id === set.requirementId)));
    setCases(cases.filter((item) => rows.find((row) => row.id === item.issueID)));
  }, [rows]);

  const getTestCase = async (items: IRow[], cb: (data: { sets: TestSet[]; testcases: Obj[] }) => void) => {
    setLoading(true);
    const res = await getAddonList({
      userId,
      projectID,
      projectName,
      requirements: items.map((item) => ({ issueID: item.id, prompt: `${item.title},${item.content}` })),
      testSetID,
      systemPrompt,
    });

    if (res.success) {
      cb?.({ testcases: res.data.testcases, sets: res.data.testSetsInfo.subdirs });
    }
    setLoading(false);
  };

  const apply = async () => {
    setLoading(true);
    const param = {
      userId,
      projectID,
      projectName,
      requirements: cases,
      testSetID,
      systemPrompt,
    };
    const res = await getAddonList(param);

    if (res.success) {
      message.success(i18n.t('{action} successfully', { action: i18n.t('apply') }));
    }
    setLoading(false);
  };

  const renderItem = (item: TestSet) => {
    return (
      <div className="bg-white rounded-[4px] p-2 mb-4">
        <div className="flex-h-center">
          <div className="flex items-start flex-1">
            <ErdaIcon type="xuqiu" className="text-xl mr-1 relative top-0.5" />
            {i18n.t('Requirement')}ID: {item.requirementId}
          </div>
        </div>
        <Divider />
        <div className="my-2 ml-1">
          {item.subDirs.map((subDir) => (
            <div className="mb-1" key={subDir.dir}>
              <div>
                {i18n.t('Test set')}: {subDir.dir}
              </div>
              <div>
                {i18n.t('number of use cases')}: {subDir.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const exportTest = async () => {
    const params = {
      projectID,
      cases,
    };
    const res = await exportXMind(params);

    res && window.open(`/api/files/${res.apiFileUUID}`);
    res && message.success(`${i18n.t('Export success! Record ID is')}: ${res.recordId}`);
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-auto case-drawer-body">
      <DndProvider backend={HTML5Backend}>
        <Spin spinning={loading}>
          <div className="flex-h-center flex-none flex-wrap bg-table-head-bg">
            <div className="flex-1 font-medium test-base min-w-[130px] mb-2">
              {i18n.t('generate an overview of test cases')}
            </div>
            <div className="flex-none mb-2">
              <Button
                onClick={() =>
                  getTestCase(rows, (data) => {
                    setSets(data.sets);
                    setCases(data.testcases);
                  })
                }
                disabled={!rows.length || loading}
              >
                {sets.length ? i18n.t('regenerate') : i18n.t('generate')}
              </Button>
              <Button className="ml-1" onClick={() => exportTest()} disabled={!sets.length || loading}>
                {i18n.t('Export')}
              </Button>
              <Button className="ml-1" onClick={() => apply()} disabled={!sets.length || loading}>
                {i18n.t('save')}
              </Button>
            </div>
          </div>
          <div className="flex-1 mt-2">{sets.map(renderItem)}</div>
        </Spin>
      </DndProvider>
    </div>
  );
};

export default DescList;
