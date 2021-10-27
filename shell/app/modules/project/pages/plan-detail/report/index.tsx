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
import { message } from 'antd';
import { MarkdownEditor } from 'common';
import routeInfoStore from 'core/stores/route';
import testPlanStore from 'project/stores/test-plan';
import BasicInfo from './basic-info';
import ChartsResult from './charts-result';
import ExportPdf from './export-pdf';
import NumberInfo from './number-info';
import PersonalUseCase from './personal-usecase';
import { get } from 'lodash';
import { Upload as IconUpload } from '@icon-park/react';
import './index.scss';

const DetailIntro = () => {
  const { getReport, updateSummary } = testPlanStore.effects;
  const planReport = testPlanStore.useStore((s) => s.planReport);
  const { testPlanId } = routeInfoStore.useStore((s) => s.params);

  React.useEffect(() => {
    testPlanId && getReport(+testPlanId);
  }, [getReport, testPlanId]);

  const handleSummary = (v: string) => {
    if (v.length > 7000) {
      message.warning(i18n.t('project:content should not exceed 7000'));
      return;
    }
    updateSummary({ summary: v });
  };

  return (
    <div id="report-page" className="report-page">
      <div className="section-title">
        <span>{i18n.t('project:test report details')}</span>
        <ExportPdf domId="report-page" tip={i18n.t('project:test report')}>
          {({ exportPdf }) => (
            <span className="text-sm cursor-pointer text-primary" onClick={() => exportPdf()}>
              <IconUpload />
              {i18n.t('project:export report')}
            </span>
          )}
        </ExportPdf>
      </div>
      <div className="sub-section-title">{i18n.t('project:basic information')}</div>
      <BasicInfo />
      <div className="sub-section-title">{i18n.t('overview')}</div>
      <NumberInfo />
      <div className="sub-section-title">{i18n.t('project:test summary')}</div>
      <MarkdownEditor
        value={get(planReport, 'testPlan.summary', '')}
        onBlur={handleSummary}
        maxLength={2000}
        placeholder={i18n.t('project:no content yet')}
      />
      {/* <EditReport projectId={projectId} testPlanId={testPlanId} /> */}
      <div className="sub-section-title">{i18n.t('project:use case execution result distribution')}</div>
      <ChartsResult />
      <div className="sub-section-title">{i18n.t('project:summary of individual use case execution')}</div>
      <PersonalUseCase />
      {/* <div className="sub-section-title">未关闭缺陷列表</div> */}
      {/* <DefectTable
        projectId={projectId}
        testPlanId={testPlanId}
      /> */}
    </div>
  );
};

export default DetailIntro;
