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

import { debounce } from 'lodash';
import i18n from 'i18n';
import React from 'react';
import { Button, Input } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { SplitPage } from 'layout/common';
import { updateSearch } from 'common/utils';
import routeInfoStore from 'common/stores/route';
import testCaseStore from 'project/stores/test-case';
import { CaseTable, CaseTree } from '../components';
import { columns } from './columns';
import BatchProcessing from './header/batch-processing';
import ExportFile from './header/export-file';
import ImportFile from './header/import-file';
import AddTestSet from './new-set';
import CaseFilterDrawer from './filter-drawer';
import ProjectTreeModal from './project-tree-modal';
import CaseDrawer from 'project/pages/test-manage/case/case-drawer';
import testEnvStore from 'project/stores/test-env';
import { useEffectOnce } from 'react-use';
import moment from 'moment';
import { Search } from '@icon-park/react';
import './manual-test.scss';

const ManualTest = () => {
  const [query, params] = routeInfoStore.useStore(s => [s.query, s.params]);
  const { getCases, getCaseDetail } = testCaseStore.effects;
  const { getTestEnvList } = testEnvStore;
  const caseRef = React.useRef(null as any);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [enhanceFilterVisible, setEnhanceFilterVisible] = React.useState(false);

  useEffectOnce(() => {
    getTestEnvList({ envID: +params.projectId, envType: 'project' });
  });

  const closeEnhanceFilter = () => {
    setEnhanceFilterVisible(false);
  };

  const onSearch = (q: any) => {
    const { timestampSecUpdatedAtBegin, timestampSecUpdatedAtEnd } = q;
    if (timestampSecUpdatedAtBegin) {
      // eslint-disable-next-line no-param-reassign
      q.timestampSecUpdatedAtBegin = moment(+timestampSecUpdatedAtBegin).startOf('day').format('X');
    }
    if (timestampSecUpdatedAtEnd) {
      // eslint-disable-next-line no-param-reassign
      q.timestampSecUpdatedAtEnd = moment(+timestampSecUpdatedAtEnd).endOf('day').format('X');
    }
    updateSearch(q);
    getCases(q);
    closeEnhanceFilter();
  };
  const debouncedSearch = debounce(onSearch, 500);

  const handleAddTestSetFromOut = (data: TEST_SET.TestSet) => {
    caseRef.current && caseRef.current.addNodeFromOuter(data);
  };

  const reloadTestSets = () => {
    const { testSetID, eventKey } = query;
    caseRef.current && caseRef.current.reloadLoadData(testSetID, eventKey, false);
  };

  const showCaseDrawer = () => {
    getTestEnvList({ envID: +params.projectId, envType: 'project' });
    setDrawerVisible(true);
  };
  return (
    <SplitPage>
      <SplitPage.Left>
        <div className="section-title mb0">
          <span>{i18n.t('project:test set')}</span>
          <AddTestSet afterCreate={handleAddTestSetFromOut} />
        </div>

        <div style={{ position: 'relative', overflow: 'auto' }}>
          <CaseTree ref={(e) => { caseRef.current = e; }} needBreadcrumb needRecycled mode="testCase" />
        </div>
      </SplitPage.Left>
      <SplitPage.Right>
        <div className="section-title mb0">
          <span>{i18n.t('project:use case list')}</span>
        </div>

        <div className="flex-box mb12">
          <div className="ml12-group">
            {
              query.recycled !== 'true' && (
                <>
                  <Button type="primary" icon="plus" onClick={showCaseDrawer}>{i18n.t('project:add use case')}</Button>
                  <ImportFile
                    afterImport={reloadTestSets}
                  />
                  <ExportFile />
                </>
              )
            }
            <CaseDrawer
              scope="testCase"
              visible={drawerVisible}
              onClose={() => { setDrawerVisible(false); }}
              afterClose={(saved) => { saved && getCases(); }}
            />
            <BatchProcessing recycled={query.recycled === 'true'} />
            <ProjectTreeModal />
          </div>
          <div className="mr12-group">
            <Input
              style={{ width: '160px' }}
              placeholder={i18n.t('project:search for')}
              onChange={e => debouncedSearch({ query: e.target.value, pageNo: 1 })}
              prefix={<Search />}
            />
            <Button onClick={() => setEnhanceFilterVisible(true)}>
              <CustomIcon type="filter" />
            </Button>
            <CaseFilterDrawer visible={enhanceFilterVisible} onSearch={onSearch} onClose={closeEnhanceFilter} />
          </div>
        </div >
        <CaseTable
          columns={columns}
          scope="testCase"
          onClickRow={(record: any) => {
            if (record.id) {
              getCaseDetail({ id: record.id, scope: 'testCase' });
              showCaseDrawer();
            }
          }}
        />
      </SplitPage.Right>
    </SplitPage>
  );
};

export default ManualTest;
